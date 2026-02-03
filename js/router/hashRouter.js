import { load } from '../utils/loader.js';
import { renderDaftarBab } from '../ui/daftarBab.js';
import { renderKontenBab } from '../ui/kontenBab.js'; // nanti buat konten bab

export function navigate(page) {
  location.hash = page;
}

export async function handleRoute() {
  let hash = location.hash.replace('#', '') || 'home';
  const content = document.getElementById('content');
  if (!content) return;

  content.classList.add('fade-out');
  await new Promise(r => setTimeout(r, 200));

  try {
    // ======= Route Dinamis =======
    // materi/:slug/:bab
    const materiBabMatch = hash.match(/^materi\/([^\/]+)\/([^\/]+)$/);
    // materi/:slug
    const materiMatch = hash.match(/^materi\/([^\/]+)$/);

    if (materiBabMatch) {
      const [, slugMateri, slugBab] = materiBabMatch;
      await renderKontenBab(slugMateri, slugBab); // render konten bab
    } else if (materiMatch) {
      const [, slugMateri] = materiMatch;
      await renderDaftarBab(slugMateri); // render daftar bab otomatis
    } else {
      // default load HTML statis: home, about, dll
      content.innerHTML = await load(`./pages/${hash}.html`);
    }
  } catch (err) {
    console.error(err);
    content.innerHTML = '<h2>Page not found</h2>';
  }

  content.classList.remove('fade-out');

  // ======= Update active nav-btn =======
  const rootPage = hash.split('/')[0]; // ambil bagian pertama dari hash
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === rootPage);
  });
}

export function initRouter() {
  // load route pertama
  handleRoute();

  // listen hash change
  window.addEventListener('hashchange', handleRoute);
}
