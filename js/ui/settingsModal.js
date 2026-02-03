export function initSettingsModal() {
  const settingsBtn = document.querySelector('.icon-btn[title="Settings"]');
  const modal = document.getElementById('settingsModal');
  if (!settingsBtn || !modal) return;

  // toggle modal
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // jangan trigger klik luar
    modal.classList.toggle('show');

    // posisi modal selalu di bawah tombol
    const rect = settingsBtn.getBoundingClientRect();
    modal.style.top = rect.bottom + window.scrollY + 8 + 'px';
    modal.style.right = window.innerWidth - rect.right + 'px';
  });

  // klik luar modal → tutup
  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && e.target !== settingsBtn) {
      modal.classList.remove('show');
    }
  });

  // tombol close di modal
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
  });
}
