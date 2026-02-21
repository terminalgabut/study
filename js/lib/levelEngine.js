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
  baseXP: 25,

  earlyHookEnd: 10,    // growth 1.04
  earlyEnd: 30,        // growth 1.05
  midEnd: 50,          // growth 1.04
  lateEnd: 90,         // growth 1.03
  maxLevel: 100,       // growth 1.02

  growth: {
    earlyHook: 1.04,
    early: 1.05,
    mid: 1.04,
    late: 1.03,
    veryLate: 1.02
  }
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

export function xpRequiredForLevel(level) {
  if (level <= 1) return LEVEL_CONFIG.baseXP;

  let xp = LEVEL_CONFIG.baseXP;

  for (let i = 1; i < level; i++) {
    let growth;

    if (i <= LEVEL_CONFIG.earlyHookEnd) {
      growth = LEVEL_CONFIG.growth.earlyHook;
    } else if (i <= LEVEL_CONFIG.earlyEnd) {
      growth = LEVEL_CONFIG.growth.early;
    } else if (i <= LEVEL_CONFIG.midEnd) {
      growth = LEVEL_CONFIG.growth.mid;
    } else if (i <= LEVEL_CONFIG.lateEnd) {
      growth = LEVEL_CONFIG.growth.late;
    } else {
      growth = LEVEL_CONFIG.growth.veryLate;
    }

    xp *= growth;
  }

  return Math.floor(xp);
}

/* =========================================
   TOTAL XP HELPER (CUMULATIVE)
========================================= */

function getTotalXPToReachLevel(level) {
  let total = 0;

  for (let i = 1; i < level; i++) {
    total += xpRequiredForLevel(i);
  }

  return total;
}

/**
 * Calculate progress within current level
 */
function calculateProgress(totalXP, level) {
  if (level >= LEVEL_CONFIG.maxLevel) {
    return {
      percent: 100,
      currentLevelXP: totalXP,
      nextLevelXP: totalXP,
      remainingXP: 0
    };
  }

  const xpStartOfLevel = getTotalXPToReachLevel(level);
  const xpStartOfNextLevel = getTotalXPToReachLevel(level + 1);

  const levelRange = xpStartOfNextLevel - xpStartOfLevel;
  const progressXP = totalXP - xpStartOfLevel;

  const percent = (progressXP / levelRange) * 100;

  return {
    percent: Math.max(0, Math.min(100, percent)),
    currentLevelXP: xpStartOfLevel,
    nextLevelXP: xpStartOfNextLevel,
    remainingXP: Math.max(0, xpStartOfNextLevel - totalXP)
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
