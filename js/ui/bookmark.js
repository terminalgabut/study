// js/ui/bookmark.js
// Pastikan path ini benar sesuai struktur folder Anda (naik satu level ke js/ lalu masuk ke services/)
import { supabase } from '../services/supabase.js'; 

/**
 * Logika Toggle Bookmark untuk halaman Konten Materi
 */
export async function handleBookmarkToggle(slug, category) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // Cek status bookmark saat halaman dimuat
  const { data: existing } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  // Jika sudah ada, aktifkan indikator visual (misal class active)
  if (existing) btn.classList.add('active');

  btn.onclick = async () => {
    const isActive = btn.classList.contains('active');

    if (isActive) {
      // Hapus jika sudah aktif
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('material_slug', slug);
      
      if (!error) btn.classList.remove('active');
    } else {
      // Tambah jika belum aktif
      const { error } = await supabase
        .from('bookmark')
        .insert([{ material_slug: slug, category: category }]);
      
      if (!error) btn.classList.add('active');
    }
  };
}

/**
 * Menampilkan daftar Bookmark di halaman BookmarkView
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat daftar simpanan...</p></div>';

  try {
    const { data: bookmarks, error } = await supabase
      .from('bookmark')
      .select('material_slug, category');

    if (error) throw error;

    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = `
        <div class="home-card">
          <p class="small">Belum ada materi yang disimpan.</p>
        </div>`;
      return;
    }

    container.innerHTML = bookmarks.map(b => `
      <div class="home-card">
        <h3>📌 Tersimpan</h3>
        <p class="small">Judul Materi</p>
        <p class="highlight">${b.category}</p> 
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button class="primary-btn" 
                  onclick="window.location.hash='#/materi/${b.material_slug}'" 
                  style="flex:2;">
            Lanjutkan
          </button>
          <button class="secondary-btn" 
                  onclick="deleteBookmark('${b.material_slug}')" 
                  style="flex:1; border:none; cursor:pointer; background:rgba(255,255,255,0.1); color:inherit;">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Gagal memuat bookmark:', err);
    container.innerHTML = `<div class="home-card"><p>Error: ${err.message}</p></div>`;
  }
}

// Global function untuk hapus cepat dari grid
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus materi ini?')) {
    const { error } = await supabase.from('bookmark').delete().eq('material_slug', slug);
    if (!error) initBookmarkPage();
  }
};
