export async function initProgress() {
  const statsEl = document.getElementById('progressStats');
  const timeEl = document.getElementById('studyTime');

  if (!statsEl || !timeEl) return;

  try {
    // 1. Ambil semua ID dari tabel materials untuk menghitung total materi
    const { data: allMaterials, error: e1 } = await supabase
      .from('materials')
      .select('id'); // Mengambil kolom id saja agar ringan

    // 2. Ambil data dari study_progress user
    const { data: progress, error: e2 } = await supabase
      .from('study_progress')
      .select('total_reading_seconds');

    if (e1 || e2) throw (e1 || e2);

    // --- LOGIKA PERHITUNGAN ---
    const totalMateri = allMaterials ? allMaterials.length : 0;
    const materiDilihat = progress ? progress.length : 0;

    const totalSeconds = progress 
      ? progress.reduce((acc, curr) => acc + (curr.total_reading_seconds || 0), 0) 
      : 0;
    
    const totalMinutes = Math.floor(totalSeconds / 60);

    // --- UPDATE UI ---
    // Hasilnya akan menjadi: "3 / 10" (berdasarkan jumlah baris ID)
    statsEl.textContent = `${materiDilihat} / ${totalMateri}`;

    // Format waktu
    if (totalMinutes >= 60) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      timeEl.textContent = `${h}j ${m}m`;
    } else {
      timeEl.textContent = `${totalMinutes} menit`;
    }

  } catch (err) {
    console.error('Error initProgress:', err);
    statsEl.textContent = "0 / 0";
    timeEl.textContent = "0 menit";
  }
}
