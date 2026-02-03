import { supabase } from '../services/supabase.js';

export async function renderDaftarBab(slugMateri) {
  const main = document.getElementById('content');
  if (!main) return;

  // 1️⃣ Ambil materi berdasarkan slug
  const { data: materiArr } = await supabase
    .from('materi')
    .select('id, title')
    .eq('slug', slugMateri)
    .limit(1);

  if (!materiArr || materiArr.length === 0) {
    main.innerHTML = '<p>Materi tidak ditemukan</p>';
    return;
  }

  const materi = materiArr[0];

  // 2️⃣ Fetch bab sesuai materi_id
  const { data: babs } = await supabase
    .from('bab')
    .select('id, title, slug, order')
    .eq('materi_id', materi.id)
    .order('order', { ascending: true });

  // 3️⃣ Render halaman
  main.innerHTML = `
    <section class="page-daftar-bab">
      <div class="hero">
        <h2>${materi.title}</h2>
        <p class="desc">Pilih bab untuk melihat pembahasan lengkap</p>
      </div>
      <ul class="bab-list">
        ${babs.map(b => `<li data-id="${b.id}" data-slug="${b.slug}">${b.title}</li>`).join('')}
      </ul>
    </section>
  `;

  // 4️⃣ Klik bab → navigasi halaman konten bab
  main.querySelectorAll('.bab-list li').forEach(li => {
    li.addEventListener('click', () => {
      window.location.hash = `#/materi/${slugMateri}/${li.dataset.slug}`;
    });
  });
}
