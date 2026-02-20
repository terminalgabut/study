// root/js/controllers/profileHomeController.js

import { getProfileHomeData } from '../services/profileHomeService.js';
import { buildLevelProfile } from '../lib/levelEngine.js';

export const profileHomeController = {

  async render(userId) {
    if (!userId) return;

    try {
      const raw = await getProfileHomeData(userId);

      const cognitive = this.computeCognitive(raw);
      const daily = this.computeDaily(raw.dailyAttempts);
      const favorite = this.computeFavorite(raw.favoriteAttempts);
      const target = this.computeTarget(raw.xpRow?.xp || 0);

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

  /* ==================================================
     🧠 COGNITIVE SUMMARY LOGIC
  ================================================== */

  computeCognitive(raw) {

    const sessions = raw.cognitiveSessions || [];
    const summary = raw.cognitive || {};

    let delta = 0;

    if (sessions.length >= 2) {
      delta =
        Number(sessions[0].cognitive_index || 0) -
        Number(sessions[1].cognitive_index || 0);
    }

    return {
      index: Number(summary.cognitive_index || 0).toFixed(1),
      delta,
      stability: this.mapStability(summary.stability_index),
      neuroType: summary.neuro_type || "Unknown"
    };
  },

  mapStability(value = 0) {
    if (value >= 75) return "Stable";
    if (value >= 45) return "Moderate";
    return "Volatile";
  },

  /* ==================================================
     📊 DAILY LOGIC
  ================================================== */

  computeDaily(attempts = []) {

    const quizDone = attempts.length;

    let highestScore = 0;
    let correctCount = 0;

    for (const a of attempts) {
      const score = Number(a.score || 0);

      if (score > highestScore)
        highestScore = score;

      if (a.is_correct)
        correctCount++;
    }

    return {
      quizDone,
      highestScore,
      xpToday: correctCount // rule XP = correct answers
    };
  },

  /* ==================================================
     ⭐ FAVORITE MATERIAL LOGIC
  ================================================== */

  computeFavorite(attempts = []) {

    if (!attempts.length)
      return { title: "No activity yet" };

    const counter = {};

    for (const a of attempts) {
      if (!a.title) continue;
      counter[a.title] =
        (counter[a.title] || 0) + 1;
    }

    let topTitle = null;
    let topCount = 0;

    for (const [title, count] of Object.entries(counter)) {
      if (count > topCount) {
        topTitle = title;
        topCount = count;
      }
    }

    return {
      title: topTitle || "No activity yet"
    };
  },

  /* ==================================================
     🎯 LEVEL TARGET LOGIC
  ================================================== */

  computeTarget(totalXP) {

  const levelData =
    buildLevelProfile(totalXP);

  return {
    level: levelData.level,
    badgeName: levelData.badge.name,
    remainingXP: levelData.remainingXP,
    progressPercent: levelData.progressPercent
  };
},

  /* ==================================================
     🎨 UI RENDER
  ================================================== */

  renderUI(data) {

    const root =
      document.querySelector('#profileDynamicContent .home-overview');

    if (!root) return;

    /* ===== Cognitive ===== */

    const metrics =
      root.querySelectorAll('.metric-value');

    if (metrics[0]) {
      const arrow =
        data.cognitive.delta >= 0 ? "↑" : "↓";

      metrics[0].textContent =
        `${data.cognitive.index} ${arrow}`;
    }

    if (metrics[1])
      metrics[1].textContent =
        data.cognitive.stability;

    if (metrics[2])
      metrics[2].textContent =
        data.cognitive.neuroType;

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

    if (favEl)
      favEl.textContent =
        data.favorite.title;

    /* ===== Target ===== */

    /* ===== Target ===== */

// Level + Badge
const targetValue =
  root.querySelector('.target-row .target-value');

if (targetValue) {
  targetValue.textContent =
    `Level ${data.target.level} (${data.target.badgeName})`;
}

// XP Needed
const xpRow =
  root.querySelector('.xp-needed');

if (xpRow) {
  xpRow.textContent =
    `${data.target.remainingXP} XP needed`;
}

// Progress bar
const progressFill =
  root.querySelector('.progress-fill');

if (progressFill) {
  progressFill.style.width =
    `${data.target.progressPercent}%`;
}
};
