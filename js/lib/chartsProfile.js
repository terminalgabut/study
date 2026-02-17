// js/lib/chartsProfile.js

export function renderProfileRadar(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ===== CONFIG =====
  const labelsMap = {
    pemahaman_bacaan: "Reading",
    kosakata_semantik: "Vocabulary",
    penalaran_verbal: "Verbal",
    analogi: "Analogy",
    memori_kerja: "Memory"
  };

  const values = data.map(d => d.value);
  const labels = data.map(d => labelsMap[d.dimension]);

  const maxValue = 100; // asumsi skor 0-100
  const levels = 5;

  // ===== RESPONSIVE =====
  const size = canvas.parentElement.offsetWidth;
  canvas.width = size;
  canvas.height = size;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = size * 0.35;

  const angleStep = (Math.PI * 2) / values.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ===== DRAW GRID =====
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--border');

  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);

    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ===== DRAW AXIS =====
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--border');

  for (let i = 0; i < values.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // ===== DRAW DATA =====
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

  // ===== LABELS =====
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--text');
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";

  for (let i = 0; i < labels.length; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + (radius + 20) * Math.cos(angle);
    const y = centerY + (radius + 20) * Math.sin(angle);
    ctx.fillText(labels[i], x, y);
  }
}
