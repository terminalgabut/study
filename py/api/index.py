import os
import logging
import requests
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api import -
from api import -
from api import -

app = FastAPI()

# TANPA prefix
app.include_router(-.router)
app.include_router(-.router)
app.include_router(-.router)

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

@app.post("/generator")
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
