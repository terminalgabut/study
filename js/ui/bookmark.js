// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

export async function handleBookmarkToggle(slug) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // Cek status bookmark saat pertama kali dimuat
  const { data: existing } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  if (existing) btn.classList.add('active');

  btn.onclick = async () => {
    // Hindari klik berulang saat proses asinkron berjalan
    if (btn.disabled) return;
    btn.disabled = true;

    const isActive = btn.classList.contains('active');

    try {
      if (isActive) {
        // URUTAN BENAR: from -> delete -> filter
        const { error } = await supabase
          .from('bookmark')
          .delete() 
          .eq('material_slug', slug);

        if (!error) btn.classList.remove('active');
        else throw error;
      } else {
        const { error } = await supabase
          .from('bookmark')
          .insert([{ material_slug: slug }]);
        
        if (!error) btn.classList.add('active');
        else throw error;
      }
    } catch (err) {
      // Pastikan error tertangkap di sini agar tidak memicu unhandled rejection
      window.__DEBUG__.error('Bookmark Toggle Error:', err.message);
    } finally {
      btn.disabled = false;
    }
  };
}

/**
 * LOGIKA 2: Halaman Daftar Bookmark
 * Pakai JOIN agar sekali panggil langsung dapat Judul dan Kategori
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat bookmark...</p></div>';

  try {
    // 1 & 2 GABUNG: Ambil slug dan data materials sekaligus
    const { data: bookmarks, error } = await supabase
      .from('bookmark')
      .select(`
        material_slug,
        materials (slug, title, category)
      `);

    if (error) throw error;

    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada bookmark.</p></div>';
      return;
    }

    // 3. Render daftar
    container.innerHTML = bookmarks.map(b => {
      const m = b.materials;
      // Gunakan title untuk tampilan utama, category untuk sub-info
      const displayTitle = m?.title || 'Materi Tanpa Judul';
      const displayCat = m?.category || 'Umum';

      return `
      <div class="home-card bookmark-card" style="margin-bottom: 15px;">
        <small style="color: var(--accent); font-weight: bold; text-transform: uppercase;">📌 ${displayCat}</small>
        <h3 style="margin: 5px 0 15px 0;">${displayTitle}</h3>
        
        <div style="display:flex; gap:10px;">
          <button class="primary-btn" 
                  onclick="location.hash='#materi/${displayCat}/${m?.slug}'" 
                  style="flex:3; padding: 10px;">
            Lanjutkan Baca
          </button>
          
          <button class="delete-btn" 
                  onclick="deleteBookmark('${b.material_slug}')" 
                  style="flex:1; background:rgba(255,77,77,0.1); border:1px solid rgba(255,77,77,0.2); border-radius: 8px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
          </button>
        </div>
      </div>
    `}).join('');

  } catch (err) {
    console.error('Error load bookmark:', err);
    container.innerHTML = '<div class="home-card"><p>Gagal memuat bookmark.</p></div>';
  }
}

// Global function untuk delete (biar bisa dipanggil dari HTML string)
// Gunakan async agar await bisa bekerja
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus dari bookmark?')) {
    try {
      // 1. Pastikan urutan: from -> delete -> eq
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('material_slug', slug);

      if (error) {
        console.error("Gagal menghapus:", error.message);
        alert("Gagal menghapus bookmark");
        return;
      }

      // 2. Jika sukses, panggil ulang initBookmarkPage untuk refresh UI
      // Karena initBookmarkPage adalah export function di file ini, 
      // pastikan fungsi ini bisa diakses atau panggil secara lokal.
      initBookmarkPage(); 

    } catch (err) {
      console.error("Fatal Error:", err);
    }
  }
};
