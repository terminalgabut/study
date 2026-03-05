// js/controllers/journalController.js
import { journalService } from '../services/journalService.js';
import { supabase } from '../services/supabase.js';

export const journalController = {
  async init() {
    const container = document.getElementById('journalListContainer');
    if (!container) return;

    this.renderLoading(container);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return this.renderMessage(container, 'Silakan login terlebih dahulu.', 'warning');
      }

      // Ambil data "matang" dari Database yang sudah dihitung oleh Trigger
      const snapshots = await journalService.getWeeklySnapshots(user.id);

      if (!snapshots || snapshots.length === 0) {
        return this.renderMessage(container, 'Belum ada catatan aktivitas belajar mingguan.', 'info');
      }

      this.renderSnapshots(container, snapshots);
    } catch (err) {
      console.error('[JournalController] Error:', err);
      this.renderMessage(container, 'Gagal memuat data jurnal. Coba lagi nanti.', 'error');
    }
  },

  renderSnapshots(container, snapshots) {
    container.innerHTML = snapshots.map(s => this.createJournalCard(s)).join('');
  },

  createJournalCard(s) {
    const readTime = this.formatDuration(s.total_reading_seconds ?? 0);
    const quizTime = this.formatDuration(s.total_quiz_seconds ?? 0);
    
    return `
      <div class="home-card journal-card">
        <div class="journal-header">
          <div class="journal-date">
            <span class="icon">🗓</span>
            <h3>${this.formatDate(s.week_start)} - ${this.formatDate(s.week_end)}</h3>
          </div>
          <span class="badge-active">${s.most_active_category ?? 'Umum'}</span>
        </div>

        <div class="journal-grid">
          <div class="stat-item">
            <span class="label">🏆 Kuis</span>
            <span class="value">${s.total_quiz_attempts || 0} Selesai</span>
          </div>
          <div class="stat-item">
            <span class="label">📊 Akurasi</span>
            <span class="value">${Math.round(s.avg_score || 0)}%</span>
          </div>
          <div class="stat-item">
            <span class="label">📖 Membaca</span>
            <span class="value">${readTime}</span>
          </div>
          <div class="stat-item">
            <span class="label">⚔️ Kuis</span>
            <span class="value">${quizTime}</span>
          </div>
        </div>

        <div class="journal-highlight">
          <div class="highlight-item">
            <span class="icon">👑</span>
            <span><strong>Bab Teraktif:</strong> ${s.most_active_bab || '-'}</span>
          </div>
          <div class="highlight-item">
            <span class="icon">🕒</span>
            <span><strong>Jam Produktif:</strong> ${s.most_active_hour ? s.most_active_hour + ':00' : '-'}</span>
          </div>
        </div>

        <div class="journal-insight">
          <p>${s.insight?.summary || 'Terus pertahankan ritme belajarmu untuk hasil maksimal!'}</p>
        </div>
      </div>
    `;
  },

  // --- HELPER FUNCTIONS ---

  renderLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Menyusun laporan mingguan...</p>
      </div>`;
  },

  renderMessage(container, msg, type = 'info') {
    container.innerHTML = `
      <div class="message-card ${type}">
        <p>${msg}</p>
      </div>`;
  },

  formatDate(dateStr) {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  },

  formatDuration(seconds) {
    if (seconds === 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
  }
};
