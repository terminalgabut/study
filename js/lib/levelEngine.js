// root/js/lib/levelEngine.js

/* =========================================
   LEVEL ENGINE (Professional Version)
   - Configurable XP Curve
   - Centralized Tier System
   - Clean Return Structure
========================================= */

/* =========================================
   CONFIGURATION
========================================= */

const LEVEL_CONFIG = {
  baseXP: 100,
  earlyGrowth: 1.08,   // Level 1–50
  lateGrowth: 1.04,    // Level 51–100
  midPoint: 50,
  maxLevel: 100
};

const BADGE_TIERS = [
  { minLevel: 95, name: "Pinnacle", className: "badge-pinnacle" },
  { minLevel: 85, name: "Distinguished", className: "badge-distinguished" },
  { minLevel: 75, name: "Expert", className: "badge-expert" },
  { minLevel: 65, name: "Specialist", className: "badge-specialist" },
  { minLevel: 50, name: "Advanced Practitioner", className: "badge-advanced-practitioner" },
  { minLevel: 35, name: "Proficient", className: "badge-proficient" },
  { minLevel: 20, name: "Competent", className: "badge-competent" },
  { minLevel: 10, name: "Skilled", className: "badge-skilled" },
  { minLevel: 5,  name: "Developing", className: "badge-developing" },
  { minLevel: 1,  name: "Pemula", className: "badge-beginner" }
];

/* =========================================
   XP CALCULATION (HYBRID CURVE)
========================================= */

function xpRequiredForLevel(level) {
  let total = 0;

  for (let i = 1; i < level; i++) {
    if (i <= LEVEL_CONFIG.midPoint) {
      total += LEVEL_CONFIG.baseXP *
        Math.pow(LEVEL_CONFIG.earlyGrowth, i - 1);
    } else {
      const earlyTotal =
        LEVEL_CONFIG.baseXP *
        Math.pow(LEVEL_CONFIG.earlyGrowth, LEVEL_CONFIG.midPoint - 1);

      total += earlyTotal *
        Math.pow(
          LEVEL_CONFIG.lateGrowth,
          i - LEVEL_CONFIG.midPoint
        );
    }
  }

  return Math.floor(total);
}

/**
 * Calculate progress within current level
 */
function calculateProgress(totalXP, level) {
  const currentLevelXP = xpRequiredForLevel(level);

  if (level >= LEVEL_CONFIG.maxLevel) {
    return {
      percent: 100,
      currentLevelXP,
      nextLevelXP: currentLevelXP,
      remainingXP: 0
    };
  }

  const nextLevelXP = xpRequiredForLevel(level + 1);
  const levelRange = nextLevelXP - currentLevelXP;
  const progressXP = totalXP - currentLevelXP;

  const percent = (progressXP / levelRange) * 100;

  return {
    percent: Math.max(0, Math.min(100, percent)),
    currentLevelXP,
    nextLevelXP,
    remainingXP: Math.max(0, nextLevelXP - totalXP)
  };
}

/**
 * Determine badge tier
 */
function resolveBadge(level) {
  return (
    BADGE_TIERS.find(tier => level >= tier.minLevel) ||
    BADGE_TIERS[BADGE_TIERS.length - 1]
  );
}

/* =========================================
   PUBLIC BUILDER
========================================= */

function calculateLevel(totalXP) {
  let level = 1;

  while (
    level < LEVEL_CONFIG.maxLevel &&
    xpRequiredForLevel(level + 1) <= totalXP
  ) {
    level++;
  }

  return level;
}

export function buildLevelProfile(xp = 0) {
  const safeXP = Math.max(0, Number(xp) || 0);

  const level = calculateLevel(safeXP);
  const progress = calculateProgress(safeXP, level);
  const badge = resolveBadge(level);

  return {
    xp: safeXP,
    level,
    badge: {
      name: badge.name,
      className: badge.className
    },
    progressPercent: Number(progress.percent.toFixed(1)),
    currentLevelXP: progress.currentLevelXP,
    nextLevelXP: progress.nextLevelXP,
    remainingXP: progress.remainingXP
  };
}
