import { supabase } from '../services/supabase.js';

export async function initNotesList() {
  const container = document.getElementById('notesList');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat catatan...</p></div>';

  try {
    // LANGKAH 1: Ambil slug dan content dari tabel 'catatan'
    const { data: noteRows, error: e1 } = await supabase
      .from('catatan')
      .select('material_slug, content, updated_at')
      .not('content', 'is', null)
      .not('content', 'eq', '');

    if (e1 || !noteRows || noteRows.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada catatan.</p></div>';
      return;
    }

    // LANGKAH 2: Ambil detail category dari tabel 'materi' berdasarkan slug yang ada
    const slugs = noteRows.map(n => n.material_slug);
    const { data: materials, error: e2 } = await supabase
      .from('materi')
      .select('slug, category')
      .in('slug', slugs);

    if (e2) throw e2;

    // LANGKAH 3: Render daftar dengan mencocokkan content (dari catatan) dan category (dari materi)
    container.innerHTML = noteRows.map(note => {
      // Cari materi yang slug-nya cocok dengan catatan ini
      const materialDetail = materials.find(m => m.slug === note.material_slug);
      const title = materialDetail ? materialDetail.category : 'Materi Tanpa Judul';
      const date = new Date(note.updated_at).toLocaleDateString('id-ID');
      
      return `
        <div class="home-card note-card" onclick="location.hash='#catatan-detail/${note.material_slug}'" style="cursor: pointer;">
          <h3>${title}</h3>
          <p class="desc" style="font-size: 0.9rem; margin: 10px 0;">
            ${note.content.substring(0, 80)}...
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <small style="color: #888;">📅 ${date}</small>
            <span style="color: var(--primary); font-size: 0.8rem; font-weight: bold;">Lihat Detail →</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error load notes:', err);
    container.innerHTML = '<div class="home-card"><p>Gagal memuat catatan.</p></div>';
  }
}
