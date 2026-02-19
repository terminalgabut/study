// root/js/lib/trendEngine.js

/* =========================================
   CORE INTELLIGENCE TREND ENGINE
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

function calculateStability(values) {
  if (!values.length) return 0;

  const avg = average(values);
  const variance =
    average(values.map(v => Math.pow(v - avg, 2)));

  const stdDev = Math.sqrt(variance);

  // Skala 0-100 (semakin kecil deviasi semakin stabil)
  return Math.max(0, 100 - stdDev);
}

function classifyTrend(delta) {
  if (delta > 5) return "uptrend_strong";
  if (delta > 2) return "uptrend";
  if (delta < -5) return "downtrend_strong";
  if (delta < -2) return "downtrend";
  return "stable";
}

/* =========================================
   MAIN BUILDER
========================================= */

export function buildTrendAnalysis(sessions = [], options = {}) {

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  const {
    trendWindow = 8,
    strengthMode = "personal_best" // or "average"
  } = options;

  /* ===============================
     1️⃣ IQ TREND
  =============================== */

  const recentSessions = sessions.slice(-trendWindow);

  const iqTrend = recentSessions.map(s => ({
    date: s.date || s.session_at || null,
    value: Number(s.iq_estimated) || 0
  }));

  const firstIQ = iqTrend[0]?.value || 0;
  const lastIQ = iqTrend[iqTrend.length - 1]?.value || 0;

  const delta = lastIQ - firstIQ;
  const deltaPercent = percentChange(firstIQ, lastIQ);
  const trendStatus = classifyTrend(delta);

  const stabilityScore = calculateStability(
    iqTrend.map(i => i.value)
  );

  /* ===============================
     2️⃣ DOMAIN STRENGTH / WEAKNESS
  =============================== */

  const domains = detectDomains();
  const lastSession = sessions[sessions.length - 1];

  const domainStats = domains.map(domainKey => {

    const avg = average(sessions.map(s => s[domainKey] || 0));
    const best = personalBest(sessions, domainKey);
    const current = Number(lastSession[domainKey]) || 0;

    let percent = 0;

    if (strengthMode === "personal_best") {
      percent = percentChange(best, current);
    } else {
      percent = percentChange(avg, current);
    }

    return {
      key: domainKey,
      current,
      avg,
      best,
      percent
    };
  });

  domainStats.sort((a, b) => b.percent - a.percent);

  const strength = domainStats[0];
  const weakness = domainStats[domainStats.length - 1];

  /* ===============================
     3️⃣ CONFIDENCE CHECK
  =============================== */

  const lastConfidence = Number(lastSession.iq_confidence) || 0;

  let confidenceNote = null;

  if (lastConfidence < 30) {
    confidenceNote =
      "Data masih terbatas, estimasi bisa berubah signifikan.";
  }

  /* ===============================
     4️⃣ STRUCTURAL IMBALANCE CHECK
  =============================== */

  const values = domainStats.map(d => d.current);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  const imbalanceDetected = (maxVal - minVal > 60);

  /* ===============================
     FINAL RETURN
  =============================== */

  return {
    iqTrend,
    delta,
    deltaPercent: Number(deltaPercent.toFixed(1)),
    trendStatus,
    stabilityScore: Number(stabilityScore.toFixed(1)),

    strength: {
      name: strength.key,
      percent: Number(strength.percent.toFixed(1)),
      current: strength.current
    },

    weakness: {
      name: weakness.key,
      percent: Number(weakness.percent.toFixed(1)),
      current: weakness.current
    },

    confidence: lastConfidence,
    confidenceNote,
    imbalanceDetected
  };
}
