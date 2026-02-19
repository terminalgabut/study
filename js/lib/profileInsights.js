// root/js/lib/profileInsights.js
/* =========================================
   IQ INTERPRETATION
========================================= */

export function getIQInsight(summary) {
  if (!summary) return null;

  const iq = summary.iq_estimated || 0;
  const iqClass = summary.iq_class || "Unknown";
  const neuroType = summary.neuro_type || "Unknown";

  let iqDescription = "";
  let neuroDescription = "";

  /* ===== IQ CLASS INTERPRETATION ===== */

  switch (iqClass) {
    case "Below Average":
      iqDescription = "Kemampuan kognitif saat ini masih bisa ditingkatkan melalui latihan konsisten dan penguatan dasar.";
      break;
    case "Average":
      iqDescription = "Kemampuan kognitif berada pada rentang rata-rata. Konsistensi latihan dapat meningkatkan performa.";
      break;
    case "Above Average":
      iqDescription = "Menunjukkan kemampuan analitis dan pemrosesan informasi yang kuat.";
      break;
    default:
      iqDescription = "Profil kognitif sedang dianalisis.";
  }

  /* ===== NEURO TYPE ===== */

  if (neuroType === "Balanced") {
    neuroDescription = "Profil menunjukkan keseimbangan antara kecepatan dan akurasi.";
  } else if (neuroType === "Speed Dominant") {
    neuroDescription = "Cenderung cepat dalam menjawab namun perlu menjaga konsistensi akurasi.";
  } else if (neuroType === "Accuracy Dominant") {
    neuroDescription = "Cenderung hati-hati dan presisi dalam menjawab.";
  }

  return {
    iq,
    iqClass,
    iqDescription,
    neuroType,
    neuroDescription,
    confidence: summary.iq_confidence || 0
  };
}
