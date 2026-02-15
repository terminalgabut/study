// root/js/ui/header.js

import { islandController } from './island.js';

export function initHeader() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  // --- 1. INISIALISASI ISLAND ---
  // Kita tempelkan ke window supaya file lain (audio/timer) 
  // bisa memanggil window.islandController tanpa import ulang.
  window.islandController = islandController;
  
  // Daftarkan elemen-elemen HTML island yang ada di headerView
  window.islandController.init();

  initSettingsModal();

  if (!menuBtn || !sidebar) return;

  // --- 2. LOGIKA SIDEBAR ---
  menuBtn.onclick = () => {
    sidebar.classList.toggle('open');

    if (overlay) {
      overlay.classList.toggle('show');
    }
  };
}
