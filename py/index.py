import os
import json
import re
import logging
import requests
from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api.cognitive import router as cognitive_router

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://terminalgabut.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cognitive_router)

BASE_SYSTEM_PROMPT = "Kamu adalah ahli menyusun soal test iQ kritis gunakan 5 dimension di aturan wajib. Kamu HARUS mematuhi struktur JSON yang diminta."

def generate_quiz(messages, mode="qa"):
    client = OpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        timeout=60
    )

    MODE_SETTINGS = {
        "qa": {
            "temperature": 0.7,
            "max_tokens": 5000
        },
        "creative": {
            "temperature": 0.9,
            "max_tokens": 5000
        }
    }

    settings = MODE_SETTINGS.get(mode, MODE_SETTINGS["qa"])

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=settings["temperature"],
        max_tokens=settings["max_tokens"],
        top_p=0.9,
        response_format={"type": "json_object"},
        extra_headers={
            "HTTP-Referer": "https://terminalgabut.github.io",
            "X-Title": "Terminal Gabut Quiz Engine"
        }
    )

    return response.choices[0].message.content

ALLOWED_DIMENSIONS = {
"reading comprehension", 
"vocabulary & semantics", 
"verbal reasoning", 
"analogy", 
"working memory"
}

def validate_quiz_structure(data: dict):
    if "questions" not in data:
        raise ValueError("Missing 'questions' field")

    questions = data["questions"]

    if len(questions) != 5:
        raise ValueError("Jumlah soal tidak 5")

    dimension_count = {}

    for q in questions:
        required_fields = ["dimension", "question", "options", "correct_answer", "explanation"]

        for field in required_fields:
            if field not in q:
                raise ValueError(f"Field '{field}' tidak ada di soal")

        if not isinstance(q["options"], list) or len(q["options"]) != 4:
            raise ValueError("Options harus 4 pilihan")

        if q["correct_answer"] not in q["options"]:
            raise ValueError("Correct answer tidak cocok dengan options")

        dim = q["dimension"] 
        if not isinstance(dim, str):
            raise ValueError(f"Dimension harus string, dapat: {type(dim)}")
            
        dim = dim.strip().lower()
        
        if dim not in ALLOWED_DIMENSIONS:
           raise ValueError(
               f"Dimension tidak valid: '{dim}'. "
               f"Harus salah satu dari {sorted(ALLOWED_DIMENSIONS)}")
            
        dimension_count[dim] = dimension_count.get(dim, 0) + 1
        q["dimension"] = dim
        
    for dim, count in dimension_count.items():
        if count != 1:
            raise ValueError(f"Distribusi dimension salah: {dim} = {count}")

def validate_cognitive_quality(data: dict):
    for i, q in enumerate(data["questions"], start=1):
        dim = q["dimension"]
        question = q["question"].lower()

        # --- READING ---
        if dim == "reading comprehension":
            if any(w in question for w in ["kesimpulan", "asumsi", "logis"]):
                raise ValueError(f"Q{i}: reading tercampur reasoning")

        # --- VOCAB ---
        elif dim == "vocabulary & semantics":
            if not any(w in question for w in ["kata", "makna", "istilah"]):
                raise ValueError(f"Q{i}: vocab tidak fokus kata")

        # --- REASONING ---
        elif dim == "verbal reasoning":
            if not any(w in question for w in ["kesimpulan", "logis", "asumsi"]):
                raise ValueError(f"Q{i}: reasoning tidak terlihat")

        # --- ANALOGY ---
        elif dim == "analogy":
            if not any(w in question for w in ["hubungan", "mirip", "diibaratkan"]):
                raise ValueError(f"Q{i}: analogy tidak jelas")

        # --- WORKING MEMORY ---
        elif dim == "working memory":
            if not any(w in question for w in ["paragraf", "bagian", "urutan"]):
                raise ValueError(f"Q{i}: working memory tidak multi info")

        # --- BASIC QUALITY ---
        if len(q["explanation"]) < 25:
            raise ValueError(f"Q{i}: explanation terlalu pendek")

        if len(set(q["options"])) != 4:
            raise ValueError(f"Q{i}: opsi tidak unik")

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Adapted-Unified"}

@app.post("/quiz")
async def quiz_generate(request: Request):
    try:
        body = await request.json()
        materi = body.get("materi", "").strip()
        category = body.get("category", "Umum")
        slug = body.get("slug", "default")
        order = body.get("order", 1)

        if not materi:
            return JSONResponse({"error": "Materi tidak boleh kosong"}, status_code=400)

        logging.info(f"Generating quiz with explanations for: {category}")

        prompt_quiz = f"""
Buatkan 5 soal kritis berdasarkan teks materi berikut:
{materi}

ATURAN WAJIB:

1. Struktur 5 Soal Berbasis Teks menggunakan 5 Dimension (SETIAP DIMENSI HARUS UNIK DAN TIDAK BOLEH OVERLAP):

   - reading comprehension:
      Fokus: Memahami informasi eksplisit dan implikasi langsung dari teks.
      Aturan:
      - Jawaban dapat ditelusuri dari teks
      - Tidak membutuhkan logika kompleks atau asumsi tambahan
      Contoh:
      - "Apa ide utama yang ingin disampaikan penulis?"
      - "Apa implikasi langsung dari pernyataan pada paragraf kedua?"

   - vocabulary & semantics:
      Fokus: Memahami makna kata atau istilah berdasarkan konteks, bukan definisi umum.
      Aturan:
      - Kata/istilah harus berasal dari teks
      - Jawaban harus bergantung pada konteks kalimat
      Contoh:
      - "Dalam konteks bacaan, kata 'signifikan' paling dekat maknanya dengan..."
      - "Istilah 'X' dalam teks merujuk pada apa?"

   - verbal reasoning:
      Fokus: Menarik kesimpulan logis yang tidak tertulis secara langsung.
      Aturan:
      - Jawaban tidak boleh eksplisit di teks
      - Membutuhkan proses logika/inferensi
      Contoh:
      - "Kesimpulan mana yang paling logis berdasarkan teks?"
      - "Manakah pernyataan yang tidak dapat disimpulkan dari bacaan?"
      - "Apa asumsi yang mendasari argumen penulis?"

   - analogy:
      Fokus: Mengidentifikasi hubungan antar konsep (bukan sekadar isi teks).
      Aturan:
      - Menilai pola hubungan (A : B = C : ?)
      - Boleh menggunakan konteks di luar teks selama masih relevan
      Contoh:
      - "Hubungan antara X dan Y dalam teks paling mirip dengan..."
      - "Jika X berperan sebagai [fungsi], maka padanan yang setara adalah..."

   - working memory:
      Fokus: Mengingat dan menggabungkan beberapa informasi dari bagian teks yang berbeda.
      Aturan:
      - Wajib melibatkan minimal dua bagian teks
      - Tidak bisa dijawab jika hanya membaca satu bagian
      Contoh:
      - "Informasi mana yang konsisten jika menggabungkan paragraf awal dan akhir?"
      - "Bagaimana hubungan antara konsep di awal dan kesimpulan di akhir teks?"

   ATURAN GLOBAL DIMENSI:
   - Setiap soal harus benar-benar merepresentasikan proses berpikir dari dimensinya
   - Jika soal bisa dijawab tanpa menggunakan kemampuan utama dimensinya, maka soal dianggap SALAH

   Tips soal seperti "Tes IQ":
   - Gunakan parafrase (jangan copy kalimat dari teks)
   - Semua opsi harus terlihat masuk akal dan relevan
   - Minimal 2 opsi harus tampak benar secara sekilas, namun hanya 1 paling tepat

2. Setiap soal WAJIB menyertakan 'explanation' singkat yang menjelaskan MENGAPA jawaban benar berdasarkan teks.

3. Kembalikan HANYA JSON VALID.

4. Struktur:
{{
  "questions": [
    {{
      "id": "q1",
      "category": "judul materi",
      "dimension": "vocabulary & semantics",
      "question": "teks soal",
      "options": ["opsi1", "opsi2", "opsi3", "opsi4"],
      "correct_answer": "teks jawaban yang persis sama dengan salah satu opsi",
      "explanation": "Teks penjelasan edukatif berdasarkan materi"
    }}
  ]
}}

VALIDATION STEP (Internal, jangan ditampilkan):
- Periksa 5 dimension: reading comprehension, vocabulary & semantics, verbal reasoning, analogy, working memory
- Pastikan masing-masing muncul tepat 1 kali
- Periksa semua correct_answer identik dengan salah satu options
- Periksa JSON valid sebelum output
- Gunakan tanda kutip tunggal (') jika diperlukan dalam teks
"""

        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_quiz}
        ]

        ai_reply = generate_quiz(messages, mode="qa")
        ai_reply = ai_reply.strip()

# hapus markdown fence kalau ada
        if ai_reply.startswith("```"):
            ai_reply = re.sub(r"```json|```", "", ai_reply).strip()

# ambil hanya bagian JSON object
        start = ai_reply.find("{")
        end = ai_reply.rfind("}") + 1
        ai_reply = ai_reply[start:end]

        try:
            parsed = json.loads(ai_reply)
        except json.JSONDecodeError as e:
            logging.error("RAW AI RESPONSE:\n" + ai_reply)
            raise ValueError(f"JSON Decode Error: {str(e)}")
 
        validate_quiz_structure(parsed)
        validate_cognitive_quality(parsed)

        questions = parsed["questions"]
        
        import random
        random.shuffle(questions)

        for i, q in enumerate(questions, start=1):
            q["id"] = f"q{i}"
            q["category"] = category

        return {
            "quiz": {
                "slug": slug,
                "order": order,
                "questions": questions
            },
            "status": "success"
        }

    except Exception as e:
        logging.error(f"VALIDATION ERROR: {str(e)}")
        return JSONResponse({"error": f"AI JSON invalid: {str(e)}"}, status_code=500)
