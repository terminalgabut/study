// js/router/hashRouter.js

// ===== VIEW pages =====
import { homeView } from '../../pages/homeView.js';
import { materiView } from '../../pages/materiView.js';
import { babView } from '../../pages/babView.js';
import { kontenBabView } from '../../pages/kontenBabView.js';
import { bookmarkView } from '../../pages/bookmarkView.js'; // TAMBAHAN

// ===== LOGIC =====
import { initBab } from '../ui/bab.js';
import { initKontenBab } from '../ui/kontenBab.js';
import { initQuizGenerator } from '../ui/generator.js';
import { initBookmarkPage } from '../ui/bookmark.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const rawHash = location.hash || '#home';
  const hash = rawHash.replace(/^#\/?/, '');
  
  const content = document.getElementById('content');
  if (!content) return;

  // Animasi keluar
  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 150));

  try {
    // ==================================================
    // 1. ROUTE: materi/:category/:slug (ISI MATERI)
    // ==================================================
    const kontenMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    if (kontenMatch) {
      const [, category, slug] = kontenMatch;
      
      // Render VIEW
      content.innerHTML = kontenBabView;

      // ===== LOGIC KONTEN & BOOKMARK TOGGLE =====
      try {
        initKontenBab(category, slug);
        
        // Inisialisasi fitur simpan/hapus bookmark di halaman konten
        // category di sini akan disimpan sebagai Judul Materi di tabel bookmark
        handleBookmarkToggle(slug, category); 
      } catch (e) {
        console.error('initKontenBab error:', e);
      }

      // ===== LOGIC QUIZ =====
      try {
        initQuizGenerator();
      } catch (e) {
        console.error('initQuizGenerator error:', e);
      }
    }

    // ==================================================
    // 2. ROUTE: materi/:category (DAFTAR BAB)
    // ==================================================
    else {
      const materiMatch = hash.match(/^materi\/([^\/]+)$/);
      if (materiMatch) {
        const category = materiMatch[1];
        content.innerHTML = babView;
        try {
          initBab(category);
        } catch (e) {
          console.error('initBab error:', e);
        }
      }

      // ==================================================
      // 3. ROUTE STATIS
      // ==================================================
      else {
        switch (hash) {
          case 'home':
            content.innerHTML = homeView;
            break;

          case 'materi':
            content.innerHTML = materiView;
            break;

          // RUTE BARU: BOOKMARK
          case 'bookmark':
            content.innerHTML = bookmarkView;
            try {
              // Menjalankan logika pengambilan data dari Supabase & rendering grid
              initBookmarkPage(); 
            } catch (e) {
              console.error('initBookmarkPage error:', e);
            }
            break;

          default:
            content.innerHTML = '<h2>Page not found</h2>';
        }
      }
    }
  } catch (err) {
    console.error('Router error:', err);
    content.innerHTML = '<h2>Router error</h2>';
  }

  // Animasi masuk
  content.classList.remove('fade-out');

  // ===== Update active nav =====
  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
