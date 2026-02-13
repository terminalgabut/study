// root/js/controllers/performaController.js

import { performaService } from '../services/performaService.js';
import { babModalView } from '../../components/babModalView.js';
import { durasiModalView } from '../../components/durasiModalView.js';
import { ulangModalView } from '../../components/ulangModalView.js';
import { akurasiModalView } from '../../components/akurasiModalView.js';
import { initCalendar } from '../lib/kalender.js';
import { chartLib } from '../lib/charts.js'; 

export const performaController = {
  
  /**
   * Fungsi Inisialisasi Utama
   */
  async init() {
    window.__DEBUG__.log("--- [DEBUG] Inisialisasi PerformaController ---");
    try {
      // 1. Ambil data awal (Default 7 hari terakhir ditangani di Service)
      const data = await performaService.getDashboardData();
      
      // 2. Render seluruh UI dengan data awal
      this.renderAll(data);
      
      // 3. Pasang Listener Kalender untuk Filter Tanggal
      initCalendar(async (startDate, endDate) => {
        window.__DEBUG__.log(`Filter data: ${startDate.toISOString()} - ${endDate.toISOString()}`);
        
        // Beri feedback loading ke user
        this.showChartLoading(true);

        try {
          // Ambil data baru berdasarkan range tanggal dari kalender
          const filteredData = await performaService.getDashboardData(startDate, endDate);
          
          // Render ulang komponen dengan data hasil filter
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
    
    // Tetap panggil library agar grafik lama dihapus & diganti placeholder/nol
    chartLib.renderTrendChart('trendChart', progress);
    chartLib.renderCategoryChart('categoryChart', progress);
  },

  /**
   * Update statistik angka di kartu ringkasan
   */
  renderSummary(profile, stats) {
    const nameEl = document.getElementById('user-fullname');
    if (nameEl) nameEl.textContent = profile?.full_name || 'Pelajar';
    
    // Logika Level: 1 level setiap kelipatan 500 poin
    const level = Math.floor((stats.totalPoints || 0) / 500) + 1;
    const progressPercent = (((stats.totalPoints || 0) % 500) / 500) * 100;
    
    const updateText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    updateText('user-rank', `Level ${level} Scholar`);
    updateText('xp-text', `${stats.totalPoints} Poin Total`);
    
    const xpFillEl = document.getElementById('xp-fill');
    if (xpFillEl) xpFillEl.style.width = `${progressPercent}%`;

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
