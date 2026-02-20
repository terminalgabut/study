// root/js/controllers/profileHomeController.js

import { buildLevelProfile } from '../lib/levelEngine.js';
// import { } from '../services/profileService.js';

export const profileHomeController = {

  async render(userId) {
    if (!userId) return;

    try {
      this.userId = userId;

      const [
        cognitive,
        daily,
        favorite
      ] = await Promise.all([
        this.loadCognitiveSummary(),
        this.loadDailyStats(),
        this.loadFavoriteMaterial()
      ]);

      const target = this.loadNextTarget(cognitive.xp);

      this.renderUI({
        cognitive,
        daily,
        favorite,
        target
      });

    } catch (err) {
      console.error('[ProfileHome]', err);
    }
  },

  /* ===============================
     DATA LOADERS (TEMP MOCK)
  =============================== */

  async loadCognitiveSummary() {
    // nanti diganti service DB
    return {
      index: 87.4,
      delta: 1.2,
      stability: "Moderate",
      neuroType: "Analytical Strategist",
      xp: 860
    };
  },

  async loadDailyStats() {
    return {
      quizDone: 12,
      highestScore: 92,
      xpToday: 18
    };
  },

  async loadFavoriteMaterial() {
    return {
      title: "Logical Fallacies Advanced"
    };
  },

  loadNextTarget(totalXP) {
    const levelData = buildLevelProfile(totalXP);

    return {
      level: levelData.level,
      nextLevelXP:
        levelData.nextLevelXP - levelData.currentLevelXP,
      remainingXP: levelData.remainingXP,
      progressPercent: levelData.progressPercent
    };
  },

  /* ===============================
     UI RENDER
  =============================== */

  renderUI(data) {
    const root =
      document.querySelector('#profileDynamicContent .home-overview');

    if (!root) return;

    /* ===== Cognitive ===== */

    const indexEl = root.querySelector('.metric-value');
    if (indexEl) {
      const arrow = data.cognitive.delta >= 0 ? "↑" : "↓";
      indexEl.textContent =
        `${data.cognitive.index} ${arrow}`;
    }

    const stabilityEl =
      root.querySelectorAll('.metric-value')[1];
    if (stabilityEl) {
      stabilityEl.textContent =
        data.cognitive.stability;
    }

    const neuroEl =
      root.querySelectorAll('.metric-value')[2];
    if (neuroEl) {
      neuroEl.textContent =
        data.cognitive.neuroType;
    }

    /* ===== Daily ===== */

    const dailyNumbers =
      root.querySelectorAll('.daily-number');

    if (dailyNumbers[0])
      dailyNumbers[0].textContent =
        data.daily.quizDone;

    if (dailyNumbers[1])
      dailyNumbers[1].textContent =
        data.daily.highestScore;

    if (dailyNumbers[2])
      dailyNumbers[2].textContent =
        `+${data.daily.xpToday} XP`;

    /* ===== Favorite ===== */

    const favEl =
      root.querySelector('.favorite-title');
    if (favEl) {
      favEl.textContent =
        data.favorite.title;
    }

    /* ===== Target ===== */

    const targetRow =
      root.querySelector('.target-row span:last-child');
    if (targetRow) {
      targetRow.textContent =
        `${data.target.remainingXP} XP needed`;
    }

    const progressFill =
      root.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width =
        `${data.target.progressPercent}%`;
    }
  }
};
