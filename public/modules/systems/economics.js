/**
 * Economics System
 * Contains functions for calculating GDP, growth rates, and income
 */

import { GAME_CONFIG, GROWTH_CONFIG, PROJECT_UPKEEP_RATES } from "../config/game-config.js";

/**
 * Infer development level from region ID (fallback when no climate data)
 * @param {string} regionId - Region identifier
 * @returns {string} Development level
 */
export function inferDevelopmentLevel(regionId) {
  const developedRegions = [
    "north_america",
    "western_europe",
    "northern_europe",
    "southern_europe",
    "oceania",
  ];
  const oilRegions = ["west_asia"];
  const emergingRegions = [
    "east_asia",
    "south_america",
    "southeast_asia",
    "eastern_europe",
    "asia",
  ];

  if (developedRegions.some((r) => regionId.includes(r))) return "developed";
  if (oilRegions.some((r) => regionId.includes(r))) return "oilEconomy";
  if (emergingRegions.some((r) => regionId.includes(r))) return "emerging";
  return "developing";
}

/**
 * Get development level for a region
 * @param {string} regionId - Region identifier
 * @param {Object|null} climateData - Climate data for the region
 * @returns {string} Development level (developed/emerging/developing/oilEconomy)
 */
export function getRegionDevelopmentLevel(regionId, climateData) {
  if (climateData?.developmentLevel) return climateData.developmentLevel;
  return inferDevelopmentLevel(regionId);
}

/**
 * Get GDP growth rate for a region
 * @param {string} regionId - Region identifier
 * @param {Object|null} climateData - Climate data for the region
 * @returns {number} Annual growth rate (0.02 = 2%)
 */
export function getRegionGrowthRate(regionId, climateData) {
  if (climateData?.gdpGrowthRate) return climateData.gdpGrowthRate;

  const level = getRegionDevelopmentLevel(regionId, climateData);
  return GROWTH_CONFIG.gdpGrowthRates[level] || 0.03;
}

/**
 * Calculate effective monthly GDP growth rate with all modifiers
 * @param {Object} params - Calculation parameters
 * @param {number} params.baseGrowthRate - Annual base growth rate
 * @param {number} params.powerModifier - Power stability modifier (1.0 = normal)
 * @param {number} params.disasterModifier - Disaster impact modifier (1.0 = normal)
 * @param {number} params.temperature - Current global temperature
 * @returns {number} Effective monthly growth rate
 */
export function calculateEffectiveGdpGrowth({
  baseGrowthRate,
  powerModifier = 1.0,
  disasterModifier = 1.0,
  temperature,
}) {
  // Monthly growth = annual rate / 12
  let monthlyRate = baseGrowthRate / 12;

  // Climate damage reduces growth at high temperatures
  const tempPenalty = Math.max(
    0,
    (temperature - GROWTH_CONFIG.climateGdpPenaltyStart) * GROWTH_CONFIG.climateGdpPenaltyRate
  );
  const climateMod = Math.max(GROWTH_CONFIG.minGdpGrowthModifier, 1 - tempPenalty);

  // Apply all modifiers
  const effectiveRate = monthlyRate * powerModifier * disasterModifier * climateMod;

  // Cap growth rate
  const cappedRate = Math.max(
    -0.01, // Max 1% monthly decline
    Math.min(
      (GROWTH_CONFIG.gdpGrowthRates.developing / 12) * GROWTH_CONFIG.maxGdpGrowthModifier,
      effectiveRate
    )
  );

  return cappedRate;
}

/**
 * Calculate global GDP from all regions
 * @param {Object} regions - All regions from state
 * @returns {number} Total GDP in trillions
 */
export function calculateGlobalGdp(regions) {
  if (!regions) return 0;
  return Object.values(regions).reduce((sum, r) => sum + (r.economy?.gdp || 0), 0);
}

/**
 * Calculate global emissions from all regions
 * @param {Object} regions - All regions from state
 * @returns {number} Total emissions in Gt CO2/year
 */
export function calculateGlobalEmissions(regions) {
  if (!regions) return 0;
  return Object.values(regions).reduce((sum, r) => sum + (r.emissions?.current || 0), 0);
}

/**
 * Calculate power emissions from regional power mix
 * @param {Object} currentMix - Power mix in TWh {coal, gas, other, ...}
 * @param {Object} retiredFossilGW - Retired fossil capacity {coal, gas}
 * @param {Object} capacityFactors - Capacity factors for fuel types
 * @returns {Object} Power emissions breakdown {total, coal, gas} in Gt CO2/year
 */
export function calculatePowerEmissions(currentMix, retiredFossilGW, capacityFactors) {
  if (!currentMix) {
    return { total: 0, coal: 0, gas: 0 };
  }

  let coalTWh = currentMix.coal || 0;
  let gasTWh = currentMix.gas || 0;
  const otherTWh = currentMix.other || 0;

  // Account for retired fossil capacity
  if (retiredFossilGW) {
    const retiredCoalGW = retiredFossilGW.coal || 0;
    const retiredGasGW = retiredFossilGW.gas || 0;

    const coalCapacityFactor = capacityFactors?.coal || 0.5;
    const gasCapacityFactor = capacityFactors?.naturalGas || 0.45;

    const retiredCoalTWh = retiredCoalGW * coalCapacityFactor * 8.76;
    const retiredGasTWh = retiredGasGW * gasCapacityFactor * 8.76;

    coalTWh = Math.max(0, coalTWh - retiredCoalTWh);
    gasTWh = Math.max(0, gasTWh - retiredGasTWh);
  }

  const coalEmissions = (coalTWh * GROWTH_CONFIG.emissionsPerTWhCoal) / 1000;
  const gasEmissions = (gasTWh * GROWTH_CONFIG.emissionsPerTWhGas) / 1000;
  const otherEmissions = (otherTWh * GROWTH_CONFIG.emissionsPerTWhOther) / 1000;

  return {
    total: coalEmissions + gasEmissions + otherEmissions,
    coal: coalEmissions,
    gas: gasEmissions,
  };
}

/**
 * Calculate emissions trend
 * @param {number} previousEmissions - Previous period emissions
 * @param {number} currentEmissions - Current period emissions
 * @returns {number} Trend as percentage change
 */
export function calculateEmissionsTrend(previousEmissions, currentEmissions) {
  if (previousEmissions <= 0) return 0;
  return (currentEmissions - previousEmissions) / previousEmissions;
}

/**
 * Calculate climate budget income from a region
 * @param {Object} params - Calculation parameters
 * @param {number} params.gdpTrillions - Region GDP in trillions
 * @param {number} params.climatePercent - Climate finance percentage
 * @param {number} params.gdpContributionMod - GDP contribution modifier
 * @param {number} params.powerGdpMod - Power stability modifier
 * @param {number} params.disasterMult - Disaster multiplier
 * @returns {number} Monthly climate budget income
 */
export function calculateClimateBudgetIncome({
  gdpTrillions,
  climatePercent,
  gdpContributionMod = 1.0,
  powerGdpMod = 1.0,
  disasterMult = 1.0,
}) {
  let income = ((gdpTrillions * climatePercent) / 100 / 12) * 1000;
  income *= GAME_CONFIG.climateBudgetIncomeMultiplier;
  income *= disasterMult * gdpContributionMod * powerGdpMod;
  return income;
}

/**
 * Calculate carbon tax revenue from emissions
 * @param {number} monthlyEmissions - Monthly emissions in Gt
 * @param {number} taxRate - Tax rate per ton
 * @returns {number} Carbon tax revenue
 */
export function calculateCarbonTaxRevenue(monthlyEmissions, taxRate) {
  return monthlyEmissions * taxRate;
}

export function calculateProjectUpkeep(project) {
  if (!project) {
    return 0;
  }

  if (project.subcategory?.startsWith("ccs_")) {
    return PROJECT_UPKEEP_RATES.ccs;
  }

  return PROJECT_UPKEEP_RATES[project.category] ?? PROJECT_UPKEEP_RATES.default;
}

/**
 * Apply minimum income guarantee
 * @param {number} grossIncome - Calculated gross income
 * @returns {number} Income with minimum guarantee applied
 */
export function applyMinimumIncome(grossIncome) {
  if (grossIncome === 0) {
    return GAME_CONFIG.baseIncome;
  }
  return grossIncome;
}
