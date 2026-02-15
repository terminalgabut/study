// root/js/ui/header.js
import { settingsModalView } from '../../components/settingsModalView.js';
import { islandController } from './island.js';

export function initHeader() {
  const headerRight = document.querySelector('.header-right');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  // --- 1. INJEKSI HTML (Penting agar ID modal ada di DOM) ---
  //if (headerRight && !document.getElementById('profileDropdown')) {
   // headerRight.insertAdjacentHTML('beforeend', profileModalView);
 // }

  // --- 2. INISIALISASI LOGIKA ---
  
  // Setup Dynamic Island
  window.islandController = islandController; 
  window.islandController.init(); 

  // Setup Settings (Menggunakan pola render ke body)
  settingsModalView.renderBase(); 

  // --- 3. LOGIKA UI LOCAL (Sidebar) ---
  if (!menuBtn || !sidebar) return;

  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');
    if (overlay) {
      overlay.classList.toggle('show');
    }
  };
}
