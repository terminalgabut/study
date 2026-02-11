import { performaService } from '../services/performaService.js';

export const performaController = {
  async init() {
    window.__DEBUG__.log("--- [DEBUG] Inisialisasi PerformaController ---");
    try {
      // Ambil data agregat (Data sudah dihitung di Service)
      const data = await performaService.getDashboardData();
      window.__DEBUG__.log("[Performa] Data Diterima:", data);

      // Kirim stats yang sudah matang dari service ke fungsi render
      this.renderSummary(data.profile, data.stats);
      this.renderAchievements(data.achievements);
      this.renderCharts(data.progress);
      this.renderActivityJournal(data.progress); 
      
    } catch (error) {
      window.__DEBUG__.error("[Performa] Gagal:", error.message);
      console.error("Gagal inisialisasi Performa:", error);
    }
  },

  renderSummary(profile, stats) {
    window.__DEBUG__.log("[Performa] Rendering Summary...");
    
    // 1. Update Nama
    const nameEl = document.getElementById('user-fullname');
    if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';
    
    // 2. Logika Leveling (Menggunakan stats.totalPoints yang sudah dihitung Service)
    const level = Math.floor(stats.totalPoints / 500) + 1;
    const progressXP = stats.totalPoints % 500;
    const progressPercent = (progressXP / 500) * 100;
    
    const rankEl = document.getElementById('user-rank');
    const xpTextEl = document.getElementById('xp-text');
    const xpFillEl = document.getElementById('xp-fill');

    if (rankEl) rankEl.textContent = `Level ${level} Scholar`;
    if (xpTextEl) xpTextEl.textContent = `${stats.totalPoints} Poin Total`;
    if (xpFillEl) xpFillEl.style.width = `${progressPercent}%`;

    // 3. Pasang data statistik dari Service ke UI element
    const updateText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    updateText('stat-materi', stats.totalMateri);
    updateText('stat-waktu', stats.timeString);
    updateText('stat-read-count', stats.totalReadCount);
    updateText('stat-skor', `${stats.avgScore}%`);
  },

  renderActivityJournal(progress = []) {
    const listContainer = document.getElementById('activity-list');
    if (!listContainer) return;

    const recent = [...progress]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    if (recent.length === 0) {
      listContainer.innerHTML = '<li class="small gray">Belum ada aktivitas belajar.</li>';
      return;
    }

    listContainer.innerHTML = recent.map(item => `
      <li>
        <div class="task-info">
          <strong>${item.bab_title || 'Materi'}</strong>
          <span class="small gray">${item.category || 'Umum'} • Dilihat ${item.read_count}x</span>
        </div>
        <div class="task-meta">
           <span class="small gray">${new Date(item.updated_at).toLocaleDateString()}</span>
        </div>
      </li>
    `).join('');
  },

  renderAchievements(badges = []) {
    const container = document.getElementById('badge-container');
    if (!container) return;
    
    if (badges.length === 0) {
      container.innerHTML = '<p class="small gray">Belum ada lencana yang diraih.</p>';
      return;
    }

    container.innerHTML = badges.map(b => `
      <div class="badge-icon active" title="${b.achievements?.description || ''}">
        ${this.getBadgeEmoji(b.achievements?.title)}
        <span class="badge-tooltip">${b.achievements?.title}</span>
      </div>
    `).join('');
  },

  getBadgeEmoji(title) {
    const map = { 
      'Langkah Awal': '🌱', 
      'Kutu Buku I': '📚', 
      'Petarung Kuis': '⚔️',
      'Eksplorer Ulung': '🗺️'
    };
    return map[title] || '🏆';
  },

  renderCharts(progress = []) {
    const trendEl = document.getElementById('trendChart');
    const catEl = document.getElementById('categoryChart');

    if (!progress || progress.length === 0) return;

    if (trendEl) {
      new Chart(trendEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: progress.map(p => p.bab_title ? p.bab_title.substring(0, 10) + '..' : 'Bab'),
          datasets: [
            {
              label: 'Poin Kuis',
              data: progress.map(p => p.total_score_points),
              backgroundColor: '#4f46e5'
            },
            {
              label: 'Menit Baca',
              type: 'line',
              data: progress.map(p => Math.floor(p.total_reading_seconds / 60)),
              borderColor: '#10b981',
              tension: 0.4
            }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (catEl) {
      const catData = {};
      progress.forEach(p => {
        const cat = p.category || 'Lainnya';
        catData[cat] = (catData[cat] || 0) + p.total_score_points;
      });

      new Chart(catEl.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(catData),
          datasets: [{
            data: Object.values(catData),
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: { responsive: true }
      });
    }
  }
};
