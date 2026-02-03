import { load } from './utils/loader.js';
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileDropdown } from './ui/modalprofil.js';

async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // load komponen
  const headerHTML = await load('components/header.html');
  const sidebarHTML = await load('components/sidebar.html');
  const modalHTML = await load('components/modal-settings.html');

  // render utama (TANPA modal)
  app.innerHTML = `
    ${headerHTML}
    <div class="layout">
      ${sidebarHTML}
      <main id="content"></main>
    </div>
  `;

  // inject modal ke header-right (KUNCI)
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalHTML);
  }

  const profileHTML = await load('components/modalprofil.html');
  // inject modal profil
  if (headerRight) {
  headerRight.insertAdjacentHTML('beforeend', profileHTML);
}

  // init UI
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileDropdown();
  initRouter();
}

init();
