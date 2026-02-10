import { supabase } from '../services/supabase.js';

export async function initBab(categoryFromUrl) {
  const list = document.getElementById('babList');
  const title = document.querySelector('.bab-title');
  if (!list) return;

  if (title) title.textContent = `Materi ${categoryFromUrl}`;

  // JALUR CERDAS: Filter langsung di server, abaikan besar/kecil huruf
  const { data, error } = await supabase
    .from('materials')
    .select('title, subtitle, slug, category') // ambil subtitle juga untuk UI
    .ilike('category', categoryFromUrl) 
    .order('m_order', { ascending: true });

  if (error) {
    console.error(error);
    list.innerHTML = '<p>Gagal load bab</p>';
    return;
  }

  // Jika data kosong, langsung tampilkan pesan
  if (!data || data.length === 0) {
    list.innerHTML = '<p>Bab belum tersedia</p>';
    return;
  }

  // Render langsung dari 'data'
  list.innerHTML = data.map(bab => `
    <a href="#materi/${categoryFromUrl.toLowerCase()}/${bab.slug}" class="home-card">
      <h3>${bab.title}</h3>
      <p class="small">${bab.subtitle || ''}</p> 
    </a>
  `).join('');
}
