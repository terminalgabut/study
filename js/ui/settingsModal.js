export function initSettingsModal() {
  const overlay = document.getElementById('settingsOverlay');
  const openBtn = document.querySelector('.icon-btn[aria-label="Settings"]');
  const closeBtn = document.getElementById('closeSettings');

  if (!overlay || !openBtn) return;

  openBtn.onclick = () => overlay.classList.add('show');
  closeBtn.onclick = close;
  overlay.onclick = e => {
    if (e.target === overlay) close();
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  function close() {
    overlay.classList.remove('show');
  }
}
