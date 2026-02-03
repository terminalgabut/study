import { load } from '../utils/loader.js';
import { renderDaftarBab } from '../ui/daftarBab.js';
import { renderKontenBab } from '../ui/kontenBab.js'; // nanti buat konten bab

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
    // cek route dinamis
    const materiBabMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    const materiMatch = hash.match(/^materi\/([^\/]+)$/);

    if (materiBabMatch) {
      const [, slugMateri, slugBab] = materiBabMatch;
      await renderKontenBab(slugMateri, slugBab); // tampilkan konten bab
    } else if (materiMatch) {
      const [, slugMateri] = materiMatch;
      await renderDaftarBab(slugMateri); // tampilkan daftar bab
    } else {
      // default load HTML page
      content.innerHTML = await load(`./pages/${hash}.html`);
    }
  } catch (err) {
    console.error(err);
    content.innerHTML = '<h2>Page not found</h2>';
  }

  content.classList.remove('fade-out');

  // update active nav button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === hash.split('/')[0]);
  });
}

export function initRouter() {
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
}
