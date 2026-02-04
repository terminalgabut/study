import os
import json
import re
import logging
import requests
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Import prompt (pastikan file api/prompts.py ada)
try:
    from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt
except ImportError:
    from prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

@app.get("/")
def health_check():
    return {"status": "Ready", "note": "Unified Index"}

@app.post("/generator")
async def quiz_generate(payload: QuizRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="API Key missing in Vercel")

    # 1. Prepare Messages
    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(payload.materi)}
    ]

    # 2. Call OpenRouter
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
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

        # 3. Clean & Parse JSON
        cleaned = re.sub(r"^```json|```$", "", raw_content.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
        questions = parsed.get("questions", [])

        # 4. Standardize
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

# Penting untuk Vercel

handler = app
