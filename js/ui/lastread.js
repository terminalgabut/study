import { supabase } from '../services/supabase.js';

export async function initLastRead() {
  // Ambil elemen berdasarkan ID spesifik yang baru kita buat
  const titleEl = document.getElementById('lastReadTitle');
  const btnEl = document.getElementById('lastReadBtn');
  const dateEl = document.getElementById('lastReadDate');

  if (!titleEl || !btnEl) return;

  try {
    // 1. Ambil data riwayat terakhir
    const { data: history, error: e1 } = await supabase
      .from('riwayat')
      .select('material_slug, last_accessed')
      .order('last_accessed', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (e1) throw e1;

    // Jika belum ada riwayat (user baru)
    if (!history) {
      titleEl.textContent = "Belum ada riwayat";
      btnEl.style.display = "none";
      return;
    }

    // 2. Ambil judul lengkap dari tabel materi [cite: 14]
    const { data: material, error: e2 } = await supabase
      .from('materi')
      .select('category')
      .eq('slug', history.material_slug)
      .single();

    if (e2) throw e2;

    // 3. Update UI secara otomatis
    titleEl.textContent = material.category; // Mengisi judul utuh
    
    // Opsional: Ubah teks "Terakhir dibuka" menjadi tanggal asli
    if (dateEl) {
      const date = new Date(history.last_accessed).toLocaleDateString('id-ID');
      dateEl.textContent = `Terakhir dibuka: ${date}`;
    }

    // Ubah fungsi klik tombol
    btnEl.onclick = () => {
      window.location.hash = `#/materi/redirect/${history.material_slug}`;
    };

  } catch (err) {
    console.error('Error initLastRead:', err);
    titleEl.textContent = "Gagal memuat riwayat";
  }
}
