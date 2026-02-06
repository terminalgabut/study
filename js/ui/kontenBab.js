import { supabase } from '../services/supabase.js';

export async function initKontenBab(category, slug) {
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  if (!titleEl || !contentEl) return;

  const { data, error } = await supabase
    .from('materi')
    .select('content, category')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    contentEl.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

const { error: historyError } = await supabase
  .from('riwayat')
  .upsert(
    { material_slug: slug, last_accessed: new Date().toISOString() }, 
    { onConflict: 'material_slug' }
  );

if (historyError) console.error('Gagal mencatat riwayat:', historyError.message);
  
 // Di dalam initKontenBab
let startTime = Date.now();

// Fungsi untuk menyimpan durasi ke Supabase
async function saveProgress() {
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // dalam detik

    if (duration < 5) return; // Jangan catat jika kurang dari 5 detik (mencegah spam)

    // Gunakan increment di database agar durasi terus bertambah setiap kali dibaca
    const { error } = await supabase.rpc('increment_duration', { 
        slug: slug, 
        seconds: duration 
    });
}

// Pemicu saat pindah page (hash change) atau tutup tab
window.addEventListener('hashchange', saveProgress, { once: true });
window.addEventListener('beforeunload', saveProgress);
  
  // 🔑 judul dari category
  titleEl.textContent = data.category;

  // 🔥 isi HTML murni dari DB
  contentEl.innerHTML = data.content;
}
