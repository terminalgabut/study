// ===== APP BOOT CHECK =====
console.log('[APP] app.js file loaded');

// Tandai bahwa app module sudah aktif
window.__APP_LOADED__ = true;

// ===== GLOBAL DEBUG (Versi Detail) =====
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
  const fileName = e.filename
    ? e.filename.split('/').pop()
    : 'unknown_file';

  const location = `${fileName}:${e.lineno}:${e.colno}`;

  window.__DEBUG__.error(
    `[${location}] Global Error:`,
    e.message
  );
});

// Tangkap Promise error
window.addEventListener('unhandledrejection', e => {
  const reason =
    e.reason?.message ||
    e.reason ||
    'Unknown Promise Rejection';

  window.__DEBUG__.error('[Async/Promise] Error:', reason);
});

import { audioController } from './controllers/audioController.js';
import { supabase } from './services/supabase.js'; // Pastikan diimport paling atas
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { island } from './island.js';

console.log('ISLAND IMPORT:', island);
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileModal } from './ui/auth/profileModal.js';

// views
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { modalprofilView } from '../components/modalprofilView.js';
import { babModalView } from '../components/babModalView.js';
import { durasiModalView } from '../components/durasiModalView.js';
import { ulangModalView } from '../components/ulangModalView.js';
import { akurasiModalView } from '../components/akurasiModalView.js';

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

  island.init();

  if (!document.getElementById('youtube-player')) {
    const ytDiv = document.createElement('div');
    ytDiv.id = 'youtube-player';
    // Sembunyikan jauh di luar layar agar tidak merusak UI
    ytDiv.style.cssText = 'position:absolute; top:-9999px; left:-9999px; width:1px; height:1px;';
    document.body.appendChild(ytDiv);
  }

  babModalView.renderBase();
  durasiModalView.renderBase();
  ulangModalView.renderBase();
  akurasiModalView.renderBase();


  // 2. Inject Modals
  const headerRight = document.querySelector('.header-right');
if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);    
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
  audioController.init();
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
