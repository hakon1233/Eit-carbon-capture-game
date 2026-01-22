/**
 * Research System
 * Contains functions for research centers, technology unlocking, and research progress
 */

/**
 * Research center base configuration
 */
export const RESEARCH_CENTER_BASE = {
  buildCost: 10, // $10B to build
  baseMonthlyCost: 0.5, // $0.5B base operating cost
  costPerLevel: 0.3, // +$0.3B per level
  levelNames: {
    1: "Research Lab",
    2: "Research Institute",
    3: "Advanced Research Center",
    4: "National Laboratory",
    5: "World-Class Institute",
  },
};

/**
 * Research fields configuration
 */
export const RESEARCH_FIELDS = {
  renewable: {
    id: "renewable",
    name: "Renewable Energy",
    icon: "☀️",
    switchCost: 8,
    switchTime: 2,
    description: "Solar, wind, and hydrogen technologies",
  },
  carbon: {
    id: "carbon",
    name: "Carbon Capture",
    icon: "🏭",
    switchCost: 10,
    switchTime: 3,
    description: "CCS technologies and CO2 storage",
  },
  efficiency: {
    id: "efficiency",
    name: "Energy Efficiency",
    icon: "⚡",
    switchCost: 6,
    switchTime: 2,
    description: "Nuclear and grid optimization",
  },
  adaptation: {
    id: "adaptation",
    name: "Climate Adaptation",
    icon: "🛡️",
    switchCost: 8,
    switchTime: 2,
    description: "Nature-based solutions and resilience",
  },
};

/**
 * Calculate RP per month for a given research center level
 * Formula: floor(5 * level * (1 + 0.1 * (level - 1)))
 * @param {number} level - Research center level
 * @returns {number} RP per month
 */
export function getResearchCenterRPPerMonth(level) {
  if (level < 1) return 0;
  return Math.floor(5 * level * (1 + 0.1 * (level - 1)));
}

/**
 * Calculate upgrade cost to reach the next level
 * Formula: 4 + 8 * level (cost to upgrade FROM level to level+1)
 * @param {number} currentLevel - Current level
 * @returns {number} Cost in billions
 */
export function getResearchCenterUpgradeCost(currentLevel) {
  if (currentLevel < 1) return 0;
  return 4 + 8 * currentLevel;
}

/**
 * Get the display name for a research center level
 * @param {number} level - Research center level
 * @returns {string} Level name
 */
export function getResearchCenterName(level) {
  return RESEARCH_CENTER_BASE.levelNames[level] || `Level ${level} Research Center`;
}

/**
 * Get all data for a research center level
 * @param {number} level - Research center level
 * @returns {Object} Level data {level, rpPerMonth, upgradeCost, name}
 */
export function getResearchCenterLevelData(level) {
  return {
    level: level,
    rpPerMonth: getResearchCenterRPPerMonth(level),
    upgradeCost: getResearchCenterUpgradeCost(level),
    name: getResearchCenterName(level),
  };
}

/**
 * Calculate total monthly operating cost for all research centers
 * @param {Object} regionalResearchCenters - Map of regionId to center data
 * @returns {number} Total monthly cost in billions
 */
export function calculateResearchCenterMonthlyCost(regionalResearchCenters) {
  if (!regionalResearchCenters) return 0;
  let totalCost = 0;
  for (const regionId in regionalResearchCenters) {
    const center = regionalResearchCenters[regionId];
    if (center && center.level > 0) {
      totalCost += RESEARCH_CENTER_BASE.baseMonthlyCost + RESEARCH_CENTER_BASE.costPerLevel * center.level;
    }
  }
  return totalCost;
}

/**
 * Calculate total RP generation from all research centers
 * @param {Object} regionalResearchCenters - Map of regionId to center data
 * @returns {number} Total RP per month
 */
export function calculateTotalRPGeneration(regionalResearchCenters) {
  if (!regionalResearchCenters) return 0;
  let totalRP = 0;
  for (const regionId in regionalResearchCenters) {
    const center = regionalResearchCenters[regionId];
    if (center && center.level > 0) {
      totalRP += getResearchCenterRPPerMonth(center.level);
    }
  }
  return totalRP;
}

/**
 * Check if a research center can be built in a region
 * @param {Object} params - Check parameters
 * @param {Object} params.region - Region state object
 * @param {Object} params.alliance - Alliance data for the region
 * @param {Object} params.existingCenter - Existing center if any
 * @param {number} params.funds - Available funds
 * @returns {Object} {can: boolean, reason?: string}
 */
export function canBuildResearchCenter({ region, alliance, existingCenter, funds }) {
  if (!region) return { can: false, reason: "Region not found" };

  if (!alliance || alliance.status !== "allied") {
    return { can: false, reason: "No alliance with this region" };
  }

  if (existingCenter) {
    return { can: false, reason: "Already has a research center" };
  }

  if (funds < RESEARCH_CENTER_BASE.buildCost) {
    return { can: false, reason: `Not enough funds (need $${RESEARCH_CENTER_BASE.buildCost}B)` };
  }

  return { can: true };
}

/**
 * Check if a research center can be upgraded
 * @param {Object} params - Check parameters
 * @param {Object} params.center - Existing center data
 * @param {number} params.funds - Available funds
 * @returns {Object} {can: boolean, reason?: string, cost?: number}
 */
export function canUpgradeResearchCenter({ center, funds }) {
  if (!center) {
    return { can: false, reason: "No research center in this region" };
  }

  const upgradeCost = getResearchCenterUpgradeCost(center.level);

  if (funds < upgradeCost) {
    return { can: false, reason: `Not enough funds (need $${upgradeCost}B)`, cost: upgradeCost };
  }

  return { can: true, cost: upgradeCost };
}

/**
 * Check if a technology can be unlocked
 * @param {Object} params - Check parameters
 * @param {Object} params.tech - Technology definition
 * @param {Object} params.unlockedTech - Set or object of unlocked tech IDs
 * @param {number} params.researchPoints - Available research points
 * @returns {Object} {can: boolean, reason?: string}
 */
export function canUnlockTech({ tech, unlockedTech, researchPoints }) {
  if (!tech) {
    return { can: false, reason: "Technology not found" };
  }

  // Check if already unlocked
  const isUnlocked = unlockedTech instanceof Set
    ? unlockedTech.has(tech.id)
    : unlockedTech?.[tech.id];

  if (isUnlocked) {
    return { can: false, reason: "Already researched" };
  }

  // Check prerequisites
  if (tech.requires && tech.requires.length > 0) {
    for (const prereq of tech.requires) {
      const prereqUnlocked = unlockedTech instanceof Set
        ? unlockedTech.has(prereq)
        : unlockedTech?.[prereq];
      if (!prereqUnlocked) {
        return { can: false, reason: "Missing prerequisites" };
      }
    }
  }

  // Check research points
  if (researchPoints < tech.cost) {
    return { can: false, reason: `Need ${tech.cost} RP (have ${researchPoints})` };
  }

  return { can: true };
}

/**
 * Get technology bonus for a project type
 * @param {string} projectType - Project type key
 * @param {string} bonusType - Bonus type (cost, effect, income)
 * @param {Object} unlockedTech - Unlocked technologies
 * @param {Object} technologies - Technology definitions
 * @returns {number} Bonus multiplier
 */
export function getTechBonusForProject(projectType, bonusType, unlockedTech, technologies) {
  let bonus = bonusType === "cost" ? 1.0 : 1.0; // Start with no modification

  if (!unlockedTech || !technologies) return bonus;

  for (const techId in unlockedTech) {
    if (!unlockedTech[techId]) continue;
    const tech = technologies[techId];
    if (!tech?.projectBonuses) continue;

    const projectBonus = tech.projectBonuses[projectType];
    if (!projectBonus) continue;

    if (bonusType === "cost" && projectBonus.costReduction) {
      bonus *= 1 - projectBonus.costReduction;
    }
    if (bonusType === "effect" && projectBonus.effectBonus) {
      bonus *= 1 + projectBonus.effectBonus;
    }
    if (bonusType === "income" && projectBonus.incomeBonus) {
      bonus *= 1 + projectBonus.incomeBonus;
    }
  }

  return bonus;
}

/**
 * Calculate research progress for a technology
 * @param {number} currentProgress - Current progress
 * @param {number} rpPerMonth - RP generation per month
 * @param {number} techCost - Total technology cost
 * @returns {Object} {newProgress, completed, overflow}
 */
export function calculateResearchProgress(currentProgress, rpPerMonth, techCost) {
  const newProgress = currentProgress + rpPerMonth;
  const completed = newProgress >= techCost;
  const overflow = completed ? newProgress - techCost : 0;

  return {
    newProgress: completed ? techCost : newProgress,
    completed,
    overflow,
  };
}
