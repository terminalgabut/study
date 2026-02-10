// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

/**
 * LOGIKA 1: Tombol Bookmark di Halaman Materi
 */
export async function handleBookmarkToggle(slug) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // 1. Cek status awal: Apakah materi ini sudah di-bookmark?
  try {
    const { data: existing } = await supabase
      .from('bookmark')
      .select('material_slug')
      .eq('material_slug', slug)
      .maybeSingle();

    if (existing) btn.classList.add('active');
  } catch (err) {
    console.error("Gagal cek status bookmark:", err);
  }

  btn.onclick = async () => {
    if (btn.disabled) return; // Cegah spam klik
    btn.disabled = true;

    const isActive = btn.classList.contains('active');

    try {
      if (isActive) {
        // JIKA AKTIF -> HAPUS
        const { error } = await supabase
          .from('bookmark')
          .delete() // Method delete
          .eq('material_slug', slug); // Diikuti filter

        if (error) throw error;
        btn.classList.remove('active');
        console.log("Bookmark dihapus");
      } else {
        // JIKA TIDAK AKTIF -> TAMBAH (Gunakan insert, bukan delete!)
        const { error } = await supabase
          .from('bookmark')
          .insert([{ material_slug: slug }]);

        if (error) throw error;
        btn.classList.add('active');
        console.log("Bookmark ditambahkan");
      }
    } catch (err) {
      console.error("Kesalahan Bookmark:", err.message);
      alert("Gagal memperbarui bookmark: " + err.message);
    } finally {
      btn.disabled = false;
    }
  };
}

/**
 * LOGIKA 2: Render Halaman Daftar Bookmark
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat bookmark...</p></div>';

  try {
    // Ambil data bookmark sekaligus info materinya (JOIN)
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

    container.innerHTML = bookmarks.map(b => {
      const m = b.materials;
      const title = m?.title || 'Materi Tanpa Judul';
      const cat = m?.category || 'Umum';

      return `
      <div class="home-card bookmark-card" style="margin-bottom: 15px;">
        <small style="color: var(--accent); font-weight: bold;">📌 ${cat.toUpperCase()}</small>
        <h3 style="margin: 5px 0 15px 0;">${title}</h3>
        
        <div style="display:flex; gap:10px;">
          <button class="primary-btn" 
                  onclick="location.hash='#materi/${cat}/${m?.slug}'" 
                  style="flex:3;">
            Buka Materi
          </button>
          
          <button class="delete-btn" 
                  onclick="deleteBookmark('${b.material_slug}')" 
                  style="flex:1; background:rgba(255,77,77,0.1); border:1px solid rgba(255,77,77,0.2); border-radius: 8px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
          </button>
        </div>
      </div>`;
    }).join('');

  } catch (err) {
    console.error('Error load bookmark:', err);
    container.innerHTML = '<div class="home-card"><p>Gagal memuat data.</p></div>';
  }
}

/**
 * LOGIKA 3: Fungsi Global Hapus (untuk tombol sampah)
 */
// js/ui/bookmark.js

// Pastikan ini di luar agar bisa diakses oleh fungsi window

window.deleteBookmark = async (slug) => {
  // Validasi objek supabase sebelum eksekusi
  if (!supabase || !supabase.from) {
    console.error("Supabase client is not initialized properly");
    return;
  }

  if (!confirm('Hapus dari bookmark?')) return;

  try {
    // Gunakan sintaksis yang lebih eksplisit untuk menghindari TypeError pada chaining
    const table = supabase.from('bookmark');
    
    // Pastikan table.delete ada sebelum dipanggil
    if (typeof table.delete !== 'function') {
      throw new Error("Method .delete() tidak ditemukan pada provider Supabase");
    }

    const { error } = await table
      .delete()
      .eq('material_slug', slug);

    if (error) throw error;
    
    // Refresh UI
    const container = document.getElementById('bookmarkListContainer');
    if (container) {
       // Panggil init secara asinkron
       import('./bookmark.js').then(m => m.initBookmarkPage());
    }

  } catch (err) {
    window.__DEBUG__.error('Fatal Delete Error:', err);
    alert("Gagal menghapus: " + err.message);
  }
};
