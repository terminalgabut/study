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
  navigate('home');
}

function bindNav() {
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.onclick = () => navigate(btn.dataset.page);
  });
}

init();
