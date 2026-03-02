// js/lib/volatilityEngine.js

/**
 * Hitung standar deviasi (population std dev)
 */
export function calculateVolatility(values = []) {
  if (!Array.isArray(values) || values.length < 2) return 0;

  const mean =
    values.reduce((sum, v) => sum + v, 0) / values.length;

  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}

/**
 * Mapping level berdasarkan nilai volatility
 */
export function getVolatilityLevel(volatility) {
  if (volatility < 3) return "stable";
  if (volatility < 8) return "moderate";
  return "high";
}

/**
 * Meta untuk UI (label + class)
 */
export function getVolatilityMeta(level) {
  switch (level) {
    case "stable":
      return {
        label: "🟢 Stabil",
        className: "volatility-stable",
      };

    case "moderate":
      return {
        label: "🟡 Fluktuatif",
        className: "volatility-moderate",
      };

    case "high":
      return {
        label: "🔴 Tidak Stabil",
        className: "volatility-high",
      };

    default:
      return {
        label: "",
        className: "",
      };
  }
}

/**
 * Helper utama (pakai ini di controller)
 */
export function analyzeVolatility(values = []) {
  const value = calculateVolatility(values);
  const level = getVolatilityLevel(value);
  const meta = getVolatilityMeta(level);

  return {
    value,
    level,
    ...meta,
  };
}
