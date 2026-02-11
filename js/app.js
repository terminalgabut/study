// ===== GLOBAL DEBUG =====
const DEV =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1';

window.__DEBUG__ = {
  log: (...args) => DEV && console.log('[DEBUG]', ...args),
  warn: (...args) => DEV && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Tangkap error JS biasa
window.addEventListener('error', e => {
window.__DEBUG__.error('Global Error:', e.message, e.error);
});

// Tangkap error async / Promise
window.addEventListener('unhandledrejection', e => {
window.__DEBUG__.error('Unhandled Promise:', e.reason);
});
// ========================

import { supabase } from './services/supabase.js'; // Pastikan diimport paling atas
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileModal } from './ui/auth/profileModal.js';

// views
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { modalprofilView } from '../components/modalprofilView.js';
import { babModalView } from '../components/babModalView.js';

function init() {
window.__DEBUG__.log('App init() dipanggil');

  const app = document.getElementById('app');
  if (!app) return;

  // 1. Render struktur dasar Aplikasi terlebih dahulu
  app.innerHTML = `
    <div id="main-layout-wrapper">
      ${headerView}
      <div class="layout">
        ${sidebarView}
      </div>
    </div>
    <main id="content"></main>
  `;

  // 2. Inject Modals
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);
    headerRight.insertAdjacentHTML('beforeend', modalprofilView);
    babModalView.renderBase();
  }

  // 3. Listener Auth Global (Diletakkan setelah render dasar)
  supabase.auth.onAuthStateChange((event, session) => {
  window.__DEBUG__.log('Auth Event:', event); // ← TAMBAHAN
  console.log("Auth Event:", event);
    
    if (event === 'SIGNED_OUT') {
      window.location.hash = '#login';
      const content = document.getElementById('content');
      if (content) content.innerHTML = ''; 
    }
    
    // Jika login berhasil, pastikan layout muncul kembali
    checkLayout();
  });

  // 4. Inisialisasi Logika UI
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileModal(); 
  
  // 5. Jalankan Router & Layout Check
  initRouter();
  window.addEventListener('hashchange', checkLayout);
  checkLayout();
}

function checkLayout() {
  const hash = window.location.hash;
  const layoutWrapper = document.getElementById('main-layout-wrapper');
  const contentArea = document.getElementById('content');
  
  // Login, Register, dan Hash kosong dianggap halaman Auth
  const isAuthPage = hash === '#login' || hash === '#register' || hash === '' || hash === '#';

  if (layoutWrapper && contentArea) {
    if (isAuthPage) {
      layoutWrapper.style.display = 'none';
      contentArea.style.cssText = 'margin: 0; padding: 0;';
    } else {
      layoutWrapper.style.display = 'block';
      contentArea.style.cssText = ''; // Kembali ke CSS default
    }
  }
}

init();
