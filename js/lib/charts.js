// root/js/lib/charts.js

/**
 * Variabel privat untuk menyimpan instance Chart.js
 * agar bisa di-destroy sebelum render ulang.
 */
let instances = {
    trend: null,
    category: null
};

export const chartLib = {
    /**
     * 1. Grafik Efektivitas (Horizontal Bar Chart)
     * Menampilkan perbandingan Poin Kuis vs Menit Baca
     */
    renderTrendChart(canvasId, progressData = []) {
        const el = document.getElementById(canvasId);
        if (!el) return;

        // Bersihkan instance lama jika ada
        if (instances.trend) {
            instances.trend.destroy();
        }

        // Ambil 7 data terbaru agar grafik tidak sesak
        const limitedData = [...progressData]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 7)
            .reverse(); // Balik agar yang terbaru di bawah

        instances.trend = new Chart(el.getContext('2d'), {
            type: 'bar',
            data: {
                labels: limitedData.map(p => 
                    p.bab_title && p.bab_title.length > 20 
                        ? p.bab_title.substring(0, 20) + '...' 
                        : (p.bab_title || 'Materi')
                ),
                datasets: [
                    { 
                        label: 'Poin Kuis', 
                        data: limitedData.map(p => p.total_score_points || 0), 
                        backgroundColor: '#38bdf8', // Accent Blue
                        borderRadius: 4,
                        barThickness: 12
                    },
                    { 
                        label: 'Menit Baca', 
                        data: limitedData.map(p => {
                        const totalDetik = Number(p.total_reading_seconds || 0) + Number(p.total_quiz_seconds || 0);
                        return Math.round(totalDetik / 60); // Gunakan Round agar 50 detik dihitung 1 menit
                        }),
                        backgroundColor: '#10b981', // Success Green
                        borderRadius: 4,
                        barThickness: 12
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { size: 11 }, padding: 20 }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: { 
                        beginAtZero: true,
                        ticks: { color: '#64748b', font: { size: 10 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: { 
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    },

    /**
     * 2. Grafik Distribusi (Doughnut Chart)
     * Menampilkan persebaran poin berdasarkan kategori materi
     */
    renderCategoryChart(canvasId, progressData = []) {
        const el = document.getElementById(canvasId);
        if (!el) return;

        if (instances.category) {
            instances.category.destroy();
        }

        // Agregasi poin per kategori
        const catMap = {};
        progressData.forEach(p => { 
            const cat = p.category || 'Lainnya';
            catMap[cat] = (catMap[cat] || 0) + (p.total_score_points || 0); 
        });

        const labels = Object.keys(catMap);
        const values = Object.values(catMap);

        instances.category = new Chart(el.getContext('2d'), {
            type: 'doughnut',
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: 10
                }] 
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // Membuat tampilan doughnut lebih modern/tipis
                plugins: {
                    legend: {
                        position: 'left',
                        labels: { 
                            color: '#e2e8f0', 
                            boxWidth: 10, 
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                },
                layout: {
                    padding: { right: 20 }
                }
            }
        });
    }
};
