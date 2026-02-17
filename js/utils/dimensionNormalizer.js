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
    return 'reading';
  }

  // ===== KOSAKATA & SEMANTIK =====
  if (
    text.includes('kosakata_simantik') ||
    text.includes('kosakata & simantik') ||
    text.includes('vocabulary') ||
    text.includes('semantics')
  ) {
    return 'vocabulary';
  }

  // ===== PENALARAN VERBAL =====
  if (
    text.includes('penalaran_verbal') ||
    text.includes('penalaran verbal') ||
    text.includes('verbal reasoning')
  ) {
    return 'reasoning';
  }

  // ===== ANALOGI =====
  if (
    text.includes('analogi') ||
    text.includes('analogy')
  ) {
    return 'analogy';
  }

  // ===== MEMORI KERJA =====
  if (
    text.includes('memori_kerja') ||
    text.includes('memori kerja') ||
    text.includes('working memory')
  ) {
    return 'memory';
  }

  return null;
}
