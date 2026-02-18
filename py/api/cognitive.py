from fastapi import APIRouter
from sqlalchemy import text
from api.database import SessionLocal
from api.cognitive_service import compute_cognitive_profile

router = APIRouter(prefix="/cognitive", tags=["Cognitive"])


@router.post("/compute-profile/{user_id}")
def compute_profile(user_id: str):

    db = SessionLocal()
    try:
        scores, cognitive_index, total_attempts, valid_attempts = compute_cognitive_profile(db, user_id)
        
        db.execute(text("""
    INSERT INTO user_cognitive_profile (
        user_id,
        reading_score,
        vocabulary_score,
        reasoning_score,
        analogy_score,
        memory_score,
        cognitive_index,
        total_attempts,
        valid_attempts,
        last_computed_at
    )
    VALUES (
        :user_id,
        :reading,
        :vocabulary,
        :reasoning,
        :analogy,
        :memory,
        :cognitive_index,
        :total_attempts,
        :valid_attempts,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
    reading_score = EXCLUDED.reading_score,
    vocabulary_score = EXCLUDED.vocabulary_score,
    reasoning_score = EXCLUDED.reasoning_score,
    analogy_score = EXCLUDED.analogy_score,
    memory_score = EXCLUDED.memory_score,
    cognitive_index = EXCLUDED.cognitive_index,
    total_attempts = EXCLUDED.total_attempts,
    valid_attempts = EXCLUDED.valid_attempts,
    last_computed_at = now();
"""), {
    "user_id": user_id,
    "reading": scores.get("reading", 0),
    "vocabulary": scores.get("vocabulary", 0),
    "reasoning": scores.get("reasoning", 0),
    "analogy": scores.get("analogy", 0),
    "memory": scores.get("memory", 0),
    "cognitive_index": cognitive_index,
    "total_attempts": total_attempts
})

        db.commit()

        return {
            "status": "computed",
            "scores": scores,
            "cognitive_index": cognitive_index
        }

    finally:
        db.close()
