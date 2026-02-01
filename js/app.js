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
  setActive('home');
  navigate('home');
}

function bindNav() {
  const buttons = document.querySelectorAll('.nav-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;

      setActive(page);
      navigate(page);
    });
  });
}

function setActive(page) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

init();
