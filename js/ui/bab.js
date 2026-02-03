import { supabase } from '../services/supabase.js';

export async function initBab(categoryFromUrl) {
  const list = document.getElementById('babList');
  if (!list) return;

  const { data, error } = await supabase
    .from('materi')
    .select('*');

  if (error) {
    list.innerHTML = '<p>Gagal load bab</p>';
    return;
  }

  const filtered = data.filter(row =>
    row.category.toLowerCase().startsWith(categoryFromUrl)
  );

  list.innerHTML = filtered.map(bab => `
    <a href="#materi/${categoryFromUrl}/${bab.slug}" class="bab-item">
      <h4>${bab.category}</h4>
      <p>${bab.title}</p>
    </a>
  `).join('');
}
