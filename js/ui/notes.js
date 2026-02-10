import { supabase } from '../services/supabase.js';

export async function initNotesList() {
  const container = document.getElementById('notesList');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat catatan...</p></div>';

  try {
    // LANGKAH 1 & 2 (GABUNG): Ambil catatan beserta info materinya sekaligus
    // Syntax 'materials(title)' melakukan join otomatis berdasarkan foreign key/slug
    const { data: notes, error } = await supabase
      .from('catatan')
      .select(`
        material_slug, 
        content, 
        updated_at,
        materials:material_slug (title, category)
      `)
      .not('content', 'eq', '')
      .order('updated_at', { ascending: false }); // Yang terbaru di atas

    if (error) throw error;

    if (!notes || notes.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada catatan.</p></div>';
      return;
    }

    // LANGKAH 3: Render
    container.innerHTML = notes.map(note => {
      // Ambil title dari join, atau gunakan slug sebagai fallback
      const title = note.materials?.title || note.materials?.category || note.material_slug;
      const date = new Date(note.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      // Bersihkan cuplikan konten dari baris baru agar tidak merusak layout
      const preview = note.content.replace(/\n/g, ' ').substring(0, 80);

      return `
        <div class="home-card note-card" 
             onclick="location.hash='#catatan-detail/${note.material_slug}'" 
             style="cursor: pointer; transition: transform 0.2s;">
          <h3 style="color: var(--accent); margin-bottom: 5px;">${title}</h3>
          <p class="desc" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
            ${preview}${note.content.length > 80 ? '...' : ''}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; border-top: 1px solid var(--border); padding-top: 10px;">
            <small style="color: #888;">🗓️ ${date}</small>
            <span style="color: var(--primary); font-size: 0.8rem; font-weight: bold;">Baca →</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error load notes:', err);
    container.innerHTML = '<div class="home-card"><p>Gagal memuat catatan.</p></div>';
  }
}
