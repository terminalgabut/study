import { load } from './utils/loader.js';
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settings.js';

async function init() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${await load('components/import { load } from './utils/loader.js';
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';

async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // render layout + modal
  app.innerHTML = `
    ${await load('components/header.html')}

    <div class="layout">
      ${await load('components/sidebar.html')}
      <main id="content"></main>
    </div>

    ${await load('components/modal-settings.html')}
  `;

  // init UI (SETELAH HTML ADA)
  initHeader();
  initSidebar();
  initSettingsModal();
  initRouter();
}

init();.html')}
    <div class="layout">
      ${await load('components/sidebar.html')}
      <main id="content"></main>
    </div>
  `;

  initHeader();
  initSidebar();
  initRouter();
  initSettingsModal();
}

init();
