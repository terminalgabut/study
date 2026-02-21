import { supabase } from '../services/supabase.js';
import { buildLevelProfile } from '../lib/levelEngine.js';

export const profileMateriController = {

  async render(userId) {
    const container = document.getElementById('materiList');
    if (!container) return;

    container.innerHTML = 'Memuat...';

    const { data, error } = await supabase
      .from('study_progress')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) {
      container.innerHTML = 'Gagal memuat.';
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = 'Belum ada materi.';
      return;
    }

    container.innerHTML = data.map(item => {
      const totalSeconds =
        Number(item.total_reading_seconds || 0) +
        Number(item.total_quiz_seconds || 0);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      const attempts = item.attempts_count || 0;
      const totalPoints = item.total_score_points || 0;
      const winrate = attempts > 0
        ? Math.round((totalPoints / attempts) * 100)
        : 0;

      const speed = attempts > 0
        ? Math.round((item.total_quiz_seconds || 0) / attempts)
        : 0;

      const cognitiveIndex = Math.round(
        (winrate * 0.6) +
        (Math.max(0, 100 - speed) * 0.2) +
        (Math.min(item.read_count * 5, 100) * 0.2)
      );
      let indexClass = 'index-low';
if (cognitiveIndex >= 75) indexClass = 'index-high';
else if (cognitiveIndex >= 50) indexClass = 'index-mid';

      const strength = winrate >= 80 ? 'Akurasi Tinggi' : 'Perlu Latihan';
      const needsWork = speed > 40 ? 'Kecepatan' : 'Konsistensi';

      return `
        <div class="materi-item">
          <div class="materi-main">
            <small class="materi-category">${item.category || 'Umum'}</small>
            <h4>${item.bab_title || 'Materi'}</h4>
            <div class="materi-meta">
              Dibaca ${item.read_count || 0}x •
              ${hours}j ${minutes}m •
              Winrate ${winrate}%
            </div>
            <div class="materi-index ${indexClass}">
  Cognitive Index ${cognitiveIndex}
</div>
          </div>

          <div class="materi-detail">
            Soal: ${attempts}x <br>
            Speed: ${speed} dtk/soal <br>
            Strength: ${strength} <br>
            Needs Work: ${needsWork}
          </div>
        </div>
      `;
    }).join('');

    this.attachToggle();
  },

  attachToggle() {
    document.querySelectorAll('.materi-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('expanded');
      });
    });
  }
};
