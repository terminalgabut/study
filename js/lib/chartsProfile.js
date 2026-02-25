/* =========================================
   UTILITIES
========================================= */

function getCssVar(name, fallback = '#ccc') {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback
  );
}

function resizeBarCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.width * 0.6; // 🔥 ini rasio ideal bar chart

  canvas.width = width;
  canvas.height = height;

  return { width, height };
}

/* =========================================
   RADAR CHART (Cognitive Dimension)
========================================= */

export function renderProfileRadar(canvasId, data) { 
  const canvas = document.getElementById(canvasId);
  if (!canvas || !data?.length) return;

  canvas.onclick = null;
  canvas.onmousemove = null;

  const ctx = canvas.getContext('2d');
  const { width, height } = resizeBarCanvas(canvas);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  const labelsMap = {
    reading: "Reading",
    vocabulary: "Vocabulary",
    reasoning: "Reasoning",
    analogy: "Analogy",
    memory: "Memory"
  };

  const values = data.map(d => d.value || 0);
  const labels = data.map(d => labelsMap[d.dimension] || d.dimension);

  const maxValue = 100;
  const levels = 5;
  const angleStep = (Math.PI * 2) / values.length;
  const points = [];

  ctx.clearRect(0, 0, size, size);

  const borderColor = getCssVar('--border');
  const textColor = getCssVar('--text');

  /* ===== GRID ===== */
  ctx.strokeStyle = borderColor;

  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);
    ctx.beginPath();

    values.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle); 
       i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.stroke();
  }

  /* ===== AXIS ===== */
  values.forEach((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  /* ===== DATA SHAPE ===== */
  ctx.beginPath();

  values.forEach((val, i) => {
    const percent = val / maxValue;
    const r = radius * percent;
    const angle = i * angleStep - Math.PI / 2;

    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle); 
     points.push({
     x,
     y,
     label: labels[i],
     value: val
     });
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke(); 
   points.forEach(p => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
});

  /* ===== LABELS ===== */
  ctx.fillStyle = textColor;
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  labels.forEach((label, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + (radius + 20) * Math.cos(angle);
    const y = centerY + (radius + 20) * Math.sin(angle);
    ctx.fillText(label, x, y);
  });

   // pastikan parent punya position relative
const parent = canvas.parentElement;
if (getComputedStyle(parent).position === 'static') {
  parent.style.position = 'relative';
}

// buat tooltip jika belum ada
let tooltip = parent.querySelector('.radar-tooltip');

if (!tooltip) {
  tooltip = document.createElement('div');
  tooltip.className = 'radar-tooltip';

  // style langsung dari JS
  Object.assign(tooltip.style, {
    position: 'absolute',
    padding: '6px 10px',
    background: '#0f172a',
    color: '#fff',
    fontSize: '12px',
    borderRadius: '6px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
  });

  parent.appendChild(tooltip);
}

   // 🔴 ADD HERE: click detection
canvas.onclick = (e) => {
  const rect = canvas.getBoundingClientRect();
   
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const hitRadius = 12;

  for (const p of points) {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;

    if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
      console.log(`${p.label}: ${Math.round(p.value)}`);
      break;
    }
  }
};

canvas.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  let foundPoint = null;

  for (const p of points) {
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;

    if (Math.sqrt(dx * dx + dy * dy) <= 10) {
      foundPoint = p;
      break;
    }
  }

  if (foundPoint) {
    tooltip.innerHTML = `
      <strong>${foundPoint.label}</strong><br/>
      Score: ${Math.round(foundPoint.value)}
    `;

    tooltip.style.opacity = 1;

    const offset = 14;
    let left = foundPoint.x;
    let top = foundPoint.y - offset;

    const tooltipWidth = tooltip.offsetWidth;
    const canvasWidth = canvas.offsetWidth;

    // clamp kanan
    if (left + tooltipWidth / 2 > canvasWidth) {
      left = canvasWidth - tooltipWidth / 2 - 8;
    }

    // clamp kiri
    if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 8;
    }

     // clamp atas
    if (top < 0) {
       top = foundPoint.y + 20;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    canvas.style.cursor = 'pointer';
  } else {
    tooltip.style.opacity = 0;
    canvas.style.cursor = 'default';
  }
};
}

/* =========================================
   STABILITY BAR CHART
========================================= */

export function renderStabilityChart(canvasId, summary) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !summary) return;

  const ctx = canvas.getContext('2d');
  const size = resizeSquareCanvas(canvas);
  const bars = [];

  const data = [
    { label: "Stability", value: summary.stability_index },
    { label: "Accuracy", value: summary.accuracy_stability },
    { label: "Speed", value: summary.speed_stability },
    { label: "Endurance", value: summary.endurance_index },
    { label: "Consistency", value: summary.error_consistency }
  ];

  const max = 100;
  const padding = 50;
  const gap = 20;
  const totalGap = gap * (data.length - 1);
  const totalBarArea = size - padding * 2 - totalGap;
  const barWidth = totalBarArea / data.length;

  ctx.clearRect(0, 0, size, size);

  const textColor = getCssVar('--text');

  ctx.fillStyle = "#6366f1";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  data.forEach((item, i) => {
    const value = item.value || 0;
    const barHeight = (value / max) * (size - padding * 2);

    const x = padding + i * (barWidth + gap);
    const y = size - padding - barHeight;
     bars.push ({ x, y,
                width: barWidth, 
                 height: barHeight,
                 label: item.label, value 
                });

    // Bar
    ctx.fillRect(x, y, barWidth, barHeight);

    // Value
    ctx.fillStyle = textColor;
    ctx.fillText(`${Math.round(value)}`, x + barWidth / 2, y - 5);

    // Label
    ctx.fillText(item.label, x + barWidth / 2, size - padding + 15);

    ctx.fillStyle = "#6366f1";
  });

   // pastikan parent relative
const parent = canvas.parentElement;
if (getComputedStyle(parent).position === 'static') {
  parent.style.position = 'relative';
}

// buat tooltip jika belum ada
let tooltip = parent.querySelector('.bar-tooltip');

if (!tooltip) {
  tooltip = document.createElement('div');
  tooltip.className = 'bar-tooltip';

  Object.assign(tooltip.style, {
    position: 'absolute',
    padding: '6px 10px',
    background: '#0f172a',
    color: '#fff',
    fontSize: '12px',
    borderRadius: '6px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
  });

  parent.appendChild(tooltip);
}

canvas.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let foundBar = null;

  for (const bar of bars) {
    if (
      mouseX >= bar.x &&
      mouseX <= bar.x + bar.width &&
      mouseY >= bar.y &&
      mouseY <= bar.y + bar.height
    ) {
      foundBar = bar;
      break;
    }
  }

  if (foundBar) {
    tooltip.innerHTML = `
      <strong>${foundBar.label}</strong><br/>
      Score: ${Math.round(foundBar.value)}
    `;

    tooltip.style.opacity = 1;

    const offset = 12;
    let left = foundBar.x + foundBar.width / 2;
    let top = foundBar.y - offset;

    const tooltipWidth = tooltip.offsetWidth;
    const canvasWidth = canvas.offsetWidth;

    // clamp kanan
    if (left + tooltipWidth / 2 > canvasWidth) {
      left = canvasWidth - tooltipWidth / 2 - 8;
    }

    // clamp kiri
    if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 8;
    }

    // kalau terlalu atas
    if (top < 0) {
      top = foundBar.y + foundBar.height + 20;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    canvas.style.cursor = 'pointer';
  } else {
    tooltip.style.opacity = 0;
    canvas.style.cursor = 'default';
  }
};

canvas.onclick = (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (const bar of bars) {
    if (
      mouseX >= bar.x &&
      mouseX <= bar.x + bar.width &&
      mouseY >= bar.y &&
      mouseY <= bar.y + bar.height
    ) {
      console.log(`${bar.label}: ${Math.round(bar.value)}`);
      break;
    }
  }
};
}
