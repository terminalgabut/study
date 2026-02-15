// root/js/ui/header.js

import { modalsettingsView } from '../../components/modalsettingsView.js';

import { islandController } from './island.js';
import { initSettingsModal } from './settingsModal.js';

export function initHeader() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  window.islandController = islandController;
  window.islandController.init();
  initSettingsModal();

  if (!menuBtn || !sidebar) return;

  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');

    if (overlay) {
      overlay.classList.toggle('show');
    }
  };
}
