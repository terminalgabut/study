import json
import re

from ai.client import call_ai
from .prompts import SYSTEM_PROMPT, build_user_prompt


class QuizGenerationError(Exception):
    pass


def generate_quiz(
    materi: str,
    category: str,
    slug: str,
    order: int,
    jumlah_soal: int = 5
):
    """
    Generator soal AI
    LOGIC & OUTPUT mengikuti quiz.py original
    """

    if not materi or len(materi.strip()) < 50:
        raise QuizGenerationError("Materi terlalu pendek untuk dibuat soal")

    # ===== build prompt (SAMA SEPERTI quiz.py) =====
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": build_user_prompt(
                materi=materi,
                jumlah_soal=jumlah_soal
            )
        }
    ]

    # ===== call AI =====
    response = call_ai(messages)

    if not response:
        raise QuizGenerationError("AI tidak mengembalikan response")

    # ===== ambil text dari AI =====
    try:
        raw_text = response["choices"][0]["message"]["content"]
    except Exception:
        raise QuizGenerationError("Format response AI tidak valid")

    # ===== bersihkan kemungkinan markdown ```json =====
    cleaned = re.sub(r"^```json|```$", "", raw_text.strip(), flags=re.MULTILINE)

    # ===== parse JSON =====
    try:
        quiz_data = json.loads(cleaned)
    except json.JSONDecodeError:
        raise QuizGenerationError("AI mengembalikan JSON tidak valid")

    # ===== validasi struktur (SAMA DENGAN quiz.py) =====
    if not isinstance(quiz_data, dict):
        raise QuizGenerationError("Output AI bukan object")

    questions = quiz_data.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        raise QuizGenerationError("Soal kosong atau format salah")

    for q in questions:
        if not all(k in q for k in ["question", "options", "answer"]):
            raise QuizGenerationError("Struktur soal tidak lengkap")

        if not isinstance(q["options"], list) or len(q["options"]) < 2:
            raise QuizGenerationError("Opsi jawaban tidak valid")

    # ===== output FINAL (KONTRAK TETAP) =====
    return {
        "category": category,
        "slug": slug,
        "order": order,
        "total_questions": len(questions),
        "questions": questions
  }
