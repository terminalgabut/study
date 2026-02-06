import { supabase } from '../services/supabase.js';

// Variabel Global untuk melacak sesi belajar
let startTime = null;
let currentSlug = null;

/**
 * Inisialisasi halaman materi, timer, dan fitur catatan
 */
export async function initKontenBab(category, slug) {
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  const noteArea = document.getElementById('noteArea');
  const saveBtn = document.getElementById('saveNoteBtn');

  if (!titleEl || !contentEl) return;

  // 1. Set data sesi saat ini
  currentSlug = slug;
  startTime = Date.now();

  // 2. Ambil data materi dan catatan secara bersamaan (Parallel Request)
  const [materiRes, catatanRes] = await Promise.all([
    supabase.from('materi').select('content, category').eq('slug', slug).single(),
    supabase.from('catatan').select('content').eq('material_slug', slug).maybeSingle()
  ]);

  // Handle jika materi tidak ditemukan
  if (materiRes.error || !materiRes.data) {
    contentEl.innerHTML = '<p style="text-align:center; padding:20px;">Materi tidak ditemukan atau terjadi kesalahan.</p>';
    return;
  }

  // 3. Render Konten ke UI
  titleEl.textContent = materiRes.data.category;
  contentEl.innerHTML = materiRes.data.content;
  
  // 4. Isi area catatan jika sebelumnya sudah pernah ada catatan
  if (noteArea) {
    noteArea.value = catatanRes.data ? catatanRes.data.content : "";
  }

  // 5. Catat waktu akses terakhir di tabel riwayat (Tanpa durasi)
  await supabase.from('riwayat').upsert(
    { material_slug: slug, last_accessed: new Date().toISOString() }, 
    { onConflict: 'material_slug' }
  );

  // 6. Setup Tombol Simpan Catatan (Manual)
  if (saveBtn) {
    // Menggunakan .onclick untuk memastikan listener lama tertimpa (mencegah double save)
    saveBtn.onclick = () => handleSaveNote();
  }

  // 7. Setup Event Listener untuk mencatat durasi saat user keluar
  // Menghapus listener lama agar tidak terjadi penumpukan memori
  window.removeEventListener('beforeunload', saveProgress);
  
  // Memicu simpan durasi saat pindah halaman (hash change) atau tutup tab
  window.addEventListener('hashchange', saveProgress, { once: true });
  window.addEventListener('beforeunload', saveProgress);
}

/**
 * Fungsi untuk menyimpan catatan secara manual
 */
async function handleSaveNote() {
  const noteArea = document.getElementById('noteArea');
  const statusEl = document.getElementById('saveStatus');
  
  if (!noteArea || !currentSlug) return;

  const noteContent = noteArea.value.trim();
  
  // Beri feedback visual ke user
  if (statusEl) {
    statusEl.textContent = "⏳ Menyimpan...";
    statusEl.style.color = "#3498db";
  }

  const { error } = await supabase
    .from('catatan')
    .upsert({ 
      material_slug: currentSlug, 
      content: noteContent,
      updated_at: new Date().toISOString() 
    }, { onConflict: 'material_slug' });

  // Update status feedback
  if (statusEl) {
    if (error) {
      statusEl.textContent = "❌ Gagal menyimpan";
      statusEl.style.color = "#e74c3c";
    } else {
      statusEl.textContent = "✅ Tersimpan!";
      statusEl.style.color = "#27ae60";
      
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => {
        statusEl.textContent = "";
      }, 3000);
    }
  }
}

/**
 * Fungsi untuk mengirim total durasi belajar ke database via RPC
 */
async function saveProgress() {
  if (!startTime || !currentSlug) return;

  const endTime = Date.now();
  const durationInSeconds = Math.floor((endTime - startTime) / 1000);

  // Kirim hanya jika user belajar minimal 5 detik
  if (durationInSeconds >= 5) {
    const { error } = await supabase.rpc('increment_duration', { 
      slug: currentSlug, 
      seconds: durationInSeconds 
    });
    
    if (error) console.error('Error updating duration:', error.message);
  }

  // Bersihkan variabel agar sesi berikutnya bersih
  startTime = null;
  currentSlug = null;
}
