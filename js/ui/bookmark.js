// js/ui/bookmark.js
import { supabase } from '../services/supabase.js'; 

/**
 * WAJIB ADA: Export fungsi untuk halaman utama bookmark
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

    container.innerHTML = bookmarks.map(b => `
      <div class="home-card">
        <h3>📌 Tersimpan</h3>
        <p class="highlight">${b.category}</p> 
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button class="primary-btn" 
                  onclick="window.location.hash='#/materi/redirect/${b.material_slug}'" 
                  style="flex:2;">
            Lanjutkan
          </button>
          <button class="secondary-btn" 
                  onclick="deleteBookmark('${b.material_slug}')" 
                  style="flex:1; background:rgba(255,255,255,0.05); border:none; cursor:pointer;">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error:', err);
  }
}

/**
 * WAJIB ADA: Export fungsi untuk tombol di halaman materi
 */
export async function handleBookmarkToggle(slug, category) {
  const btn = document.getElementById('bookmarkBtn');
  if (!btn) return;

  // Cek status saat halaman dimuat
  const { data } = await supabase
    .from('bookmark')
    .select('material_slug')
    .eq('material_slug', slug)
    .maybeSingle();

  if (data) btn.classList.add('active');

  btn.onclick = async () => {
    const isActive = btn.classList.contains('active');
    if (isActive) {
      const { error } = await supabase.from('bookmark').delete().eq('material_slug', slug);
      if (!error) btn.classList.remove('active');
    } else {
      const { error } = await supabase.from('bookmark').insert([{ material_slug: slug, category: category }]);
      if (!error) btn.classList.add('active');
    }
  };
}

// Fungsi hapus global
window.deleteBookmark = async (slug) => {
  if (confirm('Hapus bookmark?')) {
    const { error } = await supabase.from('bookmark').delete().eq('material_slug', slug);
    if (!error) initBookmarkPage();
  }
};
