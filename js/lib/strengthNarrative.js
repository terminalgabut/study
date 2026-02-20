// root/js/lib/strengthNarrative.js

const domainLabel = {
  memory: "Memory",
  reading: "Reading",
  reasoning: "Reasoning",
  analogy: "Analogy",
  vocabulary: "Vocabulary"
};

function strengthMessage(domain, level) {
  switch (level) {
    case "elite":
      return `Kemampuan ${domainLabel[domain]} kamu berada di level sangat tinggi. Ini menjadi fondasi kognitif utama kamu.`;
    case "strong":
      return `Kamu menunjukkan performa kuat di area ${domainLabel[domain]}. Ini salah satu aset terbaikmu.`;
    case "moderate":
      return `Area ${domainLabel[domain]} cukup stabil, tetapi masih bisa ditingkatkan ke level berikutnya.`;
    case "developing":
      return `Kemampuan ${domainLabel[domain]} sedang berkembang dan masih perlu penguatan terstruktur.`;
    default:
      return `Area ${domainLabel[domain]} membutuhkan perhatian lebih agar tidak tertinggal dari domain lain.`;
  }
}

function weaknessMessage(domain, level) {
  if (level === "weak" || level === "developing") {
    return `Disarankan fokus latihan pada ${domainLabel[domain]} untuk meningkatkan keseimbangan kognitif kamu.`;
  }
  return `Area ${domainLabel[domain]} masih memiliki ruang peningkatan untuk menyamai domain terkuatmu.`;
}

export function buildStrengthNarrative(profile) {
  if (!profile) return null;

  const { strongest, weakest, imbalanceDetected } = profile;

  return {
    strengthTitle: `Strength: ${domainLabel[strongest.name]}`,
    strengthText: strengthMessage(strongest.name, strongest.level),

    weaknessTitle: `Needs Work: ${domainLabel[weakest.name]}`,
    weaknessText: weaknessMessage(weakest.name, weakest.level),

    imbalanceDetected,
    balanceNote: imbalanceDetected
      ? "Terdapat ketimpangan performa antar domain yang cukup signifikan."
      : "Profil kognitif kamu relatif seimbang."
  };
}
