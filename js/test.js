import { audioController } from './controllers/audioController.js';
import { supabase } from './services/supabase.js'; 
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileModal } from './ui/auth/profileModal.js';

// Views
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { babModalView } from '../components/babModalView.js';
import { durasiModalView } from '../components/durasiModalView.js';
import { ulangModalView } from '../components/ulangModalView.js';
import { akurasiModalView } from '../components/akurasiModalView.js';


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

  // Inisialisasi Modals Dasar
  babModalView.renderBase();
  durasiModalView.renderBase();
  ulangModalView.renderBase();
  akurasiModalView.renderBase();

  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);    
  }

  // Listener Auth
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
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileModal(); 
  
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
