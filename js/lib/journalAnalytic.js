// js//libjournalAnalytic.js

export const journalAnalytic = {
  getInsights(s) {
    const cog = s.cognitive_profile || {};
    const stab = s.stability_metrics || {};
    const summ = s.cognitive_summary || {};
    
    const insights = [];

    // --- 1. Analisis Kekuatan & Kelemahan Dimensi ---
    const dimensions = [
      { name: 'Memory', val: cog.memory_score || 0 },
      { name: 'Reasoning', val: cog.reasoning_score || 0 },
      { name: 'Analogi', val: cog.analogy_score || 0 },
      { name: 'Reading', val: cog.reading_score || 0 },
      { name: 'Vocabulary', val: cog.vocabulary_score || 0 }
    ].filter(d => d.val > 0);

    if (dimensions.length > 0) {
      const sorted = [...dimensions].sort((a, b) => a.val - b.val);
      const weakest = sorted[0];
      const strongest = sorted[sorted.length - 1];

      insights.push(`Kekuatan utamamu ada pada <strong>${strongest.name}</strong>, namun dimensi <strong>${weakest.name}</strong> perlu perhatian lebih.`);
    }

    // --- 2. Analisis Stabilitas & Fokus ---
    const stability = stab.stability_index || 0;
    if (stability > 0) {
      if (stability < 40) {
        insights.push(`Fokusmu cenderung terpecah (Stability: ${Math.round(stability)}). Cobalah teknik Pomodoro.`);
      } else if (stability > 80) {
        insights.push(`Konsentrasi sangat solid! Kamu mampu mempertahankan performa tinggi dalam waktu lama.`);
      }
    }

    // --- 3. Analisis Kelelahan (Endurance) ---
    const fatigue = summ.endurance_index || 0;
    if (fatigue > 15) {
      insights.push(`Terdeteksi penurunan performa di akhir sesi (Fatigue: ${Math.round(fatigue)}). Jangan lupa istirahat sejenak.`);
    }

    // --- 4. Analisis Validitas Data ---
    const confidence = cog.iq_confidence || 0;
    if (confidence < 25) {
      insights.push(`Data jurnal masih dalam fase kalibrasi (${confidence}%). Hasil akan semakin akurat seiring bertambahnya sesi.`);
    }

    // Default jika data minim
    if (insights.length === 0) {
      insights.push("Lanjutkan latihan kuis untuk mendapatkan analisis kognitif yang lebih mendalam.");
    }

    return insights;
  }
};
