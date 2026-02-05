import { supabase } from '../services/supabase.js';

/**
 * Menginisialisasi halaman Bookmark
 * Mengambil data dari tabel 'bookmark' dan merender ke 'bookmarkListContainer'
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  // State loading agar user tahu proses sedang berjalan
  container.innerHTML = '<div class="home-card"><p>Menghubungkan ke perpustakaan...</p></div>';

  try {
    // 1. Ambil data (kolom category berisi Judul Materi) [cite: 10, 17]
    const { data: bookmarks, error } = await supabase
      .from('bookmark')
      .select('material_slug, category');

    if (error) throw error;

    // 2. Jika belum ada materi yang disimpan [cite: 12]
    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = `
        <div class="home-card">
          <p class="small">Belum ada materi yang disimpan.</p>
          <button class="primary-btn" onclick="window.location.hash='#/'" style="margin-top:12px;">
            Jelajahi Materi
          </button>
        </div>`;
      return;
    }

    // 3. Render Grid Kartu (Konsisten dengan homeView) [cite: 23, 26]
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
                  style="flex:1; background:rgba(255,255,255,0.05); color:var(--text-muted); border:none; cursor:pointer;">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Gagal memuat bookmark:', err);
    container.innerHTML = `<div class="home-card"><p style="color:red;">Error: ${err.message}</p></div>`;
  }
}

/**
 * Fungsi untuk menghapus bookmark langsung dari daftar halaman ini
 */
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus dari daftar simpanan?')) {
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('material_slug', slug);
    
    if (!error) {
      initBookmarkPage(); // Muat ulang daftar agar kartu hilang dari grid
    }
  }
};
