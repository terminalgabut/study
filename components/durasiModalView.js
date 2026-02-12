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
                        </div>
                    </div>
                </div>
            </div>
        `.trim();

        document.body.insertAdjacentHTML('beforeend', html);
        this.setupEventListeners();
    },

    renderChart(data) {
        const ctx = document.getElementById('durationChart');
        if (!ctx) return;

        // Hancurkan chart lama jika ada (mencegah memory leak/tampilan ganda)
        if (this._chartInstance) {
            this._chartInstance.destroy();
        }

        // Proses data: Kelompokkan detik ke menit per jam (00-23)
        const hourlyData = new Array(24).fill(0);
        data.forEach(session => {
            const hour = new Date(session.created_at).getHours();
            hourlyData[hour] += (session.duration_seconds / 60);
        });

        // Cari jam puncak untuk insight
        const maxVal = Math.max(...hourlyData);
        const peakHour = hourlyData.indexOf(maxVal);
        
        if (maxVal > 0) {
            document.getElementById('peakHourText').textContent = `${peakHour}:00`;
            document.getElementById('durasi-insight-text').textContent = 
                `Kamu paling produktif sekitar jam ${peakHour}. Pertahankan ritme ini!`;
        }

        // Render Chart.js
        this._chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Menit Belajar',
                    data: hourlyData,
                    borderColor: '#4f46e5', // Gunakan warna --accent kamu
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
                    y: { beginAtZero: true, display: false },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    setupEventListeners() {
        if (this._isListenerAttached) return;
        const overlay = document.getElementById('durasi-modal-overlay');
        const closeBtn = document.getElementById('close-durasi-modal');

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
