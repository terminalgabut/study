// root/components/avatarModalView.js

const log = (...args) =>
  window.__DEBUG__?.log("[avatarModalView]", ...args);

export const avatarModalView = {
  _isListenerAttached: false,
  _onUpload: null,
  _onRemove: null,

  renderBase() {
    if (document.getElementById("avatar-modal-overlay")) return;

    const html = `
      <div id="avatar-modal-overlay" class="modal-stat-overlay">
        <div class="modal-stat-content">
          <div class="modal-stat-header">
            <h3>Foto Profil</h3>
            <button id="close-avatar-modal" class="close-btn-minimal">&times;</button>
          </div>

          <div class="modal-stat-scroll-area">
            <div class="avatar-modal-body">

              <div class="avatar-preview">
                <div class="avatar-placeholder" id="avatarPreview">
                  👤
                </div>
              </div>

              <!-- hidden file input -->
              <input
                type="file"
                id="avatarFileInput"
                accept="image/*"
                hidden
              />

              <button class="primary-btn" id="uploadAvatarBtn">
                Upload Foto
              </button>

              <button class="secondary-btn" id="removeAvatarBtn">
                Hapus Foto
              </button>

            </div>
          </div>
        </div>
      </div>
    `.trim();

    document.body.insertAdjacentHTML("beforeend", html);
    this.setupEventListeners();
  },

  show(payload = {}) {
    log("Membuka avatar modal...");
    this.renderBase();

    // simpan callback dari controller
    this._onUpload = payload.onUpload || null;
    this._onRemove = payload.onRemove || null;

    // preview avatar lama (kalau ada)
    if (payload.profile?.avatar_url) {
      const preview = document.getElementById("avatarPreview");
      preview.innerHTML = `<img src="${payload.profile.avatar_url}" />`;
    }

    const overlay = document.getElementById("avatar-modal-overlay");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  hide() {
    const overlay = document.getElementById("avatar-modal-overlay");
    if (!overlay) return;

    overlay.classList.remove("active");
    document.body.style.overflow = "";
  },

  setupEventListeners() {
    if (this._isListenerAttached) return;

    const overlay = document.getElementById("avatar-modal-overlay");
    const closeBtn = document.getElementById("close-avatar-modal");

    const uploadBtn = document.getElementById("uploadAvatarBtn");
    const removeBtn = document.getElementById("removeAvatarBtn");
    const fileInput = document.getElementById("avatarFileInput");
    const preview = document.getElementById("avatarPreview");

    const hide = () => this.hide();

    // close
    closeBtn.onclick = hide;
    overlay.onclick = (e) => {
      if (e.target === overlay) hide();
    };

    // klik upload → buka file picker
    uploadBtn.onclick = () => {
      fileInput.click();
    };

    // file dipilih
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;

      // preview langsung
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" />`;

      // kirim ke controller
      this._onUpload?.(file);
    };

    // hapus avatar
    removeBtn.onclick = () => {
      this._onRemove?.();
    };

    this._isListenerAttached = true;
  }
};
