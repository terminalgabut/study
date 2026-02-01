import { load } from './utils/loader.js';
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';

async function init() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${await load('components/header.html')}
    <div class="layout">
      ${await load('components/sidebar.html')}
      <main id="content"></main>
    </div>
  `;

  initHeader();
  initSidebar();
  initRouter();
}

init();
