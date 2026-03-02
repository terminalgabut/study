/* =========================================
   INTERACTIVE STRENGTH NARRATIVE (REFACTORED)
========================================= */

const domainLabel = {
  memory: "Memory",
  reading: "Reading",
  reasoning: "Reasoning",
  analogy: "Analogy",
  vocabulary: "Vocabulary"
};

const HIGH_LEVELS = new Set(["elite", "strong"]);

const getLabel = (domain) => domainLabel[domain] || domain || "Unknown";

/* =========================================
   STRENGTH MESSAGE
========================================= */

function strengthMessage({ domain, level, score }) {
  const label = getLabel(domain);

  switch (level) {
    case "elite":
      return `Di area ${label}, performa kamu berada di level sangat tinggi (${score}). Ini menunjukkan stabilitas dan kedalaman kemampuan yang bisa menjadi keunggulan utama dalam pemecahan masalah.`;

    case "strong":
      return `${label} termasuk domain kuat (${score}). Ini memberi keunggulan nyata dalam proses berpikir dan pengambilan keputusan.`;

    case "moderate":
      return `${label} berada di level cukup stabil (${score}). Dengan peningkatan terarah, domain ini berpotensi menjadi salah satu kekuatan utama kamu.`;

    case "developing":
      return `${label} masih dalam tahap berkembang (${score}). Konsistensi latihan akan sangat berpengaruh terhadap peningkatan di area ini.`;

    default:
      return `${label} saat ini belum menjadi kekuatan dominan (${score}), namun tetap memiliki potensi untuk ditingkatkan secara bertahap.`;
  }
}

/* =========================================
   WEAKNESS MESSAGE
========================================= */

function weaknessMessage({
  domain,
  level,
  strongestDomain,
  strongestLevel,
  gap
}) {
  const label = getLabel(domain);

  if (level === "weak" || level === "developing") {

    if (strongestDomain && HIGH_LEVELS.has(strongestLevel)) {
      return `Terdapat jarak performa yang cukup signifikan antara ${label} dan ${getLabel(strongestDomain)} (gap ${gap}). Memperkuat area ini akan memberi dampak terbesar terhadap keseimbangan profil kamu.`;
    }

    return `${label} saat ini memerlukan perhatian lebih. Latihan bertahap dan konsisten akan membantu meningkatkan kestabilan performa keseluruhan.`;
  }

  return `${label} bukan kelemahan utama, namun masih memiliki ruang untuk optimalisasi agar profil kognitif kamu semakin solid.`;
}

/* =========================================
   BALANCE NOTE
========================================= */

function buildBalanceNote(profile) {
  const gap = profile.imbalanceScore;

  if (profile.imbalanceDetected && gap > 50) {
    return "Terdapat ketimpangan signifikan antar domain. Fokus pada area terlemah akan memberikan peningkatan paling drastis.";
  }

  if (profile.imbalanceDetected) {
    return "Profil menunjukkan perbedaan performa antar domain. Penyesuaian latihan akan membantu menstabilkan keseimbangan.";
  }

  return "Profil kognitif kamu relatif seimbang. Menjaga konsistensi akan menjadi kunci perkembangan selanjutnya.";
}

/* =========================================
   FINAL BUILDER (SAFE VERSION)
========================================= */

export function buildStrengthNarrative(profile) {
  if (!profile?.strongest || !profile?.weakest) return null;

  const strongest = profile.strongest;
  const weakest = profile.weakest;

  const focus = weakest?.name || strongest?.name;

  return {
    strengthTitle: `Strength: ${getLabel(strongest.name)}`,
    strengthText: strengthMessage({
      domain: strongest.name,
      level: strongest.level,
      score: strongest.score
    }),

    weaknessTitle: `Needs Work: ${getLabel(focus)}`,
    weaknessText: weaknessMessage({
      domain: focus,
      level: weakest?.level || strongest?.level,
      strongestDomain: strongest.name,
      strongestLevel: strongest.level,
      gap: profile.imbalanceScore
    }),

    imbalanceDetected: profile.imbalanceDetected,
    balanceNote: buildBalanceNote(profile.imbalanceScore)
  };
}
