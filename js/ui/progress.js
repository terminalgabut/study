export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // 1. Ambil total baris materi yang ada di sistem
    const { count: totalGlobal, error: e1 } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });

    // 2. Ambil data aktivitas user dari study_progress
    const { data: progress, error: e2 } = await supabase
      .from('study_progress')
      .select('total_reading_seconds');

    if (e1 || e2) throw (e1 || e2);

    // --- LOGIKA PERHITUNGAN ---
    const materiDilihat = progress ? progress.length : 0;
    const totalTersedia = totalGlobal || 0;

    const totalSeconds = progress 
      ? progress.reduce((acc, curr) => acc + (curr.total_reading_seconds || 0), 0) 
      : 0;
    
    const totalMinutes = Math.floor(totalSeconds / 60);

    // --- UPDATE UI ---
    // Hasil: "3 / 10"
    statsEl.textContent = `${materiDilihat} / ${totalTersedia}`;

    // Format Waktu
    if (totalMinutes >= 60) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      timeEl.textContent = `${h}j ${m}m`;
    } else {
      timeEl.textContent = `${totalMinutes} menit`;
    }

  } catch (err) {
    console.error(err);
    statsEl.textContent = "0 / 0";
    timeEl.textContent = "0 menit";
  }
}
