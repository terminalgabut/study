import { supabase } from '../services/supabase.js';

// Variabel di luar fungsi agar bisa diakses oleh saveProgress saat event listener dipicu
let startTime = null;
let currentSlug = null;

export async function initKontenBab(category, slug) {
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  if (!titleEl || !contentEl) return;

  // 1. Ambil data materi
  const { data, error } = await supabase
    .from('materi')
    .select('content, category')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    contentEl.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

  // 2. Catat/Update riwayat akses (tanpa durasi dulu)
  const { error: historyError } = await supabase
    .from('riwayat')
    .upsert(
      { material_slug: slug, last_accessed: new Date().toISOString() }, 
      { onConflict: 'material_slug' }
    );

  if (historyError) console.error('Gagal mencatat riwayat:', historyError.message);

  // 3. Inisialisasi Timer
  startTime = Date.now();
  currentSlug = slug;

  // 4. Render konten ke UI
  titleEl.textContent = data.category;
  contentEl.innerHTML = data.content;

  // 5. Pasang Event Listeners (Hanya sekali)
  // Bersihkan listener lama jika ada untuk menghindari penumpukan
  window.removeEventListener('beforeunload', saveProgress);
  
  window.addEventListener('hashchange', saveProgress, { once: true });
  window.addEventListener('beforeunload', saveProgress);
}

// Ambil catatan lama jika ada
const { data: existingNote } = await supabase
  .from('catatan')
  .select('content')
  .eq('material_slug', slug)
  .single();

if (existingNote) {
  document.getElementById('noteArea').value = existingNote.content;
}

// Fungsi untuk menyimpan durasi ke Supabase menggunakan RPC
async function saveProgress() {
    if (!startTime || !currentSlug) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // konversi ke detik

    // Jangan catat jika hanya buka sebentar (di bawah 5 detik)
    if (duration >= 5) {
        const { error } = await supabase.rpc('increment_duration', { 
            slug: currentSlug, 
            seconds: duration 
        });
        
        if (error) console.error('Gagal update durasi:', error.message);
    }

    // Reset variabel setelah data dikirim
    startTime = null;
    currentSlug = null;
}

async function handleSaveNote(slug) {
  const noteArea = document.getElementById('noteArea');
  const statusEl = document.getElementById('saveStatus');
  const noteContent = noteArea.value.trim();

  if (!noteContent) return;

  statusEl.textContent = "Menyimpan...";

  const { error } = await supabase
    .from('catatan')
    .upsert({ 
      material_slug: slug, 
      content: noteContent,
      updated_at: new Date().toISOString() 
    }, { onConflict: 'material_slug' });

  if (error) {
    statusEl.textContent = "❌ Gagal menyimpan";
    console.error(error);
  } else {
    statusEl.textContent = "✅ Tersimpan!";
    // Hilangkan pesan sukses setelah 3 detik
    setTimeout(() => { statusEl.textContent = ""; }, 3000);
  }
}
