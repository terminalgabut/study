import { load } from './loader.js';

export async function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const page = location.hash.replace('#', '') || 'home';

  const content = document.getElementById('content');
  if (!content) return;

  try {
    content.innerHTML = await load(`pages/${page}.html`);
  } catch {
    content.innerHTML = '<h2>Page not found</h2>';
  }

  // active sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}
