// components/akurasiModalView.js

const log = (...args) => window.__DEBUG__?.log("[akurasiModalView]", ...args);

export const akurasiModalView = {
    _isListenerAttached: false,

    renderBase() {
        if (document.getElementById('akurasi-modal-overlay')) return;

        const html = `
            <div id="akurasi-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Konsultasi Belajar</h3>
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
        log("Membuka sesi konsultasi...");
        this.renderBase();
        
        const body = document.getElementById('akurasi-modal-body');
        const overlay = document.getElementById('akurasi-modal-overlay');

        // Logika Konsultatif: Cari bab dengan skor terendah yang pernah dikerjakan
        const attemptedMateri = progressData.filter(p => p.attempts_count > 0);
        const worstMateri = [...attemptedMateri].sort((a, b) => a.total_score_points - b.total_score_points)[0];

        if (!worstMateri) {
            body.innerHTML = `
                <div class="mentor-card info">
                    <div class="mentor-icon">🎓</div>
                    <p>"Halo! Saya belum melihat riwayat kuismu. Ayo kerjakan satu kuis agar saya bisa memberikan saran belajar yang tepat!"</p>
                </div>
            `;
        } else {
            const isCritical = worstMateri.total_score_points < 60;
            body.innerHTML = `
                <div class="mentor-card ${isCritical ? 'warning' : 'success'}">
                    <div class="mentor-header">
                        <span class="mentor-avatar">${isCritical ? '🧐' : '🌟'}</span>
                        <div>
                            <strong>Analisis Mentor</strong>
                            <p style="font-size: 11px; opacity: 0.8">Berdasarkan Bab: ${worstMateri.bab_title}</p>
                        </div>
                    </div>
                    
                    <div class="mentor-bubble">
                        "Saya perhatikan akurasimu di bab <strong>${worstMateri.bab_title}</strong> 
                        ${isCritical ? 'masih perlu perhatian ekstra' : 'sudah cukup baik, tapi bisa ditingkatkan'}. 
                        Skor terakhirmu adalah <strong>${worstMateri.total_score_points} poin</strong>."
                    </div>

                    <div class="mentor-suggestion">
                        <p><strong>Rencana Aksi:</strong></p>
                        <ul class="suggestion-list">
                            <li>${isCritical ? 'Baca ulang materi fokus pada terminologi sulit' : 'Coba kerjakan variasi soal yang lebih kompleks'}</li>
                            <li>Ulangi kuis tanpa melihat catatan (Metode Active Recall)</li>
                            <li>Gunakan fitur "Materi Diulang" untuk ulasan singkat</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    setupEventListeners() {
        if (this._isListenerAttached) return;
        const overlay = document.getElementById('akurasi-modal-overlay');
        const closeBtn = document.getElementById('close-akurasi-modal');

        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.onclick = hide;
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
        this._isListenerAttached = true;
    }
};
