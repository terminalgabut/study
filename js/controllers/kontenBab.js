import { supabase } from '../services/supabase.js';

// Variabel Global untuk melacak sesi belajar
let startTime = null;
let currentSlug = null;
let currentTitle = null; // Menyimpan judul untuk keperluan riwayat/catatan

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

  // 2. Ambil data materi dan catatan secara bersamaan
  // Mengambil dari tabel baru 'materials'
  const [materiRes, catatanRes] = await Promise.all([
    supabase.from('materials')
      .select('title, content')
      .eq('slug', slug)
      .single(),
    supabase.from('catatan')
      .select('content')
      .eq('material_slug', slug)
      .maybeSingle()
  ]);

  // Handle jika materi tidak ditemukan
  if (materiRes.error || !materiRes.data) {
    contentEl.innerHTML = '<p style="text-align:center; padding:20px;">Materi tidak ditemukan atau terjadi kesalahan.</p>';
    return;
  }

  // Simpan judul ke variabel global agar bisa dipakai fungsi save
  currentTitle = materiRes.data.title;

  // 3. Render Konten ke UI
  titleEl.textContent = currentTitle;
  contentEl.innerHTML = materiRes.data.content;
  
  // 4. Isi area catatan jika ada
  if (noteArea) {
    noteArea.value = catatanRes.data ? catatanRes.data.content : "";
  }

  // 5. Catat riwayat akses (Otomatis menyertakan bab_title)
  await supabase.from('riwayat').upsert({ 
    material_slug: slug, 
    bab_title: currentTitle,
    last_accessed: new Date().toISOString() 
  }, { onConflict: 'user_id, material_slug' });

  // 6. Setup Tombol Simpan Catatan
  if (saveBtn) {
    saveBtn.onclick = () => handleSaveNote();
  }

  // 7. Setup Durasi Belajar
  window.removeEventListener('beforeunload', saveProgress);
  window.addEventListener('hashchange', saveProgress, { once: true });
  window.addEventListener('beforeunload', saveProgress);
}

/**
 * Fungsi untuk menyimpan catatan secara manual
 */
async function handleSaveNote() {
  const noteArea = document.getElementById('noteArea');
  const statusEl = document.getElementById('saveStatus');
  
  if (!noteArea || !currentSlug || !currentTitle) return;

  const noteContent = noteArea.value.trim();
  
  if (statusEl) {
    statusEl.textContent = "⏳ Menyimpan...";
    statusEl.style.color = "#3498db";
  }

  // Simpan ke tabel catatan dengan menyertakan judul bab
  // Di dalam handleSaveNote atau initKontenBab
const { error } = await supabase
  .from('catatan')
  .upsert({ 
    material_slug: currentSlug, 
    bab_title: currentTitle,
    content: noteContent,
    updated_at: new Date().toISOString() 
  }, { 
    onConflict: 'user_id, material_slug' // Sesuaikan dengan constraint SQL tadi
  });

  if (statusEl) {
    if (error) {
      console.error(error);
      statusEl.textContent = "❌ Gagal menyimpan";
      statusEl.style.color = "#e74c3c";
    } else {
      statusEl.textContent = "✅ Tersimpan!";
      statusEl.style.color = "#27ae60";
      setTimeout(() => { statusEl.textContent = ""; }, 3000);
    }
  }
}

/**
 * Fungsi durasi belajar via RPC
 */
async function saveProgress() {
  if (!startTime || !currentSlug) return;

  const endTime = Date.now();
  const durationInSeconds = Math.floor((endTime - startTime) / 1000);

  if (durationInSeconds >= 5) {
    const { error } = await supabase.rpc('increment_duration', { 
      slug: currentSlug, 
      seconds: durationInSeconds 
    });
    if (error) console.error('Error updating duration:', error.message);
  }

  startTime = null;
  currentSlug = null;
  currentTitle = null;
}
