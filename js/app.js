import { load } from './loader.js';
import { navigate } from './router.js';

async function init() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${await load('components/header.html')}
    <div class="layout">
      ${await load('components/sidebar.html')}
      <main id="content"></main>
    </div>
  `;

  bindNav();
  bindMenu();
  const startPage = 'home';
setActive(startPage);
navigate(startPage);
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
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;

      setActive(page);
      navigate(page);

      // mobile: auto close
      sidebar?.classList.remove('open');
    });
  });
}

function setActive(page) {
  const buttons = document.querySelectorAll('.nav-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

init();
