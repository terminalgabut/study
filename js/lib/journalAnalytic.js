/**
 * JournalAnalytic: Senior Cognitive Intelligence Mentor (10+ Years Experience)
 * Fokus: Transformasi metrik mentah menjadi strategi pengembangan diri yang taktis.
 */
export const journalAnalytic = {
  getNeuroProfile(type) {
    const profiles = {
      'Analytical': 'Arsitektur kognitif Anda sangat terstruktur; Anda unggul dalam mendekomposisi kompleksitas menjadi logika linear yang tajam.',
      'Memory-Oriented': 'Anda memiliki sistem retensi yang robust, memungkinkan konsolidasi informasi jangka panjang dengan presisi tinggi.',
      'Creative': 'Spektrum pemikiran Anda bersifat divergen, sangat efektif dalam sintesis pola abstrak yang sering terlewatkan oleh orang lain.',
      'Balanced': 'Profil kognitif Anda menunjukkan neuroplastisitas yang sehat, sangat adaptif terhadap pergeseran konteks beban kerja.',
      'default': 'Fase pemetaan awal terdeteksi. Saya sedang mengamati signature kognitif spesifik Anda untuk analisis yang lebih tajam.'
    };
    return profiles[type] || profiles.default;
  },

  getInsights(s) {
    const cog = s.cognitive_profile || {};
    const stab = s.stability_metrics || {};
    const summ = s.cognitive_summary || {};
    
    const insights = [];

    // 1. Core Competency & Strategic Leverage
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

      insights.push(`Dominansi kognitif Anda pada <strong>${strongest.name}</strong> adalah aset strategis. Gunakan ini untuk mem-bypass hambatan di domain <strong>${weakest.name}</strong> melalui teknik asosiasi atau pemetaan visual.`);
    }

    // 2. Performance Stability & Neural Rhythm
    const stability = stab.stability_index || 0;
    if (stability > 0) {
      if (stability < 45) {
        insights.push(`Analisis ritme menunjukkan fluktuasi fokus. Strategi optimal bagi Anda adalah metode <em>interleaving</em>—pecah sesi menjadi blok 15 menit untuk memitigasi degradasi atensi.`);
      } else if (stability > 80) {
        insights.push(`Resiliensi mental Anda berada di kuartil atas. Anda memiliki kapasitas untuk menangani <em>high-stakes cognitive load</em> dalam durasi yang signifikan tanpa kehilangan akurasi.`);
      }
    }

    // 3. Burnout Prevention & Neural Recovery (Integrating Your Request)
    const burnout = stab.burnout_risk || 0;
    const recovery = stab.recovery_rate || 0;

    if (burnout > 65) {
      insights.push(`🚨 <strong>Critical Overload:</strong> Indikator kelelahan sistemik Anda mencapai ambang batas (${Math.round(burnout)}%). Tanpa fase deload yang segera, performa Anda akan mengalami <em>diminishing returns</em>.`);
    } else if (burnout > 35) {
      insights.push(`Beban kognitif mulai membebani sistem saraf perifer. Pertimbangkan teknik <em>active recovery</em> atau meditasi singkat untuk menekan akumulasi stres mental.`);
    }

    if (recovery > 0) {
      if (recovery > 75) {
        insights.push(`Efisiensi <em>Neural Recovery</em> Anda luar biasa. Kapasitas sistem saraf untuk reset setelah tekanan tinggi memungkinkan Anda kembali ke performa puncak lebih cepat dari rata-rata.`);
      } else if (recovery < 45 && burnout > 40) {
        insights.push(`Laju pemulihan tidak sebanding dengan beban kerja. Fokuslah pada kualitas tidur dan asupan nutrisi kognitif untuk memperbaiki plastisitas sinapsis Anda.`);
      }
    }

    // 4. Cognitive Endurance & Precision
    const endurance = summ.endurance_index || 0; 
    if (endurance > 0 && endurance < 65) {
      insights.push(`Terdeteksi penurunan <em>sustained attention</em> di fase akhir. Ini bukan masalah kecerdasan, melainkan stamina mental. Latih endurance Anda dengan menambah durasi sesi secara gradual.`);
    }

    // 5. Data Integrity & Calibration
    const confidence = cog.iq_confidence || 0;
    if (confidence < 30) {
      insights.push(`Model kognitif Anda masih dalam tahap kalibrasi (${confidence}%). Lanjutkan protokol latihan untuk meningkatkan presisi algoritma prediksi saya terhadap potensi Anda.`);
    }

    if (insights.length === 0) {
      insights.push("Data Anda sedang saya proses secara mendalam. Teruslah berlatih untuk membangun baseline kognitif yang lebih solid.");
    }

    return {
      neuroDescription: this.getNeuroProfile(cog.neuro_type),
      list: insights
    };
  }
};
