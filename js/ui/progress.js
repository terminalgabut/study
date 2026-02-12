import { supabase } from '../services/supabase.js';

export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // 1. Ambil ID dari materials untuk hitung total (sebelah kanan /..)
    const { data: mData, error: e1 } = await supabase
      .from('materials')
      .select('id');

    // 2. Ambil data dari study_progress (sebelah kiri ../)
    const { data: pData, error: e2 } = await supabase
      .from('study_progress')
      .select('total_reading_seconds');

    if (e1 || e2) throw (e1 || e2);

    // --- LOGIKA ---
    const totalMateri = mData ? mData.length : 0;
    const materiDilihat = pData ? pData.length : 0;

    // Hitung durasi (pastikan pData tidak null sebelum reduce)
    const totalSecs = (pData || []).reduce((acc, curr) => acc + (curr.total_reading_seconds || 0), 0);
    const totalMins = Math.floor(totalSecs / 60);

    // --- UI ---
    statsEl.textContent = `${materiDilihat} / ${totalMateri}`;

    if (totalMins >= 60) {
      timeEl.textContent = `${Math.floor(totalMins / 60)}j ${totalMins % 60}m`;
    } else {
      timeEl.textContent = `${totalMins} menit`;
    }

  } catch (err) {
    console.error('Error initProgress:', err);
    statsEl.textContent = "0 / 0";
    timeEl.textContent = "0 m";
  }
}
