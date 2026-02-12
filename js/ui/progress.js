export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // 1. Ambil JUMLAH TOTAL materi yang ada di database
    // Menggunakan count: 'exact' agar Supabase mengembalikan angka total baris
    const { count: totalTersedia, error: e1 } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });

    // 2. Ambil data materi yang sudah dipelajari user
    const { data: progress, error: e2 } = await supabase
      .from('study_progress')
      .select('total_reading_seconds');

    if (e1 || e2) throw (e1 || e2);

    // --- LOGIKA PERHITUNGAN ---
    const materiDilihat = progress ? progress.length : 0;
    const totalMateri = totalTersedia || 0;

    const totalSeconds = progress 
      ? progress.reduce((acc, curr) => acc + (curr.total_reading_seconds || 0), 0) 
      : 0;
    
    const totalMinutes = Math.floor(totalSeconds / 60);

    // --- UPDATE UI ---
    // Sekarang akan tampil seperti "3 / 10" (dinamis)
    statsEl.textContent = `${materiDilihat} / ${totalMateri}`;

    // Format Waktu Belajar
    if (totalMinutes >= 60) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      timeEl.textContent = `${h}j ${m}m`;
    } else {
      timeEl.textContent = `${totalMinutes} menit`;
    }

  } catch (err) {
    console.error('Gagal memuat progres:', err);
    statsEl.textContent = "0 / 0";
    timeEl.textContent = "0 menit";
  }
}
