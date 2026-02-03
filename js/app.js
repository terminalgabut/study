import { load } from './utils/loader.js';
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';

async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // 1️⃣ Load semua komponen HTML dulu
  const headerHTML = await load('components/header.html');
  const sidebarHTML = await load('components/sidebar.html');
  const modalHTML = await load('components/modal-settings.html');

  app.innerHTML = `
    ${headerHTML}
    <div class="layout">
      ${sidebarHTML}
      <main id="content"></main>
    </div>
    ${modalHTML}
  `;

  // 2️⃣ Init UI setelah HTML ada di DOM
  initHeader();
  initSidebar();
  initSettingsModal(); // popover modal Settings
  initRouter();
}

init();
