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

        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';

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

        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    renderChart(data = []) {
        const ctx = document.getElementById('durationChart');
        if (!ctx) return;

        if (this._chartInstance) {
            this._chartInstance.destroy();
        }

        const hourlyData = new Array(24).fill(0);
        data.forEach(session => {
            if (session.created_at) {
                const hour = new Date(session.created_at).getHours();
                hourlyData[hour] += (session.duration_seconds / 60);
            }
        });

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
                    borderColor: '#4f46e5',
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
        if (this._isListenerAttached) return;
        
        const overlay = document.getElementById('durasi-modal-overlay');
        const closeBtn = document.getElementById('close-durasi-modal');

        if (!overlay || !closeBtn) return;

        const hide = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.onclick = (e) => { e.stopPropagation(); hide(); };
        overlay.onclick = (e) => { if (e.target === overlay) hide(); };
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) hide();
        });

        this._isListenerAttached = true;
    }
};
