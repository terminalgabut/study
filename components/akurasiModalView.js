// components/akurasiModalView.js

export const akurasiModalView = {
    renderBase() {
        if (document.getElementById('akurasi-modal-overlay')) return;
        const html = `
            <div id="akurasi-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Analisis & Saran</h3>
                        <button id="close-akurasi-modal" class="close-btn-minimal">&times;</button>
                    </div>
                    <div id="akurasi-modal-body" class="modal-stat-scroll-area">
                        </div>
                </div>
            </div>
        `.trim();
        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    show(progressData) {
        this.renderBase();
        const body = document.getElementById('akurasi-modal-body');

        // Urutkan berdasarkan skor terendah (Asumsi ada field total_score_points atau sejenisnya)
        const lowScoreMateri = progressData
            .filter(p => p.attempts_count > 0)
            .sort((a, b) => a.total_score_points - b.total_score_points)[0];

        let suggestionHTML = '';

        if (!lowScoreMateri) {
            suggestionHTML = `
                <div class="consultation-card">
                    <div class="mentor-icon">🎓</div>
                    <p>"Kamu belum mengambil kuis. Mulailah satu kuis untuk mendapatkan analisis kemampuanmu!"</p>
                </div>
            `;
        } else {
            const isCritical = lowScoreMateri.total_score_points < 50;
            suggestionHTML = `
                <div class="consultation-card ${isCritical ? 'warning' : 'info'}">
                    <div class="mentor-header">
                        <span class="mentor-avatar">👨‍🏫</span>
                        <div>
                            <strong>Saran Belajar</strong>
                            <p style="font-size: 11px; color: var(--text-muted)">Berdasarkan performa terakhir</p>
                        </div>
                    </div>
                    <div class="mentor-bubble">
                        "Halo! Saya melihat kamu agak kesulitan di bab <strong>${lowScoreMateri.bab_title}</strong>. 
                        Skormu di sini paling rendah dibandingkan bab lain."
                    </div>
                    <div class="action-plan">
                        <p>Rekomendasi tindakan:</p>
                        <ul>
                            <li>${isCritical ? 'Baca ulang materi secara perlahan' : 'Coba kerjakan bank soal serupa'}</li>
                            <li>Fokus pada sub-bab yang belum dipahami</li>
                            <li>Gunakan fitur "Ulang Kuis" untuk memperbaiki skor</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        body.innerHTML = suggestionHTML;
        document.getElementById('akurasi-modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    setupEventListeners() {
        const overlay = document.getElementById('akurasi-modal-overlay');
        const closeBtn = document.getElementById('close-akurasi-modal');
        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        closeBtn.onclick = hide;
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
    }
};
