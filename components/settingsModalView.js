// root/components/settingsModalView.js

export const settingsModalView = `
<div class="modal-settings" id="settingsModal">
  <div class="modal-header">
    <h3>Pengaturan</h3>
  </div>
  <div class="modal-section">
    <p class="section-title">Tampilan</p>
    <div class="setting-item">
      <div>
        <span class="setting-title">Dark Mode</span>
        <small class="setting-desc">Tema gelap untuk kenyamanan mata</small>
      </div>
      <label class="switch">
        <input type="checkbox" id="darkMode">
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-item">
      <div>
        <span class="setting-title">Reduce Motion</span>
        <small class="setting-desc">Kurangi animasi UI</small>
      </div>
      <label class="switch">
        <input type="checkbox" id="reduceMotion">
        <span class="slider"></span>
      </label>
    </div>
  </div>
  <div class="modal-footer">
    <span class="version">Study App v1.0.0</span>
  </div>
</div>
`;

export function initSettingsModal() {
  window.__DEBUG__?.log('initSettingsModal() - Menyiapkan listener...');

  // Kita gunakan pendekatan Event Delegation di level document
  // Agar tidak masalah jika elemen disuntikkan belakangan
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    const settingsBtn = e.target.closest('#settingsBtn');

    // 1. Logika Klik Tombol Gear (Open/Toggle)
    if (settingsBtn) {
      if (!modal) {
        window.__DEBUG__?.error('initSettingsModal - Klik terdeteksi tapi #settingsModal tidak ada di DOM');
        return;
      }
      e.stopPropagation();
      modal.classList.toggle('show');
      window.__DEBUG__?.log('Settings Modal Toggled:', modal.classList.contains('show'));
      return;
    }

    // 2. Logika Klik Luar (Close)
    if (modal && modal.classList.contains('show')) {
      if (!modal.contains(e.target)) {
        modal.classList.remove('show');
        window.__DEBUG__?.log('Settings Modal Closed (Klik luar)');
      }
    }
  });

  // 3. Logika Switch (Gunakan delegation juga agar aman)
  document.addEventListener('change', (e) => {
    if (e.target.id === 'darkMode') {
      const isDark = e.target.checked;
      document.body.classList.toggle('dark-mode', isDark);
      window.__DEBUG__?.log('Dark Mode changed:', isDark);
    }
    
    if (e.target.id === 'reduceMotion') {
      document.body.classList.toggle('reduce-motion', e.target.checked);
      window.__DEBUG__?.log('Reduce Motion changed:', e.target.checked);
    }
  });
}
