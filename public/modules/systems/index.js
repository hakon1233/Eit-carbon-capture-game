/**
 * Systems barrel export
 * Re-exports all game system modules
 */

// Emissions system
export {
  initializeSectorEmissions,
  getMonthsElapsed,
  calculateSectorEmissionsUpdate,
  getRegionSectorEmissionsTotal,
  calculateGlobalSectorEmissions,
  calculateOceanAbsorption,
  calculateLandAbsorption,
  calculatePlayerForestRemoval,
  calculatePlayerCCSRemoval,
  calculateEmbodiedCarbon,
  calculateCarbonBalance,
  getSinkSaturationLevel,
  getOceanBaseAbsorption,
  getLandBaseAbsorption,
} from "./emissions.js";

// Economics system
export {
  inferDevelopmentLevel,
  getRegionDevelopmentLevel,
  getRegionGrowthRate,
  calculateEffectiveGdpGrowth,
  calculateGlobalGdp,
  calculateGlobalEmissions,
  calculatePowerEmissions,
  calculateEmissionsTrend,
  calculateClimateBudgetIncome,
  calculateCarbonTaxRevenue,
  applyMinimumIncome,
} from "./economics.js";

// Power grid system
export {
  calculateProjectTWh,
  calculatePowerDemand,
  calculateExistingSupply,
  calculatePlayerCapacity,
  calculatePowerSupply,
  calculateGridStability,
  calculatePowerPrice,
  calculatePowerGDPImpact,
  calculatePowerHappinessImpact,
  calculateGridImpactPreview,
  initializePowerState,
} from "./power-grid.js";

// Research system
export {
  RESEARCH_CENTER_BASE,
  RESEARCH_FIELDS,
  getResearchCenterRPPerMonth,
  getResearchCenterUpgradeCost,
  getResearchCenterName,
  getResearchCenterLevelData,
  calculateResearchCenterMonthlyCost,
  calculateTotalRPGeneration,
  canBuildResearchCenter,
  canUpgradeResearchCenter,
  canUnlockTech,
  getTechBonusForProject,
  calculateResearchProgress,
} from "./research.js";

// Disasters system
export {
  getDisasterVulnerability,
  calculateDisasterProbability,
  getMaxDisastersForDifficulty,
  calculateDisasterIncomeReduction,
  calculateDisasterDuration,
  getDisasterIncomeMultiplier,
  hasActiveDisaster,
  createDisasterHistoryEntry,
  calculateAwarenessBoost,
  updateDisasterHistory,
  getDisasterAwarenessModifier,
  decayRegionAwareness,
  calculateDisasterAllianceEffects,
  calculateVolcanicCO2Effect,
  processDisasterDuration,
  getNaturalDisasters,
  getDisasterById,
  getRandomDisasterDescription,
  createDisasterEvent,
} from "./disasters.js";
