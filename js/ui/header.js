// root/js/ui/header.js
import { settingsModalView } from '../../components/settingsModalView.js';
import { islandController } from './island.js';
import { profileModalView } from '../../components/profileModalView.js';
import { initProfileModal } from '../auth/profileModal.js';

export function initHeader() {
  const headerRight = document.querySelector('.header-right');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

if (headerRight && !document.getElementById('profileDropdown')) {
  headerRight.insertAdjacentHTML('beforeend', profileModalView);
}
  
  window.islandController = islandController; 
  window.islandController.init(); 
  settingsModalView.renderBase(); 
  initProfileModal(); 

  if (!menuBtn || !sidebar) return;

  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');
    if (overlay) {
      overlay.classList.toggle('show');
    }
  };
}
