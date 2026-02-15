// root/js/ui/sidebar.js

import { navigate } from '../router/hashRouter.js';

export function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const menuBtn = document.getElementById('menuBtn');
  const buttons = document.querySelectorAll('.nav-btn');

  if (!sidebar) return;

  function open() {
    sidebar.classList.add('open');
    overlay?.classList.add('show');
  }

  function close() {
    sidebar.classList.remove('open');
    overlay?.classList.remove('show');
  }

  menuBtn?.addEventListener('click', open);
  overlay?.addEventListener('click', close);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.page);
      close();
    });
  });
}
