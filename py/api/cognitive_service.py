from sqlalchemy import text
import statistics
import math

MIN_TIME = 2.5
MAX_TIME = 60.0
IQR_MULTIPLIER = 1.5

DIMENSIONS = [
    "reading",
    "vocabulary",
    "reasoning",
    "analogy",
    "memory"
]


def clamp(val, low=0.0, high=1.0):
    return max(low, min(high, val))


def iqr_bounds(values):
    if len(values) < 4:
        return None, None

    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    return q1 - IQR_MULTIPLIER * iqr, q3 + IQR_MULTIPLIER * iqr


def compute_stability_metrics(attempts):
    """
    attempts = list of (is_correct, duration_seconds)
    """

    if len(attempts) < 10:
        return 0, 0, 0, 0, 0, 0, 0

    correctness = [1 if a[0] else 0 for a in attempts]
    times = [float(a[1]) for a in attempts]

    # ===== Accuracy Stability =====
    window = 10
    acc_blocks = [
        sum(correctness[i:i+window]) / window
        for i in range(0, len(correctness) - window + 1, window)
    ]

    acc_std = statistics.pstdev(acc_blocks) if len(acc_blocks) > 1 else 0
    accuracy_stability = clamp(1 - (acc_std / 0.5))

    # ===== Speed Stability =====
    mean_time = statistics.mean(times)
    speed_std = statistics.pstdev(times) if len(times) > 1 else 0
    speed_variance = speed_std / mean_time if mean_time else 0
    speed_stability = clamp(1 - speed_variance)

    # ===== Cognitive Endurance =====
    n = len(correctness)
    s1 = correctness[: max(1, int(n * 0.3))]
    s3 = correctness[int(n * 0.7):]

    acc_start = sum(s1) / len(s1)
    acc_end = sum(s3) / len(s3)

    fatigue_drop = max(0, acc_start - acc_end)
    endurance_index = clamp(1 - fatigue_drop)

    # ===== Error Consistency =====
    error_blocks = [
        1 - sum(correctness[i:i+window]) / window
        for i in range(0, len(correctness) - window + 1, window)
    ]

    if len(error_blocks) > 1:
        err_std = statistics.pstdev(error_blocks)
        error_consistency = clamp(1 - (err_std / 0.5))
    else:
        error_consistency = 1.0

    # ===== Final Stability Index =====
    stability_index = (
        accuracy_stability * 0.40 +
        speed_stability * 0.25 +
        endurance_index * 0.25 +
        error_consistency * 0.10
    )

    return (
        round(stability_index * 100, 2),
        round(accuracy_stability * 100, 2),
        round(speed_stability * 100, 2),
        round(endurance_index * 100, 2),
        round(error_consistency * 100, 2),
        round(fatigue_drop * 100, 2),
        round(speed_variance * 100, 2)
    )


def compute_cognitive_profile(db, user_id: str):

    result = db.execute(text("""
        SELECT 
            dimension,
            is_correct,
            duration_seconds
        FROM study_attempts
        WHERE user_id = :user_id
          AND duration_seconds IS NOT NULL
        ORDER BY created_at ASC
    """), {"user_id": user_id})

    rows = result.fetchall()

    scores = {dim: 0 for dim in DIMENSIONS}
    valid_counts = {dim: 0 for dim in DIMENSIONS}
    weighted_correct = {dim: 0.0 for dim in DIMENSIONS}

    total_attempts = 0
    valid_attempts = 0

    all_valid_attempts = []

    per_dim = {dim: [] for dim in DIMENSIONS}

    for row in rows:
        per_dim[row.dimension].append(row)
        total_attempts += 1

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

            valid_attempts += 1
            valid_counts[dim] += 1

            all_valid_attempts.append((a.is_correct, t))

            if t < 5:
                weight = 0.7
            elif t > 60:
                weight = 0.75
            else:
                weight = 1.0

            if a.is_correct:
                weighted_correct[dim] += weight

    for dim in DIMENSIONS:
        total = valid_counts[dim]
        if total == 0:
            continue

        accuracy = weighted_correct[dim] / total
        scores[dim] = round(accuracy * 100, 2)

    cognitive_index = round(sum(scores.values()) / len(DIMENSIONS), 2)

    (
        stability_index,
        accuracy_stability,
        speed_stability,
        endurance_index,
        error_consistency,
        fatigue_drop,
        speed_variance
    ) = compute_stability_metrics(all_valid_attempts)

    iq_profile = compute_iq_profile(
        scores,
        stability_index,
        valid_attempts
    )

    return (
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
    )
