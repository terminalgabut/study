 /* =========================================
   INTERACTIVE STRENGTH NARRATIVE
   Safe, contextual, non-contradicting
========================================= */

const domainLabel = {
  memory: "Memory",
  reading: "Reading",
  reasoning: "Reasoning",
  analogy: "Analogy",
  vocabulary: "Vocabulary"
};

const isHighLevel = level => level === "elite" || level === "strong";

/* =========================================
   STRENGTH NARRATIVE
========================================= */

function strengthMessage(domain, level, score) {
  const label = domainLabel[domain];

  switch (level) {
    case "elite":
      return `Di area ${label}, performa kamu berada di level sangat tinggi (${score}). Ini menunjukkan stabilitas dan kedalaman kemampuan yang bisa menjadi keunggulan utama dalam pemecahan masalah.`;
    case "strong":
      return `${label} termasuk domain kuat (${score}). Ini memberi keunggulan nyata dalam proses berpikir dan pengambilan keputusan.`;
    case "moderate":
      return `${label} berada di level cukup stabil (${score}). Dengan peningkatan terarah, domain ini bisa naik menjadi salah satu kekuatan utama kamu.`;
    case "developing":
      return `${label} masih dalam tahap berkembang (${score}). Konsistensi latihan akan sangat berpengaruh terhadap peningkatan di area ini.`;
    default:
      return `${label} saat ini belum menjadi kekuatan dominan (${score}), namun tetap memiliki potensi untuk ditingkatkan secara bertahap.`;
  }
}

/* =========================================
   WEAKNESS / FOCUS NARRATIVE
========================================= */

function weaknessMessage(domain, level, strongestDomain, strongestLevel, gap) {
  const label = domainLabel[domain];

  if (level === "weak" || level === "developing") {
    if (strongestDomain && isHighLevel(strongestLevel)) {
      return `Terdapat jarak performa yang cukup signifikan antara ${label} dan ${domainLabel[strongestDomain]} (gap ${gap}). Memperkuat area ini akan memberi dampak terbesar terhadap keseimbangan profil kamu.`;
    }

    return `${label} saat ini memerlukan perhatian khusus. Latihan bertahap dan konsisten akan membantu meningkatkan kestabilan performa keseluruhan.`;
  }

  return `${label} bukan kelemahan utama, namun masih memiliki ruang untuk optimalisasi agar profil kognitif kamu semakin solid.`;
}

/* =========================================
   BALANCE
========================================= */

function buildBalanceNote(profile) {
  const gap = profile.imbalanceScore;

  if (gap > 60) {
    return "Terdapat ketimpangan signifikan antar domain. Fokus pada area terlemah akan memberikan peningkatan paling drastis.";
  }

  if (gap > 30) {
    return "Profil menunjukkan perbedaan performa antar domain. Penyesuaian latihan akan membantu menstabilkan keseimbangan.";
  }

  return "Profil kognitif kamu relatif seimbang. Menjaga konsistensi akan menjadi kunci perkembangan selanjutnya.";
}

/* =========================================
   FINAL BUILDER
========================================= */

export function buildStrengthNarrative(profile) {
  if (!profile) return null;

  const { strongest, weakest, imbalanceDetected } = profile;

  // strongest hanya valid jika benar-benar kuat
  const validStrongest =
    strongest && (strongest.level === "elite" || strongest.level === "strong")
      ? strongest
      : null;

  // 🔒 SINGLE SOURCE OF TRUTH
  const focusDomain = weakest?.name || strongest?.name;
  const focusLevel = weakest?.level || strongest?.level;

  return {
    strengthTitle: `Strength: ${domainLabel[strongest.name]}`,
    strengthText: strengthMessage( 
     strongest.name,
     strongest.level,
     strongest.score 
    ),

    // ✅ judul & isi pakai domain yang sama
    weaknessTitle: `Needs Work: ${domainLabel[focusDomain]}`,
    weaknessText: weaknessMessage(
     focusDomain,
     focusLevel,
     validStrongest?.name || null,
     validStrongest?.level || null,
     profile.imbalanceScore 
    ),

   imbalanceDetected: profile.imbalanceDetected,
    balanceNote: buildBalanceNote(profile)
  };
}
