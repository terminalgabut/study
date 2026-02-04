import os
import json
import re
import logging
import requests
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
BASE_SYSTEM_PROMPT = "Kamu adalah AI pembuat soal tes kritis tingkat menengah hingga tinggi. Kamu HARUS patuh pada struktur JSON."

def call_openrouter_api(messages: list):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise Exception("OPENROUTER_API_KEY tidak ditemukan di environment variables")

    # Menggunakan model yang lebih cepat untuk menghindari Vercel Timeout (10 detik)
    # Saran: google/gemini-2.0-flash-001 atau meta-llama/llama-3-70b-instruct
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://terminalgabut.github.io",
            "X-Title": "Study AI"
        },
        json={
            "model": "openai/gpt-oss-120b:nitro", 
            "messages": messages,
            "temperature": 0.7
        },
        timeout=20 # Timeout diperpendek agar sinkron dengan limit Vercel
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Adapted-Unified"}

@app.post("/quiz") # Mengubah endpoint ke /quiz sesuai contoh file tadi
async def quiz_generate(request: Request):
    try:
        # Menggunakan request.json() agar tidak kaku (menghindari error 422)
        body = await request.json()
        materi = body.get("materi", "").strip()
        category = body.get("category", "Umum")
        slug = body.get("slug", "default")
        order = body.get("order", 1)

        if not materi:
            return JSONResponse({"error": "Materi tidak boleh kosong"}, status_code=400)

        logging.info(f"Generating quiz for category: {category}")

        prompt_quiz = f"""
Buatkan 5 soal test IQ pilihan ganda berbasis teks berikut:
{materi}

ATURAN WAJIB:
1. Setiap soal fokus pada dimensi: Analisa, Logika, Pemecahan Masalah, Konsentrasi, atau Memori.
2. Kembalikan HANYA JSON VALID.
3. Struktur:
{{
  "questions": [
    {{
      "id": "q1",
      "category": "{category}",
      "dimension": "Analisa",
      "question": "teks soal",
      "options": ["opsi1", "opsi2", "opsi3", "opsi4"],
      "correct_answer": "teks jawaban yang persis sama dengan salah satu opsi"
    }}
  ]
}}
"""

        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_quiz}
        ]

        # Panggil AI
        ai_reply = call_openrouter_api(messages).strip()

        # Pembersihan JSON (Adaptasi dari file tadi)
        try:
            # Hapus tag markdown ```json ... ``` jika ada
            cleaned_content = re.sub(r"```json|```", "", ai_reply, flags=re.IGNORECASE).strip()
            parsed = json.loads(cleaned_content)
            
            questions = parsed.get("questions", [])

            # Post-processing untuk standarisasi key
            for i, q in enumerate(questions, start=1):
                q["id"] = f"q{i}"
                if "answer" in q and "correct_answer" not in q:
                    q["correct_answer"] = q.pop("answer")
                q["category"] = category

            # Output dibungkus dalam "quiz" agar sama dengan contoh file tadi
            return {
                "quiz": {
                    "category": category,
                    "slug": slug,
                    "order": order,
                    "questions": questions
                },
                "status": "success"
            }

        except json.JSONDecodeError:
            logging.error(f"AI gagal kirim JSON valid. Raw: {ai_reply}")
            return JSONResponse({"error": "AI tidak menghasilkan JSON valid", "raw": ai_reply}, status_code=500)

    except Exception as e:
        logging.error(f"General Error: {str(e)}")
        return JSONResponse({"error": str(e)}, status_code=500)
