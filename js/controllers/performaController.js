import { performaService } from '../services/performaService.js';

export const performaController = {
  async init() {
    window.__DEBUG__.log("--- [DEBUG] Inisialisasi PerformaController ---");
    try {
      // 1. Ambil data dari tabel study_progress (Agregat)
      const data = await performaService.getDashboardData();
      
      window.__DEBUG__.log("[Performa] Data Diterima:", data);

      this.renderSummary(data.profile, data.progress);
      this.renderAchievements(data.achievements);
      this.renderCharts(data.progress);
      this.renderActivityJournal(data.progress); // Menggunakan bab terakhir
      
    } catch (error) {
      window.__DEBUG__.error("[Performa] Gagal:", error.message);
      console.error("Gagal inisialisasi Performa:", error);
    }
  },

  renderSummary(profile, progress = []) {
    window.__DEBUG__.log("[Performa] Rendering Summary...");
    
    // Perhitungan Total dari tabel study_progress
    const stats = {
      totalMateri: progress.length,
      totalSeconds: progress.reduce((acc, curr) => acc + (Number(curr.total_reading_seconds || 0) + Number(curr.total_quiz_seconds || 0)), 0),
      totalPoin: progress.reduce((acc, curr) => acc + (curr.total_score_points || 0), 0),
      totalReadCount: progress.reduce((acc, curr) => acc + (curr.read_count || 0), 0),
      totalAttempts: progress.reduce((acc, curr) => acc + (curr.attempts_count || 0), 0)
    };

    const nameEl = document.getElementById('user-fullname');
    if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';
    
    // Logika Leveling berdasarkan TOTAL POIN (bukan XP lama)
    const level = Math.floor(stats.totalPoin / 500) + 1;
    const progressXP = stats.totalPoin % 500;
    const progressPercent = (progressXP / 500) * 100;
    
    document.getElementById('user-rank').textContent = `Level ${level} Scholar`;
    document.getElementById('xp-text').textContent = `${stats.totalPoin} Poin`;
    document.getElementById('xp-fill').style.width = `${progressPercent}%`;

    // Pasang ke UI sesuai ID baru kita
    document.getElementById('stat-materi').textContent = stats.totalMateri;
    document.getElementById('stat-waktu').textContent = `${Math.floor(stats.totalSeconds / 60)}m`;
    document.getElementById('stat-read-count').textContent = stats.totalReadCount;
    
    // Hitung Akurasi (Poin / Total Soal)
    const accuracy = stats.totalAttempts > 0 ? Math.round((stats.totalPoin / stats.totalAttempts) * 100) : 0;
    document.getElementById('stat-skor').textContent = `${accuracy}%`;
  },

  renderActivityJournal(progress = []) {
    const listContainer = document.getElementById('activity-list');
    if (!listContainer) return;

    // Ambil 5 materi yang baru saja diupdate
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
          <span class="small gray">${item.category || ''} • Diulang ${item.read_count}x</span>
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
    
    window.__DEBUG__.log(`[Performa] Rendering ${badges.length} lencana`);

    if (badges.length === 0) {
      container.innerHTML = '<p class="small gray">Selesaikan materi untuk meraih lencana.</p>';
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

    if (!progress.length) return;

    // 1. Chart Efektivitas (Waktu vs Skor per Bab)
    if (trendEl) {
      new Chart(trendEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: progress.map(p => p.bab_title.substring(0, 10) + '..'),
          datasets: [
            {
              label: 'Poin',
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

    // 2. Chart Kategori (Poin per Kategori)
    if (catEl) {
      const catData = {};
      progress.forEach(p => {
        catData[p.category] = (catData[p.category] || 0) + p.total_score_points;
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
