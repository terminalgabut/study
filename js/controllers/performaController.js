import { performaService } from '../services/performaService.js';

export const performaController = {
  async init() {
    try {
      const data = await performaService.getDashboardData();
      this.renderSummary(data.profile, data.stats);
      this.renderActivityJournal(data.attempts, data.history);
      this.renderAchievements(data.achievements);
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
    
    document.getElementById('user-rank').textContent = `Level ${level} Scholar`;
    document.getElementById('xp-text').textContent = `${currentXP} / 100 XP`;
    document.getElementById('xp-fill').style.width = `${currentXP}%`;

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
      listContainer.innerHTML = '<li class="small gray">Belum ada aktivitas.</li>';
      return;
    }

    listContainer.innerHTML = recentActivity.map(act => `
      <li>
        <div class="task-info">
          <strong>${act.dimension || 'Kuis'}</strong>
          <span class="small gray">${new Date(act.submitted_at).toLocaleDateString()}</span>
        </div>
        <div class="task-meta"><span class="badge-score">${act.score}%</span></div>
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
            label: 'Skor',
            data: attempts.map(a => a.score),
            borderColor: '#ffffff',
            tension: 0.4,
            fill: false
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (catEl) {
      new Chart(catEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Sains', 'Bahasa', 'Umum'],
          datasets: [{ data: [80, 65, 90], backgroundColor: '#ffffff' }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
      });
    }
  }
};
