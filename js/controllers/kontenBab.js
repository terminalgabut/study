import { supabase } from '../services/supabase.js';

// Variabel Global untuk melacak sesi belajar
let startTime = null;
let currentSlug = null;
let currentTitle = null;

/**
 * Inisialisasi halaman materi
 */
export async function initKontenBab(category, slug) {
  console.log("--- DEBUG START ---");
  const titleEl = document.getElementById('learningTitle');
  const contentEl = document.getElementById('learningContent');
  const noteArea = document.getElementById('noteArea');
  const saveBtn = document.getElementById('saveNoteBtn');

  if (!titleEl || !contentEl) return;

  // Set state awal
  currentSlug = slug;
  startTime = Date.now();
  window.__DEBUG__.log(`[Materi] Membuka: ${slug}`);

  // 1. Ambil data materi dan catatan secara paralel
  const [materiRes, catatanRes] = await Promise.all([
    supabase.from('materials').select('title, content').eq('slug', slug).single(),
    supabase.from('catatan').select('content').eq('material_slug', slug).maybeSingle()
  ]);

  if (materiRes.error || !materiRes.data) {
    window.__DEBUG__.error(`[Materi] Gagal memuat: ${materiRes.error?.message}`);
    contentEl.innerHTML = '<p>Materi tidak ditemukan.</p>';
    return;
  }

  // 2. Render konten ke UI
  currentTitle = materiRes.data.title;
  titleEl.textContent = currentTitle;
  contentEl.innerHTML = materiRes.data.content;
  if (noteArea) noteArea.value = catatanRes.data ? catatanRes.data.content : "";

  // 3. Catat riwayat akses (Hanya jika user login)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error: upsertError } = await supabase.from('riwayat').upsert({ 
      material_slug: slug, 
      bab_title: currentTitle,
      last_accessed: new Date().toISOString() 
    }, { onConflict: 'user_id, material_slug' });

    if (upsertError) {
      window.__DEBUG__.error(`[Riwayat] Upsert Gagal: ${upsertError.message}`);
    } else {
      window.__DEBUG__.log(`[Riwayat] Berhasil mencatat kunjungan: ${currentTitle}`);
    }
  }

  // 4. Setup Event Listeners (Tombol & Timer)
  if (saveBtn) saveBtn.onclick = () => handleSaveNote();

  // Bersihkan listener lama agar tidak double
  window.removeEventListener('beforeunload', saveProgress);
  // Pasang listener baru
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
    window.__DEBUG__.log(`[Catatan] Berhasil disimpan`);
    if (statusEl) {
      statusEl.textContent = "✅ Tersimpan!";
      setTimeout(() => { statusEl.textContent = ""; }, 2000);
    }
  }
}

/**
 * SIMPAN PROGRESS (RPC)
 */
async function saveProgress() {
  if (!startTime || !currentSlug) return;

  const endTime = Date.now();
  const durationInSeconds = Math.floor((endTime - startTime) / 1000);

  // Hanya jalankan RPC jika durasi masuk akal (minimal 5 detik)
  if (durationInSeconds >= 5) {
    window.__DEBUG__.log(`[RPC] Mengirim durasi: ${durationInSeconds}s`);
    
    const { error } = await supabase.rpc('increment_duration', { 
      slug: currentSlug, 
      seconds: durationInSeconds 
    });

    if (error) {
      window.__DEBUG__.error(`[RPC] Gagal: ${error.message}`);
    } else {
      window.__DEBUG__.log(`[RPC] ✅ Durasi terupdate`);
    }
  }

  // Reset state agar tidak terjadi pengiriman ganda
  startTime = null;
  currentSlug = null;
  currentTitle = null;
}
