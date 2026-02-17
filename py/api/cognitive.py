from fastapi import APIRouter
from sqlalchemy import text
from api.database import SessionLocal
from api.cognitive_service import compute_cognitive_profile

router = APIRouter(prefix="/cognitive", tags=["Cognitive"])


@router.post("/compute-profile/{user_id}")
def compute_profile(user_id: str):

    db = SessionLocal()
    try:
        scores, cognitive_index, total_attempts = compute_cognitive_profile(db, user_id)

        db.execute(text("""
            INSERT INTO user_cognitive_profile (
                user_id,
                verbal_score,
                logical_score,
                memory_score,
                spatial_score,
                attention_score,
                cognitive_index,
                total_attempts,
                last_computed_at
            )
            VALUES (
                :user_id,
                :v1,
                :v2,
                :v3,
                :v4,
                :v5,
                :cognitive_index,
                :total_attempts,
                now()
            )
            ON CONFLICT (user_id) DO UPDATE SET
                verbal_score = EXCLUDED.verbal_score,
                logical_score = EXCLUDED.logical_score,
                memory_score = EXCLUDED.memory_score,
                spatial_score = EXCLUDED.spatial_score,
                attention_score = EXCLUDED.attention_score,
                cognitive_index = EXCLUDED.cognitive_index,
                total_attempts = EXCLUDED.total_attempts,
                last_computed_at = now();
        """), {
            "user_id": user_id,
            "v1": scores["Pemahaman Bacaan"],
            "v2": scores["Kosakata & Semantik"],
            "v3": scores["Penalaran Verbal"],
            "v4": scores["Hubungan Analogi"],
            "v5": scores["Memori Kerja Verbal"],
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
