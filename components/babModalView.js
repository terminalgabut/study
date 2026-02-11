// components/babModalView.js

export const babModalView = {
    // Properti internal untuk melacak state listener agar tidak double
    _isListenerAttached: false,

    show(progressData, allCategories) {
        // 1. Guard: Pastikan base sudah ada sebelum manipulasi isi
        this.renderBase();
        
        const bodyEl = document.getElementById('bab-modal-body');
        const overlayEl = document.getElementById('bab-modal-overlay');

        if (!bodyEl || !overlayEl) {
            window.__DEBUG__.error("Elemen modal tidak ditemukan di DOM");
            return;
        }

        const content = this.generateContent(progressData, allCategories);
        bodyEl.innerHTML = content;
        overlayEl.classList.add('active');
        
        // Kunci scroll body utama saat modal buka
        document.body.style.overflow = 'hidden';
    },

    renderBase() {
        // Guard 1: Cek apakah elemen sudah ada di DOM
        if (document.getElementById('bab-modal-overlay')) return;

        window.__DEBUG__.log("Menyuntikkan Base BabModal ke DOM");

        const html = `
            <div id="bab-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Progres Materi</h3>
                        <button id="close-bab-modal" class="close-btn-minimal">&times;</button>
                    </div>
                    <div id="bab-modal-body" class="modal-stat-scroll-area"></div>
                </div>
            </div>
        `;
        
        // Masukkan ke body untuk menghindari masalah z-index di layout SPA
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    generateContent(progressData = [], allCategories = []) {
        // Guard 2: Pastikan data adalah array untuk menghindari crash .map()
        if (!Array.isArray(progressData) || !Array.isArray(allCategories)) {
            return '<div class="bab-text-empty">Data tidak tersedia.</div>';
        }

        if (allCategories.length === 0) {
            return '<div class="bab-text-empty">Belum ada kategori materi.</div>';
        }

        return allCategories.sort().map(cat => {
            const completedInCat = progressData.filter(item => item.category === cat);
            const count = completedInCat.length;
            const total = 10; 
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
                                <div class="bab-text-row">${bab.bab_title || 'Materi Tanpa Judul'}</div>
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
        // Guard 3: Jangan pasang listener berkali-kali (Event Leak)
        if (this._isListenerAttached) return;

        const overlay = document.getElementById('bab-modal-overlay');
        const closeBtn = document.getElementById('close-bab-modal');

        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Kembalikan scroll body
        };

        if (closeBtn) closeBtn.onclick = hide;

        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) hide();
            };
        }
        
        // Shortcut Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        });

        this._isListenerAttached = true;
        window.__DEBUG__.log("Event Listeners BabModal berhasil dipasang");
    }
};
