// root/js/ui/settingModal.js

export function initSettingsModal() {
  const btn = document.querySelector('.icon-btn[title="Settings"]');
  const modal = document.getElementById('settingsModal');
  if (!btn || !modal) return;

  // toggle via tombol settings
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.toggle('show');
  });

  // klik luar → tutup
  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && !btn.contains(e.target)) {
      modal.classList.remove('show');
    }
  });
}
