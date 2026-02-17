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

from app.routes.cognitive import router as cognitive_router
app.include_router(cognitive_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
BASE_SYSTEM_PROMPT = "Kamu adalah AI Mentalist profesional yang ahli dalam menyusun soal test iQ kritis gunakan 5 dimension di aturan wajib. Kamu HARUS mematuhi struktur JSON yang diminta."

def call_openrouter_api(messages: list):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise Exception("OPENROUTER_API_KEY tidak ditemukan di environment variables")

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
            "temperature": 0.35
            "top_p": 0.9,
        },
        timeout=25 # Disesuaikan sedikit lebih lama karena teks penjelasan menambah beban kerja
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Adapted-Unified"}

@app.post("/quiz")
async def quiz_generate(request: Request):
    try:
        body = await request.json()
        materi = body.get("materi", "").strip()
        # category = body.get("category", "Umum")
        slug = body.get("slug", "default")
        order = body.get("order", 1)

        if not materi:
            return JSONResponse({"error": "Materi tidak boleh kosong"}, status_code=400)

        logging.info(f"Generating quiz with explanations for: {category}")

        prompt_quiz = f"""
Buatkan 10 soal test pilihan ganda yang kritis dan mendalam berdasarkan teks materi berikut:
{materi}

ATURAN WAJIB:
1. Struktur 10 Soal Berbasis Teks mengunakan 5 Dimension (Pemahaman Bacaan, Kosakata & Semantik, Penalaran Verbal, Hubungan Analogi, Memori Kerja Verbal) :
   1.Dimension Pemahaman Bacaan (2 Soal):
      Fokus: Mencari gagasan utama atau fakta tersurat.
      Contoh Pertanyaan: "Apa tujuan utama penulis dalam paragraf kedua?" atau "Berdasarkan teks, apa penyebab utama dari fenomena X?"
   2.Dimension Kosakata & Semantik (2 Soal):
      Fokus: Menguji pemahaman kata sulit atau istilah teknis dalam materi.
      Contoh Pertanyaan: "Kata 'signifikan' pada baris ke-5 paling tepat digantikan dengan kata..." atau "Apa makna istilah [Istilah Teknis] menurut konteks bacaan tersebut?"
   3.Dimension Penalaran Verbal (2 Soal):
      Fokus: Menarik kesimpulan atau logika "Benar/Salah/Tidak Diketahui".
      Contoh Pertanyaan: "Jika pernyataan di paragraf 3 benar, manakah kesimpulan berikut yang paling logis?" atau "Manakah asumsi yang mendasari argumen penulis di bagian akhir?"
   4.Dimension Hubungan Analogi (2 Soal):
      Fokus: Menghubungkan konsep dalam teks dengan konsep serupa.
      Contoh Pertanyaan: "Berdasarkan teks, hubungan antara A dan B serupa dengan hubungan antara..." atau "Jika [Konsep A] digambarkan sebagai [Sifat], maka [Konsep B] dalam teks digambarkan sebagai..."
   5.Dimension Memori Kerja Verbal (2 Soal):
      Fokus: Menghubungkan informasi dari dua bagian teks yang berjauhan (sintesis).
      Contoh Pertanyaan: "Bagaimana pengaruh temuan di paragraf pertama terhadap teori yang dijelaskan di paragraf terakhir?" atau "Berdasarkan keseluruhan materi, urutan proses yang benar adalah..."
   Tips Agar Soal Terasa Seperti "Tes IQ":
    Hindari Jawaban Langsung: Jangan buat jawaban yang bisa di-copy-paste langsung dari teks. Gunakan parafrase (penggunaan kata yang berbeda namun maknanya sama).
    Pengecoh (Distractor): Buat pilihan jawaban yang terlihat benar jika pembaca hanya membaca sekilas, tetapi salah secara logika detail.
2. Setiap soal WAJIB menyertakan 'explanation' (penjelasan) singkat namun padat yang menjelaskan MENGAPA jawaban tersebut benar berdasarkan materi yang diberikan.
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
- Periksa jumlah soal = 10
- Periksa distribusi dimensi = 2 per dimension
- Periksa semua correct_answer identik dengan salah satu options
- Periksa JSON valid sebelum final output
"""

        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt_quiz}
        ]

        # Panggil AI
        ai_reply = call_openrouter_api(messages).strip()

        # Pembersihan JSON
        try:
            cleaned_content = re.sub(r"```json|```", "", ai_reply, flags=re.IGNORECASE).strip()
            parsed = json.loads(cleaned_content)
            
            questions = parsed.get("questions", [])

            # Post-processing
            for i, q in enumerate(questions, start=1):
                q["id"] = f"q{i}"
                if "answer" in q and "correct_answer" not in q:
                    q["correct_answer"] = q.pop("answer")
                q["category"] = category
                # Pastikan explanation ada, jika tidak ada beri teks default
                if "explanation" not in q:
                    q["explanation"] = "Pahami kembali materi di atas untuk memperdalam konsep ini."

            return {
                "quiz": {
                    #"category": category,
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
