from fastapi import APIRouter
from sqlalchemy import text
from api.database import SessionLocal
from api.cognitive_service import compute_cognitive_profile

router = APIRouter(prefix="/cognitive", tags=["Cognitive"])


@router.post("/compute-profile/{user_id}")
def compute_profile(user_id: str):

    db = SessionLocal()
    try:
        scores,
        cognitive_index,
        total_attempts,
        valid_attempts,
        stability_index,
        accuracy_stability,
        speed_stability,
        endurance_index,
        error_consistency,
        fatigue_drop,
        speed_variance,
        iq_profile
        = compute_cognitive_profile(db, user_id)

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
    stability_index,
    accuracy_stability,
    speed_stability,
    endurance_index,
    error_consistency,
    fatigue_drop,
    speed_variance,
    now(),
    last_computed_at,
    iq_estimated,
    iq_confidence,
    iq_class
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
    :stability_index,
    :accuracy_stability,
    :speed_stability,
    :endurance_index,
    :error_consistency,
    :fatigue_drop,
    :speed_variance,
    :iq_estimated,
    :iq_confidence,
    :iq_class
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
    stability_index = EXCLUDED.stability_index,
    accuracy_stability = EXCLUDED.accuracy_stability,
    speed_stability = EXCLUDED.speed_stability,
    endurance_index = EXCLUDED.endurance_index,
    error_consistency = EXCLUDED.error_consistency,
    fatigue_drop = EXCLUDED.fatigue_drop,
    speed_variance = EXCLUDED.speed_variance,
    iq_estimated = EXCLUDED.iq_estimated,
    iq_confidence = EXCLUDED.iq_confidence,
    iq_class = EXCLUDED.iq_class,
    last_computed_at = now();
"""), {
    "user_id": user_id,
    "reading": scores.get("reading", 0),
    "vocabulary": scores.get("vocabulary", 0),
    "reasoning": scores.get("reasoning", 0),
    "analogy": scores.get("analogy", 0),
    "memory": scores.get("memory", 0),
    "cognitive_index": cognitive_index,
    "total_attempts": total_attempts,
    "valid_attempts": valid_attempts,
    "stability_index": stability_index,
    "accuracy_stability": accuracy_stability,
    "speed_stability": speed_stability,
    "endurance_index": endurance_index,
    "error_consistency": error_consistency,
    "fatigue_drop": fatigue_drop,
    "speed_variance": speed_variance,
    "iq_estimated": iq_profile["iq_estimated"],
    "iq_confidence": iq_profile["iq_confidence"],
    "iq_class": iq_profile["iq_class"]
})

        db.commit()

        return {
    "status": "computed",
    "scores": scores,
    "cognitive_index": cognitive_index,
    "stability_index": stability_index,
    "iq_profile": iq_profile
}

    finally:
        db.close()
