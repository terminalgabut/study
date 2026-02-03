export function initProfileDropdown() {
  const btn = document.querySelector('.profile-btn');
  const dropdown = document.getElementById('profileDropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('show');
    }
  });
}
