// root/js/lib/iqTrendPreview.js

const chartInstances = {};

export function renderIQTrendPreview(canvasId, iqTrend = []) {
const canvas = document.getElementById(canvasId);
if (!canvas || !Array.isArray(iqTrend) || iqTrend.length === 0) return;

const ctx = canvas.getContext('2d');

// 🔴 FIX INI (WAJIB)
canvas.height ||= 220;

// Destroy existing chart instance
if (chartInstances[canvasId]) {
chartInstances[canvasId].destroy();
}

const values = iqTrend.map(item => item.value);

const min = Math.min(...values);
const max = Math.max(...values);

const first = values[0];
const last = values[values.length - 1];

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
labels: iqTrend.map((item, i) => {
if (item.date) {
const d = new Date(item.date);
return d.toLocaleDateString('id-ID', {
day: 'numeric',
month: 'short'
});
}
return `S${i + 1}`;
}),

datasets: [  
  {  
    label: 'CP Trend',  
    data: iqTrend.map(item => item.value),  // ✅ Ambil .value nya!  
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
      beginAtZero: false,
      grace: '10%', // ✅ padding otomatis (Chart.js v3+)
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
