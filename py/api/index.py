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

# Import hanya prompts (pastikan file api/prompts.py ada)
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

# --- AI CLIENT FUNCTION ---
def call_ai(messages: List[Dict[str, str]]):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="API Key belum dikonfigurasi di Vercel")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study-app.vercel.app",
        "X-Title": "Study AI"
    }
    payload = {
        "model": DEFAULT_MODEL,
        "messages": messages,
        "temperature": 0.7
    }

    response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
    if response.status_code != 200:
        logging.error(f"OpenRouter Error: {response.text}")
        raise HTTPException(status_code=502, detail="Gagal mendapatkan respon dari AI")
    return response.json()

# --- SCHEMAS ---
class QuizRequest(BaseModel):
    materi: str
    category: str
    slug: str
    order: int

# --- ROUTES ---
@app.get("/")
def health_check():
    return {"status": "Online", "version": "2.0-merged"}

@app.post("/generator")
async def quiz_generate(payload: QuizRequest):
    try:
        # 1. Siapkan Prompt
        messages = [
            {"role": "system", "content": BASE_SYSTEM_PROMPT},
            {"role": "user", "content": build_quiz_prompt(payload.materi)}
        ]

        # 2. Panggil AI
        ai_data = call_ai(messages)
        raw_content = ai_data["choices"][0]["message"]["content"]
        
        # 3. Bersihkan & Parse JSON
        cleaned_json = re.sub(r"^```json|```$", "", raw_content.strip(), flags=re.MULTILINE)
        parsed_data = json.loads(cleaned_json)
        
        questions = parsed_data.get("questions", [])
        
        # 4. Format Output
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

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

handler = app

deError:
        raise HTTPException(status_code=500, detail="AI menghasilkan format data yang rusak")
    except AIClientError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logging.error(f"General Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel Handler
handler = app
