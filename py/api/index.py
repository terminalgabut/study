import os
import logging
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Gunakan relative import yang aman
from . import client
from . import generator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pastikan di client.py dan generator.py sudah ada objek 'router'
app.include_router(client.router)
app.include_router(generator.router)

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.get("/")
def health_check():
    return {"status": "AI API is Online"}

@app.post("/generator")
async def quiz_generate(payload: QuizRequest):
    try:
        # Panggil fungsi dari modul generator
        return generator.generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

handler = app
