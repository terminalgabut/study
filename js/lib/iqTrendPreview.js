// root/js/lib/iqTrendPreview.js

const chartInstances = {};

export function renderIQTrendPreview(canvasId, iqTrend = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !Array.isArray(iqTrend) || iqTrend.length === 0) return;

  // Pastikan canvas punya tinggi
  if (!canvas.height || canvas.height === 0) {
    canvas.height = 220;
  }

  const ctx = canvas.getContext('2d');

  // Destroy chart lama
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  // Ambil value numerik
  const values = iqTrend
    .map(item => item?.value)
    .filter(v => typeof v === 'number');

  if (values.length === 0) return;

  const min = Math.min(...values);
  const max = Math.max(...values);

  const isUptrend = values[values.length - 1] >= values[0];

  const lineColor = isUptrend ? '#22c55e' : '#ef4444';

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(
    0,
    isUptrend
      ? 'rgba(34,197,94,0.35)'
      : 'rgba(239,68,68,0.35)'
  );
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: iqTrend.map((item, i) =>
        item?.date
          ? new Date(item.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short'
            })
          : `S${i + 1}`
      ),
      datasets: [
        {
          label: 'CP Trend',
          data: values,
          borderColor: lineColor,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
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
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e5e7eb',
          bodyColor: lineColor,
          displayColors: false,
          padding: 10,
          borderColor: '#1e293b',
          borderWidth: 1,
          callbacks: {
            label: ctx => `CP: ${ctx.parsed.y}`
          }
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
