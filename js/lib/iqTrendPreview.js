// root/js/lib/iqTrendPreview.js

let trendInstance = null;

export function renderIQTrendPreview(canvasId, iqTrend = []) {
  const el = document.getElementById(canvasId);
  if (!el || !iqTrend.length) return;

  if (trendInstance) {
    trendInstance.destroy();
  }

  trendInstance = new Chart(el.getContext('2d'), {
    type: 'line',
    data: {
      labels: iqTrend.map((_, i) => i + 1),
      datasets: [{
        data: iqTrend,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.4,          // smooth seperti crypto
        pointRadius: 0,        // tanpa titik
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#020617',
          titleColor: '#e5e7eb',
          bodyColor: '#93c5fd',
          displayColors: false
        }
      },
      scales: {
        x: { display: false },
        y: {
          ticks: {
            color: '#64748b',
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(255,255,255,0.04)'
          }
        }
      }
    }
  });
}
