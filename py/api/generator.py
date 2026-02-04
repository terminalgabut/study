import logging
import json
import re # Penting untuk membersihkan JSON dari AI
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

# Perbaikan Import: Sesuai dengan isi file prompts.py dan client.py
from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt
from .client import call_ai

# Konfigurasi logging dasar
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

router = APIRouter()

class QuizGenerationError(Exception):
    pass

@router.post("/quiz")
def generate_quiz(materi: str, category: str, slug: str, order: int):
    # Gabungkan pesan untuk dikirim ke AI
    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(materi)}
    ]

    try:
        # Memanggil fungsi call_ai dari client.py
        response = call_ai(messages)
        
        # Mengambil konten teks dari respon OpenRouter
        if "choices" not in response:
            raise QuizGenerationError(f"Respon AI tidak valid: {response}")
            
        raw = response["choices"][0]["message"]["content"]
        
        # Membersihkan tag ```json jika AI menyertakannya agar tidak error saat json.loads
        cleaned = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
        
    except json.JSONDecodeError:
        logging.error(f"Gagal parse JSON. Raw output: {raw}")
        raise HTTPException(status_code=500, detail="AI tidak menghasilkan format data yang benar")
    except Exception as e:
        logging.error(f"Error saat generate quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    questions = parsed.get("questions", [])
    if not questions:
        raise HTTPException(status_code=500, detail="AI tidak menghasilkan soal apa pun")

    # Standarisasi format soal
    for i, q in enumerate(questions, start=1):
        q["id"] = f"q{i}"
        # Memastikan field jawaban konsisten (jika AI pakai 'answer', diubah ke 'correct_answer')
        if "answer" in q and "correct_answer" not in q:
            q["correct_answer"] = q.pop("answer")
        
        if not q.get("category"):
            q["category"] = category

    return {
        "category": category,
        "slug": slug,
        "order": order,
        "questions": questions
    }
