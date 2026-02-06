import { supabase } from '../services/supabase.js';

export async function initNotesList() {
  const container = document.getElementById('notesList');
  if (!container) return;

  try {
    // 1. Ambil data dari riwayat dan joinkan dengan tabel materi
    const { data, error } = await supabase
      .from('riwayat')
      .select(`
        material_slug, 
        content, 
        updated_at,
        materi ( category )
      `)
      // Pastikan hanya mengambil yang isi content-nya tidak kosong
      .not('content', 'is', null)
      .not('content', 'eq', '');

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="home-card" style="grid-column: 1/-1; text-align: center;">
          <p>Belum ada catatan. Yuk, mulai mencatat saat belajar!</p>
        </div>`;
      return;
    }

    // 2. Render kartu catatan dengan UI yang konsisten (home-card)
    container.innerHTML = data.map(note => {
      // Ambil judul dari kolom category di tabel materi
      const title = note.materi?.category || 'Materi Tanpa Judul';
      const preview = note.content ? note.content.substring(0, 80) + '...' : '';
      const date = new Date(note.updated_at).toLocaleDateString('id-ID');

      return `
        <div class="home-card note-card" onclick="location.hash='#catatan-detail/${note.material_slug}'" style="cursor: pointer;">
          <h3>${title}</h3>
          <p class="desc" style="font-size: 0.9rem; margin: 10px 0;">${preview}</p>
          <small style="color: #888;">📅 ${date}</small>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Gagal memuat daftar catatan:', err);
    container.innerHTML = '<p>Terjadi kesalahan saat memuat data.</p>';
  }
}
