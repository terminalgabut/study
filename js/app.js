// js/app.js
import { initRouter } from './router/hashRouter.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initSettingsModal } from './ui/settingsModal.js';
import { initProfileModal } from './ui/auth/profilModal.js';


// views
import { headerView } from '../components/headerView.js';
import { sidebarView } from '../components/sidebarView.js';
import { modalsettingsView } from '../components/modal-settingsView.js';
import { modalprofilView } from '../components/modalprofilView.js';

function init() {
  const app = document.getElementById('app');
  if (!app) return;

  // 1. Render struktur dasar Aplikasi
  // Kita bungkus Header dan Sidebar dalam div agar mudah disembunyikan via CSS/JS
  app.innerHTML = `
    <div id="main-layout-wrapper">
      ${headerView}
      <div class="layout">
        ${sidebarView}
      </div>
    </div>
    <main id="content"></main>
  `;

  // 2. Inject Modals ke dalam Header Right
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.insertAdjacentHTML('beforeend', modalsettingsView);
    headerRight.insertAdjacentHTML('beforeend', modalprofilView);
  }

  // 3. Inisialisasi semua komponen UI
  initHeader();
  initSidebar();
  initSettingsModal();
  initProfileModal(); // Ini yang akan mengisi data John Doe jadi Nama Asli
  
  // 4. Jalankan Router terakhir
  initRouter();

  // 5. Pantau perubahan Hash untuk menyembunyikan/menampilkan layout
  window.addEventListener('hashchange', checkLayout);
  checkLayout();
}

// Fungsi untuk mengatur tampilan Layout (Hide Header/Sidebar di Login Page)
function checkLayout() {
  const hash = window.location.hash;
  const layoutWrapper = document.getElementById('main-layout-wrapper');
  const contentArea = document.getElementById('content');
  
  const isAuthPage = hash === '#login' || hash === '#register' || hash === '';

  if (layoutWrapper && contentArea) {
    if (isAuthPage) {
      layoutWrapper.style.display = 'none';
      contentArea.style.marginLeft = '0';
      contentArea.style.marginTop = '0';
      contentArea.style.padding = '0';
    } else {
      layoutWrapper.style.display = 'block';
      // Kembalikan styling ke asal (sesuaikan dengan CSS layout kamu)
      contentArea.style.marginLeft = ''; 
      contentArea.style.marginTop = '';
      contentArea.style.padding = '';
    }
  }
}

init();
