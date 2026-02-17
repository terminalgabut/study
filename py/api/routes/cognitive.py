from fastapi import APIRouter
from sqlalchemy import text
from app.database import SessionLocal

router = APIRouter(prefix="/cognitive", tags=["Cognitive"])

MAX_TIME = 60

@router.post("/compute-profile/{user_id}")
def compute_profile(user_id: str):

    db = SessionLocal()
    try:
        result = db.execute(text("""
            SELECT 
                dimension,
                COUNT(*) as total,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
                AVG(duration_seconds) as avg_time
            FROM study_attempts
            WHERE user_id = :user_id
            GROUP BY dimension
        """), {"user_id": user_id})

        rows = result.fetchall()

        scores = {
            "Pemahaman Bacaan": 0,
            "Kosakata & Semantik": 0,
            "Penalaran Verbal": 0,
            "Hubungan Analogi": 0,
            "Memori Kerja Verbal": 0
        }

        total_attempts = 0

        for row in rows:
            dim = row.dimension
            total = row.total
            correct = row.correct or 0
            avg_time = row.avg_time or MAX_TIME

            accuracy = correct / total if total > 0 else 0
            speed_score = 1 - (avg_time / MAX_TIME)
            speed_score = max(0, min(speed_score, 1))

            final_score = (accuracy * 0.7) + (speed_score * 0.3)
            final_score_scaled = round(final_score * 100, 2)

            if dim in scores:
                scores[dim] = final_score_scaled

            total_attempts += total

        cognitive_index = round(sum(scores.values()) / 5, 2)

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
