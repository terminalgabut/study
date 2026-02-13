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
                    
                    <div class="chart-wrapper" style="margin-bottom: var(--space-lg); height: 250px;">
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

        // 1. Inisialisasi 2 array (Gunakan nama baru agar sinkron dengan database)
        const readingHourly = new Array(24).fill(0);
        const quizHourly = new Array(24).fill(0);
        const combinedHourly = new Array(24).fill(0);

        data.forEach(session => {
            if (session.created_at) {
                const hour = new Date(session.created_at).getHours();
                const rMin = (Number(session.reading_seconds || 0) / 60);
                const qMin = (Number(session.quiz_seconds || 0) / 60);

                readingHourly[hour] += rMin;
                quizHourly[hour] += qMin;
                combinedHourly[hour] += (rMin + qMin);
            }
        });

        // 2. Logika Peak Hour (Gunakan gabungan keduanya)
        const maxVal = Math.max(...combinedHourly);
        const peakHour = combinedHourly.indexOf(maxVal);
        const peakHourTextEl = document.getElementById('peakHourText');
        const insightTextEl = document.getElementById('durasi-insight-text');

        if (maxVal > 0) {
            if (peakHourTextEl) peakHourTextEl.textContent = `${peakHour.toString().padStart(2, '0')}:00`;
            if (insightTextEl) {
                const isMostlyQuiz = quizHourly.reduce((a,b) => a+b, 0) > readingHourly.reduce((a,b) => a+b, 0);
                insightTextEl.innerHTML = `Kamu paling produktif jam <strong>${peakHour}:00</strong>. ${isMostlyQuiz ? 'Kamu fokus pada latihan soal!' : 'Kamu fokus pada pendalaman materi.'}`;
            }
        } else {
            if (insightTextEl) insightTextEl.textContent = "Belum ada aktivitas belajar hari ini.";
        }

        const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

        this._chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Membaca (m)',
                        data: readingHourly.map(v => parseFloat(v.toFixed(1))),
                        borderColor: '#4f46e5', // Indigo
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Kuis (m)',
                        data: quizHourly.map(v => parseFloat(v.toFixed(1))),
                        borderColor: '#f59e0b', // Amber/Orange
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } },
                    x: {
                        ticks: {
                            callback: function(val, index) { return index % 4 === 0 ? this.getLabelForValue(val) : ''; }
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
