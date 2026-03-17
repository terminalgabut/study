// js/controllers/journalController.js
import { journalService } from '../services/journalService.js';
import { journalAnalytic } from '../lib/journalAnalytic.js';
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
  // Parsing data JSONB
  const cog = s.cognitive_profile || {};
  const stab = s.stability_metrics || {};
  const summ = s.cognitive_summary || {};
  const { neuroDescription, list: insightsList } = journalAnalytic.getInsights(s);

  // 3. Mapping HTML menggunakan insightsList
  const insightsListHtml = insightsList
      .map(text => `<li>${text}</li>`)
      .join('');
  
  // Format Durasi & Metrik Dasar
  const totalStudyTime = this.formatDuration(s.total_study_seconds ?? 0);
  const avgSpeed = parseFloat(s.avg_speed_seconds || s.avg_speed || 0).toFixed(1);

  return `
    <div class="home-card journal-card">
      <div class="journal-header">
        <div class="journal-date">
          <small style="color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📘 Jurnal Mingguan</small>
          <h3>${this.formatDate(s.week_start)} – ${this.formatDate(s.week_end)}</h3>
        </div>
        <div class="journal-brief" style="margin-top: 8px; font-size: 13px; line-height: 1.5;">
          <p>Selama 7 hari terakhir, kamu mempelajari <strong>${s.unique_bab_count || 0} bab</strong> dari <strong>${s.unique_category_count || 0} kategori</strong> dengan total waktu belajar <strong>${totalStudyTime}</strong>.</p>
          <p style="margin-top: 4px;">Pola belajar menunjukkan kamu paling fokus pada pukul <strong>${s.most_active_hour ? s.most_active_hour + ':00' : '-'} WIB</strong>.</p>
        </div>
      </div>

      <div class="journal-section">
        <h4 style="color: var(--accent); font-size: 12px; margin-bottom: 10px;">🧪 Aktivitas Latihan</h4>
        <div class="journal-grid">
          <div class="stat-item">
            <span class="label">🎯 Akurasi</span>
            <span class="value">${Math.round(s.avg_score || 0)}%</span>
          </div>
          <div class="stat-item">
            <span class="label">⚡ Avg Speed</span>
            <span class="value">${avgSpeed}s</span>
          </div>
          <div class="stat-item">
            <span class="label">🏆 Kuis</span>
            <span class="value">${s.total_quiz_attempts || 0} Selesai</span>
          </div>
          <div class="stat-item">
            <span class="label">🔄 Review</span>
            <span class="value">${s.review_bab_count || 0} Materi</span>
          </div>
        </div>
      </div>

      <div class="journal-section">
        <h4 style="color: var(--accent); font-size: 12px; margin-bottom: 10px;">📊 Nilai Dimensi Kognitif</h4>
        <div class="dimensi-table">
          <div class="table-row header"><span>Dimensi</span> <span>Skor</span></div>
          <div class="table-row"><span>Memory</span> <span>${Math.round(cog.memory_score || 0)}</span></div>
          <div class="table-row"><span>Reasoning</span> <span>${Math.round(cog.reasoning_score || 0)}</span></div>
          <div class="table-row"><span>Analogi</span> <span>${Math.round(cog.analogy_score || 0)}</span></div>
          <div class="table-row"><span>Reading</span> <span>${Math.round(cog.reading_score || 0)}</span></div>
          <div class="table-row"><span>Vocabulary</span> <span>${Math.round(cog.vocabulary_score || 0)}</span></div>
        </div>
      </div>

      <div class="journal-section">
        <h4 style="color: var(--accent); font-size: 12px; margin-bottom: 10px;">📈 Stability Metrics</h4>
        <div class="dimensi-table">
          <div class="table-row header"><span>Metric</span> <span>Nilai</span></div>
          <div class="table-row"><span>Stability</span> <span>${Math.round(stab.stability_index || 0)}</span></div>
          <div class="table-row"><span>Speed Stability</span> <span>${Math.round(stab.speed_stability || 0)}</span></div>
          <div class="table-row"><span>Konsistensi</span> <span>${Math.round(summ.error_consistency || 0)}</span></div>
          <div class="table-row"><span>Akurasi</span> <span>${Math.round(stab.accuracy_stability || 0)}</span></div>
          <div class="table-row"><span>Endurance</span> <span>${Math.round(summ.endurance_index || 0)}</span></div>
        </div>
      </div>

      <div class="table-row" style="background: rgba(255, 71, 87, 0.05);">
      <span style="color: #ff4757;">🔥 Burnout Risk</span> 
      <span style="font-weight: 700; color: #ff4757;">${Math.round(stab.burnout_risk || 0)}%</span>
    </div>
    <div class="table-row" style="background: rgba(46, 213, 115, 0.05);">
      <span style="color: #2ed573;">🔋 Recovery Rate</span> 
      <span style="font-weight: 700; color: #2ed573;">${Math.round(stab.recovery_rate || 0)}%</span>
    </div>

      <div class="journal-summary-box" style="background: var(--accent-soft); padding: 16px; border-radius: var(--radius-md); margin-top: 20px; border-left: 4px solid var(--accent);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="summary-item">
            <span class="label" style="display:block; font-size: 11px; color: var(--text-muted);">Cognitive Poin</span>
            <span class="value" style="font-size: 18px; font-weight: 800; color: var(--accent);">${cog.iq_final || 0}</span>
          </div>
          <div class="summary-item">
            <span class="label" style="display:block; font-size: 11px; color: var(--text-muted);">Confidence</span>
            <span class="value" style="font-size: 18px; font-weight: 800;">${cog.iq_confidence || 0}%</span>
          </div>
          <div class="summary-item">
            <span class="label" style="display:block; font-size: 11px; color: var(--text-muted);">Classification</span>
            <span class="value" style="font-weight: 600;">${cog.iq_class || '-'}</span>
          </div>
          <div class="summary-item">
            <span class="label" style="display:block; font-size: 11px; color: var(--text-muted);">Neuro Type</span>
            <span class="value" style="font-weight: 600;">${cog.neuro_type || '-'}</span>
          </div>
        </div>
        <p style="margin-top: 12px; font-size: 12px; font-style: italic; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 8px;">
          ${neuroDescription}
        </p>
      </div>

      <div class="journal-insight" style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: var(--radius-md);">
          <div class="insight-label" style="font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span>🔎</span> Intelligence Insight
          </div>
          <ul style="font-size: 13px; color: var(--text-muted); padding-left: 18px; line-height: 1.6;">
            ${insightsListHtml}
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
