import sys
import os
sys.path.append(os.path.dirname(__file__))
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generator import generate_quiz, QuizGenerationError [cite: 1]

app = FastAPI()

# Middleware tetap dipertahankan untuk mengizinkan akses dari frontend/CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "AI API is running"}

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.post("/quiz/generate")
def quiz_generate(payload: QuizRequest):
    try:
        # Memanggil fungsi dari generator.py 
        return generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
    except QuizGenerationError as e:
        # Menangani error spesifik dari logika quiz
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Menangani error server umum
        raise HTTPException(status_code=500, detail=str(e))

# Penting untuk Vercel: mendaftarkan instance app
handler = app
