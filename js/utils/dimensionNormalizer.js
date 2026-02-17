// root/js/utils/dimensionNormalizer.js

export function normalizeDimension(input) {
  if (!input) return null;

  const text = input.toLowerCase().trim();

  // ===== PEMAHAMAN BACAAN =====
  if (
    text.includes('pemahaman_bacaan') ||
    text.includes('pemahaman bacaan') ||
    text.includes('reading comprehension')
  ) {
    return 'pemahaman_bacaan';
  }

  // ===== KOSAKATA & SEMANTIK =====
  if (
    text.includes('kosakata_simantik') ||
    text.includes('kosakata & simantik') ||
    text.includes('vocabulary') ||
    text.includes('semantics')
  ) {
    return 'kosakata_semantik';
  }

  // ===== PENALARAN VERBAL =====
  if (
    text.includes('penalaran_verbal') ||
    text.includes('penalaran verbal') ||
    text.includes('verbal reasoning')
  ) {
    return 'penalaran_verbal';
  }

  // ===== ANALOGI =====
  if (
    text.includes('analogi') ||
    text.includes('analogy')
  ) {
    return 'analogi';
  }

  // ===== MEMORI KERJA =====
  if (
    text.includes('memori_kerja') ||
    text.includes('memori kerja') ||
    text.includes('working memory')
  ) {
    return 'memori_kerja';
  }

  return null;
}
