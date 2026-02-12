// root/js/controllers/performaControllers.js

import { performaService } from '../services/performaService.js';
import { babModalView } from '../../components/babModalView.js';
import { durasiModalView } from '../../components/durasiModalView.js';
import { ulangModalView } from '../../components/ulangModalView.js';
import { akurasiModalView } from '../../components/akurasiModalView.js';

export const performaController = {
  async init() {
    window.__DEBUG__.log("--- [DEBUG] Inisialisasi PerformaController ---");
    try {
      const data = await performaService.getDashboardData();
      this.renderSummary(data.profile, data.stats);
      this.renderAchievements(data.achievements);
      this.renderCharts(data.progress);
      this.renderActivityJournal(data.progress);
      this.setupStatClicks(data.progress);
    } catch (error) {
      window.__DEBUG__.error("[Performa] Gagal:", error.message);
    }
  },

  setupStatClicks(progressData) {
    const babCard = document.getElementById('card-materi');
    if (babCard) {
      babCard.onclick = () => {
        // Ambil kategori unik dari data progres
        const allCategories = [...new Set(progressData.map(p => p.category))];
        // Tampilkan modal
        babModalView.show(progressData, allCategories);
      };
    }

    const durasiCard = document.getElementById('card-durasi'); // Pastikan ID ini ada di HTML
    if (durasiCard) {
      durasiCard.onclick = async () => {
        try {
          // Tampilkan loading state jika perlu
          const sessionData = await performaService.getLearningSessions();
          durasiModalView.show(sessionData);
        } catch (err) {
          window.__DEBUG__.error("[Controller] Gagal memuat modal durasi");
        }
      };
    }

    // Handle Klik Kartu Materi Diulang (Analisis)
const ulangCard = document.getElementById('card-ulang');
if (ulangCard) {
    ulangCard.onclick = () => {
        ulangModalView.show(progressData);
    };
}

    const akurasiCard = document.getElementById('card-akurasi');
if (akurasiCard) {
    akurasiCard.onclick = () => {
        akurasiModalView.show(progressData);
    };
}
  },

  renderSummary(profile, stats) {
    const nameEl = document.getElementById('user-fullname');
    if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';
    
    const level = Math.floor(stats.totalPoints / 500) + 1;
    const progressPercent = ((stats.totalPoints % 500) / 500) * 100;
    
    const updateText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    updateText('user-rank', `Level ${level} Scholar`);
    updateText('xp-text', `${stats.totalPoints} Poin Total`);
    const xpFillEl = document.getElementById('xp-fill');
    if (xpFillEl) xpFillEl.style.width = `${progressPercent}%`;

    updateText('stat-materi', stats.totalMateri);
    updateText('stat-waktu', stats.timeString);
    updateText('stat-read-count', stats.totalReadCount);
    updateText('stat-skor', `${stats.avgScore}%`);
  },

  renderActivityJournal(progress = []) {
    const listContainer = document.getElementById('activity-list');
    if (!listContainer) return;
    const recent = [...progress].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);
    if (recent.length === 0) {
      listContainer.innerHTML = '<li class="small gray">Belum ada aktivitas.</li>';
      return;
    }
    listContainer.innerHTML = recent.map(item => `
      <li>
        <div class="task-info">
          <strong>${item.bab_title || 'Materi'}</strong>
          <span class="small gray">${item.category || ''} • Dilihat ${item.read_count}x</span>
        </div>
        <div class="task-meta"><span class="small gray">${new Date(item.updated_at).toLocaleDateString()}</span></div>
      </li>`).join('');
  },

  renderAchievements(badges = []) {
    const container = document.getElementById('badge-container');
    if (!container) return;
    if (badges.length === 0) {
      container.innerHTML = '<p class="small gray">Belum ada lencana.</p>';
      return;
    }
    container.innerHTML = badges.map(b => `
      <div class="badge-icon active" title="${b.achievements?.description || ''}">
        ${this.getBadgeEmoji(b.achievements?.title)}
        <span class="badge-tooltip">${b.achievements?.title}</span>
      </div>`).join('');
  },

  getBadgeEmoji(title) {
    const map = { 'Langkah Awal': '🌱', 'Kutu Buku I': '📚', 'Petarung Kuis': '⚔️', 'Eksplorer Ulung': '🗺️' };
    return map[title] || '🏆';
  },

  renderCharts(progress = []) {
  const trendEl = document.getElementById('trendChart');
  const catEl = document.getElementById('categoryChart');
  if (!progress || progress.length === 0) return;

  // 1. GRAFIK EFEKTIVITAS (HORIZONTAL BAR)
  if (trendEl) {
    // Ambil 7 data terbaru agar tidak terlalu sesak di layar
    const limitedProgress = progress.slice(0, 7);
    
    new Chart(trendEl.getContext('2d'), {
      type: 'bar',
      data: {
        // Judul di kiri (Y-axis), dipotong di 25 karakter
        labels: limitedProgress.map(p => 
          p.bab_title && p.bab_title.length > 25 
            ? p.bab_title.substring(0, 25) + '...' 
            : (p.bab_title || 'Bab')
        ),
        datasets: [
          { 
            label: 'Poin Kuis', 
            data: limitedProgress.map(p => p.total_score_points || 0), 
            backgroundColor: '#4f46e5',
            borderRadius: 4
          },
          { 
            label: 'Menit Baca', 
            data: limitedProgress.map(p => Math.floor((p.total_reading_seconds || 0) / 60)), 
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: { 
        indexAxis: 'y', // Mengubah menjadi Horizontal
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: { beginAtZero: true },
          y: { 
            ticks: { 
              font: { size: 11 } 
            } 
          }
        }
      }
    });
  }

  // 2. GRAFIK DISTRIBUSI (DOUGHNUT - LEGEND DI KIRI)
  if (catEl) {
    const catData = {};
    progress.forEach(p => { 
      catData[p.category || 'Lainnya'] = (catData[p.category || 'Lainnya'] || 0) + p.total_score_points; 
    });

    new Chart(catEl.getContext('2d'), {
      type: 'doughnut',
      data: { 
        labels: Object.keys(catData), 
        datasets: [{ 
          data: Object.values(catData), 
          backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] 
        }] 
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'left', // PINDAH KE KIRI sesuai diskusi
            align: 'center',
            labels: {
              boxWidth: 12,
              padding: 20,
              font: { size: 12 }
            }
          }
        },
        // Memberikan sedikit ruang ekstra di sisi kanan agar grafik bulat simetris
        layout: {
          padding: {
            left: 10,
            right: 40, 
            top: 10,
            bottom: 10
          }
        }
      }
    });
  }
}
};
