/* =========================================
   UTILITIES
========================================= */

function getCssVar(name, fallback = '#ccc') {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim() || fallback;
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return rect;
}

function getOrCreateTooltip(parent, className) {
  let tooltip = parent.querySelector(`.${className}`);
  if (tooltip) return tooltip;

  tooltip = document.createElement('div');
  tooltip.className = className;
  parent.appendChild(tooltip);
  return tooltip;
}

/* =========================================
   RADAR CHART (Cognitive Dimension)
========================================= */

export function renderProfileRadar(id, data) {
  const canvas = document.getElementById(id);
  if (!canvas || !data?.length) return;

  const ctx = canvas.getContext('2d');
  const { width, height } = resizeCanvas(canvas);

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.38;
  const angleStep = (Math.PI * 2) / data.length;

  const labelsMap = {
    reading: "Reading",
    vocabulary: "Vocabulary",
    reasoning: "Reasoning",
    analogy: "Analogy",
    memory: "Memory"
  };

  const points = data.map((d, i) => {
    const val = d.value || 0;
    const angle = i * angleStep - Math.PI / 2;
    return {
      label: labelsMap[d.dimension] || d.dimension,
      value: val,
      x: center.x + Math.cos(angle) * radius * (val / 100),
      y: center.y + Math.sin(angle) * radius * (val / 100)
    };
  });

  ctx.clearRect(0, 0, width, height);

  drawRadarGrid(ctx, center, radius, data.length);
  drawRadarShape(ctx, points);
  drawRadarLabels(ctx, center, radius, points);

  attachRadarInteraction(canvas, points);
}

  /* ===== DRAW HELPERS ===== */

  function drawRadarGrid(ctx, c, r, count) {
  const step = (Math.PI * 2) / count;
  ctx.strokeStyle = getCssVar('--border');

  for (let lvl = 1; lvl <= 5; lvl++) {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const angle = i * step - Math.PI / 2;
      const x = c.x + Math.cos(angle) * r * (lvl / 5);
      const y = c.y + Math.sin(angle) * r * (lvl / 5);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawRadarShape(ctx, points) {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();

  ctx.fillStyle = "rgba(56,189,248,0.25)";
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
}

function drawRadarLabels(ctx, c, r, points) {
  ctx.fillStyle = getCssVar('--text');
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';

  points.forEach((p, i) => {
    const angle = i * (Math.PI * 2 / points.length) - Math.PI / 2;
    ctx.fillText(
      p.label,
      c.x + Math.cos(angle) * (r + 18),
      c.y + Math.sin(angle) * (r + 18)
    );
  });
}

  /* ===== INTERACTION ===== */
function attachRadarInteraction(canvas, points) {
  const parent = canvas.parentElement;
  parent.style.position ||= 'relative';

  const tooltip = getOrCreateTooltip(parent, 'radar-tooltip');

  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = points.find(p => Math.hypot(x - p.x, y - p.y) < 10);

    if (!hit) return tooltip.style.opacity = 0;

    tooltip.innerHTML = `<b>${hit.label}</b><br/>${Math.round(hit.value)}`;
    tooltip.style.opacity = 1;

    tooltip.style.left = `${Math.min(
    canvas.offsetWidth - 20,
    Math.max(20, hit.x) 
    )}px`;
    tooltip.style.top = `${hit.y - 14}px`;
}
}
  

/* =========================================
   STABILITY BAR CHART
========================================= */

export function renderStabilityChart(id, summary) {
  const canvas = document.getElementById(id);
  if (!canvas || !summary) return;

  const ctx = canvas.getContext('2d');
  const { width, height } = resizeCanvas(canvas);

  const data = [
    ["Stability", summary.stability_index],
    ["Accuracy", summary.accuracy_stability],
    ["Speed", summary.speed_stability],
    ["Endurance", summary.endurance_index],
    ["Consistency", summary.error_consistency]
  ];

  drawBarChart(ctx, canvas, data, width, height);
}

    /* ===== BAR DRAW ===== */
function drawBarChart(ctx, canvas, data, w, h) {
  const padding = 40;
  const gap = 16;
  const barW = (w - padding * 2 - gap * (data.length - 1)) / data.length;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#6366f1";
  ctx.textAlign = 'center';
  ctx.font = '12px system-ui';

  data.forEach(([label, val], i) => {
    const barH = (val / 100) * (h - padding * 2);
    const x = padding + i * (barW + gap);
    const y = h - padding - barH;

    ctx.fillRect(x, y, barW, barH);
    ctx.fillText(Math.round(val), x + barW / 2, y - 6);
    ctx.fillText(label, x + barW / 2, h - 14);
  });
}    
