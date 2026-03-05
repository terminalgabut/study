// js/controllers/journalController.js
import { journalService } from '../services/journalService.js';

export async function initJournalPage() {
  const container = document.getElementById('journalListContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading">Menyusun laporan mingguan...</div>';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return renderMessage(container, 'Silakan login terlebih dahulu.');

    const snapshots = await journalService.getWeeklySnapshots(user.id);

    if (snapshots.length === 0) {
      return renderMessage(container, 'Belum ada catatan aktivitas belajar.');
    }

    container.innerHTML = snapshots.map(s => createJournalCard(s)).join('');
  } catch (err) {
    renderMessage(container, 'Gagal memuat jurnal.');
  }
}

function createJournalCard(s) {
  // Format durasi menggunakan helper yang sudah ada
  const readTime = formatDuration(s.total_reading_seconds ?? 0);
  const quizTime = formatDuration(s.total_quiz_seconds ?? 0);
  
  return `
    <div class="home-card journal-card">
      <div class="journal-header">
        <h3>🗓 ${formatDate(s.week_start)} - ${formatDate(s.week_end)}</h3>
        <span class="badge-active">${s.most_active_category ?? 'Umum'}</span>
      </div>

      <div class="journal-grid">
        <div class="stat-item">
          <span class="label">🏆 Kuis</span>
          <span class="value">${s.total_quiz_attempts} Selesai</span>
        </div>
        <div class="stat-item">
          <span class="label">📊 Skor</span>
          <span class="value">${Math.round(s.avg_score)}%</span>
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
        <p>👑 <strong>Bab Teraktif:</strong> ${s.most_active_bab ?? '-'}</p>
        <p>🕒 <strong>Jam Produktif:</strong> ${s.most_active_hour ? s.most_active_hour + ':00' : '-'}</p>
      </div>

      <div class="journal-insight">
        <p>${s.insight?.summary || 'Terus pertahankan ritme belajarmu!'}</p>
      </div>
    </div>
  `;
}
