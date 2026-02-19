// root/js/lib/iqTrendPreview.js

const chartInstances = {};

export function renderIQTrendPreview(canvasId, iqTrend = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !Array.isArray(iqTrend) || iqTrend.length === 0) return;

  const ctx = canvas.getContext('2d');

  // Destroy existing instance (per canvas)
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  // Calculate dynamic Y range for stability
  const min = Math.min(...iqTrend);
  const max = Math.max(...iqTrend);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: iqTrend.map((_, i) => `S${i + 1}`),
      datasets: [
        {
          data: iqTrend,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#020617',
          titleColor: '#e5e7eb',
          bodyColor: '#93c5fd',
          displayColors: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          suggestedMin: min - 5,
          suggestedMax: max + 5,
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
