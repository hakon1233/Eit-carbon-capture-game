/**
 * Emissions System
 * Contains functions for calculating and managing emissions across sectors
 */

import {
  GAME_CONFIG,
  NATURAL_SINK_CONFIG,
  SECTOR_GROWTH_RATES,
  DEVELOPMENT_GROWTH_MODIFIERS,
  EFFICIENCY_IMPROVEMENT,
  EMBODIED_CARBON,
  EMISSIONS_TO_PPM_FACTOR,
  GROWTH_CONFIG,
} from "../config/game-config.js";

import { PROJECT_TYPES } from "../config/projects.js";
import { ADVANCED_PROJECT_TYPES } from "../data/project-data.js";

/**
 * Initialize sector emissions for a region from climate data
 * @param {Object} climateData - Climate data for the region
 * @returns {Object} Sector emissions object with current, baseline, subsectors
 */
export function initializeSectorEmissions(climateData) {
  const baseData = climateData?.sectorEmissions;

  if (!baseData) {
    // Return default minimal emissions if no data available
    return {
      industry: {
        current: 0.1,
        baseline: 0.1,
        subsectors: { cement: 0.025, steel: 0.025, chemicals: 0.025, other: 0.025 },
        reductionMultiplier: 1.0,
      },
      transport: {
        current: 0.1,
        baseline: 0.1,
        subsectors: { road: 0.07, aviation: 0.015, shipping: 0.01, rail: 0.005 },
        reductionMultiplier: 1.0,
      },
      buildings: {
        current: 0.05,
        baseline: 0.05,
        subsectors: { residential: 0.03, commercial: 0.02 },
        reductionMultiplier: 1.0,
      },
      agriculture: {
        current: 0.05,
        baseline: 0.05,
        subsectors: { livestock: 0.025, crops: 0.015, landUse: 0.01 },
        reductionMultiplier: 1.0,
      },
    };
  }

  // Initialize from real data with current = baseline
  return {
    industry: {
      current: baseData.industry?.baseline || 0.1,
      baseline: baseData.industry?.baseline || 0.1,
      subsectors: { ...baseData.industry?.subsectors },
      reductionMultiplier: 1.0,
    },
    transport: {
      current: baseData.transport?.baseline || 0.1,
      baseline: baseData.transport?.baseline || 0.1,
      subsectors: { ...baseData.transport?.subsectors },
      reductionMultiplier: 1.0,
    },
    buildings: {
      current: baseData.buildings?.baseline || 0.05,
      baseline: baseData.buildings?.baseline || 0.05,
      subsectors: { ...baseData.buildings?.subsectors },
      reductionMultiplier: 1.0,
    },
    agriculture: {
      current: baseData.agriculture?.baseline || 0.05,
      baseline: baseData.agriculture?.baseline || 0.05,
      subsectors: { ...baseData.agriculture?.subsectors },
      reductionMultiplier: 1.0,
    },
  };
}

/**
 * Calculate months elapsed since game start
 * @param {Object} state - Game state with year and month
 * @returns {number} Total months elapsed
 */
export function getMonthsElapsed(state) {
  const startYear = GAME_CONFIG.startYear || 2025;
  const startMonth = GAME_CONFIG.startMonth || 1;
  const yearsElapsed = (state.year || startYear) - startYear;
  const monthsInYears = yearsElapsed * 12;
  const currentMonth = state.month || 1;
  return monthsInYears + (currentMonth - startMonth);
}

/**
 * Calculate updated sector emissions based on growth and efficiency
 * @param {Object} sectorEmissions - Region's sector emissions object
 * @param {string} devLevel - Development level (developed/emerging/developing)
 * @param {number} yearsElapsed - Years since game start
 * @returns {Object} Updated sector emissions (new object, doesn't mutate input)
 */
export function calculateSectorEmissionsUpdate(sectorEmissions, devLevel, yearsElapsed) {
  if (!sectorEmissions) return null;

  const efficiencyRate = EFFICIENCY_IMPROVEMENT[devLevel] || 0.015;
  const result = {};

  ["industry", "transport", "buildings", "agriculture"].forEach((sector) => {
    const sectorData = sectorEmissions[sector];
    if (!sectorData) {
      result[sector] = null;
      return;
    }

    const baseGrowthRate = SECTOR_GROWTH_RATES[sector] || 0.02;
    const growthModifier = DEVELOPMENT_GROWTH_MODIFIERS[devLevel]?.[sector] || 1.0;
    const effectiveGrowthRate = baseGrowthRate * growthModifier;

    // Calculate emissions with growth and efficiency applied
    let emissions = sectorData.baseline;
    emissions *= Math.pow(1 + effectiveGrowthRate, yearsElapsed);
    emissions *= Math.pow(1 - efficiencyRate, yearsElapsed);
    emissions *= sectorData.reductionMultiplier || 1.0;

    result[sector] = {
      ...sectorData,
      current: emissions,
    };
  });

  return result;
}

/**
 * Calculate total sector emissions for a region (excluding power)
 * @param {Object} region - Region state object with sectorEmissions
 * @returns {number} Total non-power emissions in Gt CO2/year
 */
export function getRegionSectorEmissionsTotal(region) {
  if (!region?.sectorEmissions) return 0;

  return ["industry", "transport", "buildings", "agriculture"].reduce((total, sector) => {
    return total + (region.sectorEmissions[sector]?.current || 0);
  }, 0);
}

/**
 * Calculate global sector emissions (sum of all regions)
 * @param {Object} regions - All regions from state
 * @returns {Object} Sector emissions breakdown {industry, transport, buildings, agriculture, total}
 */
export function calculateGlobalSectorEmissions(regions) {
  const result = {
    industry: 0,
    transport: 0,
    buildings: 0,
    agriculture: 0,
    total: 0,
  };

  if (!regions) return result;

  Object.values(regions).forEach((region) => {
    if (!region.sectorEmissions) return;
    ["industry", "transport", "buildings", "agriculture"].forEach((sector) => {
      result[sector] += region.sectorEmissions[sector]?.current || 0;
    });
  });

  result.total = result.industry + result.transport + result.buildings + result.agriculture;
  return result;
}

/**
 * Calculate ocean carbon absorption with saturation effects
 * @param {number} co2 - Current CO2 level (ppm)
 * @param {number} temperature - Current temperature anomaly
 * @param {number} oceanModifier - Tipping point modifier (1.0 = normal, 0.7 = 30% reduction)
 * @returns {number} Ocean absorption in Gt CO2/year
 */
export function calculateOceanAbsorption(co2, temperature, oceanModifier = 1.0) {
  const config = NATURAL_SINK_CONFIG.ocean;
  let absorption = config.baseAbsorption;

  // Saturation effect from high CO2
  if (co2 > config.saturationStart) {
    const ppmAbove = co2 - config.saturationStart;
    const saturationPenalty = (ppmAbove / 10) * config.saturationRate;
    absorption *= Math.max(0.5, 1 - saturationPenalty);
  }

  // Temperature effect (warmer water holds less CO2)
  const tempAbove = Math.max(0, temperature - 1.5);
  if (tempAbove > 0) {
    const tempPenalty = (tempAbove / 0.5) * config.temperatureImpact;
    absorption *= Math.max(0.6, 1 - tempPenalty);
  }

  // Apply tipping point modifier
  absorption *= oceanModifier;

  return absorption;
}

/**
 * Calculate land carbon absorption with saturation effects
 * @param {number} co2 - Current CO2 level (ppm)
 * @param {number} temperature - Current temperature anomaly
 * @param {boolean} amazonDieback - Whether Amazon dieback tipping point is triggered
 * @returns {number} Land absorption in Gt CO2/year
 */
export function calculateLandAbsorption(co2, temperature, amazonDieback = false) {
  const config = NATURAL_SINK_CONFIG.land;
  let absorption = config.baseAbsorption;

  // CO2 saturation effect
  const co2SaturationStart = 500;
  const co2SaturationRate = 0.015;
  if (co2 > co2SaturationStart) {
    const co2Excess = (co2 - co2SaturationStart) / 10;
    const saturationPenalty = co2Excess * co2SaturationRate;
    absorption *= Math.max(0.5, 1 - saturationPenalty);
  }

  // Temperature stress effect
  const tempAbove = Math.max(0, temperature - config.saturationStart);
  if (tempAbove > 0) {
    const stressPenalty = (tempAbove / 0.5) * config.saturationRate;
    absorption *= Math.max(0.3, 1 - stressPenalty);
  }

  // Amazon dieback effect
  if (amazonDieback) {
    absorption *= 0.5;
  }

  return absorption;
}

/**
 * Calculate player-created forest removal from projects
 * @param {Object} regions - All regions from state
 * @param {number} forestModifier - Forest effectiveness modifier (from tipping points)
 * @returns {number} Total forest absorption in Gt CO2/year
 */
export function calculatePlayerForestRemoval(regions, forestModifier = 1.0) {
  if (!regions) return 0;

  let totalRemoval = 0;

  Object.values(regions).forEach((region) => {
    region.projects?.forEach((project) => {
      const projectType = ADVANCED_PROJECT_TYPES?.[project.type] || PROJECT_TYPES?.[project.type];
      if (project.type === "reforestation" || projectType?.potentialKey === "forest") {
        totalRemoval += (project.co2Reduction || 0) / 1000;
      }
    });
  });

  return totalRemoval * forestModifier;
}

/**
 * Calculate player carbon capture removal (CCS and DAC projects)
 * @param {Object} regions - All regions from state
 * @returns {number} Total CCS/DAC removal in Gt CO2/year
 */
export function calculatePlayerCCSRemoval(regions) {
  if (!regions) return 0;

  let totalRemoval = 0;

  Object.values(regions).forEach((region) => {
    region.projects?.forEach((project) => {
      if (project.type === "carbonCapture" || project.type === "directAirCapture") {
        totalRemoval += (project.co2Reduction || 0) / 1000;
      }
    });
  });

  return totalRemoval;
}

/**
 * Calculate embodied carbon from clean technology manufacturing
 * @param {Object} regions - All regions from state
 * @returns {number} Embodied carbon in Gt CO2/year (amortized over project lifetimes)
 */
export function calculateEmbodiedCarbon(regions) {
  if (!regions) return 0;

  let totalEmbodied = 0;

  Object.values(regions).forEach((region) => {
    region.projects?.forEach((project) => {
      const type = project.type;
      if (EMBODIED_CARBON[type]) {
        // Assume 25-year project lifetime, distribute embodied emissions
        const capacityGW = (project.co2Reduction || 0) / 2;
        totalEmbodied += (EMBODIED_CARBON[type] * capacityGW) / 25;
      }
    });
  });

  return totalEmbodied;
}

/**
 * Calculate complete carbon balance
 * @param {Object} params - Calculation parameters
 * @param {Object} params.sectorEmissions - Global sector emissions breakdown
 * @param {Object} params.powerEmissions - Power sector emissions {total, coal, gas}
 * @param {number} params.embodiedEmissions - Embodied carbon from manufacturing
 * @param {number} params.oceanAbsorption - Ocean sink absorption
 * @param {number} params.landAbsorption - Land sink absorption
 * @param {number} params.playerForests - Player forest removal
 * @param {number} params.playerCCS - Player CCS/DAC removal
 * @returns {Object} Complete carbon balance breakdown
 */
export function calculateCarbonBalance({
  sectorEmissions,
  powerEmissions,
  embodiedEmissions,
  oceanAbsorption,
  landAbsorption,
  playerForests,
  playerCCS,
}) {
  const emissions = {
    power: powerEmissions.total,
    powerCoal: powerEmissions.coal,
    powerGas: powerEmissions.gas,
    industry: sectorEmissions.industry,
    transport: sectorEmissions.transport,
    buildings: sectorEmissions.buildings,
    agriculture: sectorEmissions.agriculture,
    embodied: embodiedEmissions,
    total:
      powerEmissions.total +
      sectorEmissions.industry +
      sectorEmissions.transport +
      sectorEmissions.buildings +
      sectorEmissions.agriculture +
      embodiedEmissions,
  };

  const removals = {
    naturalOcean: oceanAbsorption,
    naturalLand: landAbsorption,
    playerForests: playerForests,
    playerCCS: playerCCS,
    total: oceanAbsorption + landAbsorption + playerForests + playerCCS,
  };

  const netEmissions = emissions.total - removals.total;
  const ppmChange = (netEmissions / 12) * EMISSIONS_TO_PPM_FACTOR;

  return {
    emissions,
    removals,
    netEmissions,
    ppmChange,
  };
}

/**
 * Calculate sink saturation level for display
 * @param {number} currentAbsorption - Current absorption rate
 * @param {number} baseAbsorption - Base absorption rate
 * @returns {number} 0-1 saturation level
 */
export function getSinkSaturationLevel(currentAbsorption, baseAbsorption) {
  return currentAbsorption / baseAbsorption;
}

/**
 * Get ocean sink base absorption
 * @returns {number} Base ocean absorption in Gt CO2/year
 */
export function getOceanBaseAbsorption() {
  return NATURAL_SINK_CONFIG.ocean.baseAbsorption;
}

/**
 * Get land sink base absorption
 * @returns {number} Base land absorption in Gt CO2/year
 */
export function getLandBaseAbsorption() {
  return NATURAL_SINK_CONFIG.land.baseAbsorption;
}
