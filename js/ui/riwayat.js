import { supabase } from '../services/supabase.js';

export async function initHistoryPage() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat riwayat belajar...</p></div>';

  try {
    // 1. Ambil data riwayat (Sertakan duration_seconds untuk info tambahan)
    const { data: historyRows, error: e1 } = await supabase
      .from('riwayat')
      .select('material_slug, bab_title, last_accessed, duration_seconds')
      .order('last_accessed', { ascending: false });

    if (e1) throw e1;

    if (!historyRows || historyRows.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada riwayat belajar.</p></div>';
      return;
    }

    // 2. Jika bab_title sudah ada di riwayat, kita tidak wajib fetch ke tabel materials 
    // kecuali butuh info 'category'. Mari berasumsi kita butuh category:
    const slugs = historyRows.map(h => h.material_slug);
    const { data: materials, error: e2 } = await supabase
      .from('materials') // Sesuaikan nama tabel (materials/materi)
      .select('slug, category')
      .in('slug', slugs);

    if (e2) console.warn('Gagal memuat kategori:', e2);

    // 3. Render
    container.innerHTML = historyRows.map(item => {
      const mat = materials?.find(m => m.slug === item.material_slug);
      const category = mat ? mat.category : 'Umum';
      
      // Hitung menit belajar
      const minutes = Math.floor((item.duration_seconds || 0) / 60);

      return `
        <div class="home-card">
          <p class="small">🕒 ${new Date(item.last_accessed).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <h3 style="margin: 5px 0;">${item.bab_title || 'Materi Tanpa Judul'}</h3>
          <p class="highlight" style="font-size: 0.8em; opacity: 0.8;">Kategori: ${category}</p>
          <p style="font-size: 0.85em; margin: 5px 0;">Durasi Belajar: <b>${minutes} menit</b></p>
          <button class="primary-btn" 
                  onclick="window.location.hash='#/materi/${safeCategory}/${item.material_slug}'"
                  style="margin-top:10px; width:100%;">
            Lanjutkan Belajar
          </button>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error load history:', err);
    container.innerHTML = '<div class="home-card"><p>Gagal memuat riwayat. Pastikan Anda sudah login.</p></div>';
  }
}
