import { navigate } from '../router/hashRouter.js';

export function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const buttons = document.querySelectorAll('.nav-btn');

  if (!sidebar) return;

  buttons.forEach(btn => {
    btn.onclick = () => {
      navigate(btn.dataset.page);
      close();
    };
  });

  function close() {
    sidebar.classList.remove('open');
    overlay?.classList.remove('show');
  }
}
