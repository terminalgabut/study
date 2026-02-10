import { supabase } from '../services/supabase.js';

export async function initBab(categoryFromUrl) {
  const list = document.getElementById('babList');
  const title = document.querySelector('.bab-title');
  if (!list) return;

  // judul halaman
  if (title) {
    title.textContent = `Materi ${categoryFromUrl}`;
  }

  const { data, error } = await supabase
    // Contoh Logika Query Baru
.from('materials')
.select('title, subtitle, slug, order')
.eq('category', categoryFromUrl) // Langsung filter di database
.order('order', { ascending: true });

  if (error) {
    console.error(error);
    list.innerHTML = '<p>Gagal load bab</p>';
    return;
  }

  const normalizedCategory = categoryFromUrl.toLowerCase();

  const filtered = data.filter(row =>
    row.category
      ?.toLowerCase()
      .startsWith(normalizedCategory)
  );

  if (!filtered.length) {
    list.innerHTML = '<p>Bab belum tersedia</p>';
    return;
  }

  list.innerHTML = filtered.map(bab => `
  <a href="#materi/${categoryFromUrl}/${bab.slug}" class="home-card">
    <h3>${bab.category}</h3>
    <p class="small">${bab.title}</p>
  </a>
`).join('');
}
