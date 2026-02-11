import { supabase } from '../services/supabase.js';

// Variabel Global untuk melacak sesi belajar
let startTime = null;
let currentSlug = null;
let currentTitle = null;

/**
 * Inisialisasi halaman materi
 */
export async function initKontenBab(category, slug) {
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  const noteArea = document.getElementById('noteArea');
  const saveBtn = document.getElementById('saveNoteBtn');

  if (!titleEl || !contentEl) return;

  currentSlug = slug;
  startTime = Date.now();
  window.__DEBUG__.log(`[Materi] Membuka: ${slug} pada ${new Date(startTime).toLocaleTimeString()}`);

  // 1. Ambil data materi dan catatan
  const [materiRes, catatanRes] = await Promise.all([
    supabase.from('materials').select('title, content').eq('slug', slug).single(),
    supabase.from('catatan').select('content').eq('material_slug', slug).maybeSingle()
  ]);

  if (materiRes.error || !materiRes.data) {
    window.__DEBUG__.error(`[Materi] Gagal memuat: ${materiRes.error?.message}`);
    contentEl.innerHTML = '<p>Materi tidak ditemukan.</p>';
    return;
  }

  currentTitle = materiRes.data.title;
  titleEl.textContent = currentTitle;
  contentEl.innerHTML = materiRes.data.content;
  
  if (noteArea) noteArea.value = catatanRes.data ? catatanRes.data.content : "";

  // 2. Upsert Riwayat Akses
  const { error: upsertError } = await supabase.from('riwayat').upsert({ 
    material_slug: slug, 
    bab_title: currentTitle,
    last_accessed: new Date().toISOString() 
  }, { onConflict: 'user_id, material_slug' });

  if (upsertError) {
    window.__DEBUG__.error(`[Riwayat] Initial Upsert Gagal: ${upsertError.message}`);
  } else {
    window.__DEBUG__.log(`[Riwayat] Sesi dimulai untuk: ${currentTitle}`);
  }

  if (saveBtn) saveBtn.onclick = () => handleSaveNote();

  // 3. Event Listeners untuk Timer
  window.removeEventListener('beforeunload', saveProgress);
  window.addEventListener('hashchange', saveProgress, { once: true });
  window.addEventListener('beforeunload', saveProgress);
}

/**
 * Simpan Catatan
 */
async function handleSaveNote() {
  const noteArea = document.getElementById('noteArea');
  const statusEl = document.getElementById('saveStatus');
  if (!noteArea || !currentSlug) return;

  if (statusEl) statusEl.textContent = "⏳ Menyimpan...";

  const { error } = await supabase.from('catatan').upsert({ 
    material_slug: currentSlug, 
    bab_title: currentTitle,
    content: noteArea.value.trim(),
    updated_at: new Date().toISOString() 
  }, { onConflict: 'user_id, material_slug' });

  if (error) {
    window.__DEBUG__.error(`[Catatan] Gagal: ${error.message}`);
    if (statusEl) statusEl.textContent = "❌ Gagal";
  } else {
    window.__DEBUG__.log(`[Catatan] Berhasil disimpan untuk ${currentSlug}`);
    if (statusEl) {
      statusEl.textContent = "✅ Tersimpan!";
      setTimeout(() => { statusEl.textContent = ""; }, 2000);
    }
  }
}

/**
 * SIMPAN PROGRESS (RPC) - Dengan Debug Lengkap
 */
async function saveProgress() {
  if (!startTime || !currentSlug) return;

  const endTime = Date.now();
  const durationInSeconds = Math.floor((endTime - startTime) / 1000);

  window.__DEBUG__.log(`[Timer] Sesi selesai. Durasi: ${durationInSeconds} detik.`);

  // Hanya simpan jika durasi lebih dari 5 detik agar tidak membebani database
  if (durationInSeconds >= 5) {
    window.__DEBUG__.log(`[RPC] Mengirim durasi ke database untuk slug: ${currentSlug}...`);
    
    const { data, error } = await supabase.rpc('increment_duration', { 
      slug: currentSlug, 
      seconds: durationInSeconds 
    });

    if (error) {
      window.__DEBUG__.error(`[RPC] Gagal update durasi: ${error.code} - ${error.message}`);
      console.error('Detail Error RPC:', error);
    } else {
      window.__DEBUG__.log(`[RPC] ✅ Sukses! Durasi ${durationInSeconds}s ditambahkan ke ${currentSlug}`);
    }
  } else {
    window.__DEBUG__.log(`[RPC] Dilewati (Durasi < 5 detik)`);
  }

  // Reset variabel global
  startTime = null;
  currentSlug = null;
  currentTitle = null;
}
