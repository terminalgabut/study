import os
import logging
import requests
import json
import re
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Pastikan file prompts.py tetap ada di folder api
try:
    from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt
except ImportError:
    from prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt

app = FastAPI()

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-2.0-flash-exp"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

# --- CORE LOGIC ---
def call_openrouter(messages: List[Dict[str, str]]):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is missing in Vercel env")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study-app.vercel.app",
        "X-Title": "Study AI Generator"
    }
    
    payload = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"AI API Error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")

# --- ROUTES ---
@app.get("/")
def health_check():
    return {"status": "Online", "mode": "Unified"}

@app.post("/generator")
async def quiz_generate(payload: QuizRequest):
    try:
        # 1. Build messages
        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": build_quiz_prompt(payload.materi)}
        ]

        # 2. Call AI
        ai_data = call_openrouter(messages)
        
        if "choices" not in ai_data:
            raise HTTPException(status_code=500, detail="Invalid AI Response")

        raw_content = ai_data["choices"][0]["message"]["content"]
        
        # 3. Clean and Parse JSON
        # Regex untuk membersihkan tag ```json ... ```
        cleaned_json = re.sub(r"^```json|```$", "", raw_content.strip(), flags=re.MULTILINE)
        data = json.loads(cleaned_json)
        
        questions = data.get("questions", [])
        
        # 4. Standardize output
        for i, q in enumerate(questions, start=1):
            q["id"] = f"q{i}"
            if "answer" in q and "correct_answer" not in q:
                q["correct_answer"] = q.pop("answer")
            if not q.get("category"):
                q["category"] = payload.category

        return {
            "category": payload.category,
            "slug": payload.slug,
            "order": payload.order,
            "questions": questions
        }

    except json.JSONDecodeError:
        logging.error(f"Failed to parse JSON: {raw_content}")
        raise HTTPException(status_code=500, detail="AI produced broken JSON")
    except Exception as e:
        logging.error(f"Generator Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel handler

handler = app
