import { supabase } from '../services/supabase.js';

export const profileMateriController = {

  async render(userId) {

    const container = document.getElementById('materiList');

    if (!container) {
      console.warn('materiList tidak ditemukan di DOM');
      return;
    }

    container.innerHTML = 'Memuat...';

    const { data, error } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      container.innerHTML = 'Belum ada materi.';
      return;
    }

    container.innerHTML = '';

    data.forEach(item => {

      const div = document.createElement('div');
      div.className = 'home-card';

      const attempts = item.attempts_count || 0;
      const totalPoints = item.total_score_points || 0;

      const winrate = attempts > 0
        ? Math.round((totalPoints / attempts) * 100)
        : 0;

      div.innerHTML = `
  <div class="materi-category">${item.category}</div>
  <div class="materi-title">${item.bab_title}</div>

  <div class="materi-stats">
    <div>
      <div class="stat-number">${item.read_count || 0}</div>
      <div class="stat-label">Dibaca</div>
    </div>

    <div>
      <div class="stat-number">${attempts}</div>
      <div class="stat-label">Soal</div>
    </div>

    <div>
      <div class="stat-number">${winrate}%</div>
      <div class="stat-label">Winrate</div>
    </div>
  </div>
`;

      container.appendChild(div);
    });

  }
};
