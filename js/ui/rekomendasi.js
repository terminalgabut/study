import { supabase } from '../services/supabase.js';

export async function initRekomendasi() {
  const listEl = document.querySelector('.link-list');
  if (!listEl) return;

  try {
    const [materiRes, progressRes] = await Promise.all([
      supabase.from('materials').select('slug, category, title'),
      supabase.from('study_progress').select('category, bab_title')
    ]);

    if (materiRes.error || progressRes.error) throw new Error("DB Error");

    const daftarMateri = materiRes.data;
    
    // Buat Set berisi gabungan "kategori|judul" untuk pengecekan cepat
    const sudahDibaca = new Set(
      progressRes.data.map(p => `${p.category}|${p.bab_title}`)
    );

    // Filter: Materi dianggap "belum dibaca" jika gabungan category|title-nya TIDAK ADA di Set
    const belumDibaca = daftarMateri.filter(m => {
      const key = `${m.category}|${m.title}`;
      return !sudahDibaca.has(key);
    });

    const tigaSaran = belumDibaca
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    if (tigaSaran.length === 0) {
      listEl.innerHTML = '<li style="color:gray; padding:10px;">🎉 Semua materi selesai!</li>';
      return;
    }

    listEl.innerHTML = tigaSaran.map(m => {
      const pathKat = m.category ? m.category.split(' ')[0].toLowerCase() : 'umum';
      return `
        <li style="list-style:none; border-bottom:1px solid rgba(56, 189, 248, 0.15);">
          <a href="#materi/${pathKat}/${m.slug}" style="display:block; padding:10px 0; text-decoration:none; color:#4f46e5;">
            <div style="font-size:0.75em; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">${m.category}</div>
            <div style="font-weight:600; margin-top:2px; color:#1e293b;">
              <i class="fas fa-book-open" style="margin-right:6px; font-size:0.8em; color:#38bdf8;"></i>${m.title}
            </div>
          </a>
        </li>
      `;
    }).join('');

  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<li style="color:red; font-size:0.9em;">Gagal memuat rekomendasi</li>';
  }
}
