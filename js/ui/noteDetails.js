import { supabase } from '../services/supabase.js';

export async function initNoteDetail(slug) {
  const displayArea = document.getElementById('noteDisplay');
  const editorArea = document.getElementById('noteEditor');
  const actionBtn = document.getElementById('actionNoteBtn');
  const titleEl = document.getElementById('noteTitle');

  if (!displayArea || !actionBtn) return;

  try {
    // 1. Ambil data secara paralel dari tabel 'materials' (versi terbaru)
    const [materiRes, catatanRes] = await Promise.all([
      supabase.from('materials').select('title').eq('slug', slug).single(),
      supabase.from('catatan').select('content, bab_title').eq('material_slug', slug).maybeSingle()
    ]);

    // 2. Gunakan 'title' dari materials jika catatan belum ada
    const title = materiRes.data?.title || catatanRes.data?.bab_title || 'Detail Catatan';
    const content = catatanRes.data?.content || '';

    titleEl.innerText = title;
    displayArea.innerText = content || 'Belum ada catatan untuk materi ini.';
    editorArea.value = content;

    actionBtn.onclick = async () => {
      const isReading = editorArea.style.display === 'none';

      if (isReading) {
        displayArea.style.display = 'none';
        editorArea.style.display = 'block';
        editorArea.focus();
        
        actionBtn.classList.add('saving-mode');
        actionBtn.innerHTML = `<span>💾</span> <span>Simpan Catatan</span>`;
      } else {
        const newContent = editorArea.value.trim();
        actionBtn.disabled = true;
        actionBtn.innerText = 'Menyimpan...';

        // 3. Proses UPSERT (Simpan atau Update)
        const { error } = await supabase
          .from('catatan')
          .upsert({ 
            material_slug: slug, 
            bab_title: title, // Simpan judul bab agar daftar catatan lebih ringan dimuat
            content: newContent,
            updated_at: new Date().toISOString()
          }, { onConflict: 'material_slug' });

        if (!error) {
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
