import os
import logging
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import router dan fungsi dari file lokal
from . import client
from . import generator
from .generator import generate_quiz

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Menghubungkan router dari client.py dan generator.py
app.include_router(client.router)
app.include_router(generator.router)

@app.get("/")
def health_check():
    return {"status": "AI API is Online", "framework": "FastAPI"}

# Schema untuk request body
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.post("/generator")
def quiz_generate(payload: QuizRequest):
    try:
        # Memanggil fungsi generate_quiz dari generator.py
        return generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
    except Exception as e:
        logging.error(f"Error in /generator: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Penting untuk Vercel
handler = app
