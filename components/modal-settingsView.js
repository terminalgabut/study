export const modal-settingsView = `
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

  <div class="modal-section">
    <p class="section-title">Perilaku</p>

    <div class="setting-item">
      <div>
        <span class="setting-title">Auto Save</span>
        <small class="setting-desc">Simpan progres otomatis</small>
      </div>
      <label class="switch">
        <input type="checkbox" id="autoSave">
        <span class="slider"></span>
      </label>
    </div>
  </div>

  <div class="modal-footer">
    <span class="version">Study App v1.0.0</span>
  </div>
</div>
`;
