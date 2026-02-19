// root/js/lib/iqTrendPreview.js

const chartInstances = {};

export function renderIQTrendPreview(canvasId, iqTrend = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !Array.isArray(iqTrend) || iqTrend.length === 0) return;

  const ctx = canvas.getContext('2d');

  // Destroy existing chart instance
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const min = Math.min(...iqTrend);
  const max = Math.max(...iqTrend);

  const first = iqTrend[0];
  const last = iqTrend[iqTrend.length - 1];

  const isUptrend = last >= first;

  // Dynamic crypto color
  const lineColor = isUptrend ? '#22c55e' : '#ef4444';

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(
    0,
    isUptrend
      ? 'rgba(34,197,94,0.35)'
      : 'rgba(239,68,68,0.35)'
  );
  gradient.addColorStop(
    1,
    isUptrend
      ? 'rgba(34,197,94,0.02)'
      : 'rgba(239,68,68,0.02)'
  );

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: iqTrend.map((_, i) => `D${i + 1}`),
      datasets: [
        {
          label: 'CP Trend (7 Hari Terakhir)',
          data: iqTrend,
          borderColor: lineColor,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,       // smooth curve
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
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e5e7eb',
          bodyColor: lineColor,
          displayColors: false,
          padding: 10,
          borderColor: '#1e293b',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `CP: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: false,
          grid: {
            color: 'rgba(255,255,255,0.03)'
          }
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
