// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

/**
 * LOGIKA 1: Menangani Tombol Bookmark di Halaman Materi
 */
export async function handleBookmarkToggle(slug, categoryFromUrl) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  try {
    // Cek apakah materi ini sudah pernah di-bookmark sebelumnya
    const { data: existing } = await supabase
      .from('bookmark')
      .select('material_slug')
      .eq('material_slug', slug)
      .maybeSingle();

    if (existing) btn.classList.add('active');

    // Event Klik
    btn.onclick = async () => {
      const isActive = btn.classList.contains('active');

      if (isActive) {
        // PROSES HAPUS
        const { error } = await supabase
          .from('bookmark')
          .delete()
          .eq('material_slug', slug);
        
        if (!error) btn.classList.remove('active');
      } else {
        // PROSES SIMPAN
        // 🔑 MENGAMBIL JUDUL LENGKAP dari elemen #learningTitle yang sudah diisi oleh initKontenBab
        const titleEl = document.getElementById('learningTitle');
        const fullCategoryName = titleEl ? titleEl.textContent : categoryFromUrl;

        const { error } = await supabase
          .from('bookmark')
          .insert([{ 
            material_slug: slug, 
            category: fullCategoryName // Menyimpan judul lengkap (ex: "Bahasa Indonesia B1")
          }]);
        
        if (!error) {
          btn.classList.add('active');
        } else {
          console.error("Gagal simpan:", error.message);
        }
      }
    };
  } catch (err) {
    console.error('Bookmark error:', err);
  }
}

/**
 * LOGIKA 2: Inisialisasi Halaman Daftar Bookmark (#/bookmark)
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat perpustakaan...</p></div>';

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

    // Render Grid Kartu
    container.innerHTML = bookmarks.map(b => `
      <div class="home-card">
        <h3>📌 Tersimpan</h3>
        <p class="small">Judul Materi</p>
        <p class="highlight">${b.category}</p> 
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button class="primary-btn" 
                  onclick="window.location.hash='#/materi/redirect/${b.material_slug}'" 
                  style="flex:2;">
            Lanjutkan
          </button>
          <button class="secondary-btn" 
        onclick="deleteBookmark('${b.material_slug}')" 
        title="Hapus bookmark"
        style="flex:1; background:rgba(255,255,255,0.05); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; padding: 8px; border-radius: 8px;">
  <svg xmlns="http://www.w3.org/2000/svg" 
       width="18" height="18" 
       viewBox="0 0 24 24" 
       fill="none" 
       stroke="currentColor" 
       stroke-width="2" 
       stroke-linecap="round" 
       stroke-linejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Gagal memuat daftar bookmark:', err);
  }
}

/**
 * LOGIKA 3: Fungsi Hapus Global (Hapus langsung dari list)
 */
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus materi ini dari daftar simpanan?')) {
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('material_slug', slug);
    
    if (!error) {
      initBookmarkPage(); // Refresh tampilan list
    }
  }
};
