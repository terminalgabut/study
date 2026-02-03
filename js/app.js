// app.js

import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileDropdown } from './ui/modalprofil.js';

// VIEW (HTML string)
import { headerView } from './components/headerView.js';
import { sidebarView } from './components/sidebarView.js';
import { modalsettingsView } from './components/modal-settingsView.js';
import { modalprofilView } from './components/modalprofilView.js';

function init() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('#app tidak ditemukan');
    return;
  }

  // render layout utama
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
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);
    headerRight.insertAdjacentHTML('beforeend', modalprofilView);
  }

  // init logic lama (AMAN)
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileDropdown();
  initRouter();
}

init();
