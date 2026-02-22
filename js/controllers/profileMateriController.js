import { supabase } from '../services/supabase.js';

export const profileMateriController = {

  async render(userId) {
    const container = document.getElementById('materiList');
    if (!container) return;

    container.innerHTML = this.getLoadingState();

    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = this.getEmptyState();
        return;
      }

      container.innerHTML = '';

      data.forEach(item => {
        const card = this.createMateriCard(item);
        container.appendChild(card);
      });

    } catch (err) {
      console.error('[Materi] Error:', err);
      container.innerHTML = this.getEmptyState('Gagal memuat materi.');
    }
  },

  /* =========================================
     CARD BUILDER
  ========================================= */

  createMateriCard(item) {

    const {
      attempts,
      winrate,
      hours,
      minutes
    } = this.calculateMetrics(item);

    const div = document.createElement('div');
    div.className = 'materi-item';

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

    return div;
  },

  /* =========================================
     METRIC CALCULATION
  ========================================= */

  calculateMetrics(item) {

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

    return { attempts, winrate, hours, minutes };
  },

  /* =========================================
     STATES
  ========================================= */

  getLoadingState() {
    return `<div class="materi-empty">Memuat materi...</div>`;
  },

  getEmptyState(message = 'Belum ada materi dipelajari.') {
    return `<div class="materi-empty">${message}</div>`;
  }

};
