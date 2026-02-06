import { supabase } from '../services/supabase.js';

export async function initRekomendasi() {
  const rekomendasiListEl = document.querySelector('.link-list');
  if (!rekomendasiListEl) return;

  try {
    // 1. Ambil data materi dan riwayat secara paralel
    const [materiRes, riwayatRes] = await Promise.all([
      supabase.from('materi').select('slug, category'),
      supabase.from('riwayat').select('material_slug')
    ]);

    if (materiRes.error || riwayatRes.error) throw new Error("Gagal ambil data");

    const daftarMateri = materiRes.data;
    const sudahDibaca = new Set(riwayatRes.data.map(r => r.material_slug));

    // 2. Filter materi yang BELUM dibaca
    const belumDibaca = daftarMateri.filter(m => !sudahDibaca.has(m.slug));

    // 3. Acak urutannya (Fisher-Yates Shuffle)
    const shuffled = belumDibaca.sort(() => 0.5 - Math.random());

    // 4. Ambil 3 teratas
    const tigaSaran = shuffled.slice(0, 3);

    // 5. Render ke HTML sebagai link yang bisa diklik
    if (tigaSaran.length === 0) {
      rekomendasiListEl.innerHTML = '<li>🎉 Semua materi sudah dibaca!</li>';
      return;
    }

    rekomendasiListEl.innerHTML = tigaSaran.map(m => `
      <li>
        <a href="#materi/${m.slug}" class="recom-link">
          ${m.category}
        </a>
      </li>
    `).join('');

  } catch (err) {
    console.error('Rekomendasi Error:', err);
    rekomendasiListEl.innerHTML = '<li>Gagal memuat saran</li>';
  }
}
