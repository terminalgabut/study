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
      const pathKat = (m.category || 'umum')
  .toLowerCase()
  .replace(/\s+/g, '-');
      return `
        <li style="list-style:none; border-bottom:1px solid rgba(56, 189, 248, 0.15);">
  <a href="#materi/${pathKat}/${m.slug}" style="display:block; padding:12px 0; text-decoration:none;">
    
    <div style="font-size:0.7em; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">
      ${m.category}
    </div>

    <div style="font-weight:600; color:#7dd3fc; display:flex; align-items:center;">
      <i class="fas fa-book-open" style="margin-right:8px; font-size:0.85em; color:#38bdf8;"></i>
      ${m.title}
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
