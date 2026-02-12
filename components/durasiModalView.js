// components/durasiModalView.js

const log = (...args) => window.__DEBUG__?.log("[durasiModalView]", ...args);
const error = (...args) => window.__DEBUG__?.error("[durasiModalView]", ...args);

export const durasiModalView = {
    _isListenerAttached: false,
    _chartInstance: null,

    show(sessionData) {
        log("Mencoba menampilkan modal durasi...");
        this.renderBase();
        
        const overlayEl = document.getElementById('durasi-modal-overlay');
        if (!overlayEl) return error("Overlay tidak ditemukan.");

        // Tampilkan modal
        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Render Grafik
        this.renderChart(sessionData);
        log("Modal durasi berhasil ditampilkan.");
    },

    renderBase() {
        if (document.getElementById('durasi-modal-overlay')) return;

        const html = `
            <div id="durasi-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Tren Aktivitas</h3>
                        <button id="close-durasi-modal" class="close-btn-minimal" aria-label="Close">&times;</button>
                    </div>
                    
                    <div class="chart-wrapper">
                        <canvas id="durationChart"></canvas>
                    </div>

                    <div id="durasi-modal-body" class="modal-stat-scroll-area">
                        <div class="cat-group">
                            <div class="cat-label">
                                <span>Insight Fokus</span>
                                <span id="peakHourText" class="cat-ratio">--:--</span>
                            </div>
                            <div id="durasi-insight-text" class="bab-text-row">
                                Menganalisis waktu belajar kamu...
                            </div>
// components/durasiModalView.js

const log = (...args) => window.__DEBUG__?.log("[durasiModalView]", ...args);
const error = (...args) => window.__DEBUG__?.error("[durasiModalView]", ...args);

export const durasiModalView = {
    _isListenerAttached: false,
    _chartInstance: null,

    /**
     * Menampilkan modal durasi dengan grafik Chart.js
     * @param {Array} sessionData - Data dari tabel learning_sessions
     */
    show(sessionData = []) {
        log("Mencoba menampilkan modal durasi...");
        this.renderBase();
        
        const overlayEl = document.getElementById('durasi-modal-overlay');
        if (!overlayEl) return error("Overlay tidak ditemukan.");

        // Aktifkan modal (Sesuai alur modal-bab.css)
        overlayEl.classList.add('active'); [cite: 4, 46]
        document.body.style.overflow = 'hidden'; [cite: 46]

        // Render Grafik
        this.renderChart(sessionData);
        log("Modal durasi berhasil ditampilkan.");
    },

    renderBase() {
        if (document.getElementById('durasi-modal-overlay')) return; [cite: 47]

        // Menggunakan struktur .modal-stat-content yang konsisten dengan babModalView [cite: 48, 49]
        const html = `
            <div id="durasi-modal-overlay" class="modal-stat-overlay">
                <div class="modal-stat-content">
                    <div class="modal-stat-header">
                        <h3>Tren Aktivitas</h3>
                        <button id="close-durasi-modal" class="close-btn-minimal" aria-label="Close">&times;</button>
                    </div>
                    
                    <div class="chart-wrapper" style="margin-bottom: var(--space-lg);">
                        <canvas id="durationChart"></canvas>
                    </div>

                    <div id="durasi-modal-body" class="modal-stat-scroll-area">
                        <div class="cat-group">
                            <div class="cat-label">
                                <span>Insight Fokus</span>
                                <span id="peakHourText" class="cat-ratio">--:--</span>
                            </div>
                            <div id="durasi-insight-text" class="bab-text-row">
                                Menganalisis waktu belajar kamu...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `.trim();

        document.body.insertAdjacentHTML('beforeend', html); [cite: 50]
        this.setupEventListeners();
    },

    renderChart(data) {
        const ctx = document.getElementById('durationChart');
        if (!ctx) return;

        // Bersihkan instance lama jika ada (Sesuai best practice Chart.js)
        if (this._chartInstance) {
            this._chartInstance.destroy();
        }

        // Proses data 24 jam (Gunakan menit untuk sumbu Y)
        const hourlyData = new Array(24).fill(0);
        data.forEach(session => {
            const hour = new Date(session.created_at).getHours();
            hourlyData[hour] += (session.duration_seconds / 60);
        });

        // Update Insight (Gunakan .cat-ratio untuk tabular-nums) 
        const maxVal = Math.max(...hourlyData);
        const peakHour = hourlyData.indexOf(maxVal);
        
        if (maxVal > 0) {
            document.getElementById('peakHourText').textContent = `${peakHour}:00`;
            document.getElementById('durasi-insight-text').textContent = 
                `Kamu paling produktif sekitar jam ${peakHour}. Pertahankan ritme ini!`;
        }

        this._chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Menit Belajar',
                    data: hourlyData,
                    borderColor: '#4f46e5', // var(--accent) [cite: 14, 24]
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, display: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    setupEventListeners() {
        if (this._isListenerAttached) return; [cite: 59]
        const overlay = document.getElementById('durasi-modal-overlay');
        const closeBtn = document.getElementById('close-durasi-modal');

        const hide = () => {
            overlay.classList.remove('active'); [cite: 61]
            document.body.style.overflow = ''; [cite: 62]
        };

        closeBtn.onclick = (e) => { e.stopPropagation(); hide(); }; [cite: 62]
        overlay.onclick = (e) => { if (e.target === overlay) hide(); }; [cite: 63]
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        }); [cite: 64]

        this._isListenerAttached = true;
    }
};
