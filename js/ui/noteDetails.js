import { supabase } from '../services/supabase.js';

/**
 * LOGIKA DETAIL CATATAN
 * Fokus: Toggle Baca/Edit & Upsert ke Supabase
 */
export async function initNoteDetail(slug) {
  const displayArea = document.getElementById('noteDisplay');
  const editorArea = document.getElementById('noteEditor');
  const actionBtn = document.getElementById('actionNoteBtn');
  const titleEl = document.getElementById('noteTitle');

  if (!displayArea || !actionBtn) return;

  try {
    // 1. Ambil data secara paralel (lebih cepat)
    const [materiRes, catatanRes] = await Promise.all([
      supabase.from('materi').select('category').eq('slug', slug).single(),
      supabase.from('catatan').select('content').eq('material_slug', slug).maybeSingle()
    ]);

    // 2. Tampilkan Judul dan Konten
    const title = materiRes.data?.category || 'Detail Catatan';
    const content = catatanRes.data?.content || '';

    titleEl.innerText = title;
    displayArea.innerText = content || 'Belum ada catatan untuk materi ini.';
    editorArea.value = content;

    // 3. Logika Satu Tombol (Toggle)
    actionBtn.onclick = async () => {
      const isReading = editorArea.style.display === 'none';

      if (isReading) {
        // PINDAH KE MODE EDIT
        displayArea.style.display = 'none';
        editorArea.style.display = 'block';
        editorArea.focus();
        
        actionBtn.classList.add('saving-mode');
        actionBtn.innerHTML = `<span>💾</span> <span>Simpan Catatan</span>`;
      } else {
        // PROSES SIMPAN KE DATABASE
        const newContent = editorArea.value.trim();
        actionBtn.disabled = true;
        actionBtn.innerText = 'Menyimpan...';

        const { error } = await supabase
          .from('catatan')
          .upsert({ 
            material_slug: slug, 
            content: newContent,
            updated_at: new Date().toISOString()
          }, { onConflict: 'material_slug' });

        if (!error) {
          // KEMBALI KE MODE BACA
          displayArea.innerText = newContent || 'Belum ada catatan.';
          displayArea.style.display = 'block';
          editorArea.style.display = 'none';
          
          actionBtn.disabled = false;
          actionBtn.classList.remove('saving-mode');
          actionBtn.innerHTML = `<span>✏️</span> <span>Edit Catatan</span>`;
        } else {
          alert('Gagal menyimpan: ' + error.message);
          actionBtn.disabled = false;
          actionBtn.innerText = 'Simpan Catatan';
        }
      }
    };

  } catch (err) {
    console.error('Error initNoteDetail:', err);
    displayArea.innerText = 'Gagal memuat catatan.';
  }
}
