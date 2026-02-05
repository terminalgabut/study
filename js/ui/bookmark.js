// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

/**
 * FUNGSI 1: handleBookmarkToggle
 * Mengurus tombol simpan (ikon bintang/bendera) di halaman materi.
 * Fungsi ini mengecek apakah materi sudah disimpan, lalu menambah atau menghapusnya.
 */
export async function handleBookmarkToggle(slug, category) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // 1. Cek status awal: apakah slug ini sudah ada di tabel bookmark?
  const { data: existing } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  // Jika sudah ada, tambahkan class 'active' agar ikon berwarna 
  if (existing) btn.classList.add('active');

  // 2. Logika Klik: Jika diklik, jalankan Toggle (Tambah/Hapus)
  btn.onclick = async () => {
    const isActive = btn.classList.contains('active');

    if (isActive) {
      // Jika sudah active, maka klik berikutnya adalah MENGHAPUS
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('material_slug', slug);
      
      if (!error) btn.classList.remove('active');
    } else {
      // Jika belum active, maka klik berikutnya adalah MENYIMPAN
      // Category di sini kita gunakan sebagai Judul Materi
      const { error } = await supabase
        .from('bookmark')
        .insert([{ material_slug: slug, category: category }]);
      
      if (!error) btn.classList.add('active');
    }
  };
}

/**
 * FUNGSI 2: initBookmarkPage
 * Mengurus tampilan halaman daftar bookmark (#/bookmark).
 * Merender grid kartu materi yang sudah disimpan oleh user.
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
          <button class="primary-btn" onclick="window.location.hash='#/'" style="margin-top:12px;">
            Jelajahi Materi
          </button>
        </div>`;
      return;
    }

    // Render kartu dengan gaya homeView agar konsisten [cite: 22, 23]
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
 * FUNGSI 3: deleteBookmark (Global)
 * Memungkinkan penghapusan cepat langsung dari halaman daftar bookmark.
 */
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus dari daftar simpanan?')) {
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('material_slug', slug);
    
    if (!error) {
      initBookmarkPage(); // Refresh tampilan grid
    }
  }
};
