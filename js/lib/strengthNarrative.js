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

function strengthMessage(domain, level) {
  const label = domainLabel[domain];

  switch (level) {
    case "elite":
      return `Di area ${label}, kamu berada di level sangat tinggi. Ini jelas menjadi fondasi kognitif utama yang bisa kamu andalkan.`;
    case "strong":
      return `Performa kamu di ${label} tergolong kuat. Ini salah satu domain yang memberi keunggulan nyata dalam proses berpikir kamu.`;
    case "moderate":
      return `Kemampuan ${label} kamu cukup stabil. Dengan sedikit dorongan, area ini berpotensi naik ke level yang lebih solid.`;
    case "developing":
      return `${label} sedang berkembang. Progresnya ada, tapi masih butuh latihan yang lebih terarah agar terasa konsisten.`;
    default:
      return `${label} saat ini belum menjadi kekuatan utama, namun tetap punya potensi untuk dibangun secara bertahap.`;
  }
}

/* =========================================
   WEAKNESS / FOCUS NARRATIVE
========================================= */

function weaknessMessage(domain, level, strongestDomain, strongestLevel) {
  const label = domainLabel[domain];

  // Jika weakest masih lemah / berkembang
  if (level === "weak" || level === "developing") {
    // Kalau ada domain kuat yang layak jadi pembanding
    if (strongestDomain && isHighLevel(strongestLevel)) {
      return `Fokus latihan di ${label} akan membantu menutup jarak dengan kekuatan utama kamu di ${domainLabel[strongestDomain]}. Mulai dari latihan kecil tapi rutin.`;
    }

    // Kalau belum ada domain yang benar-benar dominan
    return `Saat ini, ${label} perlu perhatian lebih. Memperkuat area ini akan membantu membangun fondasi kognitif yang lebih seimbang.`;
  }

  // Jika weakest sebenarnya tidak terlalu lemah
  return `Area ${label} bukan kelemahan utama, tetapi masih bisa diasah agar kontribusinya lebih terasa dalam keseluruhan profil kognitif kamu.`;
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
      strongest.level
    ),

    // ✅ judul & isi pakai domain yang sama
    weaknessTitle: `Needs Work: ${domainLabel[focusDomain]}`,
    weaknessText: weaknessMessage(
      focusDomain,
      focusLevel,
      validStrongest?.name || null,
      validStrongest?.level || null
    ),

    imbalanceDetected,
    balanceNote: imbalanceDetected
      ? "Terlihat adanya ketimpangan antar domain. Memperkuat area terlemah akan memberi dampak paling signifikan."
      : "Profil kognitif kamu relatif seimbang. Tinggal menjaga konsistensi latihan."
  };
}
  
