import { load } from './loader.js';

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  const page = location.hash.replace('#', '') || 'home';
  const content = document.getElementById('content');
  if (!content) return;

  // animasi keluar
  content.classList.add('fade-out');

  // tunggu animasi
  await new Promise(r => setTimeout(r, 200));

  try {
    content.innerHTML = await load(`pages/${page}.html`);
  } catch {
    content.innerHTML = '<h2>Page not found</h2>';
  }

  // animasi masuk
  content.classList.remove('fade-out');

  // active sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}
