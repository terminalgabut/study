import logging
import json
import re  # WAJIB TAMBAHKAN INI
from fastapi import APIRouter
from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt
from .client import call_ai

router = APIRouter()

class QuizGenerationError(Exception):
    pass

def generate_quiz(materi: str, category: str, slug: str, order: int):
    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(materi)}
    ]

    response = call_ai(messages)

    try:
        raw = response["choices"][0]["message"]["content"]
        # Membersihkan tag markdown JSON
        cleaned = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
    except Exception as e:
        logging.error(f"Gagal parse JSON: {str(e)}")
        raise QuizGenerationError("AI tidak menghasilkan JSON valid")

    questions = parsed.get("questions", [])
    for i, q in enumerate(questions, start=1):
        q["id"] = f"q{i}"
        if "answer" in q and "correct_answer" not in q:
            q["correct_answer"] = q.pop("answer")
        if not q.get("category"):
            q["category"] = category

    return {
        "category": category,
        "slug": slug,
        "order": order,
        "questions": questions
    }
