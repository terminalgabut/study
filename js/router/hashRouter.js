// js/router/hashRouter.js

// ===== VIEW pages =====
import { homeView } from '../../pages/homeView.js';
import { materiView } from '../../pages/materiView.js';
import { babView } from '../../pages/babView.js';
import { kontenBabView } from '../../pages/kontenBabView.js';

// ===== LOGIC (OPTIONAL, JANGAN BIKIN ROUTER MATI) =====
import { initBab } from '../ui/bab.js';
import { initKontenBab } from '../ui/kontenBab.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const rawHash = location.hash || '#home';
  const hash = rawHash.replace(/^#\/?/, ''); // 🔑 fix #/materi vs #materi
  const content = document.getElementById('content');
  if (!content) return;

  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 150));

  try {
    // ===== ROUTE DINAMIS: materi/:category =====
    // ===== ROUTE DINAMIS: materi/:category/:slug =====
const kontenMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);

if (kontenMatch) {
  const [, category, slug] = kontenMatch;

  content.innerHTML = kontenBabView;

  try {
    initKontenBab(category, slug);
  } catch (e) {
    console.error('initKontenBab error:', e);
  }

}
   
    const materiMatch = hash.match(/^materi\/([^\/]+)$/);

    if (materiMatch) {
      const category = materiMatch[1];

      // render view dulu (ANTI BLANK)
      content.innerHTML = babView;

      // logic OPTIONAL (jangan bunuh router)
      try {
        initBab(category);
      } catch (e) {
        console.error('initBab error:', e);
      }

    } else {
      // ===== ROUTE STATIS =====
      switch (hash) {
        case 'home':
          content.innerHTML = homeView;
          break;

        case 'materi':
          content.innerHTML = materiView;
          break;

        default:
          content.innerHTML = '<h2>Page not found</h2>';
      }
    }
  } catch (err) {
    console.error('Router error:', err);
    content.innerHTML = '<h2>Router error</h2>';
  }

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
