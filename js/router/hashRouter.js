import { load } from '../utils/loader.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const page = location.hash.replace('#', '') || 'home';
  const content = document.getElementById('content');
  if (!content) return;

  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 200));

  try {
    content.innerHTML = await load(`pages/${page}.html`);
  } catch {
    content.innerHTML = '<h2>Page not found</h2>';
  }

  content.classList.remove('fade-out');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

export function initRouter() {
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}
