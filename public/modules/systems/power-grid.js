/**
 * Power Grid System
 * Contains functions for calculating power supply, demand, stability, and pricing
 */

import { GAME_CONFIG } from "../config/game-config.js";
import {
  POWER_CONFIG,
  POWER_CATEGORY,
  CAPACITY_FACTORS,
} from "../config/power-config.js";
import { PROJECT_TYPES } from "../config/projects.js";

/**
 * Calculate annual TWh production for a power project
 * @param {string} projectType - Project type key
 * @param {number} effectMultiplier - Effectiveness multiplier
 * @returns {number} Annual production in TWh
 */
export function calculateProjectTWh(projectType, effectMultiplier = 1) {
  const project = PROJECT_TYPES[projectType];
  if (!project?.capacityGW) return 0;

  const capacityFactor = CAPACITY_FACTORS[projectType] || 0.3;
  const hoursPerYear = 8760;

  const twhPerYear = (project.capacityGW * effectMultiplier * hoursPerYear * capacityFactor) / 1000;

  return Math.round(twhPerYear * 100) / 100;
}

/**
 * Calculate power demand based on base demand, growth, and time
 * @param {Object} params - Calculation parameters
 * @param {number} params.baseDemandGW - Base power demand in GW
 * @param {number} params.demandGrowthRate - Annual growth rate
 * @param {number} params.yearsSinceStart - Years since game start
 * @param {number} params.month - Current month (1-12)
 * @param {string} params.regionId - Region ID for seasonal calculation
 * @param {number} params.electrificationMultiplier - Electrification demand multiplier
 * @returns {number} Power demand in GW
 */
export function calculatePowerDemand({
  baseDemandGW = 100,
  demandGrowthRate = 0.02,
  yearsSinceStart = 0,
  month = 1,
  regionId = "",
  electrificationMultiplier = 1.0,
}) {
  const growthFactor = Math.pow(1 + demandGrowthRate, yearsSinceStart);

  // Seasonal variation (winter/summer peaks)
  const isNorthern = !["south_america", "oceania", "africa"].includes(regionId);
  const peakMonths = isNorthern ? [1, 2, 7, 8] : [6, 7, 12, 1];
  const seasonalFactor = peakMonths.includes(month) ? 1.1 : 1.0;

  return Math.round(baseDemandGW * growthFactor * seasonalFactor * electrificationMultiplier * 10) / 10;
}

/**
 * Calculate existing infrastructure supply from power mix data
 * @param {Object} currentMix - Power mix in TWh {coal, gas, nuclear, hydro, wind, solar, other}
 * @param {number} baseDemandGW - Base demand for scaling
 * @returns {Object} Supply breakdown {total, variable, baseload}
 */
export function calculateExistingSupply(currentMix, baseDemandGW) {
  if (!currentMix) {
    const existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;
    return {
      total: existingSupply,
      variable: existingSupply * POWER_CONFIG.existingVariableRatio,
      baseload: existingSupply * POWER_CONFIG.existingBaseloadRatio,
    };
  }

  const totalTWh =
    (currentMix.coal || 0) +
    (currentMix.gas || 0) +
    (currentMix.nuclear || 0) +
    (currentMix.hydro || 0) +
    (currentMix.wind || 0) +
    (currentMix.solar || 0) +
    (currentMix.other || 0);

  const variableTWh = (currentMix.wind || 0) + (currentMix.solar || 0);
  const baseloadTWh = totalTWh - variableTWh;

  const variableRatio = totalTWh > 0 ? variableTWh / totalTWh : 0.15;
  const baseloadRatio = totalTWh > 0 ? baseloadTWh / totalTWh : 0.7;

  const existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;

  return {
    total: existingSupply,
    variable: existingSupply * variableRatio,
    baseload: existingSupply * baseloadRatio,
  };
}

/**
 * Calculate player-built power capacity from projects
 * @param {Array} projects - Array of project objects
 * @returns {Object} Player capacity {variable, baseload, storage}
 */
export function calculatePlayerCapacity(projects) {
  let playerVariable = 0;
  let playerBaseload = 0;
  let playerStorage = 0;

  if (!projects) return { variable: 0, baseload: 0, storage: 0 };

  projects.forEach((proj) => {
    const projectType = typeof proj === "string" ? proj : proj.type;
    const effectMult = typeof proj === "object" ? proj.effectMultiplier || 1 : 1;
    const projectDef = PROJECT_TYPES[projectType];

    if (!projectDef?.capacityGW) return;

    const capacity = projectDef.capacityGW * effectMult;

    if (projectDef.powerCategory === POWER_CATEGORY.VARIABLE) {
      playerVariable += capacity;
    } else if (projectDef.powerCategory === POWER_CATEGORY.BASELOAD) {
      playerBaseload += capacity;
    } else if (projectDef.powerCategory === POWER_CATEGORY.STORAGE) {
      playerStorage += projectDef.storageGWh || capacity;
    }
  });

  return {
    variable: Math.round(playerVariable * 10) / 10,
    baseload: Math.round(playerBaseload * 10) / 10,
    storage: Math.round(playerStorage * 10) / 10,
  };
}

/**
 * Calculate total power supply breakdown
 * @param {Object} params - Supply parameters
 * @param {Object} params.existingSupply - Existing infrastructure {total, variable, baseload}
 * @param {Object} params.playerCapacity - Player-built capacity {variable, baseload, storage}
 * @param {Object} params.retiredFossilGW - Retired fossil capacity {coal, gas}
 * @returns {Object} Complete supply breakdown
 */
export function calculatePowerSupply({ existingSupply, playerCapacity, retiredFossilGW }) {
  let existingBaseload = existingSupply.baseload;

  // Account for retired fossil capacity
  if (retiredFossilGW) {
    const totalRetired = (retiredFossilGW.coal || 0) + (retiredFossilGW.gas || 0);
    existingBaseload = Math.max(0, existingBaseload - totalRetired);
  }

  const totalVariable = existingSupply.variable + playerCapacity.variable;
  const totalBaseload = existingBaseload + playerCapacity.baseload;
  const totalSupply = totalVariable + totalBaseload;

  return {
    total: Math.round(totalSupply * 10) / 10,
    variable: Math.round(totalVariable * 10) / 10,
    baseload: Math.round(totalBaseload * 10) / 10,
    storage: playerCapacity.storage,
    playerVariable: playerCapacity.variable,
    playerBaseload: playerCapacity.baseload,
  };
}

/**
 * Calculate grid stability score (0-100)
 * @param {Object} params - Stability parameters
 * @param {Object} params.supply - Supply breakdown {total, variable, baseload, storage}
 * @param {number} params.demand - Power demand in GW
 * @param {Array} params.projects - Projects for stability bonuses
 * @returns {number} Stability score 0-100
 */
export function calculateGridStability({ supply, demand, projects }) {
  if (supply.total <= 0) return 0;

  const variableShare = supply.variable / supply.total;
  const baseloadShare = supply.baseload / supply.total;
  const storageRatio = supply.storage / Math.max(1, supply.variable);

  let stability = 100;

  // Variable renewable penalty
  const variablePenalty = variableShare * 100 * POWER_CONFIG.variablePenaltyFactor;
  stability -= variablePenalty;

  // Storage mitigation
  const maxMitigation = variableShare * 100 * POWER_CONFIG.maxStorageMitigationRatio;
  const storageMitigation = Math.min(
    storageRatio * POWER_CONFIG.storageMitigationFactor,
    maxMitigation
  );
  stability += storageMitigation;

  // Baseload stability bonus
  stability += baseloadShare * 100 * POWER_CONFIG.baseloadBonusFactor;

  // Supply shortfall penalty
  if (supply.total < demand) {
    const shortfallRatio = (demand - supply.total) / demand;
    stability -= shortfallRatio * POWER_CONFIG.shortfallStabilityPenalty;
  }

  // Project-specific stability contributions
  if (projects) {
    projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const projectDef = PROJECT_TYPES[projectType];
      if (projectDef?.stabilityContribution) {
        stability += projectDef.stabilityContribution;
      }
    });
  }

  return Math.max(0, Math.min(100, Math.round(stability)));
}

/**
 * Calculate electricity price per kWh
 * @param {Object} params - Price parameters
 * @param {Object} params.supply - Supply breakdown
 * @param {number} params.demand - Power demand
 * @param {number} params.stability - Grid stability score
 * @returns {number} Price in $/kWh
 */
export function calculatePowerPrice({ supply, demand, stability }) {
  let price = POWER_CONFIG.basePrice;

  // Supply/demand effect
  const supplyRatio = supply.total / demand;
  if (supplyRatio < 1.0) {
    const shortage = 1 - supplyRatio;
    price *= 1 + Math.pow(shortage, 2) * 5;
  } else if (supplyRatio > 1.2) {
    const surplus = supplyRatio - 1.2;
    price *= Math.max(0.5, 1 - surplus * 0.3);
  }

  // Stability effect
  if (stability < POWER_CONFIG.stabilityThresholds.good) {
    const instabilityPenalty =
      (POWER_CONFIG.stabilityThresholds.good - stability) / POWER_CONFIG.stabilityThresholds.good;
    price *= 1 + instabilityPenalty * 0.5;
  }

  // Renewable premium reduction
  const renewableShare = supply.variable / (supply.total || 1);
  price *= 1 - renewableShare * 0.15;

  // Clamp price
  const minPrice = POWER_CONFIG.priceThresholds.cheap * 0.5;
  const maxPrice = POWER_CONFIG.priceThresholds.crisis * 1.5;
  price = Math.max(minPrice, Math.min(maxPrice, price));

  return Math.round(price * 1000) / 1000;
}

/**
 * Calculate GDP/income impact from power issues
 * @param {Object} params - Impact parameters
 * @param {Object} params.supply - Supply breakdown
 * @param {number} params.demand - Power demand
 * @param {number} params.stability - Grid stability score
 * @param {number} params.pricePerKwh - Current electricity price
 * @returns {number} GDP modifier 0.5-1.0
 */
export function calculatePowerGDPImpact({ supply, demand, stability, pricePerKwh }) {
  let gdpModifier = 1.0;

  // Supply shortfall impact
  if (supply.total < demand) {
    const shortfallRatio = (demand - supply.total) / demand;
    gdpModifier -= shortfallRatio * POWER_CONFIG.shortfallGDPPenalty;
  }

  // High price impact (above $0.15/kWh)
  if (pricePerKwh > 0.15) {
    const priceExcess = pricePerKwh - 0.15;
    gdpModifier -= priceExcess * POWER_CONFIG.priceGDPPenalty;
  }

  // Instability impact
  if (stability < POWER_CONFIG.stabilityThresholds.good) {
    const instabilityRatio =
      (POWER_CONFIG.stabilityThresholds.good - stability) / POWER_CONFIG.stabilityThresholds.good;
    gdpModifier *= 1 - instabilityRatio * POWER_CONFIG.instabilityGDPPenalty;
  }

  return Math.max(0.5, Math.min(1.0, gdpModifier));
}

/**
 * Calculate happiness impact from power issues
 * @param {Object} params - Impact parameters
 * @param {Object} params.supply - Supply breakdown
 * @param {number} params.demand - Power demand
 * @param {number} params.stability - Grid stability score
 * @param {number} params.pricePerKwh - Current electricity price
 * @returns {number} Happiness change (positive or negative)
 */
export function calculatePowerHappinessImpact({ supply, demand, stability, pricePerKwh }) {
  let happinessChange = 0;

  // Stability-based happiness
  if (stability >= POWER_CONFIG.stabilityThresholds.excellent) {
    happinessChange += 2;
  } else if (stability >= POWER_CONFIG.stabilityThresholds.good) {
    // No change
  } else if (stability >= POWER_CONFIG.stabilityThresholds.warning) {
    happinessChange -= 2;
  } else if (stability >= POWER_CONFIG.stabilityThresholds.critical) {
    happinessChange -= 5;
  } else {
    happinessChange -= 10;
  }

  // High prices cause unhappiness
  if (pricePerKwh > POWER_CONFIG.priceThresholds.expensive) {
    const priceExcess = (pricePerKwh - POWER_CONFIG.priceThresholds.expensive) / 0.05;
    happinessChange -= Math.min(10, priceExcess * POWER_CONFIG.happinessHighPricePenalty);
  }

  // Power shortfall
  if (supply.total < demand * 0.9) {
    const shortfall = (demand * 0.9 - supply.total) / demand;
    happinessChange -= shortfall * POWER_CONFIG.happinessShortfallPenalty;
  }

  // Abundant cheap power
  if (supply.total > demand * 1.2 && pricePerKwh < POWER_CONFIG.priceThresholds.cheap) {
    happinessChange += POWER_CONFIG.happinessAbundanceBonus;
  }

  // Clean energy pride
  const renewableShare = supply.variable / (supply.total || 1);
  if (renewableShare > 0.5) {
    happinessChange += POWER_CONFIG.happinessCleanEnergyBonus;
  }

  return Math.round(happinessChange);
}

/**
 * Calculate grid impact preview for adding a project
 * @param {Object} params - Preview parameters
 * @param {Object} params.currentSupply - Current supply breakdown
 * @param {number} params.currentStability - Current stability score
 * @param {number} params.currentDemand - Current demand
 * @param {string} params.projectType - Project type being considered
 * @param {number} params.effectMultiplier - Effectiveness multiplier
 * @returns {Object|null} Impact preview data
 */
export function calculateGridImpactPreview({
  currentSupply,
  currentStability,
  currentDemand,
  projectType,
  effectMultiplier = 1,
}) {
  const project = PROJECT_TYPES[projectType];
  if (!project?.capacityGW) return null;

  const currentRatio = currentSupply.total / currentDemand;
  const newCapacity = project.capacityGW * effectMultiplier;
  const projectedTotal = currentSupply.total + newCapacity;
  const projectedRatio = projectedTotal / currentDemand;

  const stabilityChange = project.stabilityContribution || 0;

  return {
    currentSupplyGW: Math.round(currentSupply.total * 10) / 10,
    projectedSupplyGW: Math.round(projectedTotal * 10) / 10,
    demandGW: Math.round(currentDemand * 10) / 10,
    currentRatio: Math.round(currentRatio * 100),
    projectedRatio: Math.round(projectedRatio * 100),
    ratioChange: Math.round((projectedRatio - currentRatio) * 100),
    currentStability: Math.round(currentStability),
    stabilityChange: stabilityChange,
    twhPerYear: calculateProjectTWh(projectType, effectMultiplier),
  };
}

/**
 * Initialize power state for a region
 * @param {Object} powerData - Climate data power section
 * @param {Object} currentMix - Power mix in TWh
 * @returns {Object} Initial power state
 */
export function initializePowerState(powerData, currentMix) {
  const baseDemandGW = powerData?.baseDemandGW || 100;
  const existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;

  let variableRatio = POWER_CONFIG.existingVariableRatio;
  let baseloadRatio = POWER_CONFIG.existingBaseloadRatio;

  if (currentMix) {
    const totalTWh =
      (currentMix.coal || 0) +
      (currentMix.gas || 0) +
      (currentMix.nuclear || 0) +
      (currentMix.hydro || 0) +
      (currentMix.wind || 0) +
      (currentMix.solar || 0) +
      (currentMix.other || 0);
    const variableTWh = (currentMix.wind || 0) + (currentMix.solar || 0);
    if (totalTWh > 0) {
      variableRatio = variableTWh / totalTWh;
      baseloadRatio = (totalTWh - variableTWh) / totalTWh;
    }
  }

  return {
    demand: baseDemandGW,
    supply: existingSupply,
    stability: 85,
    variableCapacity: existingSupply * variableRatio,
    baseloadCapacity: existingSupply * baseloadRatio,
    storageCapacity: 0,
    pricePerKwh: POWER_CONFIG.basePrice,
    gdpModifier: 1.0,
    blackoutRisk: false,
    playerVariableGW: 0,
    playerBaseloadGW: 0,
    playerStorageGWh: 0,
    electrificationDemandMultiplier: 1.0,
  };
}
