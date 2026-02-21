// root/js/controllers/performaController.js

import { performaService } from '../services/performaService.js';
import { babModalView } from '../../components/babModalView.js';
import { durasiModalView } from '../../components/durasiModalView.js';
import { ulangModalView } from '../../components/ulangModalView.js';
import { akurasiModalView } from '../../components/akurasiModalView.js';
import { initCalendar } from '../lib/kalender.js';
import { chartLib } from '../lib/charts.js'; 
import { buildLevelProfile } from '../lib/levelEngine.js';

export const performaController = {
  
  /**
   * Fungsi Inisialisasi Utama
   */
  async init() {
    window.__DEBUG__.log("--- [DEBUG] Inisialisasi PerformaController ---");
    try {
      
      const data = await performaService.getDashboardData();
      
      this.renderAll(data);
    
      initCalendar(async (startDate, endDate) => {
        window.__DEBUG__.log(`Filter data: ${startDate.toISOString()} - ${endDate.toISOString()}`);
        
        this.showChartLoading(true);

        try {
          
          const filteredData = await performaService.getDashboardData(startDate, endDate);
          
          this.renderAll(filteredData);
          
        } catch (err) {
          window.__DEBUG__.error("Gagal memfilter data:", err);
        } finally {
          this.showChartLoading(false);
        }
      });
      
    } catch (error) {
      window.__DEBUG__.error("[Performa] Gagal init:", error.message);
    }
  },

  /**
   * Helper untuk merender semua komponen (Summary, Charts, Journal, Achievements)
   */
  renderAll(data) {
    this.renderSummary(data.profile, data.stats);
    this.renderCharts(data.progress);
    this.renderActivityJournal(data.progress);
    this.renderAchievements(data.achievements);
    this.setupStatClicks(data.progress);
  },

  /**
   * Render Chart menggunakan library eksternal (mencegah Canvas in Use)
   */
  renderCharts(progress = []) {
    if (!progress || progress.length === 0) {
      window.__DEBUG__.log("[Charts] Merender state kosong (tidak ada data).");
    }
    
    chartLib.renderTrendChart('trendChart', progress);
    chartLib.renderCategoryChart('categoryChart', progress);
  },

// Update statistik angka di kartu ringkasan
  renderSummary(profile, stats) {
  const nameEl = document.getElementById('user-fullname');
  if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';

  const levelData = buildLevelProfile(profile?.xp || 0);

  const updateText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  updateText(
    'user-rank',
    `Lv.${levelData.level} ${levelData.badge.name}`
  );

  updateText(
    'xp-text',
    `${levelData.xp.toLocaleString('id-ID')} XP`
  );

  const xpFillEl = document.getElementById('xp-fill');
  if (xpFillEl) {
    xpFillEl.style.width = `${levelData.progressPercent}%`;
  }

  updateText('stat-materi', stats.totalMateri);
  updateText('stat-durasi', stats.timeString);
  updateText('stat-read-count', stats.totalReadCount);
  updateText('stat-skor', `${stats.avgScore}%`);
    },

  /**
   * Mengatur interaksi klik pada kartu statistik (Membuka Modal)
   */
  setupStatClicks(progressData) {
    const cards = [
      { 
        id: 'card-materi', 
        view: babModalView, 
        data: () => [progressData, [...new Set(progressData.map(p => p.category))]] 
      },
      { 
        id: 'card-durasi', 
        action: async () => {
          const sessionData = await performaService.getLearningSessions();
          durasiModalView.show(sessionData);
        } 
      },
      { 
        id: 'card-ulang', 
        view: ulangModalView, 
        data: () => [progressData] 
      },
      { 
        id: 'card-akurasi', 
        view: akurasiModalView, 
        data: () => [progressData] 
      }
    ];

    cards.forEach(card => {
      const el = document.getElementById(card.id);
      if (el) {
        // Reset listener agar tidak terjadi penumpukan event (double click)
        el.onclick = null; 
        el.onclick = card.action || (() => card.view.show(...card.data()));
      }
    });
  },

  /**
   * Render Jurnal Aktivitas (5 Aktivitas Terbaru)
   */
  renderActivityJournal(progress = []) {
    const listContainer = document.getElementById('activity-list');
    if (!listContainer) return;

    const recent = [...progress]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    if (recent.length === 0) {
      listContainer.innerHTML = '<li class="small gray" style="padding:1rem; text-align:center;">Belum ada aktivitas.</li>';
      return;
    }

    listContainer.innerHTML = recent.map(item => `
      <li>
        <div class="task-info">
          <strong>${item.bab_title || 'Materi'}</strong>
          <span class="small gray">${item.category || 'Umum'} • Dilihat ${item.read_count}x</span>
        </div>
        <div class="task-meta">
          <span class="small gray">${new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
        </div>
      </li>`).join('');
  },

  /**
   * Render Lencana / Achievements
   */
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
    const map = { 
      'Langkah Awal': '🌱', 
      'Kutu Buku I': '📚', 
      'Petarung Kuis': '⚔️', 
      'Eksplorer Ulung': '🗺️' 
    };
    return map[title] || '🏆';
  },

  /**
   * Efek Loading visual saat memproses data
   */
  showChartLoading(isLoading) {
    const wrappers = document.querySelectorAll('.chart-wrapper, .stat-card');
    wrappers.forEach(w => {
      w.style.opacity = isLoading ? '0.4' : '1';
      w.style.pointerEvents = isLoading ? 'none' : 'auto';
      w.style.transition = 'opacity 0.2s ease';
    });
  }
};
