// js/ui/kontenBab.js
import { supabase } from '../services/supabase.js';

export async function initKontenBab(category, slug) {
  const container = document.getElementById('learningContent');
  if (!container) return;

  const { data, error } = await supabase
    .from('materi')
    .select('content, title')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    container.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

  // 🔥 HTML LANGSUNG DARI DB
  container.innerHTML = data.content;
}
