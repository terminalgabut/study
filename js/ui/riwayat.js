// js/ui/riwayat.js
import { supabase } from '../services/supabase.js';

export async function initHistoryPage() {
  const container = document.getElementById('historyListContainer');
  if (!container) return;

  container.innerHTML = '<div class="home-card"><p>Memuat riwayat belajar...</p></div>';

  try {
    // 1. Ambil data riwayat diurutkan dari yang terbaru (last_accessed)
    const { data: historyRows, error: e1 } = await supabase
      .from('riwayat')
      .select('material_slug, last_accessed')
      .order('last_accessed', { ascending: false });

    if (e1 || !historyRows || historyRows.length === 0) {
      container.innerHTML = '<div class="home-card"><p>Belum ada riwayat belajar.</p></div>';
      return;
    }

    // 2. Ambil detail kategori dari tabel materi
    const slugs = historyRows.map(h => h.material_slug);
    const { data: materials, error: e2 } = await supabase
      .from('materi')
      .select('slug, category')
      .in('slug', slugs);

    if (e2) throw e2;

    // 3. Gabungkan data (Map materi ke riwayat agar urutan waktu tetap terjaga)
    const combinedData = historyRows.map(h => {
      const mat = materials.find(m => m.slug === h.material_slug);
      return { ...h, category: mat ? mat.category : 'Materi Terhapus' };
    });

    // 4. Render
    container.innerHTML = combinedData.map(item => `
      <div class="home-card">
        <p class="small">Terakhir dibuka: ${new Date(item.last_accessed).toLocaleDateString()}</p>
        <p class="highlight">${item.category}</p>
        <button class="primary-btn" 
                onclick="window.location.hash='#/materi/redirect/${item.material_slug}'" 
                style="margin-top:10px; width:100%;">
          Buka Lagi
        </button>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error load history:', err);
  }
}
