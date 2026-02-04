import os
import json
import re
import logging
import requests
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. PROMPTS CONFIGURATION (Disatukan) ---
BASE_SYSTEM_PROMPT = """
Kamu adalah AI pembuat soal tes kritis tingkat menengah hingga tinggi.
Kamu HARUS patuh pada struktur dan aturan output.
"""

def build_quiz_prompt(materi: str, jumlah_soal: int = 10):
    return f"""
Buatkan {jumlah_soal} soal test IQ pilihan ganda berbasis teks berikut:

{materi}

ATURAN WAJIB:
1. Setiap soal HARUS fokus pada SATU dimensi kognitif (Analisa, Logika, Pemecahan Masalah, Konsentrasi, atau Memori).
2. Kembalikan HANYA JSON VALID tanpa teks tambahan.
3. Struktur JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "category": "kategori-materi",
      "dimension": "Analisa | Logika | Pemecahan Masalah | Konsentrasi | Memori",
      "question": "soal kritis dan relevan",
      "options": ["opsi1", "opsi2", "opsi3", "opsi4"],
      "correct_answer": "teks yang cocok dengan salah satu options"
    }}
  ]
}}
4. JANGAN gunakan huruf A/B/C/D di awal opsi.
"""

# --- 2. SCHEMAS ---
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

# --- 3. ROUTES ---
@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Fully-Unified"}

@app.post("/generator")
async def quiz_generate(payload: QuizRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY tidak ditemukan di Environment Variables")

    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(payload.materi)}
    ]

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://study-app.vercel.app",
                "X-Title": "Study AI"
            },
            json={
                "model": "google/gemini-2.0-flash-exp",
                "messages": messages,
                "temperature": 0.7
            },
            timeout=60
        )
        response.raise_for_status()
        ai_data = response.json()
        
        raw_content = ai_data["choices"][0]["message"]["content"]

        # Pembersihan JSON
        cleaned = re.sub(r"^```json|```$", "", raw_content.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
        
        questions = parsed.get("questions", [])

        # Post-processing
        for i, q in enumerate(questions, start=1):
            q["id"] = f"q{i}"
            if "answer" in q and "correct_answer" not in q:
                q["correct_answer"] = q.pop("answer")
            q["category"] = payload.category

        return {
            "category": payload.category,
            "slug": payload.slug,
            "order": payload.order,
            "questions": questions
        }

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


handler = app
