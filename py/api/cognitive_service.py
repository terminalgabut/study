from sqlalchemy import text
import statistics
import math
import json

# ================= CONFIG =================
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

# ================= UTIL =================
def clamp(val, low=0.0, high=1.0):
    return max(low, min(high, val))


def iqr_bounds(values):
    if len(values) < 4:
        return None, None
    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    return q1 - IQR_MULTIPLIER * iqr, q3 + IQR_MULTIPLIER * iqr


# ================= STABILITY ENGINE =================
def compute_stability_metrics(attempts):
    if len(attempts) < 10:
        return 0, 0, 0, 0, 0, 0, 0

    correctness = [1 if a[0] else 0 for a in attempts]
    times = [float(a[1]) for a in attempts]

    # Accuracy stability
    window = 10
    acc_blocks = [
        sum(correctness[i:i + window]) / window
        for i in range(0, len(correctness) - window + 1, window)
    ]
    acc_std = statistics.pstdev(acc_blocks) if len(acc_blocks) > 1 else 0
    accuracy_stability = clamp(1 - (acc_std / 0.5))

    # Speed stability
    mean_time = statistics.mean(times)
    speed_std = statistics.pstdev(times) if len(times) > 1 else 0
    speed_variance = speed_std / mean_time if mean_time else 0
    speed_stability = clamp(1 - speed_variance)

    # Endurance
    n = len(correctness)
    start = correctness[: max(1, int(n * 0.3))]
    end = correctness[int(n * 0.7):]
    fatigue_drop = max(0, (sum(start) / len(start)) - (sum(end) / len(end)))
    endurance_index = clamp(1 - fatigue_drop)

    # Error consistency
    error_blocks = [
        1 - sum(correctness[i:i + window]) / window
        for i in range(0, len(correctness) - window + 1, window)
    ]
    err_std = statistics.pstdev(error_blocks) if len(error_blocks) > 1 else 0
    error_consistency = clamp(1 - (err_std / 0.5))

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


# ================= IQ CORE =================
def compute_iq_profile(scores, stability_index, valid_attempts):
    mean_score = sum(scores.values()) / len(scores)
    peak_score = max(scores.values())

    base_iq = (
        mean_score * 0.55 +
        peak_score * 0.25 +
        stability_index * 0.20
    )

    volume_bonus = math.log1p(valid_attempts) * 4

    return {
        "iq_estimated": round(base_iq + volume_bonus, 2),
        "iq_confidence": min(valid_attempts, 100)
    }


def classify_iq(iq_final):
    if iq_final >= 350:
        return "Ultra-Genius"
    elif iq_final >= 250:
        return "Elite Genius"
    elif iq_final >= 180:
        return "Genius"
    elif iq_final >= 130:
        return "Above Average"
    elif iq_final >= 85:
        return "Average"
    else:
        return "Below Average"


# ================= NEURO PROFILING =================
def assign_neuro_type(scores, stability_index):
    if scores["reasoning"] > 70 and scores["reading"] > 65:
        return "Analytical"
    elif scores["memory"] > 70 and stability_index > 60:
        return "Memory-Oriented"
    elif scores["analogy"] > 65:
        return "Creative"
    else:
        return "Balanced"


# ================= MAIN PIPELINE =================
def compute_cognitive_profile(db, user_id: str):

    rows = db.execute(text("""
        SELECT dimension, is_correct, duration_seconds
        FROM study_attempts
        WHERE user_id = :user_id
          AND duration_seconds IS NOT NULL
        ORDER BY submitted_at ASC
    """), {"user_id": user_id}).fetchall()

    scores = {d: 0 for d in DIMENSIONS}
    valid_counts = {d: 0 for d in DIMENSIONS}
    weighted_correct = {d: 0.0 for d in DIMENSIONS}

    total_attempts = 0
    valid_attempts = 0
    all_valid_attempts = []
    per_dim = {d: [] for d in DIMENSIONS}

    for r in rows:
        if r.dimension in DIMENSIONS:
            per_dim[r.dimension].append(r)
            total_attempts += 1

    # -------- scoring --------
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

            weight = 1.0
            if t < 5:
                weight = 0.5
            elif t > 60:
                weight = 0.75

            if len(all_valid_attempts) >= 3:
                if sum(x[0] for x in all_valid_attempts[-3:]) == 3:
                    weight *= 0.8

            if a.is_correct:
                weighted_correct[dim] += weight

    for dim in DIMENSIONS:
        if valid_counts[dim] > 0:
            scores[dim] = round(weighted_correct[dim] / valid_counts[dim] * 100, 2)

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

    # -------- IQ --------
    iq_profile = compute_iq_profile(scores, stability_index, valid_attempts)

    if len(all_valid_attempts) >= 5:
        fast_ratio = sum(1 for a in all_valid_attempts if a[0] and a[1] < 5) / len(all_valid_attempts)
        if fast_ratio > 0.5 and speed_stability < 50:
            iq_profile["iq_estimated"] *= 0.85
            iq_profile["iq_confidence"] *= 0.8

    confidence_factor = clamp(iq_profile["iq_confidence"] / 100, 0.4, 1.0)
    max_ceiling = 120 + confidence_factor * 300  # ≈ 420

    iq_final = min(
        round(iq_profile["iq_estimated"] * confidence_factor, 2),
        round(max_ceiling, 2)
    )

    iq_profile["iq_final"] = iq_final
    iq_profile["iq_class"] = classify_iq(iq_final)

    neuro_type = assign_neuro_type(scores, stability_index)
    fatigue_sensitivity = round(fatigue_drop, 2)
    burnout_risk_score = clamp((fatigue_drop * 0.7) + (speed_variance * 0.3), 0, 100)
    recovery_rate = clamp(stability_index - (fatigue_drop * 0.4), 0, 100)

    neuro_fingerprint = {
        "scores": scores,
        "iq_profile": iq_profile,
        "neuro_type": neuro_type,
        "stability_index": stability_index,
        "accuracy_stability": accuracy_stability,
        "speed_stability": speed_stability,
        "endurance_index": endurance_index,
        "error_consistency": error_consistency,
        "fatigue_drop": fatigue_drop,
        "speed_variance": speed_variance,
        "fatigue_sensitivity": fatigue_sensitivity,
        "burnout_risk_score": round(burnout_risk_score, 2), 
        "recovery_rate": round(recovery_rate, 2)
    }

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
        iq_profile,
        neuro_type,
        fatigue_sensitivity,
        scores,
        neuro_fingerprint,
        round(burnout_risk_score, 2), 
        round(recovery_rate, 2)
    )
