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
  // Helper untuk durasi
  const readTime = this.formatDuration(s.total_reading_seconds ?? 0);
  const quizTime = this.formatDuration(s.total_quiz_seconds ?? 0);
  
  // Data Phase 3 (Cognitive & Stability) - Default values jika null
  const cog = s.cognitive_profile || {};
  const stability = s.stability_metrics || { stability: 0, consistency: 0, endurance: 0 };
  const summary = s.cognitive_summary || { classification: 'N/A', neuro_type: 'Analytical' };

  return `
    <div class="home-card journal-card">
      <div class="journal-header">
        <div class="journal-date">
          <small class="text-accent">📘 Jurnal Mingguan</small>
          <h3>${this.formatDate(s.week_start)} – ${this.formatDate(s.week_end)}</h3>
        </div>
        <div class="journal-brief">
          <p>Selama 7 hari terakhir, kamu mempelajari <strong>${s.total_bab_unid || 0} bab</strong> dengan total waktu <strong>${readTime}</strong>.</p>
        </div>
      </div>

      <div class="journal-section">
        <h4>🧪 Aktivitas Latihan</h4>
        <div class="journal-grid">
          <div class="stat-item">
            <span class="label">🎯 Akurasi</span>
            <span class="value">${Math.round(s.avg_score || 0)}%</span>
          </div>
          <div class="stat-item">
            <span class="label">⚡ Avg Speed</span>
            <span class="value">${s.avg_speed || 0}s</span>
          </div>
          <div class="stat-item">
            <span class="label">🕒 Jam Fokus</span>
            <span class="value">${s.most_active_hour ? s.most_active_hour + ':00' : '-'}</span>
          </div>
          <div class="stat-item">
            <span class="label">🏆 Selesai</span>
            <span class="value">${s.total_quiz_attempts || 0} Kuis</span>
          </div>
        </div>
      </div>

      <div class="journal-section">
        <h4>📊 Nilai Dimensi Kognitif</h4>
        <div class="dimensi-table">
          <div class="table-row header"><span>Dimensi</span> <span>Skor</span></div>
          <div class="table-row"><span>Memory</span> <span>${cog.memory || 0}</span></div>
          <div class="table-row"><span>Reasoning</span> <span>${cog.reasoning || 0}</span></div>
          <div class="table-row"><span>Analogi</span> <span>${cog.analogi || 0}</span></div>
        </div>
      </div>

      <div class="journal-section">
        <h4>📈 Stability Metrics</h4>
        <div class="dimensi-table">
          <div class="table-row header"><span>Metric</span> <span>Nilai</span></div>
          <div class="table-row"><span>Stability</span> <span>${stability.stability || 0}</span></div>
          <div class="table-row"><span>Konsistensi</span> <span>${stability.consistency || 90}</span></div>
          <div class="table-row"><span>Endurance</span> <span>${stability.endurance || 0}</span></div>
        </div>
      </div>

      <div class="journal-summary-box">
        <div class="summary-item">
          <span class="label">Classification</span>
          <span class="value badge">${summary.classification}</span>
        </div>
        <div class="summary-item">
          <span class="label">Neuro Type</span>
          <span class="value">${summary.neuro_type}</span>
        </div>
        <p class="summary-footer">Profil ${summary.neuro_type} menunjukkan kecenderungan berpikir sistematis dan berbasis struktur.</p>
      </div>

      <div class="journal-insight">
        <div class="insight-label">🔎 Area Pengembangan:</div>
        <ul>
          <li>Fokus latihan memory recall.</li>
          <li>Pertahankan keunggulan di analogical reasoning.</li>
        </ul>
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
