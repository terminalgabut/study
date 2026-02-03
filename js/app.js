// app.js

import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileDropdown } from './ui/modalprofil.js';

// import VIEW (HTML sebagai string)
import { headerView } from './components/headerView.js';
import { sidebarView } from './components/sidebarView.js';
import { settingsModalView } from './components/modal-settingsView.js';
import { modalProfilView } from './components/modalprofilView.js';

function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // render utama
  app.innerHTML = `
    ${headerView}
    <div class="layout">
      ${sidebarView}
      <main id="content"></main>
    </div>
  `;

  // inject modal ke header-right
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', settingsModalView);
    headerRight.insertAdjacentHTML('beforeend', modalProfilView);
  }

  // init UI (LOGIKA LAMA, TIDAK DIUBAH)
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileDropdown();
  initRouter();
}

init();
