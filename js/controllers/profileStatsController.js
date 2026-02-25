// js/controllers/profileStatsController.js

import { getProfileRadarStats, 
        getCognitiveSummary } from '../services/profileService.js';
import { renderProfileRadar, 
        renderStabilityChart } from '../lib/chartsProfile.js'; 
import { getIQInsight } from '../lib/profileInsights.js'; 

export const profileStatsController = {

  async render(userId) {
    if (!userId) return;

    const radarCanvas = document.getElementById('profileRadar');
    const stabilityCanvas = document.getElementById('stabilityChart');

    const radarData = await getProfileRadarStats(userId);
    const summary = await getCognitiveSummary(userId);

    if (radarCanvas && radarData) {
      renderProfileRadar('profileRadar', radarData);
    }

    if (stabilityCanvas && summary) {
      renderStabilityChart('stabilityChart', summary);
    }

    if (!summary) return;

    const iqValue = document.getElementById('iqValue');
    const iqClass = document.getElementById('iqClass');
    const iqConfidence = document.getElementById('iqConfidence');
    const neuroType = document.getElementById('neuroType');

    if (iqValue) iqValue.textContent = Math.round(summary.iq_final || 0);
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
      if (descEl) {
        descEl.textContent =
          insight.iqDescription + " " + insight.neuroDescription;
      }
    }
  }

};
