import { supabase } from '../services/supabase.js';

export async function initDailyTarget() {
  const targetListEl = document.getElementById('dailyTargetList');
  if (!targetListEl) return;

  try {
    // Ambil data riwayat untuk cek aktivitas hari ini
    const { data: historyData, error } = await supabase
      .from('riwayat')
      .select('last_accessed, notes_completed_today');

    if (error) throw error;

    // Ambil tanggal hari ini (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Filter aktivitas yang dilakukan hari ini
    const activityToday = historyData ? historyData.filter(item => 
      item.last_accessed && item.last_accessed.startsWith(today)
    ) : [];

    // Logika penentuan target selesai
    const hasReadToday = activityToday.length > 5;
    const hasNotedToday = activityToday.some(item => item.notes_completed_today === true);

    // Render ke HTML
    targetListEl.innerHTML = `
      <li>
        ${hasReadToday ? '✅' : '⬜'} 
        <span class="${hasReadToday ? 'strikethrough' : ''}">Baca 5 materi</span>
      </li>
      <li>
        ${hasNotedToday ? '✅' : '⬜'} 
        <span class="${hasNotedToday ? 'strikethrough' : ''}">Catat poin penting</span>
      </li>
    `;

  } catch (err) {
    console.error('Gagal memuat target harian:', err);
    targetListEl.innerHTML = '<li>Gagal memuat target harian</li>';
  }
}
