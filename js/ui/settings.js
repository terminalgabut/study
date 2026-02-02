export function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('settingsBtn');
  const closeBtn = document.getElementById('closeSettings');
  const backdrop = modal?.querySelector('.modal-backdrop');

  if (!modal || !openBtn) return;

  openBtn.onclick = () => {
    modal.classList.remove('hidden');
  };

  closeBtn.onclick = () => {
    modal.classList.add('hidden');
  };

  backdrop.onclick = () => {
    modal.classList.add('hidden');
  };
}
