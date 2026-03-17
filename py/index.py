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
    SIGNATURE = {
        "reading comprehension": ["ide", "tujuan", "implikasi", "utama", "berdasarkan", "teks"],
        "vocabulary & semantics": ["kata", "makna", "istilah"],
        "verbal reasoning": ["kesimpulan", "logis", "asumsi", "tidak dapat disimpulkan"],
        "analogy": ["hubungan", "relasi", "perbandingan", "setara", "padanan", "fungsi", "peran"],
        "working memory": ["menggabungkan", "paragraf", "bagian", "awal", "akhir", "keseluruhan"]
    }

    FORBIDDEN = {
        "reading comprehension": ["asumsi"],  # dipersempit (biar gak terlalu sensitif)
        "vocabulary & semantics": ["kesimpulan"],
        "verbal reasoning": ["makna kata"],  
        "analogy": ["kesimpulan"],
        "working memory": ["makna kata"]
    }

    warnings = []

    for i, q in enumerate(data["questions"], start=1):
        dim = q["dimension"]
        question = q["question"].lower()

        # --- SIGNATURE (lebih fleksibel) ---
        signature_match = any(w in question for w in SIGNATURE[dim])

        # analogy fallback: allow pattern A : B
        if dim == "analogy":
            if not signature_match and ":" not in question:
                warnings.append(f"Q{i}: analogy lemah (tidak eksplisit relasi)")
        else:
            if not signature_match:
                warnings.append(f"Q{i}: {dim} lemah signature")

        # --- FORBIDDEN (tidak langsung fail) ---
        if any(w in question for w in FORBIDDEN.get(dim, [])):
            warnings.append(f"Q{i}: {dim} sedikit overlap")

        # --- DIMENSION CHECK (SOFT RULE) ---
        
        if dim == "reading comprehension":
            if "teks" not in question:
                warnings.append(f"Q{i}: reading tidak eksplisit referensi teks")

        elif dim == "vocabulary & semantics":
            if "'" not in q["question"] and '"' not in q["question"]:
                warnings.append(f"Q{i}: vocab tidak menyebut kata spesifik")

        elif dim == "verbal reasoning":
            if "berdasarkan teks" in question:
                warnings.append(f"Q{i}: reasoning terlalu dekat ke reading")

        elif dim == "analogy":
            if not any(w in question for w in ["hubungan", "relasi", "setara", "padanan", "fungsi", "peran"]) and ":" not in question:
                warnings.append(f"Q{i}: analogy kurang kuat")

        elif dim == "working memory":
            if not any(w in question for w in ["paragraf", "bagian", "awal", "akhir"]):
                warnings.append(f"Q{i}: working memory kurang multi-bagian")

        # --- HARD FAIL (tetap ada, tapi minimal) ---
        if len(q["explanation"]) < 20:
            raise ValueError(f"Q{i}: explanation terlalu pendek")

        if len(set(q["options"])) != 4:
            raise ValueError(f"Q{i}: opsi tidak unik")

    # --- OPTIONAL: log warning saja ---
    if warnings:
        print("Cognitive Warnings:", warnings

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
   - Jawaban HARUS bisa ditemukan atau ditelusuri langsung dari teks
   - Tidak boleh membutuhkan inferensi kompleks
   - Tidak boleh mengandung asumsi di luar teks

   Signature (WAJIB ADA SALAH SATU):
   - ide utama / tujuan / ringkasan
   - informasi langsung / fakta
   - implikasi langsung

   Anti-error:
   - Jika jawaban tidak bisa ditunjukkan ke bagian teks → SALAH
   - Jika butuh logika tambahan → masuk reasoning (BUKAN ini)

   Contoh:
   - "Apa ide utama yang ingin disampaikan penulis?"
   - "Apa implikasi langsung dari pernyataan pada paragraf kedua?"


- vocabulary & semantics:
   Fokus: Memahami makna kata/istilah berdasarkan konteks kalimat.

   Aturan:
   - Kata/istilah HARUS berasal dari teks
   - Jawaban HARUS berbasis konteks, bukan definisi umum
   - Tidak boleh jadi soal hafalan

   Signature (WAJIB ADA):
   - kata/istilah spesifik dari teks disebutkan di soal

   Anti-error:
   - Jika kata bisa dijawab tanpa konteks → SALAH
   - Jika tidak menyebut kata spesifik → SALAH

   Contoh:
   - "Dalam konteks bacaan, kata 'signifikan' paling dekat maknanya dengan..."
   - "Istilah 'X' dalam teks merujuk pada apa?"


- verbal reasoning:
   Fokus: Menarik kesimpulan logis yang tidak tertulis secara eksplisit.

   Aturan:
   - Jawaban TIDAK boleh ada secara langsung di teks
   - Harus membutuhkan inferensi/logika
   - Boleh menggunakan format implisit (kesimpulan, asumsi, kemungkinan)

   Signature (WAJIB ADA SALAH SATU):
   - kesimpulan
   - asumsi
   - tidak dapat disimpulkan
   - paling logis

   Anti-error:
   - Jika jawaban bisa ditemukan langsung → SALAH (itu reading)
   - Jika hanya parafrase → SALAH

   Contoh:
   - "Kesimpulan mana yang paling logis berdasarkan teks?"
   - "Manakah pernyataan yang tidak dapat disimpulkan dari bacaan?"
   - "Apa asumsi yang mendasari argumen penulis?"


- analogy:
   Fokus: Mengidentifikasi hubungan antar konsep (relasi, bukan isi).

   Aturan:
   - HARUS berbentuk relasi (A : B = C : ?)
   - Menilai kesamaan hubungan, bukan kesamaan isi
   - Tidak boleh hanya parafrase teks

   Signature (WAJIB ADA SALAH SATU):
   - hubungan
   - peran
   - fungsi
   - setara

   Anti-error:
   - Jika soal masih bisa dijawab dengan membaca teks langsung → SALAH
   - Jika tidak ada relasi eksplisit → SALAH

   Contoh:
   - "Hubungan antara X dan Y dalam teks paling mirip dengan..."
   - "Jika X berperan sebagai penyebab dan Y sebagai akibat, maka pasangan yang setara adalah..."


- working memory:
   Fokus: Mengingat dan menggabungkan informasi dari beberapa bagian teks.

   Aturan:
   - HARUS melibatkan minimal dua bagian teks
   - Jawaban membutuhkan penggabungan informasi
   - Tidak bisa dijawab dari satu bagian saja

   Signature (WAJIB ADA SALAH SATU):
   - menggabungkan / kombinasi
   - paragraf awal & akhir
   - beberapa bagian / seluruh teks

   Anti-error:
   - Jika bisa dijawab dari satu paragraf → SALAH
   - Jika hanya memahami tanpa menggabungkan → SALAH

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
