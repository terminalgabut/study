export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // Ambil data progres dari tabel tunggal
    const { data: progress, error } = await supabase
      .from('study_progress')
      .select('total_reading_seconds, read_count');

    if (error) throw error;

    // --- LOGIKA PERHITUNGAN ---
    const totalMaterials = progress ? progress.length : 0;
    
    // Menghitung total durasi dari semua baris materi
    const totalSeconds = progress 
      ? progress.reduce((acc, curr) => acc + (curr.total_reading_seconds || 0), 0) 
      : 0;
    
    const totalMinutes = Math.floor(totalSeconds / 60);

    // --- UPDATE UI ---
    // Materi dilihat / Total Baris di Progress
    statsEl.textContent = `${totalMaterials} Materi`;

    // Format waktu agar lebih profesional
    if (totalMinutes >= 60) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      timeEl.textContent = `${h}j ${m}m`;
    } else {
      timeEl.textContent = `${totalMinutes} menit`;
    }

  } catch (err) {
    console.error(err);
    statsEl.textContent = "0";
    timeEl.textContent = "0 menit";
  }
}
