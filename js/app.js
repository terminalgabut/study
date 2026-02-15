// root/js/app.js

// Module
import { supabase } from './services/supabase.js'; 
import { initHeader } from './ui/header.js'; 
//import { initProfileModal } from './auth/profileModal.js'; 
import { initSidebar } from './ui/sidebar.js'; 
import { audioController } from './controllers/audioController.js'; 
import { initRouter } from './router/hashRouter.js'; 

// Views
import { headerView } from '../components/headerView.js'; 
//import { profileModalView } from '../components/profileModalView.js'; 
import { sidebarView } from '../components/sidebarView.js'; 

console.log("app.js ✅");

// 2. GLOBAL DEBUG CONFIG
const DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
window.__DEBUG__ = {
  log: (...args) => DEV && console.log('[DEBUG]', ...args),
  warn: (...args) => DEV && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// 3. MAIN INIT FUNCTION
// function init() 
async function init() {
   console.log("Init ✅");
   window.__DEBUG__.log('App init() dipanggil');

  const app = document.getElementById('app');
  if (!app) return;

  // Render struktur dasar ke DOM
  app.innerHTML = `
    <div id="main-layout-wrapper">
      ${headerView}
      <div class="layout">
        ${sidebarView}
      </div>
    </div>
    <main id="content"></main>
  `;

  // Setup YouTube Hidden Player
  if (!document.getElementById('youtube-player')) {
    const ytDiv = document.createElement('div');
    ytDiv.id = 'youtube-player';
    ytDiv.style.cssText = 'position:absolute; top:-9999px; left:-9999px; width:1px; height:1px;';
    document.body.appendChild(ytDiv);
  }
  
  supabase.auth.onAuthStateChange((event, session) => {
    window.__DEBUG__.log('Auth Event:', event);
    if (event === 'SIGNED_OUT') {
      window.location.hash = '#login';
      const content = document.getElementById('content');
      if (content) content.innerHTML = ''; 
    }
    checkLayout();
  }); 

    // Inisialisasi Logika UI
  audioController.init();
  await initHeader();
//  initProfileModal();
  initSidebar();
  

// Jalankan Router
  initRouter();
  window.addEventListener('hashchange', checkLayout);
  checkLayout();
  
}

// 4. LAYOUT MANAGER
function checkLayout() {
  const hash = window.location.hash;
  const layoutWrapper = document.getElementById('main-layout-wrapper');
  const contentArea = document.getElementById('content');
  const isAuthPage = hash === '#login' || hash === '#register' || hash === '' || hash === '#';

  if (layoutWrapper && contentArea) {
    if (isAuthPage) {
      layoutWrapper.style.display = 'none';
      contentArea.style.cssText = 'margin: 0; padding: 0;';
    } else {
      layoutWrapper.style.display = 'block';
      contentArea.style.cssText = ''; 
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
