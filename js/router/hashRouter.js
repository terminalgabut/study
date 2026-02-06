// js/router/hashRouter.js

// ===== VIEW pages =====
import { homeView } from '../../pages/homeView.js';
import { materiView } from '../../pages/materiView.js';
import { babView } from '../../pages/babView.js';
import { kontenBabView } from '../../pages/kontenBabView.js';
import { bookmarkView } from '../../pages/bookmarkView.js';
import { historyView } from '../../pages/riwayatView.js';

// ===== LOGIC =====
import { initLastRead } from '../ui/lastread.js';
import { initMotivation } from '../ui/motivation.js';
import { initProgress } from '../ui/progress.js';
import { initDailyTarget } from '../ui/target.js';
import { initBab } from '../ui/bab.js';
import { initKontenBab } from '../ui/kontenBab.js';
import { initQuizGenerator } from '../ui/generator.js';
import { handleBookmarkToggle, initBookmarkPage } from '../ui/bookmark.js'; 
import { initHistoryPage } from '../ui/riwayat.js';
  
export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const rawHash = location.hash || '#home';
  const hash = rawHash.replace(/^#\/?/, '');
  
  const content = document.getElementById('content');
  if (!content) return;

  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 150));

  try {
    // 1. ROUTE: materi/:category/:slug
    const kontenMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    if (kontenMatch) {
      const [, category, slug] = kontenMatch;
      content.innerHTML = kontenBabView;

      try {
        initKontenBab(category, slug);
        // ✅ Sekarang fungsi ini sudah bisa dipanggil karena sudah di-import di atas
        handleBookmarkToggle(slug, category); 
      } catch (e) {
        console.error('initKontenBab error:', e);
      }

      try {
        initQuizGenerator();
      } catch (e) {
        console.error('initQuizGenerator error:', e);
      }
    }

    // 2. ROUTE: materi/:category
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

      // 3. ROUTE STATIS
      else {
        switch (hash) {
          case 'home':
            content.innerHTML = homeView;
              initLastRead();
              initMotivation();
              initProgress();
              initDailyTarget();
            break;
          case 'materi':
            content.innerHTML = materiView;
            break;
          case 'bookmark':
            content.innerHTML = bookmarkView;
            try {
              initBookmarkPage(); 
            } catch (e) {
              console.error('initBookmarkPage error:', e);
            }
            break;
          case 'riwayat':
            content.innerHTML = historyView;
              initHistoryPage();
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

  content.classList.remove('fade-out');

  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
