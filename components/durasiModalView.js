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

    // 1. Inisialisasi 24 jam (0-23)
    const hourlyData = new Array(24).fill(0);
    
    data.forEach(session => {
        if (session.created_at) {
            const date = new Date(session.created_at);
            const hour = date.getHours(); 
            // Konversi ke menit dan tambahkan ke array sesuai jamnya
            hourlyData[hour] += (Number(session.duration_seconds || 0) / 60);
        }
    });

    // 2. Buat Label 00:00 sampai 23:00
    const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    // --- TAMBAHKAN LOGIKA INI ---
    const maxVal = Math.max(...hourlyData);
    const peakHour = hourlyData.indexOf(maxVal);
    const peakHourTextEl = document.getElementById('peakHourText');
    const insightTextEl = document.getElementById('durasi-insight-text');

    if (maxVal > 0) {
        if (peakHourTextEl) peakHourTextEl.textContent = `${peakHour.toString().padStart(2, '0')}:00`;
        if (insightTextEl) insightTextEl.textContent = `Kamu paling produktif sekitar jam ${peakHour}. Pertahankan ritme ini!`;
    } else {
        if (insightTextEl) insightTextEl.textContent = "Belum ada aktivitas belajar yang tercatat.";
    }
    // ----------------------------

    this._chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Menit Belajar',
                data: hourlyData.map(val => parseFloat(val.toFixed(1))), // Batasi desimal agar rapi
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHitRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Durasi: ${context.parsed.y} menit`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Menit', font: { size: 10 } },
                    ticks: { maxTicksLimit: 5 }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 0,
                        // Menampilkan label setiap 3 jam agar tidak sesak di mobile
                        callback: function(val, index) {
                            return index % 3 === 0 ? this.getLabelForValue(val) : '';
                        }
                    }
                }
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
