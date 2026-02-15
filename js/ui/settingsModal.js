// root/js/ui/settingsModal.js

export function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  
  if (!modal) return;

  document.addEventListener('click', (e) => {
    const settingsBtn = e.target.closest('#settingsBtn');
    if (settingsBtn) {
      e.stopPropagation();
      modal.classList.toggle('show');
      console.log('Settings toggled');
    } 
    
    else if (modal.classList.contains('show') && !modal.contains(e.target)) {
      modal.classList.remove('show');
    }
  });

  const darkModeToggle = document.getElementById('darkMode');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('dark-mode', e.target.checked);
    });
  }
}
