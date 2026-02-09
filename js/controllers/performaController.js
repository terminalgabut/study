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
    // Nama & Rank
    document.getElementById('user-fullname').textContent = profile?.full_name || 'Pelajar';
    
    // Leveling (Contoh sederhana: tiap 100 XP naik level)
    const xp = profile?.xp || 0;
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;
    
    document.getElementById('user-rank').textContent = `Level ${level} Scholar`;
    document.getElementById('xp-text').textContent = `${currentXP} / 100 XP`;
    document.getElementById('xp-fill').style.width = `${currentXP}%`;

    // Stats Grid
    document.getElementById('stat-materi').textContent = stats.totalMateri;
    document.getElementById('stat-waktu').textContent = stats.timeString;
    document.getElementById('stat-skor').textContent = `${stats.avgScore}%`;
    document.getElementById('stat-streak').textContent = `🔥 ${stats.streak}`;
  },

  renderActivityJournal(attempts, history) {
    const listContainer = document.getElementById('activity-list');
    if (!attempts.length && !history.length) return;

    // Gabungkan dan urutkan aktivitas terbaru (limit 5)
    const recentActivity = attempts.slice(-5).reverse();
    
    listContainer.innerHTML = recentActivity.map(act => `
      <li>
        <div class="task-info">
          <strong>${act.dimension || 'Kuis'}</strong>
          <span class="small gray">${new Date(act.submitted_at).toLocaleDateString()}</span>
        </div>
        <div class="task-meta">
          <span class="badge-score">${act.score}%</span>
          <button class="small-btn" onclick="alert('Ulang kuis?')">Re-take</button>
        </div>
      </li>
    `).join('');
  },

  renderAchievements(badges) {
    const container = document.getElementById('badge-container');
    if (!badges.length) return;

    container.innerHTML = badges.map(b => `
      <div class="badge-icon active" title="${b.achievements.description}">
        ${this.getBadgeEmoji(b.achievements.title)}
      </div>
    `).join('');
  },

  getBadgeEmoji(title) {
    // Map judul achievement ke emoji
    const map = { 'Si Paling Tekun': '⏳', 'Sempurna!': '💎', 'Pemanasan': '🔥' };
    return map[title] || '🏆';
  },

  renderCharts(attempts, history) {
    // --- GRAFIK TREN (Dual Line) ---
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    new Chart(ctxTrend, {
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

    // --- GRAFIK KATEGORI (Bar) ---
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctxCat, {
      type: 'bar',
      data: {
        labels: ['Sains', 'Bahasa', 'Umum'],
        datasets: [{
          label: 'Skill',
          data: [80, 65, 90], // Ini nanti bisa dihitung dari data kategori materi
          backgroundColor: ['#4EA8DE', '#56CFE1', '#64DFDF'],
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
};
