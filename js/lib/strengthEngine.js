// root/js/lib/strengthEngine.js

/* =========================================
   DOMAIN STRENGTH ENGINE
   Consistent with trendEngine architecture
========================================= */

function average(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function percentChange(oldVal, newVal) {
  if (!oldVal || oldVal === 0) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
}

function personalBest(sessions, key) {
  return Math.max(...sessions.map(s => Number(s[key]) || 0));
}

function detectDomains() {
  return ["memory", "reading", "reasoning", "analogy", "vocabulary"];
}

function classifyLevel(score) {
  if (score >= 85) return "elite";
  if (score >= 70) return "strong";
  if (score >= 55) return "moderate";
  if (score >= 40) return "developing";
  return "weak";
}

/* =========================================
   MAIN BUILDER
========================================= */

export function buildStrengthProfile(sessions = [], options = {}) {

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  const {
    comparisonMode = "personal_best" // or "average"
  } = options;

  const domains = detectDomains();
  const lastSession = sessions[sessions.length - 1];

  const domainStats = domains.map(domainKey => {

    const avg = average(sessions.map(s => s[domainKey] || 0));
    const best = personalBest(sessions, domainKey);
    const current = Number(lastSession[domainKey]) || 0;

    let percent = 0;

    if (comparisonMode === "personal_best") {
      percent = percentChange(best, current);
    } else {
      percent = percentChange(avg, current);
    }

    return {
      key: domainKey,
      current,
      avg,
      best,
      percent: Number(percent.toFixed(1)),
      level: classifyLevel(current)
    };
  });

  /* ===============================
     RANKING
  =============================== */

  const ranked = [...domainStats].sort((a, b) => b.current - a.current);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];

  /* ===============================
     BALANCE CHECK
  =============================== */

  const values = ranked.map(d => d.current);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  const imbalanceScore = maxVal - minVal;
  const imbalanceDetected = imbalanceScore > 60;

  /* ===============================
     CONSISTENCY SCORE
  =============================== */

  const consistencyScore = 100 - imbalanceScore;
  const normalizedConsistency =
    Math.max(0, Math.min(100, consistencyScore));

  /* ===============================
     FINAL RETURN
  =============================== */

  return {
    domains: domainStats,
    ranked,
    strongest: {
      name: strongest.key,
      score: strongest.current,
      level: strongest.level
    },
    weakest: {
      name: weakest.key,
      score: weakest.current,
      level: weakest.level
    },
    imbalanceDetected,
    imbalanceScore,
    consistencyScore: Number(normalizedConsistency.toFixed(1))
  };
}
