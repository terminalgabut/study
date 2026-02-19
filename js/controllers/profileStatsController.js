// js/controllers/profileStatsController.js

import { getProfileRadarStats, getCognitiveSummary } from '../services/profileService.js';
import { renderProfileRadar, renderStabilityChart } from '../lib/chartsProfile.js'; 
import { getIQInsight } from '../lib/profileInsights.js'; 
import { buildTrendAnalysis } from '../lib/trendEngine.js'; 

export const profileStatsController = {

  async render(userId) {
    if (!userId) return;

    // Radar Chart
    const radarData = await getProfileRadarStats(userId);
    renderProfileRadar('profileRadar', radarData);

    // Stability & IQ
    const summary = await getCognitiveSummary(userId);

    if (!summary) return;

    renderStabilityChart('stabilityChart', summary);

    const iqValue = document.getElementById('iqValue');
    const iqClass = document.getElementById('iqClass');
    const iqConfidence = document.getElementById('iqConfidence');
    const neuroType = document.getElementById('neuroType');

    if (iqValue) iqValue.textContent = Math.round(summary.iq_estimated || 0);
    if (iqClass) iqClass.textContent = summary.iq_class || '-';
    if (iqConfidence) iqConfidence.textContent = summary.iq_confidence || 0;
    if (neuroType) neuroType.textContent = summary.neuro_type || '-'; 

    const insight = getIQInsight(summary);

if (insight) {
  document.getElementById('iqValue').textContent = Math.round(insight.iq);
  document.getElementById('iqClass').textContent = insight.iqClass;
  document.getElementById('iqConfidence').textContent = insight.confidence;
  document.getElementById('neuroType').textContent = insight.neuroType;

  const descEl = document.getElementById('iqDescription');
  if (descEl) descEl.textContent = insight.iqDescription + " " + insight.neuroDescription;
}

/* =========================================
       📈 IQ TREND PREVIEW (PROFILE ANALYTICS)
    ========================================= */

    const sessions = await getCognitiveHistory(userId);

    if (sessions && sessions.length >= 2) {
      const trend = buildTrendAnalysis(sessions);

      const container = document.getElementById('profileDynamicContent');
      if (!container || !trend) return;

      const deltaIcon = trend.delta >= 0 ? '📈' : '📉';
      const deltaSign = trend.delta >= 0 ? '+' : '';

      container.innerHTML = `
        <div class="trend-summary">
          <p><strong>IQ Trend</strong></p>
          <p>${deltaSign}${trend.deltaPercent}% ${deltaIcon}</p>

          <p><strong>Strength</strong>: ${trend.strength.name}
            (${trend.strength.percent}%)
          </p>

          <p><strong>Needs Work</strong>: ${trend.weakness.name}
            (${trend.weakness.percent}%)
          </p>

          ${trend.confidenceNote
            ? `<p class="trend-note">${trend.confidenceNote}</p>`
            : ''
          }
        </div>
      `;
    }
    
  }
};
