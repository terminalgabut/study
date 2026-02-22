export const profileMateriController = {

  async render() {

    const container = document.getElementById('materiList');
    if (!container) return;

    container.innerHTML = '';

    const dummyData = [
      {
        category: 'Logic',
        bab_title: 'Fallacy Bagian 2',
        read_count: 6,
        winrate: 35,
        attempts: 40,
        time: 0,
        speed: 0,
        iq: 0
      },
      {
        category: 'Bahasa',
        bab_title: 'Bahasa Bab 1.1',
        read_count: 6,
        winrate: 70,
        attempts: 32,
        time: 0,
        speed: 0,
        iq: 0
      }
    ];

    dummyData.forEach(item => {

      let winrateClass = 'low';
      if (item.winrate > 75) winrateClass = 'high';
      else if (item.winrate > 50) winrateClass = 'mid';

      const div = document.createElement('div');
      div.className = 'materi-item';

      div.innerHTML = `
        <div class="materi-header">
          <div class="materi-category">${item.category}</div>
          <div class="materi-title">${item.bab_title}</div>
        </div>

        <div class="materi-quick-meta">
          <div>Dibaca <strong>${item.read_count}x</strong></div>
          <div class="winrate ${winrateClass}">
            Winrate <strong>${item.winrate}%</strong>
          </div>
        </div>

        <div class="materi-detail">
          <div class="materi-detail-grid">
            <div class="materi-detail-item">
              <span>Total Soal</span>
              <strong>${item.attempts}x</strong>
            </div>
            <div class="materi-detail-item">
              <span>Total Waktu</span>
              <strong>${item.time}m</strong>
            </div>
            <div class="materi-detail-item">
              <span>Rata-rata Speed</span>
              <strong>${item.speed}s</strong>
            </div>
            <div class="materi-detail-item">
              <span>Cognitive Index</span>
              <strong>${item.iq}</strong>
            </div>
          </div>
        </div>
      `;

      div.addEventListener('click', () => {
        div.classList.toggle('expanded');
      });

      container.appendChild(div);
    });
  }
};
