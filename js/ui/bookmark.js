// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

/**
 * LOGIKA 1: Menangani Tombol Simpan (Bookmark) di Halaman Materi
 * Fungsi ini mencari elemen #bookmarkBtn dan mengelola interaksi kliknya.
 */
export async function handleBookmarkToggle(slug, category) {
  // Menghubungkan ID dari HTML ke variabel JavaScript
  const btn = document.getElementById('bookmarkBtn');
  
  // Jika tombol tidak ditemukan di halaman (misal bukan di halaman materi), hentikan proses
  if (!btn) return;

  try {
    // 1. Cek status awal: apakah materi ini sudah tersimpan di database?
    const { data: existing, error: fetchError } = await supabase
      .from('bookmark')
      .select('material_slug')
      .eq('material_slug', slug)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 2. Jika data ditemukan, tambahkan class 'active' agar ikon berubah warna (emas/aksen)
    if (existing) {
      btn.classList.add('active');
    }

    // 3. Pasang logika klik pada tombol
    btn.onclick = async () => {
      const isActive = btn.classList.contains('active');

      if (isActive) {
        // JIKA AKTIF: Maka perintahnya adalah MENGHAPUS
        const { error: deleteError } = await supabase
          .from('bookmark')
          .delete()
          .eq('material_slug', slug);
        
        if (!deleteError) {
          btn.classList.remove('active');
          console.log("Bookmark dihapus");
        }
      } else {
        // JIKA TIDAK AKTIF: Maka perintahnya adalah MENYIMPAN
        const { error: insertError } = await supabase
          .from('bookmark')
          .insert([{ 
            material_slug: slug, 
            category: category // Category digunakan sebagai label Judul Materi
          }]);
        
        if (!insertError) {
          btn.classList.add('active');
          console.log("Bookmark disimpan");
        }
      }
    };
  } catch (err) {
    console.error('Bookmark toggle error:', err.message);
  }
}

/**
 * LOGIKA 2: Menginisialisasi Halaman Daftar Bookmark (#/bookmark)
 * Mengambil semua data dari tabel 'bookmark' dan merendernya dalam bentuk kartu.
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  // Tampilkan loading state
  container.innerHTML = '<div class="home-card"><p>Membuka perpustakaan pribadi...</p></div>';

  try {
    // Ambil data dari tabel 'bookmark'
    const { data: bookmarks, error } = await supabase
      .from('bookmark')
      .select('material_slug, category');

    if (error) throw error;

    // Jika belum ada data yang disimpan
    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = `
        <div class="home-card">
          <p class="small">Belum ada materi yang disimpan.</p>
          <button class="primary-btn" onclick="window.location.hash='#/materi'" style="margin-top:12px;">
            Jelajahi Materi
          </button>
        </div>`;
      return;
    }

    // Render Grid Kartu (Konsisten dengan gaya homeView)
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
                  style="flex:1; background:rgba(255,255,255,0.05); border:none; cursor:pointer; color:var(--text-muted);">
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
 * LOGIKA 3: Fungsi Hapus Global
 * Memungkinkan user menghapus item langsung dari halaman daftar tanpa masuk ke materi.
 */
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus materi ini dari daftar simpanan?')) {
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('material_slug', slug);
    
    if (!error) {
      initBookmarkPage(); // Muat ulang grid agar kartu menghilang secara otomatis
    } else {
      alert("Gagal menghapus: " + error.message);
    }
  }
};
