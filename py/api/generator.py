import json
import re # WAJIB ADA
import logging
from fastapi import APIRouter
from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt
from .client import call_ai

router = APIRouter() # WAJIB ADA

def generate_quiz(materi: str, category: str, slug: str, order: int):
    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(materi)}
    ]

    response = call_ai(messages)
    
    try:
        raw = response["choices"][0]["message"]["content"]
        # Membersihkan blok kode JSON
        cleaned = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
        
        return {
            "category": category,
            "slug": slug,
            "order": order,
            "questions": parsed.get("questions", [])
        }
    except Exception as e:
        logging.error(f"JSON Error: {str(e)}")
        raise ValueError("AI gagal menghasilkan format soal yang benar")
