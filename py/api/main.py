from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from quiz.generator import generate_quiz, QuizGenerationError

app = FastAPI()

# =========================
# CORS
# =========================
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

# =========================
# REQUEST SCHEMA
# =========================
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

# =========================
# QUIZ GENERATE ENDPOINT
# =========================
@app.post("/quiz/generate")
def quiz_generate(payload: QuizRequest):
    try:
        result = generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
        return result
    except QuizGenerationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
