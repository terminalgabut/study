import os
import sys

# Trik HmmzBot: Tambahkan folder saat ini ke sys.path agar modul lain bisa di-import
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import langsung dari file tetangga
from generator import generate_quiz, QuizGenerationError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.get("/")
def home():
    return {"message": "Study AI API is Online"}

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

# Penting untuk Vercel
handler = app
