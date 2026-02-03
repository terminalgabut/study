export function initSettingsModal() {
  const settingsBtn = document.querySelector('.icon-btn[title="Settings"]');
  const modal = document.getElementById('settingsModal');
  if (!settingsBtn || !modal) return;

  // toggle via tombol settings
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.toggle('show');

    const rect = settingsBtn.getBoundingClientRect();
    modal.style.top = rect.bottom + window.scrollY + 8 + 'px';
    modal.style.right = window.innerWidth - rect.right + 'px';
  });

  // klik luar → tutup
  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && !settingsBtn.contains(e.target)) {
      modal.classList.remove('show');
    }
  });
}
