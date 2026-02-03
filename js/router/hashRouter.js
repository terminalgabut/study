// router/hashRouter.js

// VIEW pages (HTML string)
import { homeView } from '../../pages/homeView.js';
import { materiView } from '../../pages/materiView.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const hash = location.hash.replace('#', '') || 'home';
  const content = document.getElementById('content');
  if (!content) return;

  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 200));

  try {
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
  } catch (err) {
    console.error(err);
    content.innerHTML = '<h2>Page error</h2>';
  }

  content.classList.remove('fade-out');

  // update active nav
  const rootPage = hash.split('/')[0];
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}
