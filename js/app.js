import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileDropdown } from './ui/modalprofil.js';
import { initBookmarkPage } from './ui/bookmark.js';

// view
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { modalprofilView } from '../components/modalprofilView.js';
import { bookmarkView } from '../components/bookmarkView.js';

function init() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    ${headerView}
    <div class="layout">
      ${sidebarView}
      <main id="content"></main>
    </div>
  `;

  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);
    headerRight.insertAdjacentHTML('beforeend', modalprofilView);
  }

  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileDropdown();
  initRouter();
}

init();
