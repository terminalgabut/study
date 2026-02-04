import json
import re
from ai.client import call_ai
from .prompts import BASE_SYSTEM_PROMPT, build_quiz_prompt


class QuizGenerationError(Exception):
    pass

@app.post("/quiz/generate")
def generate_quiz_endpoint(payload: dict):
    return generate_quiz(
        materi=payload["materi"],
        category=payload["category"],
        slug=payload["slug"],
        order=payload["order"]
    )
def generate_quiz(materi: str, category: str, slug: str, order: int):
    messages = [
        {"role": "system", "content": BASE_SYSTEM_PROMPT},
        {"role": "user", "content": build_quiz_prompt(materi)}
    ]

    response = call_ai(messages)

    try:
        raw = response["choices"][0]["message"]["content"]
        cleaned = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE)
        parsed = json.loads(cleaned)
    except Exception:
        raise QuizGenerationError("AI tidak menghasilkan JSON valid")

    questions = parsed.get("questions", [])
    if not questions:
        raise QuizGenerationError("Soal kosong")

    for i, q in enumerate(questions, start=1):
        q["id"] = f"q{i}"

        # toleransi AI salah key
        if "answer" in q and "correct_answer" not in q:
            q["correct_answer"] = q.pop("answer")

        if not q.get("category"):
            q["category"] = category

    return {
        "category": category,
        "slug": slug,
        "order": order,
        "total_questions": len(questions),
        "questions": questions
    }
