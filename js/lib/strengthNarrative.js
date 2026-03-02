/* =========================================
   INTERACTIVE STRENGTH NARRATIVE (REFINED)
========================================= */

const domainLabel = {
  memory: "Memory",
  reading: "Reading",
  reasoning: "Reasoning",
  analogy: "Analogy",
  vocabulary: "Vocabulary"
};

const HIGH_LEVELS = new Set(["elite", "strong"]);

const getLabel = (domain) =>
  domainLabel[domain] || domain || "Unknown";

/* =========================================
   STRENGTH MESSAGE
========================================= */

function strengthMessage({ domain, level, score }) {
  const label = getLabel(domain);
  const roundedScore = Math.round(score || 0);

  switch (level) {
    case "elite":
      return `Kemampuan ${label} kamu berada di level sangat tinggi (${roundedScore}). Ini merupakan salah satu kekuatan utama yang menunjukkan kedalaman dan stabilitas berpikir.`;

    case "strong":
      return `${label} termasuk domain kuat (${roundedScore}). Area ini memberi keunggulan nyata dalam proses analisis dan pengambilan keputusan.`;

    case "moderate":
      return `${label} berada di level cukup stabil (${roundedScore}). Dengan latihan terarah, domain ini berpotensi naik menjadi kekuatan utama.`;

    case "developing":
      return `${label} masih dalam tahap berkembang (${roundedScore}). Konsistensi latihan akan sangat berpengaruh terhadap peningkatan performa.`;

    default:
      return `${label} belum menjadi kekuatan dominan (${roundedScore}), namun tetap memiliki potensi untuk ditingkatkan secara bertahap.`;
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
  const strongestLabel = getLabel(strongestDomain);
  const roundedGap = Math.round(gap || 0);

  if (level === "weak" || level === "developing") {
    if (strongestDomain && HIGH_LEVELS.has(strongestLevel)) {
      return `Terdapat jarak performa yang cukup terasa antara ${label} dan ${strongestLabel} (sekitar ${roundedGap} poin). Memperkuat area ini akan memberi dampak terbesar terhadap keseimbangan profil kamu.`;
    }

    return `${label} saat ini memerlukan perhatian lebih. Latihan bertahap dan konsisten akan membantu meningkatkan kestabilan performa keseluruhan.`;
  }

  return `${label} bukan kelemahan utama, namun masih memiliki ruang untuk optimalisasi agar profil kognitif kamu semakin solid.`;
}

/* =========================================
   BALANCE NOTE (SYNC WITH ENGINE)
========================================= */

function buildBalanceNote(profile) {
  if (!profile) return null;

  const gap = Math.round(profile.imbalanceScore || 0);

  if (profile.imbalanceDetected && gap > 50) {
    return "Terdapat ketimpangan signifikan antar domain. Fokus pada area terlemah akan memberikan peningkatan paling drastis.";
  }

  if (profile.imbalanceDetected) {
    return "Profil menunjukkan perbedaan performa antar domain. Penyesuaian latihan akan membantu menstabilkan keseimbangan.";
  }

  return "Profil kognitif kamu relatif seimbang. Menjaga konsistensi akan menjadi kunci perkembangan selanjutnya.";
}

/* =========================================
   FINAL BUILDER (SAFE & STABLE)
========================================= */

export function buildStrengthNarrative(profile) {
  if (!profile?.strongest || !profile?.weakest) return null;

  const strongest = profile.strongest;
  const weakest = profile.weakest;

  const sameDomain = strongest.name === weakest.name;
  const focusDomain = !sameDomain ? weakest.name : null;

  return {
    strengthTitle: `Strength: ${getLabel(strongest.name)}`,
    strengthText: strengthMessage({
      domain: strongest.name,
      level: strongest.level,
      score: strongest.score
    }),

    weaknessTitle: focusDomain
      ? `Needs Work: ${getLabel(focusDomain)}`
      : "Profile Insight",

    weaknessText: focusDomain
      ? weaknessMessage({
          domain: focusDomain,
          level: weakest.level,
          strongestDomain: strongest.name,
          strongestLevel: strongest.level,
          gap: profile.imbalanceScore
        })
      : "Belum terlihat perbedaan signifikan antar domain. Fokus pada konsistensi latihan untuk menjaga stabilitas performa.",

    imbalanceDetected: profile.imbalanceDetected,
    balanceNote: buildBalanceNote(profile)
  };
}
