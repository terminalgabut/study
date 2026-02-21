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

    if (error || !data) {
      container.innerHTML = 'Belum ada materi.';
      return;
    }

    container.innerHTML = '';

    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'materi-item';

      const attempts = item.attempts_count || 0;
      const totalPoints = item.total_score_points || 0;

      const winrate = attempts > 0
        ? Math.round((totalPoints / attempts) * 100)
        : 0;

      const totalSeconds =
        (item.total_reading_seconds || 0) +
        (item.total_quiz_seconds || 0);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      div.innerHTML = `
        <small class="materi-category">
          ${item.category || 'Umum'}
        </small>

        <h4>${item.bab_title || 'Materi'}</h4>

        <div class="materi-meta">
          Dibaca ${item.read_count || 0}x •
          ${hours}j ${minutes}m •
          Winrate ${winrate}%
        </div>

        <div class="materi-detail">
          Soal: ${attempts}x
        </div>
      `;

      div.addEventListener('click', () => {
        div.classList.toggle('expanded');
      });

      container.appendChild(div);
    });
  }
};
