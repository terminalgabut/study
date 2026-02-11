// compenents/babModalView.js

export const babModalView = {
    /**
     * Fungsi utama untuk menampilkan modal
     * @param {Array} progressData - Data bab yang sudah dipelajari
     * @param {Array} allCategories - Daftar semua kategori di sistem
     */
    show(progressData, allCategories) {
        this.renderBase();
        const content = this.generateContent(progressData, allCategories);
        document.getElementById('bab-modal-body').innerHTML = content;
        document.getElementById('bab-modal-overlay').classList.add('active');
    },

    // Membuat kerangka dasar modal jika belum ada
    renderBase() {
        if (document.getElementById('bab-modal-overlay')) return;

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
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    // Mengolah data menjadi HTML (Minimalis Teks & Rasio)
    generateContent(progressData, allCategories) {
        // Urutkan kategori secara alfabetis
        return allCategories.sort().map(cat => {
            const completedInCat = progressData.filter(item => item.category === cat);
            const count = completedInCat.length;
            const total = 10; // Placeholder, nanti bisa dinamis
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
                                <div class="bab-text-row">${bab.bab_title}</div>
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
        const overlay = document.getElementById('bab-modal-overlay');
        const closeBtn = document.getElementById('close-bab-modal');

        const hide = () => overlay.classList.remove('active');

        closeBtn.onclick = hide;
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
        
        // Menutup dengan tombol Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        });
    }
};
