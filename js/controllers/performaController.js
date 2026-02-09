import { performaService } from '../services/performaService.js';

export const performaController = {
  async init() {
    try {
      // 1. Ambil data dari Service
      const data = await performaService.getDashboardData();
      
      // 2. Isi UI Panel Ringkasan (Hero Card)
      this.renderSummary(data.profile, data.stats);
      
      // 3. Isi Jurnal Aktivitas
      this.renderActivityJournal(data.attempts, data.history);
      
      // 4. Isi Lencana (Achievements)
      this.renderAchievements(data.achievements);
      
      // 5. Gambar Grafik (Trend & Category)
      this.renderCharts(data.attempts, data.history);
      
    } catch (error) {
      console.error("Gagal inisialisasi Performa:", error);
    }
  },

  renderSummary(profile, stats) {
    const nameEl = document.getElementById('user-fullname');
    if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';
    
    const xp = profile?.xp || 0;
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;
    
    const rankEl = document.getElementById('user-rank');
    const xpTextEl = document.getElementById('xp-text');
    const xpFillEl = document.getElementById('xp-fill');

    if (rankEl) rankEl.textContent = `Level ${level} Scholar`;
    if (xpTextEl) xpTextEl.textContent = `${currentXP} / 100 XP`;
    if (xpFillEl) xpFillEl.style.width = `${currentXP}%`;

    document.getElementById('stat-materi').textContent = stats.totalMateri;
    document.getElementById('stat-waktu').textContent = stats.timeString;
    document.getElementById('stat-skor').textContent = `${stats.avgScore}%`;
    document.getElementById('stat-streak').textContent = `🔥 ${stats.streak}`;
  },

  renderActivityJournal(attempts, history) {
    const listContainer = document.getElementById('activity-list');
    if (!listContainer) return;

    const recentActivity = [...attempts].reverse().slice(0, 5);
    
    if (recentActivity.length === 0) {
      listContainer.innerHTML = '<li class="small gray">Belum ada aktivitas kuis.</li>';
      return;
    }

    listContainer.innerHTML = recentActivity.map(act => `
      <li>
        <div class="task-info">
          <strong>${act.dimension || 'Kuis'}</strong>
          <span class="small gray">${new Date(act.submitted_at).toLocaleDateString()}</span>
        </div>
        <div class="task-meta">
          <span class="badge-score">${act.score}%</span>
        </div>
      </li>
    `).join('');
  },

  renderAchievements(badges) {
    const container = document.getElementById('badge-container');
    if (!container) return;

    if (!badges || badges.length === 0) {
      container.innerHTML = '<p class="small gray">Belum ada lencana.</p>';
      return;
    }

    container.innerHTML = badges.map(b => `
      <div class="badge-icon active" title="${b.achievements?.description || ''}">
        ${this.getBadgeEmoji(b.achievements?.title)}
      </div>
    `).join('');
  },

  getBadgeEmoji(title) {
    const map = { 'Si Paling Tekun': '⏳', 'Sempurna!': '💎', 'Pemanasan': '🔥' };
    return map[title] || '🏆';
  },

  renderCharts(attempts, history) {
    const trendEl = document.getElementById('trendChart');
    const catEl = document.getElementById('categoryChart');

    if (trendEl) {
      new Chart(trendEl.getContext('2d'), {
        type: 'line',
        data: {
          labels: attempts.map(a => new Date(a.submitted_at).toLocaleDateString()),
          datasets: [{
            label: 'Skor Kuis',
            data: attempts.map(a => a.score),
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100, display: false }, x: { display: false } }
        }
      });
    }

    if (catEl) {
      new Chart(catEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Sains', 'Bahasa', 'Umum'],
          datasets: [{
            label: 'Skill',
            data: [80, 65, 90],
            backgroundColor: ['#ffffff', '#ffffff', '#ffffff']
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { ticks: { color: '#fff' } } }
        }
      });
    }
  }
};
