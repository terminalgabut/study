import { supabase } from '../services/supabase.js';

export async function initDailyTarget() {
  const targetListEl = document.getElementById('dailyTargetList');
  if (!targetListEl) return;

  try {
    const { data: history, error } = await supabase
      .from('riwayat')
      .select('last_accessed, notes_completed_today');

    if (error) throw error;

    // Ambil tanggal hari ini (Format: YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Filter aktivitas user yang terjadi hari ini
    const activityToday = (history || []).filter(item => 
      item.last_accessed && item.last_accessed.startsWith(today)
    );

    // LOGIKA TARGET
    const hasReadEnough = activityToday.length >= 5; // Minimal 5 materi
    const hasNoted = activityToday.some(item => item.notes_completed_today === true);

    // RENDER UI
    targetListEl.innerHTML = `
      <li style="list-style: none; margin-bottom: 8px;">
        ${hasReadEnough ? '✅' : '⬜'} 
        <span style="${hasReadEnough ? 'text-decoration: line-through; color: gray;' : ''}">Baca 5 materi</span>
      </li>
      <li style="list-style: none;">
        ${hasNoted ? '✅' : '⬜'} 
        <span style="${hasNoted ? 'text-decoration: line-through; color: gray;' : ''}">Catat poin penting</span>
      </li>
    `;

  } catch (err) {
    console.error(err);
    targetListEl.innerHTML = '<li>Gagal memuat target</li>';
  }
}
