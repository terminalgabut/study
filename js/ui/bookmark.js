// js/ui/bookmark.js
import { supabase } from '../services/supabase.js';

/**
 * LOGIKA 1: Tombol Bookmark (Materi Page)
 * Kita simpan slug-nya saja, judul diambil saat load halaman bookmark.
 */
export async function handleBookmarkToggle(slug) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // Cek status awal
  const { data: existing } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  if (existing) btn.classList.add('active');

  btn.onclick = async () => {
    const isActive = btn.classList.contains('active');

    if (isActive) {
      const { error } = await supabase.from('bookmark').delete().eq('material_slug', slug);
      if (!error) btn.classList.remove('active');
    } else {
      // Kita hanya simpan slug-nya, seperti pada baris [cite: 10]
      const { error } = await supabase
        .from('bookmark')
        .insert([{ material_slug: slug }]);
      
      if (!error) btn.classList.add('active');
    }
  };
}

/**
 * LOGIKA 2: Halaman Daftar Bookmark
 * Mengikuti sampel: Ambil slug dulu, lalu cari category-nya di tabel materi 
 */
export async function initBookmarkPage() {
  const container = document.getElementById('bookmarkListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat...</p></div>';

  try {
    // 1. Ambil semua slug dari tabel bookmark [cite: 10]
    const { data: bookmarkRows, error: e1 } = await supabase
      .from('bookmark')
      .select('material_slug');

    if (e1 || !bookmarkRows || bookmarkRows.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada bookmark.</p></div>';
      return;
    }

    // 2. Ambil detail Judul (category) dari tabel 'materi' berdasarkan slug 
    const slugs = bookmarkRows.map(b => b.material_slug);
    const { data: materials, error: e2 } = await supabase
      .from('materi') // Sesuaikan nama tabel materi Anda
      .select('slug, category')
      .in('slug', slugs);

    if (e2) throw e2;

    // 3. Render daftar menggunakan category yang didapat dari tabel materi 
    container.innerHTML = materials.map(m => `
      <div class="home-card">
        <h3>📌 Tersimpan</h3>
        <p class="highlight">${m.category}</p> <div style="display:flex; gap:10px; margin-top:15px;">
          <button class="primary-btn" 
                  onclick="window.location.hash='#/materi/redirect/${m.slug}'" 
                  style="flex:2;">
            Lanjutkan
          </button>
          <button class="secondary-btn" 
                  onclick="deleteBookmark('${m.slug}')" 
                  style="flex:1; background:rgba(255,255,255,0.05); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                  width="18" height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#ff4d4d"  /* GANTI DI SINI */
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round">
                   <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
          </button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error load bookmark:', err);
  }
}

window.deleteBookmark = async (slug) => {
  if (confirm('Hapus?')) {
    const { error } = await supabase.from('bookmark').delete().eq('material_slug', slug);
    if (!error) initBookmarkPage();
  }
};
