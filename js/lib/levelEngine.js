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
  baseXP: 100,        // XP required for level 1 → 2
  growthRate: 1.15,   // Exponential growth factor
  maxLevel: 100
};

const BADGE_TIERS = [
  { minLevel: 50, name: "Grandmaster", className: "badge-grandmaster" },
  { minLevel: 20, name: "Legend", className: "badge-legend" },
  { minLevel: 10, name: "Master", className: "badge-master" },
  { minLevel: 5,  name: "Advanced", className: "badge-advanced" },
  { minLevel: 1,  name: "Pemula", className: "badge-beginner" }
];

/* =========================================
   CORE XP CALCULATIONS
========================================= */

/**
 * Total XP required to reach a specific level
 */
function xpRequiredForLevel(level) {
  let total = 0;

  for (let i = 1; i < level; i++) {
    total += LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.growthRate, i - 1);
  }

  return Math.floor(total);
}

/**
 * Determine level based on total XP
 */
function calculateLevel(totalXP) {
  let level = 1;

  while (
    level < LEVEL_CONFIG.maxLevel &&
    totalXP >= xpRequiredForLevel(level + 1)
  ) {
    level++;
  }

  return level;
}

/**
 * Calculate progress within current level
 */
function calculateProgress(totalXP, level) {
  const currentLevelXP = xpRequiredForLevel(level);
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
