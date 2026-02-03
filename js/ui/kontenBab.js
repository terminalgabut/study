// ui/kontenBab.js
import { supabase } from '../services/supabase.js';

export async function initKontenBab(category, slug) {
  const title = document.getElementById('kontenTitle');
  const body = document.getElementById('kontenBody');

  if (!title || !body) return;

  const { data, error } = await supabase
    .from('materi')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    body.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

  title.textContent = data.category;
  body.innerHTML = data.content;
}
