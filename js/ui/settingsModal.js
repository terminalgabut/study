export function initSettingsModal() {
  const btn = document.querySelector('.icon-btn[title="Settings"]');
  const modal = document.getElementById('settingsModal');
  if (!btn || !modal) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.toggle('show');

    const r = btn.getBoundingClientRect();
    modal.style.top = r.bottom + window.scrollY + 8 + 'px';
    modal.style.right = window.innerWidth - r.right + 'px';
  });

  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && !btn.contains(e.target)) {
      modal.classList.remove('show');
    }
  });
}
