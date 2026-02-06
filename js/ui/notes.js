import { supabase } from '../services/supabase.js';

export async function initNotesList() {
  const container = document.getElementById('notesList');
  if (!container) return;

  try {
    // Ambil materi yang kolom catatannya tidak kosong
    const { data, error } = await supabase
      .from('riwayat')
      .select('material_slug, material_title, catatan, last_accessed')
      .not('catatan', 'is', null)
      .not('catatan', 'eq', '');

    if (error) throw error;

    if (data.length === 0) {
      container.innerHTML = `<div class="empty-state">Belum ada catatan. Yuk, mulai mencatat saat belajar!</div>`;
      return;
    }

    // Render kartu catatan
    container.innerHTML = data.map(note => `
      <div class="note-card" onclick="location.hash='#catatan-detail/${note.material_slug}'">
        <h3>${note.material_title}</h3>
        <p class="note-preview">${note.catatan.substring(0, 80)}...</p>
        <span class="note-date">📅 ${new Date(note.last_accessed).toLocaleDateString('id-ID')}</span>
      </div>
    `).join('');

  } catch (err) {
    console.error('Gagal memuat daftar catatan:', err);
    container.innerHTML = '<p>Gagal memuat catatan.</p>';
  }
}
