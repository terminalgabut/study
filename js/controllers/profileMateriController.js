import { getMateriProfileSummary } from '../services/materiProfileService.js';

export const profileMateriController = {

  async render() {

    const container = document.getElementById('materiList');
    if (!container) return;

    container.innerHTML = 'Memuat...';

    try {
      const data = await getMateriProfileSummary();

      if (!data || data.length === 0) {
        container.innerHTML = 'Belum ada materi.';
        return;
      }

      container.innerHTML = '';

      data.forEach(item => {

        let winrateClass = 'low';
        if (item.winrate > 75) winrateClass = 'high';
        else if (item.winrate > 50) winrateClass = 'mid';

        const div = document.createElement('div');
        div.className = 'materi-item';

        div.innerHTML = `
          <div class="materi-header">
            <div class="materi-category">${item.category}</div>
            <div class="materi-title">${item.judul}</div>
          </div>

          <div class="materi-quick-meta">
            <div>Dibaca <strong>${item.dibaca}x</strong></div>
            <div class="winrate ${winrateClass}">
              Winrate <strong>${item.winrate}%</strong>
            </div>
          </div>

          <div class="materi-detail">
            <div class="materi-detail-grid">

              <div class="materi-detail-item">
                <span>Total Soal</span>
                <strong>${item.soal_dikerjakan}x</strong>
              </div>

              <div class="materi-detail-item">
                <span>Total Belajar</span>
                <strong>${item.total_baca_jam} jam</strong>
              </div>

              <div class="materi-detail-item">
                <span>Rata-rata Speed</span>
                <strong>${item.avg_speed}s</strong>
              </div>

              <div class="materi-detail-item">
                <span>Cognitive Index</span>
                <strong>${item.cognitive_index}</strong>
              </div>

            </div>
          </div>
        `;

        div.addEventListener('click', () => {
          div.classList.toggle('expanded');
        });

        container.appendChild(div);
      });

    } catch (err) {
      console.error('Materi render error:', err);
      container.innerHTML = 'Terjadi kesalahan memuat data.';
    }
  }
};
