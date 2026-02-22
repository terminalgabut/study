import { supabase } from '../services/supabase.js';

export const profileMateriController = {

  async render(userId) {

    const container = document.getElementById('materiList');

    if (!container) {
      console.warn('materiList tidak ditemukan di DOM');
      return;
    }

    let winrateClass = '';

if (winrate <= 50) winrateClass = 'low';
else if (winrate <= 75) winrateClass = 'mid';
else winrateClass = 'high';

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
  div.className = 'materi-item';

  const attempts = item.attempts_count || 0;
  const totalPoints = item.total_score_points || 0;

  const winrate = attempts > 0
    ? Math.round((totalPoints / attempts) * 100)
    : 0;

  div.innerHTML = `
    <div class="materi-header">
      <div class="materi-category">${item.category}</div>
      <div class="materi-title">${item.bab_title}</div>
    </div>

    <div class="materi-quick-meta">
      <div>Dibaca <strong>${item.read_count || 0}x</strong></div>
      <div>Winrate <strong>${winrate}%</strong></div>
    </div>

    <div class="materi-detail">
      <div class="materi-detail-grid">

        <div class="materi-detail-item">
          <span>Total Soal</span>
          <strong>${attempts}x</strong>
        </div>

        <div class="materi-detail-item">
          <span>Total Waktu</span>
          <strong>${item.total_time_spent || 0}m</strong>
        </div>

        <div class="materi-detail-item">
          <span>Rata-rata Speed</span>
          <strong>${item.avg_time_per_question || 0}s</strong>
        </div>

        <div class="materi-detail-item">
          <span>Cognitive Index</span>
          <strong>${item.avg_cognitive_index || 0}</strong>
        </div>

      </div>
    </div>
  `;

  div.addEventListener('click', () => {
    div.classList.toggle('expanded');
  });

  container.appendChild(div);
});
