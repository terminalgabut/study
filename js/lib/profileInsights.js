// root/js/lib/profileInsights.js
/* =========================================
   IQ INTERPRETATION – ADVANCED
========================================= */

export function getIQInsight(summary) {
  if (!summary) return null;

  const iq = Number(summary.iq_estimated) || 0;
  const iqClass = summary.iq_class || "Unknown";
  const neuroType = summary.neuro_type || "Unknown";
  const confidence = Number(summary.iq_confidence) || 0;

  const stability = Number(summary.stability_index) || 0;
  const accuracy = Number(summary.accuracy_stability) || 0;
  const speed = Number(summary.speed_stability) || 0;
  const endurance = Number(summary.endurance_index) || 0;
  const consistency = Number(summary.error_consistency) || 0;

  let iqDescription = "";
  let neuroDescription = "";
  let reasons = [];

  /* =====================================
     IQ LEVEL INTERPRETATION
  ===================================== */

  if (confidence < 30) {
    iqDescription =
      "Estimasi Conitive Poin masih sangat awal dan memiliki tingkat kepastian rendah. Skor dapat berubah seiring bertambahnya data latihan.";
  } else {
    switch (iqClass) {
      case "Below Average":
        iqDescription =
          "Skor menunjukkan performa kognitif masih di bawah rata-rata saat ini.";
        break;
      case "Average":
        iqDescription =
          "Skor menunjukkan kemampuan berada dalam rentang rata-rata.";
        break;
      case "Above Average":
        iqDescription =
          "Skor menunjukkan performa kognitif di atas rata-rata.";
        break;
      default:
        iqDescription = "Profil kognitif sedang dianalisis.";
    }
  }

  /* =====================================
     CAUSAL ANALYSIS (WHY THIS SCORE)
  ===================================== */

  if (stability < 40)
    reasons.push("Performa belum stabil antar sesi.");

  if (accuracy < 40)
    reasons.push("Tingkat akurasi masih fluktuatif.");

  if (speed < 40)
    reasons.push("Kecepatan belum konsisten.");

  if (endurance < 40)
    reasons.push("Daya tahan kognitif masih rendah dalam sesi panjang.");

  if (consistency < 40)
    reasons.push("Tingkat kesalahan belum konsisten.");

  if (confidence < 30)
    reasons.push("Data latihan masih sedikit sehingga estimasi belum solid.");

  /* =====================================
     NEURO TYPE INTERPRETATION
  ===================================== */

  if (neuroType === "Balanced") {
    neuroDescription =
      "Profil menunjukkan keseimbangan antara kecepatan dan akurasi.";
  } else if (neuroType === "Speed Dominant") {
    neuroDescription =
      "Cenderung cepat dalam menjawab, namun perlu menjaga stabilitas akurasi.";
  } else if (neuroType === "Accuracy Dominant") {
    neuroDescription =
      "Cenderung berhati-hati dan presisi, dengan tempo lebih terkontrol.";
  }

  const causalExplanation =
    reasons.length > 0
      ? " Faktor yang memengaruhi skor saat ini: " + reasons.join(" ")
      : "";

  return {
    iq,
    iqClass,
    confidence,
    neuroType,
    iqDescription: iqDescription + causalExplanation,
    neuroDescription
  };
}
