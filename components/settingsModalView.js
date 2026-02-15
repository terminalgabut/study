// root/components/settingsModalView.js

const log = (...args) => window.__DEBUG__?.log("[settingsModalView]", ...args);

export const settingsModalView = {
    _isListenerAttached: false,

    // Kita gunakan renderBase sebagai entry point utama
    renderBase() {
        if (document.getElementById('settingsModal')) return;

        log("Menyuntikkan struktur modal ke body.");

        const html = `
            <div id="settingsModal" class="modal-settings">
                <div class="modal-header">
                    <h3>Pengaturan</h3>
                </div>
                <div class="modal-body">
                    <div class="setting-item">
                        <span>Dark Mode</span>
                        <label class="switch">
                            <input type="checkbox" id="darkMode">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `.trim();
        
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    setupEventListeners() {
        if (this._isListenerAttached) return;

        const modal = document.getElementById('settingsModal');
        
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#settingsBtn');
            if (btn) {
                e.stopPropagation();
                modal.classList.toggle('show');
                log("Modal toggled");
            } else if (modal.classList.contains('show') && !modal.contains(e.target)) {
                modal.classList.remove('show');
            }
        });

        // Contoh listener untuk dark mode di dalam modal
        const darkToggle = document.getElementById('darkMode');
        if (darkToggle) {
            darkToggle.onchange = (e) => {
                document.body.classList.toggle('dark-mode', e.target.checked);
                log("Dark mode:", e.target.checked);
            };
        }

        this._isListenerAttached = true;
        log("Event listeners berhasil dipasang.");
    }
};
