// root/js/ui/settingsModal.js

export function initSettingsModal() {
  window.__DEBUG__?.log('initSettingsModal() - Initializing...');
  console.log("modal setings ✅");

  const modal = document.getElementById('settingsModal');
  
  if (!modal) {
    window.__DEBUG__?.error('initSettingsModal - #settingsModal NOT FOUND in DOM');
    return;
  }

  // Debug untuk melacak keberadaan trigger
  const triggerExists = !!document.getElementById('settingsBtn');
  window.__DEBUG__?.log(`initSettingsModal - #settingsBtn exists: ${triggerExists}`);

  document.addEventListener('click', (e) => {
    const settingsBtn = e.target.closest('#settingsBtn');
    
    // Log setiap klik global untuk memudahkan tracing (opsional, bisa dihapus jika terlalu ramai)
    // window.__DEBUG__?.log('Global click detected', e.target);

    if (settingsBtn) {
      window.__DEBUG__?.log('Settings button clicked - Toggling modal');
      e.stopPropagation();
      modal.classList.toggle('show');
    } 
    
    else if (modal.classList.contains('show') && !modal.contains(e.target)) {
      window.__DEBUG__?.log('Click outside modal detected - Closing modal');
      modal.classList.remove('show');
    }
  });

  // Logika Fitur di dalam Modal
  const darkModeToggle = document.getElementById('darkMode');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      const isDark = e.target.checked;
      window.__DEBUG__?.log(`Theme changed - Dark Mode: ${isDark}`);
      document.body.classList.toggle('dark-mode', isDark);
    });
  } else {
    window.__DEBUG__?.warn('initSettingsModal - #darkMode toggle NOT FOUND');
  }

  const reduceMotionToggle = document.getElementById('reduceMotion');
  if (reduceMotionToggle) {
    reduceMotionToggle.addEventListener('change', (e) => {
       window.__DEBUG__?.log(`UI Prefs - Reduce Motion: ${e.target.checked}`);
       document.body.classList.toggle('reduce-motion', e.target.checked);
    });
  }
}
