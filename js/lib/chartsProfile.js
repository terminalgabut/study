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

function resizeSquareCanvas(canvas) {
  const size = canvas.parentElement.offsetWidth;
  canvas.width = size;
  canvas.height = size;
  return size;
}

/* =========================================
   RADAR CHART (Cognitive Dimension)
========================================= */

export function renderProfileRadar(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !data?.length) return;

  const ctx = canvas.getContext('2d');
  const size = resizeSquareCanvas(canvas);

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

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

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
}

/* =========================================
   STABILITY BAR CHART
========================================= */

export function renderStabilityChart(canvasId, summary) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !summary) return;

  const ctx = canvas.getContext('2d');
  const size = resizeSquareCanvas(canvas);

  const data = [
    { label: "Stability", value: summary.stability_index },
    { label: "Accuracy", value: summary.accuracy_stability },
    { label: "Speed", value: summary.speed_stability },
    { label: "Endurance", value: summary.endurance_index },
    { label: "Consistency", value: summary.error_consistency }
  ];

  const max = 100;
  const padding = 50;
  const barWidth = (size - padding * 2) / data.length - 20;

  ctx.clearRect(0, 0, size, size);

  const textColor = getCssVar('--text');

  ctx.fillStyle = "#6366f1";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  data.forEach((item, i) => {
    const value = item.value || 0;
    const barHeight = (value / max) * (size - padding * 2);

    const x = padding + i * (barWidth + 20);
    const y = size - padding - barHeight;

    // Bar
    ctx.fillRect(x, y, barWidth, barHeight);

    // Value
    ctx.fillStyle = textColor;
    ctx.fillText(`${Math.round(value)}`, x + barWidth / 2, y - 5);

    // Label
    ctx.fillText(item.label, x + barWidth / 2, size - padding + 15);

    ctx.fillStyle = "#6366f1";
  });
}
