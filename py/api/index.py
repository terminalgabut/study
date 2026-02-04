import os
import logging
import requests
import json
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import modul lokal yang tersisa
from . import generator
from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt

app = FastAPI()

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-2.0-flash-exp"

# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI CLIENT LOGIC (Pindahan dari client.py) ---
class AIClientError(Exception):
    pass

def call_ai(
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7
) -> Dict[str, Any]:
    if not OPENROUTER_API_KEY:
        raise AIClientError("OPENROUTER_API_KEY belum diset di Environment Variables Vercel")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study-app.vercel.app",
        "X-Title": "Study AI"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"AI Call Error: {str(e)}")
        raise AIClientError(f"Gagal menghubungi AI: {str(e)}")

# --- SCHEMAS ---
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

# --- ROUTES ---
@app.get("/")
def health_check():
    return {"status": "AI API is Online", "config": "Merged Client"}

@app.post("/generator")
def quiz_generate(payload: QuizRequest):
    try:
        # Menyiapkan Prompt
        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": build_quiz_prompt(payload.materi)}
        ]

        # Memanggil AI
        ai_response = call_ai(messages)
        
        # Parsing Content
        raw_content = ai_response["choices"][0]["message"]["content"]
        
        # Bersihkan JSON dari Markdown
        cleaned_json = re.sub(r"^```json|```$", "", raw_content.strip(), flags=re.MULTILINE)
        data = json.loads(cleaned_json)
        
        questions = data.get("questions", [])
        
        # Post-processing Soal
        for i, q in enumerate(questions, start=1):
            q["id"] = f"q{i}"
            if not q.get("category"):
                q["category"] = payload.category
        
        return {
            "category": payload.category,
            "slug": payload.slug,
            "order": payload.order,
            "questions": questions
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI menghasilkan format data yang rusak")
    except AIClientError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logging.error(f"General Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel Handler
handler = app
