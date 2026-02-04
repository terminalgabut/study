import os
import sys

# PENTING: Tambahkan path folder api agar module tetangga bisa diimport
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import langsung dari file di folder yang sama
# Pastikan file generator.py, client.py, prompts.py ada di folder api/
from generator import generate_quiz, QuizGenerationError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "AI API is Online", "framework": "FastAPI"}

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.post("/quiz/generate")
def quiz_generate(payload: QuizRequest):
    try:
        return generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# SANGAT PENTING: Vercel mencari variabel 'app'
handler = app
