// root/js/lib/trendEngine.js

/* =========================================
   CORE INTELLIGENCE TREND ENGINE
========================================= */

function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function percentChange(oldVal, newVal) {
  if (!oldVal || oldVal === 0) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
}

function personalBest(sessions, key) {
  return Math.max(...sessions.map(s => s[key] || 0));
}

function detectDomains(sessions) {
  const sample = sessions[0];
  return Object.keys(sample).filter(key =>
    key.includes("_score")
  );
}

/* =========================================
   MAIN BUILDER
========================================= */

export function buildTrendAnalysis(sessions = [], options = {}) {

  if (!sessions || sessions.length === 0) {
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

  const firstIQ = iqTrend[0] || 0;
  const lastIQ = iqTrend[iqTrend.length - 1] || 0;

  const delta = lastIQ - firstIQ;
  const deltaPercent = percentChange(firstIQ, lastIQ);

  /* ===============================
     2️⃣ DOMAIN STRENGTH / WEAKNESS
  =============================== */

  const domains = detectDomains(sessions);

  const lastSession = sessions[sessions.length - 1];

  const domainStats = domains.map(domainKey => {

    const avg = average(sessions.map(s => s[domainKey] || 0));
    const best = personalBest(sessions, domainKey);
    const current = lastSession[domainKey] || 0;

    let percent = 0;

    if (strengthMode === "personal_best") {
      percent = percentChange(best, current);
    } else {
      percent = percentChange(avg, current);
    }

    return {
      key: domainKey.replace("_score", ""),
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
     3️⃣ CONFIDENCE WARNING
  =============================== */

  const lastConfidence = lastSession.iq_confidence || 0;

  let confidenceNote = null;

  if (lastConfidence < 30) {
    confidenceNote = "Data masih terbatas, estimasi bisa berubah signifikan.";
  }

  /* ===============================
     4️⃣ STRUCTURAL IMBALANCE CHECK
  =============================== */

  const values = domainStats.map(d => d.current);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  let imbalanceDetected = false;

  if (maxVal - minVal > 60) {
    imbalanceDetected = true;
  }

  /* ===============================
     FINAL RETURN
  =============================== */

  return {
    iqTrend,
    delta,
    deltaPercent: Number(deltaPercent.toFixed(1)),

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
