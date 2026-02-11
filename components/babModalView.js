// components/babModalView.js

/**
 * Guard & Helper untuk Debugging
 * Mencegah error jika window.__DEBUG__ belum didefinisikan di app.js
 */
const log = (...args) => window.__DEBUG__?.log("[babModalView]", ...args);
const error = (...args) => window.__DEBUG__?.error("[babModalView]", ...args);

export const babModalView = {
    _isListenerAttached: false,

    show(progressData, allCategories) {
        log("Mencoba menampilkan modal...");
        
        // Pastikan panggung (HTML dasar) sudah ada
        this.renderBase();
        
        const bodyEl = document.getElementById('bab-modal-body');
        const overlayEl = document.getElementById('bab-modal-overlay');

        if (!bodyEl || !overlayEl) {
            error("Gagal menampilkan: Elemen DOM tidak ditemukan.");
            return;
        }

        // Render isi data
        bodyEl.innerHTML = this.generateContent(progressData, allCategories);
        
        // Tampilkan dengan class CSS
        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        log("Modal berhasil ditampilkan.");
    },

    renderBase() {
        if (document.getElementById('bab-modal-overlay')) return;

        log("Menyuntikkan struktur modal ke body.");

        const html = `
            <div id="bab-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Progres Materi</h3>
                        <button id="close-bab-modal" class="close-btn-minimal" aria-label="Close">&times;</button>
                    </div>
                    <div id="bab-modal-body" class="modal-stat-scroll-area"></div>
                </div>
            </div>
        `.trim();
        
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    generateContent(progressData = [], allCategories = []) {
        if (!Array.isArray(progressData) || !Array.isArray(allCategories)) {
            return '<div class="bab-text-empty">Format data tidak valid.</div>';
        }

        if (allCategories.length === 0) {
            return '<div class="bab-text-empty">Belum ada kategori yang dipelajari.</div>';
        }

        // Gunakan pembersihan data sederhana untuk keamanan
        return allCategories
            .filter(cat => cat) // Buang kategori null/undefined
            .sort()
            .map(cat => {
                const completedInCat = progressData.filter(item => item.category === cat);
                const count = completedInCat.length;
                const total = 10; // Nilai statis sesuai permintaan sebelumnya
                const isEmpty = count === 0;

                return `
                    <div class="cat-group">
                        <div class="cat-label ${isEmpty ? 'text-muted' : ''}">
                            <span class="cat-name">${cat}</span>
                            <span class="cat-ratio">${count}/${total}</span>
                        </div>
                        ${!isEmpty ? `
                            <div class="bab-item-list">
                                ${completedInCat.map(bab => `
                                    <div class="bab-text-row">${bab.bab_title || 'Tanpa Judul'}</div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="bab-text-empty">Belum ada materi dipelajari</div>
                        `}
                    </div>
                `;
            }).join('');
    },

    setupEventListeners() {
        if (this._isListenerAttached) return;

        const overlay = document.getElementById('bab-modal-overlay');
        const closeBtn = document.getElementById('close-bab-modal');

        if (!overlay || !closeBtn) return;

        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Click Event
        closeBtn.onclick = (e) => { e.stopPropagation(); hide(); };
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
        
        // Escape Key Event
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        });

        this._isListenerAttached = true;
        log("Event listeners berhasil dipasang.");
    }
};
