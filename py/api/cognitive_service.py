from sqlalchemy import text
import statistics

MIN_TIME = 2.5
MAX_TIME = 90.0
IQR_MULTIPLIER = 1.5

DIMENSIONS = [
    "reading",
    "vocabulary",
    "reasoning",
    "analogy",
    "memory"
]


def iqr_bounds(values):
    if len(values) < 4:
        return None, None

    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    return q1 - IQR_MULTIPLIER * iqr, q3 + IQR_MULTIPLIER * iqr


def compute_cognitive_profile(db, user_id: str):

    result = db.execute(text("""
        SELECT 
            dimension,
            is_correct,
            duration_seconds
        FROM study_attempts
        WHERE user_id = :user_id
          AND duration_seconds IS NOT NULL
    """), {"user_id": user_id})

    rows = result.fetchall()

    scores = {dim: 0 for dim in DIMENSIONS}
    valid_counts = {dim: 0 for dim in DIMENSIONS}
    weighted_correct = {dim: 0.0 for dim in DIMENSIONS}
    total_attempts = 0
    valid_attempts = 0

    # ===== Group by dimension =====
    per_dim = {dim: [] for dim in DIMENSIONS}

    for row in rows:
        per_dim[row.dimension].append(row)
        total_attempts += 1

    # ===== Process each dimension =====
    for dim, attempts in per_dim.items():

        durations = [
            float(a.duration_seconds)
            for a in attempts
            if MIN_TIME <= float(a.duration_seconds) <= MAX_TIME
        ]

        if not durations:
            continue

        low, high = iqr_bounds(durations)

        for a in attempts:
            t = float(a.duration_seconds)

            if t < MIN_TIME or t > MAX_TIME:
                continue

            if low is not None and (t < low or t > high):
                continue

            # ===== Valid attempt =====
            valid_attempts += 1
            valid_counts[dim] += 1

            # ===== Validity weight =====
            if t < 5:
                weight = 0.7
            elif t > 60:
                weight = 0.75
            else:
                weight = 1.0

            if a.is_correct:
                weighted_correct[dim] += weight

    # ===== Final scoring =====
    for dim in DIMENSIONS:
        total = valid_counts[dim]
        if total == 0:
            continue

        accuracy = weighted_correct[dim] / total
        scores[dim] = round(accuracy * 100, 2)

    cognitive_index = round(sum(scores.values()) / len(DIMENSIONS), 2)

    return scores, cognitive_index, total_attempts, valid_attempts
