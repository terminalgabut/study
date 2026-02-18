from sqlalchemy import text

MAX_TIME = 60

DIMENSIONS = [
    "reading",
    "vocabulary",
    "reasoning",
    "analogy",
    "memory"
]


def compute_cognitive_profile(db, user_id: str):

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

    scores = {dim: 0 for dim in DIMENSIONS}
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

    cognitive_index = round(sum(scores.values()) / len(DIMENSIONS), 2)

    return scores, cognitive_index, total_attempts
