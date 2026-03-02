// root/js/lib/profileInsights.js
/* =========================================
   IQ INTERPRETATION – ADVANCED REFACTORED
========================================= */

function interpretIndex(value, label) {
  if (value >= 75) return `${label} sangat kuat dan stabil.`;
  if (value >= 55) return `${label} cukup stabil dengan sedikit variasi.`;
  if (value >= 40) return `${label} masih berkembang dan belum sepenuhnya konsisten.`;
  return `${label} masih perlu penguatan signifikan.`;
}

function detectCognitivePattern(speed, accuracy) {
  if (speed > 70 && accuracy < 50) {
    return "Terlihat pola impulsif: kecepatan tinggi namun akurasi belum stabil.";
  }

  if (accuracy > 70 && speed < 50) {
    return "Pola reflektif: akurasi kuat namun tempo relatif lambat.";
  }

  if (speed > 65 && accuracy > 65) {
    return "Kombinasi optimal antara kecepatan dan akurasi.";
  }

  return "";
}

function buildGrowthAdvice({ stability, accuracy, speed, endurance }) {
  if (stability < 50 && endurance < 50) {
    return "Disarankan fokus pada sesi latihan lebih panjang untuk meningkatkan stabilitas dan daya tahan.";
  }

  if (speed < 50) {
    return "Latihan berbasis time-pressure dapat membantu meningkatkan respons kognitif.";
  }

  if (accuracy < 50) {
    return "Latihan presisi dan evaluasi kesalahan akan membantu meningkatkan konsistensi akurasi.";
  }

  return "";
}

export function getIQInsight(summary) {
  if (!summary) return null;

  const iq = Number(summary.iq_final ?? summary.iq_estimated ?? 0);
  const iqClass = summary.iq_class || "Unknown";
  const neuroType = summary.neuro_type || "Unknown";
  const confidence = Number(summary.iq_confidence) || 0;

  const stability = Number(summary.stability_index) || 0;
  const accuracy = Number(summary.accuracy_stability) || 0;
  const speed = Number(summary.speed_stability) || 0;
  const endurance = Number(summary.endurance_index) || 0;
  const consistency = Number(summary.error_consistency) || 0;

  /* =====================================
     IQ LEVEL INTERPRETATION
  ===================================== */

  let iqDescription = "";

  if (confidence < 30) {
    iqDescription =
      "Estimasi Cognitive Poin masih awal dan memiliki tingkat kepastian rendah.";
  } else {
    switch (iqClass) {
      case "Below Average":
        iqDescription =
          "Performa kognitif saat ini berada di bawah rata-rata.";
        break;
      case "Average":
        iqDescription =
          "Kemampuan kognitif berada dalam rentang rata-rata.";
        break;
      case "Above Average":
        iqDescription =
          "Performa kognitif berada di atas rata-rata.";
        break;
      default:
        iqDescription = "Profil kognitif sedang dianalisis.";
    }
  }

  /* =====================================
     DIMENSION INTERPRETATION
  ===================================== */

  const dimensionInsights = [
    interpretIndex(stability, "Stabilitas performa"),
    interpretIndex(accuracy, "Akurasi"),
    interpretIndex(speed, "Kecepatan"),
    interpretIndex(endurance, "Daya tahan kognitif"),
    interpretIndex(consistency, "Konsistensi kesalahan"),
  ];

  /* =====================================
     PATTERN DETECTION
  ===================================== */

  const cognitivePattern = detectCognitivePattern(speed, accuracy);

  /* =====================================
     GROWTH RECOMMENDATION
  ===================================== */

  const growthAdvice = buildGrowthAdvice({
    stability,
    accuracy,
    speed,
    endurance,
  });

  /* =====================================
     CONFIDENCE NOTE
  ===================================== */

  let confidenceNote = "";

  if (confidence < 30) {
    confidenceNote =
      " Interpretasi ini bersifat sementara karena data masih terbatas.";
  } else if (confidence < 60) {
    confidenceNote =
      " Interpretasi memiliki tingkat kepastian menengah dan akan semakin presisi seiring tambahan sesi.";
  }

  /* =====================================
     NEURO TYPE
  ===================================== */

  let neuroDescription = "";

  if (neuroType === "Balanced") {
    neuroDescription =
      "Profil menunjukkan keseimbangan antara kecepatan dan akurasi.";
  } else if (neuroType === "Speed Dominant") {
    neuroDescription =
      "Cenderung cepat dalam menjawab, perlu menjaga stabilitas akurasi.";
  } else if (neuroType === "Accuracy Dominant") {
    neuroDescription =
      "Cenderung presisi dan reflektif dengan tempo lebih terkontrol.";
  }

  return {
    iq,
    iqClass,
    confidence,
    neuroType,
    iqDescription:
      iqDescription +
      " " +
      dimensionInsights.join(" ") +
      " " +
      cognitivePattern +
      " " +
      growthAdvice +
      confidenceNote,
    neuroDescription,
  };
  }
