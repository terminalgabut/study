import { supabase } from '../services/supabase.js';

export async function initLastRead() {
  // Target elemen di dalam kartu "Lanjutkan Belajar" di Home
  const highlightEl = document.querySelector('.home-card .highlight');
  const continueBtn = document.querySelector('.home-card .primary-btn');
  const lastUpdateEl = document.querySelector('.home-card .small');

  if (!highlightEl || !continueBtn) return;

  try {
    // 1. Ambil 1 data terakhir dari tabel riwayat
    const { data: history, error: e1 } = await supabase
      .from('riwayat')
      .select('material_slug, last_accessed')
      .order('last_accessed', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (e1) throw e1;

    // Jika belum ada riwayat, ubah tampilan kartu menjadi default/kosong
    if (!history) {
      highlightEl.textContent = "Belum ada materi";
      continueBtn.disabled = true;
      continueBtn.style.opacity = "0.5";
      return;
    }

    // 2. Ambil judul lengkap dari tabel materi berdasarkan slug riwayat tersebut
    const { data: material, error: e2 } = await supabase
      .from('materi')
      .select('category')
      .eq('slug', history.material_slug)
      .single();

    if (e2) throw e2;

    // 3. Update UI dengan data asli dari Database
    highlightEl.textContent = material.category;
    
    if (lastUpdateEl) {
      lastUpdateEl.textContent = "Terakhir dibaca";
    }

    // Set aksi tombol untuk redirect ke materi tersebut
    continueBtn.onclick = () => {
      window.location.hash = `#/materi/redirect/${history.material_slug}`;
    };

  } catch (err) {
    console.error('Gagal memuat Last Read:', err);
    highlightEl.textContent = "Gagal memuat data";
  }
}
