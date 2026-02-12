// components/ulangModalView.js

export const ulangModalView = {
    renderBase() {
        if (document.getElementById('ulang-modal-overlay')) return;
        const html = `
            <div id="ulang-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Analisis Pengulangan</h3>
                        <button id="close-ulang-modal" class="close-btn-minimal">&times;</button>
                    </div>
                    <div id="ulang-modal-body" class="modal-stat-scroll-area">
                        </div>
                    <div class="modal-footer-insight">
                        <small id="ulang-footer-text">Materi di atas adalah area yang paling sering kamu ulas.</small>
                    </div>
                </div>
            </div>
        `.trim();
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    show(progressData) {
        this.renderBase();
        const body = document.getElementById('ulang-modal-body');
        
        // Filter & Sort: Ambil materi yang dibaca > 1 kali, urutkan dari yang terbanyak
        const repeatedMateri = progressData
            .filter(p => p.read_count > 1)
            .sort((a, b) => b.read_count - a.read_count);

        if (repeatedMateri.length === 0) {
            body.innerHTML = `<div class="bab-text-empty">Belum ada materi yang kamu ulang. Terus semangat!</div>`;
        } else {
            body.innerHTML = repeatedMateri.map(m => `
                <div class="cat-group">
                    <div class="cat-label">
                        <span>${m.category}</span>
                        <span class="cat-ratio">${m.read_count}x Dibaca</span>
                    </div>
                    <div class="bab-text-row">
                        <strong>${m.bab_title}</strong><br>
                        <span style="font-size: 11px; color: var(--text-muted)">
                            Terakhir diulas: ${new Date(m.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('ulang-modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    setupEventListeners() {
        const overlay = document.getElementById('ulang-modal-overlay');
        const closeBtn = document.getElementById('close-ulang-modal');
        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        closeBtn.onclick = hide;
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
    }
};
