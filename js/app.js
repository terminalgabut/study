import { load } from './loader.js';
import { navigate, handleRoute } from './router.js';

async function init() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${await load('components/header.html')}
    <div class="layout">
      ${await load('components/sidebar.html')}
      <main id="content"></main>
    </div>
  `;

  bindMenu();
  bindNav();

  // load awal dari hash
  handleRoute();

  // dengarkan perubahan hash
  window.addEventListener('hashchange', handleRoute);
}

function bindMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  if (!menuBtn || !sidebar) return;

  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');
  };
}

function bindNav() {
  const buttons = document.querySelectorAll('.nav-btn');
  const sidebar = document.querySelector('.sidebar');

  buttons.forEach(btn => {
    btn.onclick = () => {
      navigate(btn.dataset.page);
      sidebar?.classList.remove('open');
    };
  });
}

init();
