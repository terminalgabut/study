import os
import logging
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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

app.include_router(client.router)
app.include_router(generator.router)

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.get("/")
def health_check():
    return {"status": "AI API Online"}

@app.post("/generator")
def quiz_generate(payload: QuizRequest):
    try:
        # Panggil fungsi dari modul generator yang sudah diimport
        return generator.generate_quiz(
            materi=payload.materi,
            category=payload.category,
            slug=payload.slug,
            order=payload.order
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

handler = app
