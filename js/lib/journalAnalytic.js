// js/lib/journalAnalytic.js

/**
 * JournalAnalytic: Asisten Inteligensi Kognitif
 * Mengonversi metrik mentah menjadi narasi profesional yang suportif.
 */
export const journalAnalytic = {
  // Mapping profil neuro untuk narasi yang lebih personal
  getNeuroProfile(type) {
    const profiles = {
      'Analytical': 'Pola pikir sistematis dengan fokus tajam pada struktur dan logika.',
      'Memory-Oriented': 'Kapabilitas retensi informasi yang kuat dan konsistensi tinggi.',
      'Creative': 'Pendekatan non-linear yang unggul dalam pengenalan pola abstrak.',
      'Balanced': 'Keseimbangan kognitif yang adaptif terhadap berbagai jenis beban kerja.',
      'default': 'Pola kognitif unik yang sedang dalam tahap pemetaan intensif.'
    };
    return profiles[type] || profiles.default;
  },

  getInsights(s) {
    const cog = s.cognitive_profile || {};
    const stab = s.stability_metrics || {};
    const summ = s.cognitive_summary || {};
    
    const insights = [];

    // 1. Domain Performance Analysis
    const dimensions = [
      { id: 'memory', name: 'Memory', val: cog.memory_score || 0 },
      { id: 'reasoning', name: 'Reasoning', val: cog.reasoning_score || 0 },
      { id: 'analogy', name: 'Analogi', val: cog.analogy_score || 0 },
      { id: 'reading', name: 'Reading', val: cog.reading_score || 0 },
      { id: 'vocabulary', name: 'Vocabulary', val: cog.vocabulary_score || 0 }
    ].filter(d => d.val > 0);

    if (dimensions.length >= 2) {
      const sorted = [...dimensions].sort((a, b) => b.val - a.val);
      const strongest = sorted[0];
      const weakest = sorted[sorted.length - 1];

      insights.push(`Anda menunjukkan kapabilitas superior pada aspek <strong>${strongest.name}</strong>. Untuk mengoptimalkan profil Anda, pertimbangkan untuk memperkuat fundamental di domain <strong>${weakest.name}</strong>.`);
    }

    // 2. Focus & Stability Assessment
    const stability = stab.stability_index || 0;
    if (stability > 0) {
      if (stability < 45) {
        insights.push(`Terdapat fluktuasi dalam ritme kerja Anda (Stability: ${Math.round(stability)}%). Disarankan untuk membagi sesi belajar menjadi blok-blok pendek guna menjaga intensitas fokus.`);
      } else if (stability > 80) {
        insights.push(`Stabilitas kognitif Anda sangat impresif. Anda mampu mempertahankan standar performa tinggi meski di bawah tekanan durasi yang panjang.`);
      }
    }

    // 3. Endurance & Cognitive Fatigue
    // Menggunakan endurance_index sebagai tolak ukur ketahanan
    const endurance = summ.endurance_index || 0; 
    if (endurance > 0 && endurance < 65) {
      insights.push(`Terdeteksi gejala kelelahan kognitif di fase akhir sesi. Mengambil jeda restoratif (istirahat singkat) akan membantu menjaga akurasi tetap optimal.`);
    }

    // 4. Data Calibration (Confidence)
    const confidence = cog.iq_confidence || 0;
    if (confidence < 30) {
      insights.push(`Saat ini saya sedang melakukan kalibrasi data (${confidence}%). Analisis akan menjadi jauh lebih presisi setelah Anda menyelesaikan beberapa sesi tambahan.`);
    }

    // Default Fallback
    if (insights.length === 0) {
      insights.push("Lanjutkan aktivitas latihan Anda. Saya akan memantau perkembangan performa Anda untuk memberikan analisis yang lebih mendalam.");
    }

    return {
      neuroDescription: this.getNeuroProfile(cog.neuro_type),
      list: insights
    };
  }
};
