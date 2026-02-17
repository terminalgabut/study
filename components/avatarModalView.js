// root/components/avatarModalView.js

const log = (...args) =>
  window.__DEBUG__?.log("[avatarModalView]", ...args);

export const avatarModalView = {
  _isListenerAttached: false,

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
                <div class="avatar-placeholder">
                  👤
                </div>
              </div>

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

  show() {
    log("Membuka avatar modal...");
    this.renderBase();

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

    const hide = () => this.hide();

    closeBtn.onclick = hide;
    overlay.onclick = (e) => {
      if (e.target === overlay) hide();
    };

    this._isListenerAttached = true;
  }
};
