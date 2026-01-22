/**
 * Disasters System
 * Contains functions for disaster calculations, vulnerability, and awareness tracking
 */

import { GAME_CONFIG } from "../config/game-config.js";
import { NATURAL_DISASTERS, DEFAULT_VULNERABILITY_BY_REGION } from "../config/events.js";

/**
 * Middle East country list for vulnerability mapping
 */
const MIDDLE_EAST_COUNTRIES = [
  "saudi_arabia",
  "iran",
  "iraq",
  "uae",
  "kuwait",
  "qatar",
  "bahrain",
  "oman",
  "jordan",
  "lebanon",
  "syria",
  "yemen",
  "israel",
  "palestine",
];

/**
 * Get disaster vulnerability for a region
 * @param {string} regionId - Region identifier
 * @param {Object} climateData - Climate data lookup object
 * @returns {Object} Vulnerability scores by disaster type
 */
export function getDisasterVulnerability(regionId, climateData) {
  const countryData = climateData?.[regionId];
  if (countryData?.disasterVulnerability) {
    return countryData.disasterVulnerability;
  }

  // Fall back to region-based defaults
  const region = countryData?.region || "europe";
  let defaultRegion = region;

  // Map country regions to vulnerability regions
  if (region === "asia" && countryData) {
    if (MIDDLE_EAST_COUNTRIES.includes(regionId)) {
      defaultRegion = "middle_east";
    }
  }

  return DEFAULT_VULNERABILITY_BY_REGION[defaultRegion] || DEFAULT_VULNERABILITY_BY_REGION.europe;
}

/**
 * Calculate disaster probability based on temperature
 * @param {Object} disaster - Disaster definition
 * @param {number} vulnerability - Vulnerability score (0-1)
 * @param {number} temperature - Current global temperature anomaly
 * @returns {number} Probability of disaster occurring this month
 */
export function calculateDisasterProbability(disaster, vulnerability, temperature) {
  if (vulnerability === 0) return 0;

  // Temperature multiplier: scales up as temperature rises above 1.2°C
  const tempAboveBaseline = Math.max(0, temperature - 1.2);
  const tempMultiplier = 1 + tempAboveBaseline * disaster.tempScaling;

  // Base probability × vulnerability × temperature scaling
  return disaster.baseProbability * vulnerability * tempMultiplier;
}

/**
 * Get maximum number of new disasters based on difficulty
 * @param {Object} difficulty - Difficulty settings
 * @returns {number} Maximum new disasters per month
 */
export function getMaxDisastersForDifficulty(difficulty) {
  if (difficulty.id === "tutorial") return 0;
  if (difficulty.id === "easy") return 1;
  if (difficulty.id === "normal") return 2;
  if (difficulty.id === "hard") return 3;
  return 4;
}

/**
 * Calculate disaster income reduction based on resilience
 * @param {Object} disaster - Disaster definition
 * @param {number} resilience - Region resilience score (0-1)
 * @returns {number} Income reduction factor (0-0.5)
 */
export function calculateDisasterIncomeReduction(disaster, resilience) {
  const baseReduction = disaster.baseIncomeReduction * (1.5 - resilience);
  return Math.min(baseReduction, 0.5); // Cap at 50% reduction
}

/**
 * Calculate disaster duration
 * @param {Object} disaster - Disaster definition
 * @returns {number} Duration in months
 */
export function calculateDisasterDuration(disaster) {
  const range = disaster.maxDuration - disaster.minDuration + 1;
  return Math.floor(Math.random() * range) + disaster.minDuration;
}

/**
 * Get income multiplier from active disasters for a region
 * @param {string} regionId - Region identifier
 * @param {Array} activeDisasters - Array of active disaster objects
 * @returns {number} Income multiplier (1.0 = no effect, <1.0 = reduced income)
 */
export function getDisasterIncomeMultiplier(regionId, activeDisasters) {
  const activeDisaster = activeDisasters.find((d) => d.regionId === regionId);
  if (!activeDisaster) return 1.0;
  return 1.0 - activeDisaster.incomeReduction;
}

/**
 * Check if region has active disaster
 * @param {string} regionId - Region identifier
 * @param {Array} activeDisasters - Array of active disaster objects
 * @returns {boolean} True if region has active disaster
 */
export function hasActiveDisaster(regionId, activeDisasters) {
  return activeDisasters.some((d) => d.regionId === regionId);
}

/**
 * Create disaster history entry for a region
 * @returns {Object} Initial disaster history object
 */
export function createDisasterHistoryEntry() {
  return {
    totalDisasters: 0,
    recentDisasters: 0,
    lastDisasterMonth: 0,
    climateAwarenessBoost: 0,
  };
}

/**
 * Calculate awareness boost from disaster severity
 * @param {number} incomeReduction - Disaster income reduction (0-0.5)
 * @returns {number} Awareness boost amount
 */
export function calculateAwarenessBoost(incomeReduction) {
  if (incomeReduction >= 0.25) {
    return 0.08; // Severe disaster: +8%
  } else if (incomeReduction >= 0.15) {
    return 0.05; // Moderate disaster: +5%
  }
  return 0.03; // Minor disaster: +3%
}

/**
 * Update disaster history with new disaster
 * @param {Object} history - Current disaster history for region
 * @param {number} gameMonth - Current game month (from start)
 * @param {number} incomeReduction - Disaster income reduction
 * @returns {Object} Updated disaster history
 */
export function updateDisasterHistory(history, gameMonth, incomeReduction) {
  const awarenessBoost = calculateAwarenessBoost(incomeReduction);

  return {
    totalDisasters: history.totalDisasters + 1,
    recentDisasters: history.recentDisasters + 1,
    lastDisasterMonth: gameMonth,
    climateAwarenessBoost: Math.min(history.climateAwarenessBoost + awarenessBoost, 0.4), // Cap at 40%
  };
}

/**
 * Get campaign difficulty modifier based on disaster history
 * @param {Object} history - Disaster history for region
 * @returns {number} Modifier (1.0 = no effect, <1.0 = easier campaigns)
 */
export function getDisasterAwarenessModifier(history) {
  if (!history) return 1.0;
  return 1.0 - history.climateAwarenessBoost;
}

/**
 * Decay disaster awareness for a region
 * @param {Object} history - Current disaster history
 * @param {number} gameMonth - Current game month
 * @returns {Object} Updated disaster history with decayed awareness
 */
export function decayRegionAwareness(history, gameMonth) {
  // If no disaster in the last 24 months, decay awareness
  if (gameMonth - history.lastDisasterMonth > 24) {
    return {
      ...history,
      climateAwarenessBoost: Math.max(0, history.climateAwarenessBoost - 0.01),
      recentDisasters: 0,
    };
  }
  return history;
}

/**
 * Calculate alliance effects from a climate disaster
 * @param {number} severity - Disaster severity (incomeReduction)
 * @returns {Object} Alliance effects {interestBoost, happinessBoost, neighborBoost}
 */
export function calculateDisasterAllianceEffects(severity) {
  const interestBoost = Math.round(severity * 20); // +2 to +10 interest
  const happinessBoost = Math.round(severity * 10); // +1 to +5 happiness
  const neighborBoost = Math.round(interestBoost * 0.5); // Half the boost for neighbors

  return {
    interestBoost,
    happinessBoost,
    neighborBoost,
  };
}

/**
 * Calculate CO2 emission from volcanic eruption
 * @param {number} co2Emission - CO2 emission in GT
 * @returns {Object} {ppmIncrease, gtCO2}
 */
export function calculateVolcanicCO2Effect(co2Emission) {
  if (!co2Emission || co2Emission <= 0) {
    return { ppmIncrease: 0, gtCO2: 0 };
  }

  // Convert GT CO2 to ppm (approx 2.12 ppm per GT CO2)
  const ppmIncrease = co2Emission * 2.12;

  return {
    ppmIncrease,
    gtCO2: co2Emission,
  };
}

/**
 * Process disaster duration and check if expired
 * @param {Object} disaster - Active disaster object
 * @returns {Object} {disaster: updated disaster, expired: boolean}
 */
export function processDisasterDuration(disaster) {
  const updatedDisaster = {
    ...disaster,
    remainingMonths: disaster.remainingMonths - 1,
  };

  return {
    disaster: updatedDisaster,
    expired: updatedDisaster.remainingMonths <= 0,
  };
}

/**
 * Get disaster definitions
 * @returns {Array} Array of natural disaster definitions
 */
export function getNaturalDisasters() {
  return NATURAL_DISASTERS;
}

/**
 * Find disaster definition by ID
 * @param {string} disasterId - Disaster type ID
 * @returns {Object|undefined} Disaster definition
 */
export function getDisasterById(disasterId) {
  return NATURAL_DISASTERS.find((d) => d.id === disasterId);
}

/**
 * Generate a random disaster description
 * @param {Object} disaster - Disaster definition
 * @returns {string} Random description from disaster's descriptions array
 */
export function getRandomDisasterDescription(disaster) {
  if (!disaster.descriptions || disaster.descriptions.length === 0) {
    return `A ${disaster.name} has occurred.`;
  }
  return disaster.descriptions[Math.floor(Math.random() * disaster.descriptions.length)];
}

/**
 * Create a new disaster event object
 * @param {Object} params - Disaster creation parameters
 * @param {Object} params.disaster - Disaster definition
 * @param {string} params.regionId - Region identifier
 * @param {string} params.regionName - Region display name
 * @param {number} params.year - Current game year
 * @param {number} params.month - Current game month
 * @param {number} params.resilience - Region resilience score
 * @param {boolean} params.isInAlliance - Whether region is in climate alliance
 * @returns {Object} New disaster event object
 */
export function createDisasterEvent({
  disaster,
  regionId,
  regionName,
  year,
  month,
  resilience,
  isInAlliance,
}) {
  const duration = calculateDisasterDuration(disaster);
  const incomeReduction = calculateDisasterIncomeReduction(disaster, resilience);

  return {
    id: `disaster_${regionId}_${disaster.id}_${year}_${month}`,
    type: disaster.id,
    typeName: disaster.name,
    icon: disaster.icon,
    regionId,
    regionName,
    startMonth: month,
    startYear: year,
    duration,
    remainingMonths: duration,
    incomeReduction,
    description: getRandomDisasterDescription(disaster),
    isClimateRelated: !disaster.isGeological,
    co2Emission: disaster.co2Emission || 0,
    regionInAlliance: isInAlliance,
  };
}
