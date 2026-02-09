import { supabase } from '../services/supabase.js';

export async function initRekomendasi() {
  const rekomendasiListEl = document.querySelector('.link-list');
  
  // Guard clause: pastikan elemen ada di halaman
  if (!rekomendasiListEl) return;

  try {
    // 1. Ambil data materi dan riwayat secara paralel
    const [materiRes, riwayatRes] = await Promise.all([
      supabase.from('materi').select('slug, category'),
      supabase.from('riwayat').select('material_slug')
    ]);

    if (materiRes.error || riwayatRes.error) {
      throw new Error("Gagal mengambil data dari database");
    }

    const daftarMateri = materiRes.data;
    // Gunakan Set untuk pencarian yang lebih cepat (O(1))
    const sudahDibaca = new Set(riwayatRes.data.map(r => r.material_slug));

    // 2. Filter materi yang BELUM pernah dibaca oleh user
    const belumDibaca = daftarMateri.filter(m => !sudahDibaca.has(m.slug));

    // 3. Acak urutan (Fisher-Yates atau Sort Random) dan ambil 3 teratas
    const tigaSaran = belumDibaca
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // 4. Cek jika data kosong
    if (tigaSaran.length === 0) {
      rekomendasiListEl.innerHTML = `
        <li style="color:var(--text-muted); padding:10px;">
          🎉 Semua materi telah kamu selesaikan!
        </li>`;
      return;
    }

    // 5. Render ke HTML
    rekomendasiListEl.innerHTML = tigaSaran.map(m => {
      /**
       * LOGIKA PATH KATEGORI:
       * Jika m.category = "Bahasa Indonesia 1", maka pathKategori = "bahasa"
       * Ini agar link menjadi #materi/bahasa/slug
       */
      const pathKategori = m.category ? m.category.split(' ')[0].toLowerCase() : 'umum';

      return `
        <li>
          <a href="#materi/${pathKategori}/${m.slug}" class="recom-link" style="display:block; padding:8px 0; text-decoration:none; color:var(--accent); transition:0.2s;">
            <i class="fas fa-book-reader" style="margin-right:8px; font-size:0.9em;"></i>
            ${m.category}
          </a>
        </li>
      `;
    }).join('');

  } catch (err) {
    console.error('Rekomendasi Error:', err);
    rekomendasiListEl.innerHTML = '<li style="color:red;">Gagal memuat saran materi</li>';
  }
}
