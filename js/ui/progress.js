import { supabase } from '../services/supabase.js';

export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // 1. Hitung total semua materi yang tersedia
    const { count: totalMateri, error: errTotal } = await supabase
      .from('materi')
      .select('*', { count: 'exact', head: true });

    // 2. Hitung jumlah materi yang sudah pernah dibuka (di riwayat)
    // Serta ambil total durasi belajar
    const { data: historyData, error: errHistory } = await supabase
      .from('riwayat')
      .select('duration_seconds');

    if (errTotal || errHistory) throw (errTotal || errHistory);

    // --- LOGIKA PERHITUNGAN ---

    // Jumlah materi unik yang sudah dibaca
    const materiDilihat = historyData ? historyData.length : 0;
    const total = totalMateri || 0;

    // Total durasi dalam menit (konversi dari detik)
    const totalSeconds = historyData ? historyData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) : 0;
    const totalMinutes = Math.floor(totalSeconds / 60);

    // --- UPDATE UI ---
    
    // Update teks 3 / 10
    statsEl.textContent = `${materiDilihat} / ${total}`;

    // Update teks durasi belajar
    if (totalMinutes > 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      timeEl.textContent = `${hours} jam ${mins} menit`;
    } else {
      timeEl.textContent = `${totalMinutes} menit`;
    }

  } catch (err) {
    console.error('Gagal memuat data progres:', err);
    statsEl.textContent = "- / -";
    timeEl.textContent = "0 menit";
  }
}
