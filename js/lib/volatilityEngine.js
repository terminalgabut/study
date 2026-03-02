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
    label: "🟢 Konsisten",
    className: "volatility-stable",
  };

case "moderate":
  return {
    label: "🟡 Variasi Wajar",
    className: "volatility-moderate",
  };

case "high":
  return {
    label: "🔴 Fluktuasi Tinggi",
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
 * Helper utama
 * Tambah data kecil untuk toolkit
 */
export function analyzeVolatility(values = []) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      value: 0,
      level: "stable",
      label: "🟢 Stabil",
      className: "volatility-stable",
      toolkit: [],
    };
  }

  const value = calculateVolatility(values);
  const level = getVolatilityLevel(value);
  const meta = getVolatilityMeta(level);

  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    value: Number(value.toFixed(1)),
    level,
    ...meta,

    // 🔥 Toolkit kecil, mirip tooltip chart
    let insight = "";

if (level === "stable") {
  insight = "Performa kamu konsisten di setiap sesi.";
} else if (level === "moderate") {
  insight = "Ada variasi ringan dalam performa.";
} else {
  insight = "Performa masih naik-turun cukup besar.";
}

toolkit: [
  `Stability Deviation (σ): ${value.toFixed(1)}`,
  `Berdasarkan ${values.length} sesi terbaru`,
  `Rentang skor: ${min}–${max}`,
  insight
],
  };
}
