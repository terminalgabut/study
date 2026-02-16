// root/js/ui/header.js

import { settingsModalView } from '../../components/settingsModalView.js';
import { islandController } from './island.js';

export async function initHeader() {
  const headerRight = document.querySelector('.header-right');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (headerRight && !document.getElementById('profileDropdown')) {
    try {
      const { profileModalView } = await import('../../components/profileModalView.js');
      headerRight.insertAdjacentHTML('beforeend', profileModalView);

      const { initProfileModal } = await import('../auth/profileModal.js');
      initProfileModal();
    } catch (err) {
  console.error('Profile modal gagal dimuat:', err);
  console.error('Stack:', err?.stack);
}
  }

  window.islandController = islandController;

if (!window.islandController.__initialized) {
  window.islandController.init();
  window.islandController.__initialized = true;
}
  settingsModalView.renderBase();

  if (!menuBtn || !sidebar) return;

  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  };
}
