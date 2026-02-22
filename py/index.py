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

BASE_SYSTEM_PROMPT = "Kamu adalah AI Mentalist profesional yang ahli dalam menyusun soal test iQ kritis gunakan 5 dimension di aturan wajib. Kamu HARUS mematuhi struktur JSON yang diminta."

def generate_quiz(messages, mode="qa"):
    client = OpenAI(
    api_key=os.getenv("ATLASCLOUD_API_KEY"),
    base_url="https://api.atlascloud.ai/v1",
    timeout=60
)

    MODE_SETTINGS = {
        "qa": {
            "temperature": 0.2,
            "max_tokens": 1300
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
    
)

    return response.choices[0].message.content 

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
        dimension_count[dim] = dimension_count.get(dim, 0) + 1

    for dim, count in dimension_count.items():
        if count != 1:
            raise ValueError(f"Distribusi dimension salah: {dim} = {count}")

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
Buatkan 5 soal test pilihan ganda yang kritis dan mendalam berdasarkan teks materi berikut:
{materi}

ATURAN WAJIB:
1. Struktur Soal Berbasis Teks mengunakan 5 Dimension (Pemahaman Bacaan, Kosakata & Semantik, Penalaran Verbal, Hubungan Analogi, Memori Kerja Verbal) :
   Fokus: Mencari gagasan utama atau fakta tersurat,
          Menguji pemahaman kata sulit atau istilah teknis dalam materi,
          Menarik kesimpulan atau logika "Benar/Salah/Tidak Diketahui,
          Menghubungkan konsep dalam teks dengan konsep serupa,
          Menghubungkan informasi dari dua bagian teks yang berjauhan (sintesis),
    Agar Soal Terasa Seperti "Tes IQ":
    Hindari Jawaban Langsung: Jangan buat jawaban yang bisa di-copy-paste langsung dari text. Gunakan parafrase (penggunaan kata yang berbeda namun maknanya sama).
    Pengecoh (Distractor): Buat pilihan jawaban yang terlihat benar jika pembaca hanya membaca sekilas, tetapi salah secara logika detail.
2. Setiap soal WAJIB menyertakan 'explanation' (penjelasan) singkat jawaban benar.
3. Kembalikan HANYA JSON VALID.
4. Struktur:
{{
  "questions": [
    {{
      "id": "q1",
      "category": "judul materi",
      "dimension": "Memori Kerja Verbal",
      "question": "teks soal",
      "options": ["opsi1", "opsi2", "opsi3", "opsi4"],
      "correct_answer": "teks jawaban yang persis sama dengan salah satu opsi",
      "explanation": "Teks penjelasan edukatif berdasarkan materi"
    }}
  ]
}}
VALIDATION STEP (Internal, jangan ditampilkan):
- Periksa jumlah soal = 5 soal
- Periksa distribusi dimensi = 1 per dimension
- Periksa semua correct_answer identik dengan salah satu options
- Periksa JSON valid sebelum final output
"""

        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_quiz}
        ]

        ai_reply = generate_quiz(messages, mode="qa").strip()

        cleaned_content = re.sub(r"```json|```", "", ai_reply, flags=re.IGNORECASE).strip()
        parsed = json.loads(cleaned_content)

        validate_quiz_structure(parsed)

        questions = parsed["questions"]

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
