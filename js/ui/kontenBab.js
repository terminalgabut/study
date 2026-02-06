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
  
  // 🔑 judul dari category
  titleEl.textContent = data.category;

  // 🔥 isi HTML murni dari DB
  contentEl.innerHTML = data.content;
}
