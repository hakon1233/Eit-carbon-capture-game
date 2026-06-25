// ═══════════════════════════════════════════════════════════════
// MODULE IMPORTS (ES Module version)
// ═══════════════════════════════════════════════════════════════
// Import climate data from modular structure
import {
  ISO_TO_KEY,
  MAJOR_REGIONS,
  CONTINENTS,
  COUNTRY_DATA,
  REGION_AGGREGATES,
  ADVANCED_PROJECT_TYPES,
  SECTOR_POLICIES,
  EMISSION_SECTORS,
  getClimateData,
  aggregateRegionData,
  calculateProjectEffectiveness,
  getRandomFact,
  getCountryByIso,
  createDefaultCountryData,
  aggregateCountriesToRegion,
  getMajorRegionData,
  getContinentData,
  getDataForGranularity,
  getRegionIdsForGranularity,
  getParentRegion,
} from "./public/modules/data/index.js";

// Create global CLIMATE_DATA object for backward compatibility
const CLIMATE_DATA = {
  ISO_TO_KEY,
  MAJOR_REGIONS,
  CONTINENTS,
  COUNTRY_DATA,
  REGION_AGGREGATES,
  ADVANCED_PROJECT_TYPES,
  SECTOR_POLICIES,
  EMISSION_SECTORS,
  getClimateData,
  aggregateRegionData,
  calculateProjectEffectiveness,
  getRandomFact,
  getCountryByIso,
  createDefaultCountryData,
  aggregateCountriesToRegion,
  getMajorRegionData,
  getContinentData,
  getDataForGranularity,
  getRegionIdsForGranularity,
  getParentRegion,
};

// Expose CLIMATE_DATA globally for map region detection
if (typeof window !== "undefined") {
  window.CLIMATE_DATA = CLIMATE_DATA;
}

// ═══════════════════════════════════════════════════════════════
// DEBUG LOGGING
// ═══════════════════════════════════════════════════════════════
// Verbose "[Map]" tracing (game load, setup, region/SVG clicks) is useful when
// debugging map wiring but is pure noise in the production console on every click.
// It is gated behind a flag (default off). Flip it on at runtime in DevTools via
// `window.DEBUG_MAP = true` — no rebuild needed. Genuine warnings stay on
// `console.warn` and are never gated. (CAR-82 follow-up.)
function mapDebug(...args) {
  if (typeof window !== "undefined" && window.DEBUG_MAP === true) {
    console.log(...args);
  }
}

// ═══════════════════════════════════════════════════════════════
// GAME CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH: GAME_CONFIG and all gameplay config below live HERE.
// ./public/modules/config/ and ./public/modules/systems/ are NOT imported by the
// build (only ./public/modules/data/ is wired in) — they are stale, orphaned copies
// from an unfinished modularization. Do NOT edit them expecting changes to ship;
// edit this file. See public/modules/README.md and CAR-61 findings.
const GAME_CONFIG = {
  // Currency settings (real-world billions USD)
  startingFunds: 25,            // $25 billion starting budget (reduced for balance)
  currencyUnit: "B",            // Billions
  currencySymbol: "$",          // USD

  // Climate settings
  startingCo2: 423,             // Current CO2 level (2025)
  startingTemp: 1.0715,         // Seed = calculateTemperature(423): 423 * 0.0105 - 3.37 = 1.0715°C (displays +1.07°C). Must match the formula so temp doesn't dip on the first tick (CAR-22).
  startYear: 2025,
  startMonth: 1,
  co2Increase: 0.29,            // ppm per month (3.5 ppm/year from WMO 2023-2024 data, legacy fallback)
  // Temperature formula: T(c) = c * 0.0105 - 3.37 (no baseline subtraction needed)
  tempFactor: 0.0105,           // °C per ppm (new formula coefficient)
  tempOffset: -3.37,            // Temperature offset (new formula)
  baselineCo2: 320,             // Minimum CO2 floor (ultimate win = 0°C)

  // Win/lose conditions (based on new formula)
  winCo2: 416,                  // +1.0°C target
  loseCo2: 511,                 // +2.0°C catastrophic (Paris Agreement limit)
  winTemp: 1.0,                 // Win at +1.0°C
  loseTemp: 2.0,                // Lose at +2.0°C
  loseYear: 2100,

  // Climate Policy Campaign settings
  lobbyCostFactor: 0.005,       // 0.5% of GDP × difficulty
  lobbyBaseMonths: 12,          // Base duration in months
  lobbyMinIncrease: 0.2,        // Minimum % increase from campaign
  lobbyMaxIncrease: 0.5,        // Maximum % increase (easier countries)

  // Legacy (for backward compatibility)
  startingCredits: 100,
  baseIncome: 5,

  // Economy balance — both levers applied lightly (CAR-17)
  climateBudgetIncomeMultiplier: 0.6,
};

const PROJECT_UPKEEP_RATES = {
  default: 1.0,
  power: 1.5,
  economic: 1.2,
  electrification: 0.8,
  ccs: 1.2,
};

// Regional Project Caps - Max number of each project type per region
// This prevents unrealistic concentration of projects and adds strategic planning
const REGIONAL_PROJECT_CAPS = {
  forest: 3,            // Limited suitable land for reforestation
  carbonCapture: 2,     // Infrastructure and storage limitations
  solar: 5,             // Grid integration limits
  wind: 4,              // Suitable sites limited
  offshoreWind: 3,      // Coastal locations limited
  nuclear: 2,           // Political and safety constraints
  coal: 3,              // (existing plants, allows building but limited)
  naturalGas: 4,        // More flexible, but still limited
  geothermal: 2,        // Location-dependent
  hydropower: 2,        // River/dam sites limited
  batteryStorage: 6,    // More flexible infrastructure
  pumpedHydro: 2,       // Requires specific geography
  research: 2,          // Research centers per region
  infrastructure: 4,    // General infrastructure
  // CCS Capture Projects
  postCombustionCapture: 3,   // Retrofit multiple existing plants
  preCombustionCapture: 2,    // New IGCC facilities limited
  oxyfuelCapture: 2,          // Specialized facilities limited
  directAirCapture: 4,        // Can be built anywhere (modular)
  beccsPlant: 2,              // Biomass supply limitations
  // CCS Transport Infrastructure
  co2Pipeline: 3,             // Regional pipeline networks
  co2OffshorePipeline: 2,     // Requires coastal regions
  co2ShipTerminal: 2,         // Requires coastal/port regions
  // CCS Storage Infrastructure
  depletedReservoirStorage: 2,  // Limited by geological availability
  salineAquiferStorage: 2,      // Limited by suitable formations
  // CCS Integrated Hubs
  ccsHubSmall: 2,             // Regional hubs
  ccsHubMajor: 1,             // Only one major complex per region
  // Default: null means no cap
};

// Growth System Configuration
const GROWTH_CONFIG = {
  // GDP Growth Rates by development level (annual %)
  gdpGrowthRates: {
    developed: 0.02,      // 2% - USA, Europe, Japan, Australia
    emerging: 0.04,       // 4% - China, Brazil, Southeast Asia
    developing: 0.055,    // 5.5% - Africa, South Asia
    oilEconomy: 0.025,    // 2.5% - Saudi Arabia, UAE, Gulf states
  },

  // Emissions intensity (Gt CO2 per 1000 TWh of generation)
  emissionsPerTWhCoal: 0.9,     // Coal is highest emitter
  emissionsPerTWhGas: 0.4,      // Gas is about half of coal
  emissionsPerTWhOther: 0.2,    // Oil, diesel generators

  // Conversion factor: regional Gt emissions to global ppm CO2
  emissionsToGlobalCO2: 0.0025,

  // GDP growth modifiers
  maxGdpGrowthModifier: 1.5,    // Cap growth at 150% of base rate
  minGdpGrowthModifier: 0.5,    // Floor at 50% of base rate
  climateGdpPenaltyStart: 1.5,  // Temperature where GDP penalty begins
  climateGdpPenaltyRate: 0.1,   // -10% growth per degree above threshold
};

// ═══════════════════════════════════════════════════════════════
// SECTOR EMISSIONS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Base annual growth rates per sector (before development modifiers)
const SECTOR_GROWTH_RATES = {
  industry: 0.025,      // 2.5%/year base
  transport: 0.03,      // 3%/year base
  buildings: 0.02,      // 2%/year base
  agriculture: 0.015,   // 1.5%/year base
};

// Growth rate multipliers by development level
const DEVELOPMENT_GROWTH_MODIFIERS = {
  developed: {
    industry: 0.5,      // 50% of base rate (slower growth, mature economies)
    transport: 0.6,
    buildings: 0.4,
    agriculture: 0.3,
  },
  emerging: {
    industry: 1.2,      // 120% of base (faster growth, industrializing)
    transport: 1.5,
    buildings: 1.0,
    agriculture: 0.8,
  },
  developing: {
    industry: 1.8,      // 180% (rapid industrialization)
    transport: 2.0,
    buildings: 1.5,
    agriculture: 1.0,
  },
  oilEconomy: {
    industry: 1.0,
    transport: 1.2,
    buildings: 0.8,
    agriculture: 0.5,
  },
};

// Automatic carbon intensity improvement (annual % reduction in emissions per GDP)
const EFFICIENCY_IMPROVEMENT = {
  developed: 0.015,     // 1.5%/year efficiency gain
  emerging: 0.02,       // 2%/year (catching up with better tech)
  developing: 0.025,    // 2.5%/year (leapfrogging old tech)
  oilEconomy: 0.01,     // 1%/year (slower transition)
};

// Natural carbon sink configuration (GCB 2025)
const NATURAL_SINK_CONFIG = {
  ocean: {
    baseAbsorption: 12.2,      // Gt CO2/year - GCB 2025 (29% of 42.2 Gt emissions)
    saturationStart: 450,      // ppm where absorption efficiency starts dropping
    saturationRate: 0.02,      // 2% less effective per 10 ppm above start
    temperatureImpact: 0.05,   // 5% less effective per 0.5°C above 1.5°C
  },
  land: {
    baseAbsorption: 8.9,       // Gt CO2/year - GCB 2025 (21% of 42.2 Gt emissions)
    saturationStart: 2.0,      // °C where forest stress begins
    saturationRate: 0.1,       // 10% less effective per 0.5°C above start
  },
};

// Embodied carbon for clean technology manufacturing (Gt CO2 per GW capacity)
const EMBODIED_CARBON = {
  solar: 0.0015,         // ~1.5 Mt CO2 per GW of solar (manufacturing, materials)
  wind: 0.0008,          // ~0.8 Mt CO2 per GW of wind
  offshoreWind: 0.001,   // ~1.0 Mt CO2 per GW offshore
  nuclear: 0.002,        // ~2.0 Mt CO2 per GW (concrete, steel intensive)
  batteryStorage: 0.05,  // ~50 kt CO2 per GWh of battery capacity
  hydropower: 0.003,     // ~3.0 Mt CO2 per GW (dam construction)
  geothermal: 0.0012,    // ~1.2 Mt CO2 per GW
};

// Conversion factor: Gt CO2/year to ppm/month
// Formula: c = (m - 18.4) * 0.1277247 yearly, where 18.4 Gt/year is Earth's natural carbon storage
// Monthly: c = (m - 1.54) * 0.1277247, where 1.54 Gt/month is monthly natural storage
// Natural storage is handled by ocean/land absorption in getCarbonRemovals()
const EMISSIONS_TO_PPM_FACTOR = 0.1277247;

// ═══════════════════════════════════════════════════════════════
// SECTOR EMISSIONS INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize sector emissions for a region from climate data
 * Each sector has: current (dynamic), baseline (reference), and subsectors
 * @param {Object} climateData - Climate data for the region
 * @returns {Object} Sector emissions object
 */
function initializeSectorEmissions(climateData) {
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
      reductionMultiplier: 1.0, // Modified by projects/policies/tech
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

// ═══════════════════════════════════════════════════════════════
// SECTOR EMISSIONS UPDATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate months elapsed since game start
 * @returns {number} Total months elapsed
 */
function getMonthsElapsed() {
  const startYear = GAME_CONFIG.startYear || 2025;
  const startMonth = GAME_CONFIG.startMonth || 1;
  const yearsElapsed = (state.year || startYear) - startYear;
  const monthsInYears = yearsElapsed * 12;
  const currentMonth = state.month || 1;
  return monthsInYears + (currentMonth - startMonth);
}

/**
 * Update sector emissions for a region based on growth and efficiency
 * @param {string} regionId
 * @param {Object} region - Region state object
 */
function updateSectorEmissions(regionId, region) {
  if (!region.sectorEmissions) return;

  const devLevel = getRegionDevelopmentLevel(regionId);
  const monthsElapsed = getMonthsElapsed();
  const yearsElapsed = monthsElapsed / 12;

  // Get efficiency improvement rate for this development level
  const efficiencyRate = EFFICIENCY_IMPROVEMENT[devLevel] || 0.015;

  ['industry', 'transport', 'buildings', 'agriculture'].forEach(sector => {
    const sectorData = region.sectorEmissions[sector];
    if (!sectorData) return;

    const baseGrowthRate = SECTOR_GROWTH_RATES[sector] || 0.02;
    const growthModifier = DEVELOPMENT_GROWTH_MODIFIERS[devLevel]?.[sector] || 1.0;
    const effectiveGrowthRate = baseGrowthRate * growthModifier;

    // Calculate emissions with growth applied
    let emissions = sectorData.baseline;

    // Apply growth: baseline × (1 + growthRate)^years
    emissions *= Math.pow(1 + effectiveGrowthRate, yearsElapsed);

    // Apply efficiency improvement: × (1 - efficiencyRate)^years
    emissions *= Math.pow(1 - efficiencyRate, yearsElapsed);

    // Apply player reduction multiplier (from projects/policies/tech)
    emissions *= sectorData.reductionMultiplier || 1.0;

    // Update current emissions
    sectorData.current = emissions;
  });
}

/**
 * Update sector emissions for all regions (called monthly)
 */
function updateAllSectorEmissions() {
  if (!state.regions) return;

  Object.entries(state.regions).forEach(([regionId, region]) => {
    updateSectorEmissions(regionId, region);
  });
}

/**
 * Get total sector emissions for a region (excluding power)
 * @param {string} regionId
 * @returns {number} Total non-power emissions in Gt CO2/year
 */
function getRegionSectorEmissions(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.sectorEmissions) return 0;

  return ['industry', 'transport', 'buildings', 'agriculture'].reduce((total, sector) => {
    return total + (region.sectorEmissions[sector]?.current || 0);
  }, 0);
}

/**
 * Get global sector emissions breakdown
 * @returns {Object} Emissions by sector across all regions
 */
function getGlobalSectorEmissions() {
  const totals = {
    industry: 0,
    transport: 0,
    buildings: 0,
    agriculture: 0,
  };

  if (!state.regions) return totals;

  Object.values(state.regions).forEach(region => {
    if (!region.sectorEmissions) return;
    ['industry', 'transport', 'buildings', 'agriculture'].forEach(sector => {
      totals[sector] += region.sectorEmissions[sector]?.current || 0;
    });
  });

  return totals;
}

/**
 * Get detailed emissions breakdown for a single region (power + sectors)
 * Used for carbon balance popup display
 * @param {string} regionId
 * @returns {Object} Emissions breakdown for the region
 */
function getRegionEmissionsDetail(regionId) {
  const region = state.regions?.[regionId];
  if (!region) return null;

  const climateData = getClimateDataForRegion(regionId);
  const currentMix = climateData?.power?.currentMixTWh;

  // Calculate power emissions for this region
  let powerCoal = 0;
  let powerGas = 0;

  if (currentMix) {
    const baseCoalEmissions = (currentMix.coal || 0) * 0.001;
    const baseGasEmissions = (currentMix.gas || 0) * 0.00045;

    // Calculate reduction from player-built clean capacity
    const totalTWh = Object.values(currentMix).reduce((a, b) => a + b, 0);
    const playerCleanGW = (region.power?.playerVariableGW || 0) + (region.power?.playerBaseloadGW || 0);
    const playerCleanTWh = playerCleanGW * 8.76 * 0.3;
    const cleanRatio = Math.min(1, playerCleanTWh / (totalTWh || 1));
    const reductionFactor = 1 - cleanRatio * 0.8;

    powerCoal = baseCoalEmissions * reductionFactor;
    powerGas = baseGasEmissions * reductionFactor;
  }

  // Get sector emissions
  const sectorEmissions = region.sectorEmissions || {};
  const industry = sectorEmissions.industry?.current || 0;
  const transport = sectorEmissions.transport?.current || 0;
  const buildings = sectorEmissions.buildings?.current || 0;
  const agriculture = sectorEmissions.agriculture?.current || 0;

  const total = powerCoal + powerGas + industry + transport + buildings + agriculture;

  return {
    regionId,
    regionName: getRegionName(regionId),
    powerCoal,
    powerGas,
    power: powerCoal + powerGas,
    industry,
    transport,
    buildings,
    agriculture,
    total,
    sectors: { powerCoal, powerGas, industry, transport, buildings, agriculture },
  };
}

/**
 * Get emissions breakdown for all regions, sorted by total emissions
 * @returns {Array} Array of region emissions objects, sorted descending by total
 */
function getRegionEmissionsBreakdown() {
  if (!state.regions) return [];

  const regionEmissions = Object.keys(state.regions)
    .map(regionId => getRegionEmissionsDetail(regionId))
    .filter(Boolean);

  // Sort by total emissions descending
  regionEmissions.sort((a, b) => b.total - a.total);

  return regionEmissions;
}

/**
 * Get emissions snapshot for history tracking
 * @returns {Object} Current emissions state for all regions
 */
function getEmissionsSnapshot() {
  const breakdown = getRegionEmissionsBreakdown();
  const snapshot = {};

  breakdown.forEach(region => {
    snapshot[region.regionId] = {
      total: region.total,
      power: region.power,
      industry: region.industry,
      transport: region.transport,
      buildings: region.buildings,
      agriculture: region.agriculture,
    };
  });

  // Add global totals
  const balance = getCarbonBalance();
  snapshot._global = {
    total: balance.emissions.total,
    removals: balance.removals.total,
    net: balance.netEmissions,
  };

  return snapshot;
}

/**
 * Get emissions trend compared to history
 * @param {string} regionId - Region to get trend for, or '_global' for global
 * @param {number} monthsAgo - How many months back to compare (1 = last month, 12 = last year)
 * @returns {Object|null} Trend data {change, percentChange}
 */
function getEmissionsTrend(regionId, monthsAgo) {
  if (!state.emissionsHistory || state.emissionsHistory.length < monthsAgo + 1) {
    return null;
  }

  const current = state.emissionsHistory[state.emissionsHistory.length - 1];
  const past = state.emissionsHistory[state.emissionsHistory.length - 1 - monthsAgo];

  if (!current?.[regionId] || !past?.[regionId]) return null;

  const currentTotal = current[regionId].total;
  const pastTotal = past[regionId].total;
  const change = currentTotal - pastTotal;
  const percentChange = pastTotal > 0 ? (change / pastTotal) * 100 : 0;

  return { change, percentChange };
}

/**
 * Apply sector reduction from a completed project
 * @param {Object} region - Region state object
 * @param {Object} sectorReduction - Reduction config { sector: { subsector: reductionPercent } }
 */
function applySectorReduction(region, sectorReduction) {
  if (!region.sectorEmissions || !sectorReduction) return;

  Object.entries(sectorReduction).forEach(([sectorName, subsectorReductions]) => {
    const sector = region.sectorEmissions[sectorName];
    if (!sector) return;

    // Calculate total reduction for this sector
    let totalReduction = 0;
    Object.entries(subsectorReductions).forEach(([subsector, reduction]) => {
      // Reduction is a percentage (0.15 = 15% reduction)
      totalReduction += reduction;
    });

    // Apply reduction to the sector's reductionMultiplier
    // Multiple projects stack multiplicatively
    const currentMultiplier = sector.reductionMultiplier || 1.0;
    sector.reductionMultiplier = currentMultiplier * (1 - totalReduction);

    // Sector-specific floors - different sectors have different minimum emissions
    const sectorFloors = {
      power: 0.0,       // Can fully decarbonize with renewables
      industry: 0.05,   // 5% floor - some process emissions unavoidable
      transport: 0.05,  // 5% floor - aviation/shipping hard to decarbonize
      buildings: 0.02,  // 2% floor - heating in cold climates
      agriculture: 0.10 // 10% floor - livestock/soil emissions
    };
    const floor = sectorFloors[sectorName] || 0.1;
    sector.reductionMultiplier = Math.max(floor, sector.reductionMultiplier);
  });
}

/**
 * Get sector reduction multiplier for a region
 * @param {string} regionId
 * @param {string} sector - Sector name (industry, transport, buildings, agriculture)
 * @returns {number} Reduction multiplier (1.0 = no reduction, 0.5 = 50% reduction)
 */
function getSectorReductionMultiplier(regionId, sector) {
  const region = state.regions?.[regionId];
  if (!region?.sectorEmissions?.[sector]) return 1.0;
  return region.sectorEmissions[sector].reductionMultiplier || 1.0;
}

// ═══════════════════════════════════════════════════════════════
// NATURAL CARBON SINKS WITH SATURATION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate ocean carbon absorption with saturation effects
 * Oceans absorb less CO2 as atmospheric levels rise and temperatures increase
 * @returns {number} Ocean absorption in Gt CO2/year
 */
function calculateOceanAbsorption() {
  const config = NATURAL_SINK_CONFIG.ocean;
  let absorption = config.baseAbsorption;

  // Saturation effect from high CO2
  if (state.co2 > config.saturationStart) {
    const ppmAbove = state.co2 - config.saturationStart;
    const saturationPenalty = (ppmAbove / 10) * config.saturationRate;
    absorption *= Math.max(0.5, 1 - saturationPenalty); // Floor at 50% effectiveness
  }

  // Temperature effect (warmer water holds less CO2)
  const tempAbove = Math.max(0, state.temperature - 1.5);
  if (tempAbove > 0) {
    const tempPenalty = (tempAbove / 0.5) * config.temperatureImpact;
    absorption *= Math.max(0.6, 1 - tempPenalty); // Floor at 60% effectiveness
  }

  // Ocean circulation tipping point effect (30% reduction when triggered)
  const oceanMod = getOceanAbsorptionModifier();
  absorption *= oceanMod;

  return absorption;
}

/**
 * Calculate land carbon absorption with saturation effects
 * Land sinks become stressed at higher temperatures and CO2 levels
 * @returns {number} Land absorption in Gt CO2/year
 */
function calculateLandAbsorption() {
  const config = NATURAL_SINK_CONFIG.land;
  let absorption = config.baseAbsorption;

  // CO2 saturation effect (similar to ocean but starts later)
  // Land sinks become less effective at very high CO2 levels
  const co2SaturationStart = 500; // ppm - higher threshold than ocean (450)
  const co2SaturationRate = 0.015; // 1.5% reduction per 10 ppm above threshold
  if (state.co2 > co2SaturationStart) {
    const co2Excess = (state.co2 - co2SaturationStart) / 10;
    const saturationPenalty = co2Excess * co2SaturationRate;
    absorption *= Math.max(0.5, 1 - saturationPenalty); // Floor at 50%
  }

  // Temperature stress effect
  const tempAbove = Math.max(0, state.temperature - config.saturationStart);
  if (tempAbove > 0) {
    const stressPenalty = (tempAbove / 0.5) * config.saturationRate;
    absorption *= Math.max(0.3, 1 - stressPenalty); // Floor at 30% effectiveness
  }

  // Check for Amazon dieback tipping point
  if (state.tippingPointsTriggered?.includes('amazon_dieback')) {
    absorption *= 0.5; // 50% reduction if Amazon is collapsing
  }

  return absorption;
}

/**
 * Calculate player-created forest removal (from reforestation projects)
 * @returns {number} Player forest absorption in Gt CO2/year
 */
function calculatePlayerForestRemoval() {
  if (!state.regions) return 0;

  let totalRemoval = 0;
  const forestMod = getForestEffectivenessModifier(); // Accounts for Amazon dieback

  Object.values(state.regions).forEach(region => {
    // Sum CO2 reduction from forest projects
    region.projects?.forEach(project => {
      // BUG-CAR-89: completed projects persist only type and optional effectMultiplier.
      const projectType = typeof project === "string" ? project : project.type;
      const projectDef = PROJECT_TYPES?.[projectType] || ADVANCED_PROJECT_TYPES?.[projectType];
      const effectMultiplier = typeof project === "object" ? (project.effectMultiplier ?? 1) : 1;
      if (projectType === "forest" || projectDef?.potentialKey === "forest") {
        const baseRemoval = projectDef?.co2Reduction ?? (projectDef?.baseCo2Reduction ?? 0) / 1000;
        totalRemoval += baseRemoval * effectMultiplier;
      }
    });
  });

  return totalRemoval * forestMod;
}

/**
 * Calculate player carbon capture removal (CCS and DAC projects)
 * @returns {number} Player CCS/DAC removal in Gt CO2/year
 */
function calculatePlayerCCSRemoval() {
  if (!state.regions) return 0;

  let totalRemoval = 0;

  // All CCS project types that capture/remove CO2
  const ccsProjectTypes = [
    'carbonCapture', 'directAirCapture',
    'postCombustionCapture', 'preCombustionCapture', 'oxyfuelCapture',
    'beccsPlant', 'ccsHubSmall', 'ccsHubMajor'
  ];

  Object.entries(state.regions).forEach(([regionId, region]) => {
    // Calculate infrastructure bonus for this region
    let infraBonus = 1.0;
    const hasTransport = region.projects?.some(p =>
      ['co2Pipeline', 'co2OffshorePipeline', 'co2ShipTerminal'].includes(typeof p === "string" ? p : p.type)
    );
    const hasStorage = region.projects?.some(p =>
      ['depletedReservoirStorage', 'salineAquiferStorage'].includes(typeof p === "string" ? p : p.type)
    );
    if (hasTransport) infraBonus += 0.25;
    if (hasStorage) infraBonus += 0.25;
    if (hasTransport && hasStorage) infraBonus += 0.15;

    region.projects?.forEach(project => {
      const projectType = typeof project === "string" ? project : project.type;
      const projectDef = PROJECT_TYPES?.[projectType] || ADVANCED_PROJECT_TYPES?.[projectType];
      const effectMultiplier = typeof project === "object" ? (project.effectMultiplier ?? 1) : 1;
      if (ccsProjectTypes.includes(projectType) || projectDef?.potentialKey === "carbonCapture") {
        const baseCo2Reduction = projectDef?.co2Reduction ?? (projectDef?.baseCo2Reduction ?? 0) / 1000;
        // Apply infrastructure bonus
        const adjustedReduction = baseCo2Reduction * effectMultiplier * infraBonus;
        totalRemoval += adjustedReduction;
      }
    });
  });

  return totalRemoval;
}

/**
 * Get total natural + player carbon removals
 * @returns {Object} Breakdown of all carbon removals
 */
function getCarbonRemovals() {
  return {
    naturalOcean: calculateOceanAbsorption(),
    naturalLand: calculateLandAbsorption(),
    playerForests: calculatePlayerForestRemoval(),
    playerCCS: calculatePlayerCCSRemoval(),
  };
}

/**
 * Calculate ocean sink saturation level (for UI display)
 * @returns {number} 0-1 representing current/base absorption capacity
 */
function getOceanSaturationLevel() {
  const current = calculateOceanAbsorption();
  const base = NATURAL_SINK_CONFIG.ocean.baseAbsorption;
  return current / base;
}

/**
 * Calculate land sink saturation level (for UI display)
 * @returns {number} 0-1 representing current/base absorption capacity
 */
function getLandSaturationLevel() {
  const current = calculateLandAbsorption();
  const base = NATURAL_SINK_CONFIG.land.baseAbsorption;
  return current / base;
}

// ═══════════════════════════════════════════════════════════════
// CARBON BALANCE CALCULATION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate power sector emissions from all regions
 * @returns {Object} Power emissions breakdown {total, coal, gas} in Gt CO2/year
 */
function calculateGlobalPowerEmissions() {
  if (!state.regions) return { total: 0, coal: 0, gas: 0 };

  let totalCoal = 0;
  let totalGas = 0;

  Object.entries(state.regions).forEach(([regionId, region]) => {
    const climateData = getClimateDataForRegion(regionId);
    const currentMix = climateData?.power?.currentMixTWh;

    if (currentMix) {
      // Calculate base emissions from fossil sources
      // Coal: ~1000 g CO2/kWh = 1 Mt CO2/TWh
      // Gas: ~450 g CO2/kWh = 0.45 Mt CO2/TWh
      const baseCoalEmissions = (currentMix.coal || 0) * 0.001; // Convert Mt to Gt
      const baseGasEmissions = (currentMix.gas || 0) * 0.00045;

      // Calculate reduction from player-built clean capacity
      const totalTWh = Object.values(currentMix).reduce((a, b) => a + b, 0);
      const playerCleanGW = (region.power?.playerVariableGW || 0) + (region.power?.playerBaseloadGW || 0);
      const playerCleanTWh = playerCleanGW * 8.76 * 0.3; // Assume 30% average capacity factor
      const cleanRatio = Math.min(1, playerCleanTWh / (totalTWh || 1));
      const reductionFactor = 1 - cleanRatio * 0.8; // Player clean reduces fossil by 80%

      totalCoal += baseCoalEmissions * reductionFactor;
      totalGas += baseGasEmissions * reductionFactor;
    }
  });

  return {
    total: totalCoal + totalGas,
    coal: totalCoal,
    gas: totalGas,
  };
}

/**
 * Calculate embodied carbon from ongoing construction
 * @returns {number} Embodied carbon emissions in Gt CO2/year (annualized)
 */
function calculateEmbodiedCarbon() {
  if (!state.underConstruction) return 0;

  let totalEmbodied = 0;

  state.underConstruction.forEach(construction => {
    const projectType = construction.type;

    // Check if this is a power project with embodied carbon
    if (EMBODIED_CARBON[projectType]) {
      // Get capacity being built (from construction data)
      const capacityGW = construction.capacityGW || 1;

      // Embodied carbon spread over construction period
      const monthsRemaining = construction.monthsRemaining || 1;
      const totalMonths = construction.totalMonths || monthsRemaining;
      const monthlyEmbodied = (EMBODIED_CARBON[projectType] * capacityGW) / totalMonths;

      // Convert to annual rate (Gt/year)
      totalEmbodied += monthlyEmbodied * 12;
    }
  });

  return totalEmbodied;
}

/**
 * Calculate complete carbon balance (emissions vs removals)
 * Updates state.carbonBalance with full breakdown
 */
function calculateCarbonBalance() {
  // Get sector emissions
  const sectorEmissions = getGlobalSectorEmissions();

  // Get power emissions (with coal/gas breakdown)
  const powerEmissions = calculateGlobalPowerEmissions();

  // Get embodied carbon
  const embodiedEmissions = calculateEmbodiedCarbon();

  // Calculate total emissions
  const emissions = {
    power: powerEmissions.total,
    powerCoal: powerEmissions.coal,
    powerGas: powerEmissions.gas,
    industry: sectorEmissions.industry,
    transport: sectorEmissions.transport,
    buildings: sectorEmissions.buildings,
    agriculture: sectorEmissions.agriculture,
    embodied: embodiedEmissions,
    total: powerEmissions.total + sectorEmissions.industry + sectorEmissions.transport +
           sectorEmissions.buildings + sectorEmissions.agriculture + embodiedEmissions,
  };

  // Get removals
  const removals = getCarbonRemovals();
  removals.total = removals.naturalOcean + removals.naturalLand +
                   removals.playerForests + removals.playerCCS;

  // Calculate net emissions
  const netEmissions = emissions.total - removals.total;

  // Calculate ppm change per month
  const ppmChange = (netEmissions / 12) * EMISSIONS_TO_PPM_FACTOR;

  // Store in state for UI access
  state.carbonBalance = {
    emissions,
    removals,
    netEmissions,
    ppmChange,
  };

  return state.carbonBalance;
}

/**
 * Get carbon balance (calculates if not cached)
 * @returns {Object} Carbon balance breakdown
 */
function getCarbonBalance() {
  if (!state.carbonBalance) {
    calculateCarbonBalance();
  }
  return state.carbonBalance;
}

// ═══════════════════════════════════════════════════════════════
// GROWTH SYSTEM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get development level for a region
 * @param {string} regionId
 * @returns {string} Development level (developed/emerging/developing/oilEconomy)
 */
function getRegionDevelopmentLevel(regionId) {
  const climateData = getClimateDataForRegion(regionId);
  if (climateData?.developmentLevel) return climateData.developmentLevel;

  // Fallback inference from region name
  const developedRegions = ["north_america", "western_europe", "northern_europe",
                           "southern_europe", "oceania"];
  const oilRegions = ["west_asia"];
  const emergingRegions = ["east_asia", "south_america", "southeast_asia", "eastern_europe", "asia"];

  if (developedRegions.some(r => regionId.includes(r))) return "developed";
  if (oilRegions.some(r => regionId.includes(r))) return "oilEconomy";
  if (emergingRegions.some(r => regionId.includes(r))) return "emerging";
  return "developing";
}

/**
 * Get GDP growth rate for a region
 * @param {string} regionId
 * @returns {number} Annual growth rate (0.02 = 2%)
 */
function getRegionGrowthRate(regionId) {
  const climateData = getClimateDataForRegion(regionId);
  if (climateData?.gdpGrowthRate) return climateData.gdpGrowthRate;

  const level = getRegionDevelopmentLevel(regionId);
  return GROWTH_CONFIG.gdpGrowthRates[level] || 0.03;
}

/**
 * Update GDP for all regions (called monthly)
 * GDP growth affected by: power stability, disasters, climate damage
 */
function updateRegionalGdp() {
  if (!state.regions) return;

  Object.entries(state.regions).forEach(([regionId, region]) => {
    if (!region.economy) return; // Skip if not initialized

    // Monthly growth = annual rate / 12
    let monthlyRate = region.economy.growthRate / 12;

    // Power stability modifier (poor power = slower growth)
    const powerMod = region.power?.gdpModifier || 1.0;

    // Disaster modifier
    const disasterMod = getDisasterIncomeMultiplier(regionId);

    // Climate damage reduces growth at high temperatures
    const tempPenalty = Math.max(0, (state.temperature - GROWTH_CONFIG.climateGdpPenaltyStart) * GROWTH_CONFIG.climateGdpPenaltyRate);
    const climateMod = Math.max(GROWTH_CONFIG.minGdpGrowthModifier, 1 - tempPenalty);

    // Apply all modifiers
    const effectiveRate = monthlyRate * powerMod * disasterMod * climateMod;

    // Cap growth rate
    const cappedRate = Math.max(
      -0.01, // Max 1% monthly decline
      Math.min(GROWTH_CONFIG.gdpGrowthRates.developing / 12 * GROWTH_CONFIG.maxGdpGrowthModifier, effectiveRate)
    );

    // Apply growth
    region.economy.gdp *= (1 + cappedRate);
  });
}

/**
 * Calculate emissions for a region based on power mix
 * @param {string} regionId
 * @param {object} climateData - Optional climate data
 * @returns {number} Annual emissions in Gt CO2
 */
function calculateRegionEmissions(regionId, climateData = null) {
  const region = state.regions?.[regionId];
  climateData = climateData || getClimateDataForRegion(regionId);

  if (!climateData) {
    return climateData?.emissions?.total || 0;
  }

  const currentMix = climateData?.power?.currentMixTWh;
  if (!currentMix) {
    return climateData?.emissions?.total || 0;
  }

  // Calculate emissions from power generation (TWh to Gt CO2)
  let coalTWh = currentMix.coal || 0;
  let gasTWh = currentMix.gas || 0;
  const otherTWh = currentMix.other || 0;

  // Account for retired fossil capacity (from "Replace" build mode)
  if (region?.retiredFossilGW) {
    const retiredCoalGW = region.retiredFossilGW.coal || 0;
    const retiredGasGW = region.retiredFossilGW.gas || 0;

    // Convert retired GW to TWh that is no longer being produced
    // TWh = GW * capacity_factor * 8760 / 1000
    const coalCapacityFactor = CAPACITY_FACTORS?.coal || 0.50;
    const gasCapacityFactor = CAPACITY_FACTORS?.naturalGas || 0.45;

    const retiredCoalTWh = retiredCoalGW * coalCapacityFactor * 8.76; // 8760/1000
    const retiredGasTWh = retiredGasGW * gasCapacityFactor * 8.76;

    // Reduce the effective TWh from fossil
    coalTWh = Math.max(0, coalTWh - retiredCoalTWh);
    gasTWh = Math.max(0, gasTWh - retiredGasTWh);
  }

  let powerEmissions = (
    coalTWh * GROWTH_CONFIG.emissionsPerTWhCoal +
    gasTWh * GROWTH_CONFIG.emissionsPerTWhGas +
    otherTWh * GROWTH_CONFIG.emissionsPerTWhOther
  ) / 1000; // Convert to Gt

  // GDP growth increases non-power emissions (industry, transport)
  const gdpMultiplier = region?.economy ? (region.economy.gdp / region.economy.baseGdp) : 1;
  const baseNonPower = (climateData?.emissions?.total || powerEmissions) * 0.4; // 40% non-power
  const nonPowerEmissions = baseNonPower * gdpMultiplier;

  // Player clean energy projects reduce emissions
  let playerReduction = 0;
  if (region?.projects) {
    region.projects.forEach(proj => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? (proj.effectMultiplier || 1) : 1;
      const projectDef = PROJECT_TYPES[projectType];
      if (projectDef?.co2Reduction > 0) {
        playerReduction += projectDef.co2Reduction * effectMult * 0.005; // Scale to Gt
      }
    });
  }

  return Math.max(0, powerEmissions + nonPowerEmissions - playerReduction);
}

/**
 * Update emissions for all regions
 */
function updateRegionalEmissions() {
  if (!state.regions) return;

  Object.entries(state.regions).forEach(([regionId, region]) => {
    const climateData = getClimateDataForRegion(regionId);
    const prevEmissions = region.emissions?.current || 0;
    const newEmissions = calculateRegionEmissions(regionId, climateData);

    if (!region.emissions) {
      region.emissions = {
        current: newEmissions,
        baseline: climateData?.emissions?.total || newEmissions,
        trend: 0,
      };
    } else {
      region.emissions.trend = prevEmissions > 0 ? (newEmissions - prevEmissions) / prevEmissions : 0;
      region.emissions.current = newEmissions;
    }
  });
}

/**
 * Calculate global GDP (sum of all regions)
 * @returns {number} Total GDP in trillions
 */
function calculateGlobalGdp() {
  if (!state.regions) return 0;
  return Object.values(state.regions).reduce((sum, r) => sum + (r.economy?.gdp || 0), 0);
}

/**
 * Calculate global emissions (sum of all regions)
 * @returns {number} Total emissions in Gt CO2/year
 */
function calculateGlobalEmissions() {
  if (!state.regions) return 0;
  return Object.values(state.regions).reduce((sum, r) => sum + (r.emissions?.current || 0), 0);
}

// Climate Tipping Points - irreversible climate thresholds (tuned for harder difficulty)
const TIPPING_POINTS = [
  {
    id: "arctic_ice",
    name: "Arctic Sea Ice Decline",
    threshold: 1.4,          // Triggers earlier (was 1.5)
    co2Modifier: 0.08,       // +0.08 ppm/month (was 0.05, +60%)
    description: "Arctic sea ice is rapidly disappearing, reducing Earth's reflectivity and accelerating warming.",
    reversible: false,
    effects: {
      warming: 0.08,         // Additional monthly CO2 equivalent
    },
  },
  {
    id: "permafrost",
    name: "Permafrost Methane Release",
    threshold: 1.7,          // Triggers earlier (was 2.0)
    co2Modifier: 0.15,       // +0.15 ppm/month from methane (was 0.1, +50%)
    description: "Thawing permafrost is releasing ancient methane stores, creating a dangerous feedback loop.",
    reversible: false,
    effects: {
      warming: 0.15,
    },
  },
  {
    id: "amazon_dieback",
    name: "Amazon Rainforest Dieback",
    threshold: 2.1,          // Triggers earlier (was 2.5)
    co2Modifier: 0.12,       // +0.12 ppm/month (was 0.08, +50%)
    description: "The Amazon rainforest is transitioning to savanna, releasing stored carbon and reducing global oxygen production.",
    reversible: false,
    effects: {
      warming: 0.12,
      forestEffectiveness: 0.5, // Forest projects 50% less effective
    },
  },
  {
    id: "ocean_circulation",
    name: "Ocean Circulation Weakening",
    threshold: 2.4,          // Triggers earlier (was 2.8)
    co2Modifier: 0.18,       // +0.18 ppm/month (was 0.12, +50%)
    description: "Atlantic ocean circulation is slowing dramatically, disrupting global weather patterns and reducing ocean CO2 absorption.",
    reversible: false,
    effects: {
      warming: 0.18,
      oceanAbsorption: 0.7,  // Ocean absorbs 30% less CO2
    },
  },
];

// Feedback loops - temperature-dependent effects (tuned for harder difficulty)
const FEEDBACK_LOOPS = {
  // Ice-albedo feedback: less ice = more heat absorption
  iceAlbedo: {
    startTemp: 1.5,
    maxTemp: 3.0,
    maxEffect: 0.05,  // Up to +0.05 ppm/month at max (was 0.03, +67%)
    description: "Melting ice reduces Earth's reflectivity",
  },
  // Ocean saturation: warmer oceans absorb less CO2
  oceanSaturation: {
    startCO2: 450,
    maxCO2: 550,
    maxEffect: 0.08,  // Up to +0.08 ppm/month at max (was 0.05, +60%)
    description: "Warmer oceans absorb less carbon dioxide",
  },
  // Vegetation stress: extreme temps harm plants
  vegetationStress: {
    startTemp: 2.0,
    maxTemp: 3.0,
    maxEffect: 0.04,  // Up to +0.04 ppm/month at max (was 0.02, +100%)
    description: "Heat stress reduces vegetation's carbon absorption",
  },
};

// ═══════════════════════════════════════════════════════════════
// DIPLOMATIC ALLIANCE SYSTEM
// ═══════════════════════════════════════════════════════════════

// Demand types that regions can make when negotiating to join alliance
const DEMAND_TYPES = {
  carbonTaxLimit: {
    id: "carbonTaxLimit",
    text: "Limit carbon tax to ${value}/ton",
    generateValue: () => 20 + Math.floor(Math.random() * 30), // $20-50/ton
    check: (region, value) => (region.carbonTax?.ratePerTon || 0) <= value,
    difficulty: "easy",
  },
  localSpending: {
    id: "localSpending",
    text: "Spend at least {value}% of our funds in our region",
    generateValue: () => 30 + Math.floor(Math.random() * 30), // 30-60%
    check: (region, value) => (region.spendRatio || 0) >= value / 100,
    difficulty: "medium",
  },
  economicProjects: {
    id: "economicProjects",
    text: "Build at least {value} economic project(s)",
    generateValue: () => 1 + Math.floor(Math.random() * 2), // 1-2
    check: (region, value) => (region.economicProjectCount || 0) >= value,
    difficulty: "medium",
  },
  noNuclear: {
    id: "noNuclear",
    text: "No nuclear projects in our territory",
    generateValue: () => true,
    check: (region) => !region.hasNuclear,
    difficulty: "hard",
  },
  jobPriority: {
    id: "jobPriority",
    text: "Build at least {value} job-creating project(s)",
    generateValue: () => 1,
    check: (region, value) => (region.jobProjectCount || 0) >= value,
    difficulty: "easy",
  },
};

// Alliance status constants
const ALLIANCE_STATUS = {
  ALLIED: "allied",
  NEUTRAL: "neutral",
  NEGOTIATING: "negotiating",
  HOSTILE: "hostile",
};

// Happiness thresholds
const HAPPINESS_THRESHOLDS = {
  HAPPY: 80,      // May increase contribution
  CONTENT: 60,    // Stable
  CONCERNED: 40,  // Warning, may make demands
  UNHAPPY: 20,    // Reduces contribution, threatens to leave
  CRITICAL: 0,    // May leave alliance
};

// Hostile cooldown in months
const HOSTILE_COOLDOWN_MONTHS = 6;

// Negotiation cooldown (after asking, before can ask again)
const NEGOTIATION_COOLDOWN_MONTHS = 3;

// Interest thresholds for non-allied regions
const INTEREST_THRESHOLDS = {
  VERY_HIGH: 80,    // May spontaneously request to join
  HIGH: 60,         // Receptive to negotiation
  MODERATE: 40,     // Neutral stance
  LOW: 20,          // Resistant to joining
  HOSTILE: 0,       // Very resistant
};

// Terms that can be set when negotiating with regions
const NEGOTIABLE_TERMS = {
  climateDedicationMin: {
    label: "Minimum Climate Dedication",
    description: "Minimum % of GDP dedicated to climate action",
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    unit: "%",
    impactPerStep: -5,
  },
  climateDedicationMax: {
    label: "Maximum Climate Dedication",
    description: "Maximum % of GDP dedicated to climate action",
    min: 5,
    max: 10,
    step: 1,
    default: 10,
    unit: "%",
    impactPerStep: -3,
  },
  powerStabilityGoal: {
    label: "Power Stability Goal",
    description: "Alliance commitment to improve grid stability",
    min: 50,
    max: 95,
    step: 5,
    default: 70,
    unit: "%",
    impactPerStep: 3, // Higher = more attractive (we're promising to help more)
    higherIsBetter: true,
  },
  powerSupplyGoal: {
    label: "Power Supply Goal",
    description: "Alliance commitment to improve power supply",
    min: 90,
    max: 120,
    step: 5,
    default: 100,
    unit: "%",
    impactPerStep: 3, // Higher = more attractive (we're promising to help more)
    higherIsBetter: true,
  },
  goalDeadlineYears: {
    label: "Goal Deadline",
    description: "Years to achieve power goals (shorter = more attractive)",
    min: 5,
    max: 25,
    step: 5,
    default: 15,
    unit: " years",
    impactPerStep: 2, // Shorter deadline = more attractive
    shorterIsBetter: true,
  },
  carbonTaxRate: {
    label: "Carbon Tax Rate",
    description: "Tax rate per ton of CO2 emissions",
    min: 10,
    max: 100,
    step: 5,
    default: 15,
    unit: "$/ton",
    impactPerStep: -2, // Higher tax = harder to negotiate
  },
  carbonTaxGrowth: {
    label: "Carbon Tax Growth",
    description: "Yearly increase in carbon tax rate",
    min: 0,
    max: 10,
    step: 1,
    default: 5,
    unit: "%/year",
    impactPerStep: -1, // Higher growth = harder to negotiate
  },
};

// ═══════════════════════════════════════════════════════════════
// POWER GRID SYSTEM
// ═══════════════════════════════════════════════════════════════

// Power grid configuration
const POWER_CONFIG = {
  // Base electricity price ($/kWh)
  basePrice: 0.12,

  // Grid stability thresholds (0-100 scale)
  stabilityThresholds: {
    critical: 30,     // Blackout risk
    warning: 50,      // Unstable
    good: 70,         // Acceptable
    excellent: 90,    // Very stable
  },

  // Grid stability formula constants (linear approach)
  variablePenaltyFactor: 0.6,       // -60 stability at 100% variable
  storageMitigationFactor: 40,      // Points per storage/variable ratio
  maxStorageMitigationRatio: 0.8,   // Storage can offset up to 80% of variable penalty
  baseloadBonusFactor: 0.25,        // +25 stability at 100% baseload
  shortfallStabilityPenalty: 40,    // -40 stability at 100% shortfall

  // Price thresholds ($/kWh)
  priceThresholds: {
    cheap: 0.08,
    normal: 0.12,
    expensive: 0.20,  // Happiness penalty starts
    crisis: 0.30,     // Major GDP impact
  },

  // Economic impact multipliers
  shortfallGDPPenalty: 0.5,      // -50% GDP per 100% shortfall
  priceGDPPenalty: 1.0,          // -10% GDP per $0.10 above $0.15
  instabilityGDPPenalty: 0.3,    // -30% GDP for critical instability

  // Happiness impact values
  happinessBlackoutPenalty: 10,   // -10 happiness for blackout risk
  happinessHighPricePenalty: 3,   // -3 per $0.05 above $0.20
  happinessShortfallPenalty: 15,  // -15 for major shortfall
  happinessAbundanceBonus: 5,     // +5 for cheap abundant power
  happinessCleanEnergyBonus: 3,   // +3 for majority renewable
  happinessStabilityBonus: 2,     // +2 for excellent stability

  // Existing infrastructure (regions start with some power supply)
  existingSupplyRatio: 0.85,      // Regions start with 85% of demand met
  existingBaseloadRatio: 0.70,    // 70% of existing supply is baseload
  existingVariableRatio: 0.15,    // 15% of existing supply is variable
};

// Power generation categories
const POWER_CATEGORY = {
  VARIABLE: "variable",     // Solar, wind - intermittent
  BASELOAD: "baseload",     // Nuclear, coal, gas, hydro, geothermal - stable
  STORAGE: "storage",       // Batteries, pumped hydro - smooths variability
};

// Capacity factors for TWh calculation (annual hours operated / 8760)
const CAPACITY_FACTORS = {
  // Variable generation (lower capacity factors due to intermittency)
  solar: 0.20,              // ~1,752 hours/year - sunlight dependent
  wind: 0.30,               // ~2,628 hours/year - onshore wind
  offshoreWind: 0.40,       // ~3,504 hours/year - more consistent offshore

  // Baseload generation (higher capacity factors - run continuously)
  nuclear: 0.90,            // ~7,884 hours/year - very high uptime
  coal: 0.50,               // ~4,380 hours/year - declining usage
  naturalGas: 0.45,         // ~3,942 hours/year - flexible dispatch
  geothermal: 0.80,         // ~7,008 hours/year - steady output
  hydropower: 0.40,         // ~3,504 hours/year - seasonal variation

  // Storage (dispatch based on grid needs)
  batteryStorage: 0.15,     // ~1,314 hours/year - peak shaving
  pumpedHydro: 0.25,        // ~2,190 hours/year - longer duration storage
};

// ═══════════════════════════════════════════════════════════════
// POWER GRID CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate annual TWh production for a power project
 * @param {string} projectType - Project type key (e.g., 'solar', 'nuclear')
 * @param {number} effectMultiplier - Effectiveness multiplier (default 1)
 * @returns {number} Annual production in TWh (rounded to 2 decimal places)
 */
function calculateProjectTWh(projectType, effectMultiplier = 1) {
  const project = PROJECT_TYPES[projectType];
  if (!project?.capacityGW) return 0;

  const capacityFactor = CAPACITY_FACTORS[projectType] || 0.30; // Default 30%
  const hoursPerYear = 8760;

  // TWh = GW × hours × capacity factor / 1000
  const twhPerYear = project.capacityGW * effectMultiplier * hoursPerYear * capacityFactor / 1000;

  return Math.round(twhPerYear * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate grid impact preview for adding a project to a region
 * @param {string} regionId - Region to preview
 * @param {string} projectType - Project type being considered
 * @param {number} effectMultiplier - Effectiveness multiplier (default 1)
 * @returns {object|null} Impact preview data or null if invalid
 */
function calculateGridImpactPreview(regionId, projectType, effectMultiplier = 1) {
  const region = state.regions?.[regionId];
  if (!region?.power) return null;

  const project = PROJECT_TYPES[projectType];
  if (!project?.capacityGW) return null;

  // Current state
  const currentSupply = calculatePowerSupply(regionId);
  const currentStability = region.power.stability;
  const currentDemand = region.power.demand || 100;
  const currentRatio = currentSupply.total / currentDemand;

  // Calculate new capacity from this project
  const newCapacity = project.capacityGW * effectMultiplier;

  // Calculate projected state after adding this project
  const projectedTotal = currentSupply.total + newCapacity;
  const projectedRatio = projectedTotal / currentDemand;

  // Estimate stability change
  const stabilityChange = project.stabilityContribution || 0;

  return {
    currentSupplyGW: Math.round(currentSupply.total * 10) / 10,
    projectedSupplyGW: Math.round(projectedTotal * 10) / 10,
    demandGW: Math.round(currentDemand * 10) / 10,
    currentRatio: Math.round(currentRatio * 100),       // As percentage (e.g., 85%)
    projectedRatio: Math.round(projectedRatio * 100),   // As percentage (e.g., 90%)
    ratioChange: Math.round((projectedRatio - currentRatio) * 100),
    currentStability: Math.round(currentStability),
    stabilityChange: stabilityChange,
    twhPerYear: calculateProjectTWh(projectType, effectMultiplier),
  };
}

/**
 * Calculate power demand for a region based on GDP and growth
 * @param {string} regionId - Region identifier
 * @returns {number} Power demand in GW
 */
function calculatePowerDemand(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) return 100; // Default

  const climateData = getClimateDataForRegion(regionId);
  const powerData = climateData?.power || {};
  const baseDemandGW = powerData.baseDemandGW || 100;
  const growthRate = powerData.demandGrowthRate || 0.02;

  // Calculate years since game start for demand growth
  const yearsSinceStart = (state.year - GAME_CONFIG.startYear) + (state.month - 1) / 12;
  const growthFactor = Math.pow(1 + growthRate, yearsSinceStart);

  // Seasonal variation (winter/summer peaks)
  const isNorthern = !["south_america", "oceania", "africa"].includes(regionId);
  const peakMonths = isNorthern ? [1, 2, 7, 8] : [6, 7, 12, 1];
  const seasonalFactor = peakMonths.includes(state.month) ? 1.1 : 1.0;

  // Electrification multiplier (from EV infrastructure, heat pumps, etc.)
  const electrificationMultiplier = region.power.electrificationDemandMultiplier || 1.0;

  return Math.round(baseDemandGW * growthFactor * seasonalFactor * electrificationMultiplier * 10) / 10;
}

/**
 * Calculate power supply from all generation sources in a region
 * @param {string} regionId - Region identifier
 * @returns {object} Supply breakdown {total, variable, baseload, storage}
 */
function calculatePowerSupply(regionId) {
  const region = state.regions?.[regionId];
  if (!region) return { total: 0, variable: 0, baseload: 0, storage: 0 };

  const climateData = getClimateDataForRegion(regionId);
  const powerData = climateData?.power || {};
  const baseDemandGW = powerData.baseDemandGW || 100;
  const currentMix = powerData.currentMixTWh;

  // Calculate existing infrastructure from real-world power mix data
  let existingSupply, existingBaseload, existingVariable;

  if (currentMix) {
    // Use real 2024 power mix data to calculate ratios
    const totalTWh = (currentMix.coal || 0) + (currentMix.gas || 0) +
                     (currentMix.nuclear || 0) + (currentMix.hydro || 0) +
                     (currentMix.wind || 0) + (currentMix.solar || 0) +
                     (currentMix.other || 0);
    const variableTWh = (currentMix.wind || 0) + (currentMix.solar || 0);
    const baseloadTWh = totalTWh - variableTWh;

    // Calculate actual ratios from real data
    const variableRatio = totalTWh > 0 ? variableTWh / totalTWh : 0.15;
    const baseloadRatio = totalTWh > 0 ? baseloadTWh / totalTWh : 0.70;

    // Scale to GW (assuming ~85% capacity meets demand)
    existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;
    existingVariable = existingSupply * variableRatio;
    existingBaseload = existingSupply * baseloadRatio;
  } else {
    // Fallback to generic ratios if no currentMixTWh data
    existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;
    existingBaseload = existingSupply * POWER_CONFIG.existingBaseloadRatio;
    existingVariable = existingSupply * POWER_CONFIG.existingVariableRatio;
  }

  // Account for retired fossil capacity (from "Replace" build mode)
  if (region.retiredFossilGW) {
    const retiredCoalGW = region.retiredFossilGW.coal || 0;
    const retiredGasGW = region.retiredFossilGW.gas || 0;
    const totalRetired = retiredCoalGW + retiredGasGW;
    existingBaseload = Math.max(0, existingBaseload - totalRetired);
  }

  // Calculate player-built capacity
  let playerVariable = 0;
  let playerBaseload = 0;
  let playerStorage = 0;

  if (region.projects) {
    region.projects.forEach(proj => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? (proj.effectMultiplier || 1) : 1;
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
  }

  const totalVariable = existingVariable + playerVariable;
  const totalBaseload = existingBaseload + playerBaseload;
  const totalSupply = totalVariable + totalBaseload;

  return {
    total: Math.round(totalSupply * 10) / 10,
    variable: Math.round(totalVariable * 10) / 10,
    baseload: Math.round(totalBaseload * 10) / 10,
    storage: Math.round(playerStorage * 10) / 10,
    playerVariable: Math.round(playerVariable * 10) / 10,
    playerBaseload: Math.round(playerBaseload * 10) / 10,
  };
}

/**
 * Calculate grid stability (0-100 scale)
 * Higher variable generation without storage = lower stability
 * @param {string} regionId - Region identifier
 * @returns {number} Stability score 0-100
 */
function calculateGridStability(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) return 100;

  const supply = calculatePowerSupply(regionId);
  const demand = region.power.demand || 100;

  if (supply.total <= 0) return 0;

  // Calculate shares
  const variableShare = supply.variable / supply.total;
  const baseloadShare = supply.baseload / supply.total;
  const storageRatio = supply.storage / Math.max(1, supply.variable);

  // Base stability
  let stability = 100;

  // Variable renewable penalty (linear - no arbitrary threshold)
  // 100% variable = -60 stability, scales linearly
  const variablePenalty = variableShare * 100 * POWER_CONFIG.variablePenaltyFactor;
  stability -= variablePenalty;

  // Storage mitigation (scales with both storage AND variable share)
  // Storage can offset up to 80% of the variable penalty
  const maxMitigation = variableShare * 100 * POWER_CONFIG.maxStorageMitigationRatio;
  const storageMitigation = Math.min(
    storageRatio * POWER_CONFIG.storageMitigationFactor,
    maxMitigation
  );
  stability += storageMitigation;

  // Baseload stability bonus
  // 100% baseload = +25 stability
  stability += baseloadShare * 100 * POWER_CONFIG.baseloadBonusFactor;

  // Supply shortfall penalty
  if (supply.total < demand) {
    const shortfallRatio = (demand - supply.total) / demand;
    stability -= shortfallRatio * POWER_CONFIG.shortfallStabilityPenalty;
  }

  // Project-specific stability contributions (e.g., nuclear +15, batteries +15)
  if (region.projects) {
    region.projects.forEach(proj => {
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
 * Affected by supply/demand balance and grid stability
 * @param {string} regionId - Region identifier
 * @returns {number} Price in $/kWh
 */
function calculatePowerPrice(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) return POWER_CONFIG.basePrice;

  const supply = calculatePowerSupply(regionId);
  const demand = region.power.demand || 100;
  const stability = region.power.stability || 100;

  let price = POWER_CONFIG.basePrice;

  // Supply/demand effect
  const supplyRatio = supply.total / demand;
  if (supplyRatio < 1.0) {
    // Shortage: price increases exponentially
    const shortage = 1 - supplyRatio;
    price *= (1 + Math.pow(shortage, 2) * 5);
  } else if (supplyRatio > 1.2) {
    // Surplus: price decreases
    const surplus = supplyRatio - 1.2;
    price *= Math.max(0.5, 1 - surplus * 0.3);
  }

  // Stability effect - low stability increases costs
  if (stability < POWER_CONFIG.stabilityThresholds.good) {
    const instabilityPenalty = (POWER_CONFIG.stabilityThresholds.good - stability) /
                               POWER_CONFIG.stabilityThresholds.good;
    price *= (1 + instabilityPenalty * 0.5);
  }

  // Renewable premium reduction (lower marginal costs)
  const renewableShare = supply.variable / (supply.total || 1);
  price *= (1 - renewableShare * 0.15);

  // Clamp price
  const minPrice = POWER_CONFIG.priceThresholds.cheap * 0.5;
  const maxPrice = POWER_CONFIG.priceThresholds.crisis * 1.5;
  price = Math.max(minPrice, Math.min(maxPrice, price));

  return Math.round(price * 1000) / 1000;
}

/**
 * Calculate GDP/income impact from power issues
 * @param {string} regionId - Region identifier
 * @returns {number} Modifier 0.5-1.0 to apply to income
 */
function calculatePowerGDPImpact(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) return 1.0;

  const supply = calculatePowerSupply(regionId);
  const demand = region.power.demand || 100;
  const stability = region.power.stability || 100;
  const price = region.power.pricePerKwh || POWER_CONFIG.basePrice;

  let gdpModifier = 1.0;

  // Supply shortfall impact
  if (supply.total < demand) {
    const shortfallRatio = (demand - supply.total) / demand;
    gdpModifier -= shortfallRatio * POWER_CONFIG.shortfallGDPPenalty;
  }

  // High price impact (above $0.15/kWh)
  if (price > 0.15) {
    const priceExcess = price - 0.15;
    gdpModifier -= priceExcess * POWER_CONFIG.priceGDPPenalty;
  }

  // Instability impact (reflects price volatility hurting business planning)
  // Below 70 stability, businesses face unpredictable costs and unreliable power
  if (stability < POWER_CONFIG.stabilityThresholds.good) {
    const instabilityRatio = (POWER_CONFIG.stabilityThresholds.good - stability) /
                             POWER_CONFIG.stabilityThresholds.good;
    // Max -30% GDP for critical instability (stability = 0)
    gdpModifier *= (1 - instabilityRatio * POWER_CONFIG.instabilityGDPPenalty);
  }

  return Math.max(0.5, Math.min(1.0, gdpModifier));
}

/**
 * Calculate happiness impact from power issues
 * @param {string} regionId - Region identifier
 * @returns {number} Happiness change (positive or negative)
 */
function calculatePowerHappinessImpact(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) return 0;

  const supply = calculatePowerSupply(regionId);
  const demand = region.power.demand || 100;
  const stability = region.power.stability || 100;
  const price = region.power.pricePerKwh || POWER_CONFIG.basePrice;

  let happinessChange = 0;

  // === STABILITY-BASED HAPPINESS ===
  // Reflects both grid reliability AND price volatility from variable renewables

  if (stability >= POWER_CONFIG.stabilityThresholds.excellent) {
    happinessChange += 2;   // Excellent - business confidence, reliable power
  } else if (stability >= POWER_CONFIG.stabilityThresholds.good) {
    // Good stability - no change (normal operations)
  } else if (stability >= POWER_CONFIG.stabilityThresholds.warning) {
    happinessChange -= 2;   // Acceptable but concerning - some price spikes
  } else if (stability >= POWER_CONFIG.stabilityThresholds.critical) {
    happinessChange -= 5;   // Warning - frequent issues, business uncertainty
  } else {
    happinessChange -= 10;  // Critical - blackout risk, businesses leaving
  }

  // === OTHER NEGATIVE FACTORS ===

  // High prices cause unhappiness
  if (price > POWER_CONFIG.priceThresholds.expensive) {
    const priceExcess = (price - POWER_CONFIG.priceThresholds.expensive) / 0.05;
    happinessChange -= Math.min(10, priceExcess * POWER_CONFIG.happinessHighPricePenalty);
  }

  // Power shortfall
  if (supply.total < demand * 0.9) {
    const shortfall = (demand * 0.9 - supply.total) / demand;
    happinessChange -= shortfall * POWER_CONFIG.happinessShortfallPenalty;
  }

  // === POSITIVE FACTORS ===

  // Abundant cheap power
  if (supply.total > demand * 1.2 && price < POWER_CONFIG.priceThresholds.cheap) {
    happinessChange += POWER_CONFIG.happinessAbundanceBonus;
  }

  // Clean energy pride (majority renewable)
  const renewableShare = supply.variable / (supply.total || 1);
  if (renewableShare > 0.50) {
    happinessChange += POWER_CONFIG.happinessCleanEnergyBonus;
  }

  return Math.round(happinessChange);
}

/**
 * Update all power metrics for a region
 * @param {string} regionId - Region identifier
 */
function updateRegionPowerGrid(regionId) {
  const region = state.regions?.[regionId];
  if (!region) return;

  // Initialize power state if missing
  if (!region.power) {
    const climateData = getClimateDataForRegion(regionId);
    const powerData = climateData?.power || {};
    const baseDemandGW = powerData.baseDemandGW || 100;
    const currentMix = powerData.currentMixTWh;
    const existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;

    // Calculate variable/baseload ratios from real power mix data
    let variableRatio = POWER_CONFIG.existingVariableRatio;
    let baseloadRatio = POWER_CONFIG.existingBaseloadRatio;

    if (currentMix) {
      const totalTWh = (currentMix.coal || 0) + (currentMix.gas || 0) +
                       (currentMix.nuclear || 0) + (currentMix.hydro || 0) +
                       (currentMix.wind || 0) + (currentMix.solar || 0) +
                       (currentMix.other || 0);
      const variableTWh = (currentMix.wind || 0) + (currentMix.solar || 0);
      if (totalTWh > 0) {
        variableRatio = variableTWh / totalTWh;
        baseloadRatio = (totalTWh - variableTWh) / totalTWh;
      }
    }

    region.power = {
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
    };
  }

  // Calculate current metrics
  region.power.demand = calculatePowerDemand(regionId);

  const supply = calculatePowerSupply(regionId);
  region.power.supply = supply.total;
  region.power.variableCapacity = supply.variable;
  region.power.baseloadCapacity = supply.baseload;
  region.power.storageCapacity = supply.storage;
  region.power.playerVariableGW = supply.playerVariable;
  region.power.playerBaseloadGW = supply.playerBaseload;
  region.power.playerStorageGWh = supply.storage;

  region.power.stability = calculateGridStability(regionId);
  region.power.pricePerKwh = calculatePowerPrice(regionId);
  region.power.gdpModifier = calculatePowerGDPImpact(regionId);
  region.power.blackoutRisk = region.power.stability < POWER_CONFIG.stabilityThresholds.critical;

  // Calculate surplus/shortfall
  const diff = region.power.supply - region.power.demand;
  region.power.surplus = Math.max(0, diff);
  region.power.shortfall = Math.max(0, -diff);
}

/**
 * Update power grids for all regions
 */
function updateAllPowerGrids() {
  if (!state.regions) return;

  Object.keys(state.regions).forEach(regionId => {
    updateRegionPowerGrid(regionId);
  });
}

// Technology Tree - Research unlocks improved project versions
const TECHNOLOGIES = [
  {
    id: "improved_solar",
    name: "Advanced Photovoltaics",
    description: "Next-generation solar cells with 20% improved efficiency",
    cost: 100,               // Research points required
    tier: 1,
    field: "renewable",
    effects: {
      projectBonus: { solar: { co2Reduction: 1.2, income: 1.15 } },
    },
    icon: "☀️",
  },
  {
    id: "advanced_wind",
    name: "Turbine Optimization",
    description: "Improved wind turbine designs reduce offshore wind costs by 20%",
    cost: 250,
    tier: 2,
    field: "renewable",
    effects: {
      projectBonus: { offshoreWind: { costReduction: 0.8, co2Reduction: 1.15 } },
    },
    icon: "💨",
  },
  {
    id: "enhanced_forests",
    name: "Bioengineered Trees",
    description: "Fast-growing, carbon-hungry tree varieties increase reforestation effectiveness by 30%",
    cost: 200,
    tier: 2,
    field: "adaptation",
    effects: {
      projectBonus: { forest: { co2Reduction: 1.3 } },
    },
    icon: "🌲",
  },
  {
    id: "modular_nuclear",
    name: "Small Modular Reactors",
    description: "Compact nuclear designs reduce costs by 25% and increase income by 20%",
    cost: 500,
    tier: 3,
    field: "efficiency",
    effects: {
      projectBonus: { nuclear: { costReduction: 0.75, income: 1.2 } },
    },
    icon: "⚛️",
  },
  {
    id: "green_hydrogen",
    name: "Green Hydrogen",
    description: "Hydrogen production enables new clean energy storage, boosting all renewable income by 15%",
    cost: 750,
    tier: 3,
    field: "renewable",
    effects: {
      projectBonus: {
        solar: { income: 1.15 },
        wind: { income: 1.15 },
        offshoreWind: { income: 1.15 },
      },
    },
    icon: "💧",
  },
  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL ENERGY & NATURE TECHNOLOGIES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "building_efficiency",
    name: "Building Efficiency Standards",
    description: "Advanced HVAC systems, insulation, and energy codes reduce building energy consumption by 15%",
    cost: 150,
    tier: 1,
    field: "efficiency",
    effects: {
      projectBonus: {
        solar: { costReduction: 0.9 },
        wind: { costReduction: 0.9 },
      },
    },
    icon: "🏢",
  },
  {
    id: "energy_storage",
    name: "Grid-Scale Energy Storage",
    description: "Battery and pumped hydro storage solutions enable 24/7 renewable power supply",
    cost: 300,
    tier: 2,
    field: "renewable",
    requires: ["improved_solar"],
    effects: {
      projectBonus: {
        solar: { income: 1.2 },
        wind: { income: 1.2 },
        offshoreWind: { income: 1.2 },
      },
    },
    icon: "🔋",
  },
  {
    id: "geothermal_power",
    name: "Geothermal Power",
    description: "Harness Earth's internal heat for reliable baseload renewable energy",
    cost: 200,
    tier: 2,
    field: "renewable",
    effects: {
      projectBonus: { geothermal: { co2Reduction: 1.25, income: 1.15 } },
    },
    icon: "🌋",
  },
  {
    id: "smart_grid",
    name: "Smart Grid Technology",
    description: "AI-powered demand response and distribution optimization reduces energy waste by 10%",
    cost: 250,
    tier: 2,
    field: "efficiency",
    effects: {
      projectBonus: {
        solar: { costReduction: 0.95 },
        wind: { costReduction: 0.95 },
        offshoreWind: { costReduction: 0.95 },
        nuclear: { costReduction: 0.95 },
      },
    },
    icon: "🔌",
  },
  {
    id: "wetland_restoration",
    name: "Wetland Restoration",
    description: "Restore marshes, bogs, and swamps for high-density carbon sequestration",
    cost: 180,
    tier: 2,
    field: "adaptation",
    effects: {
      projectBonus: { forest: { co2Reduction: 1.2 } },
    },
    icon: "🦆",
  },
  {
    id: "regenerative_agriculture",
    name: "Regenerative Agriculture",
    description: "Soil carbon sequestration through cover crops, no-till farming, and rotational grazing",
    cost: 220,
    tier: 2,
    field: "adaptation",
    requires: ["enhanced_forests"],
    effects: {
      projectBonus: { forest: { co2Reduction: 1.25, income: 1.1 } },
    },
    icon: "🌾",
  },
  {
    id: "ocean_carbon",
    name: "Ocean Carbon Solutions",
    description: "Blue carbon ecosystems: seagrass meadows, kelp forests, and mangrove restoration",
    cost: 400,
    tier: 3,
    field: "adaptation",
    requires: ["wetland_restoration"],
    effects: {
      projectBonus: { forest: { co2Reduction: 1.35 } },
    },
    icon: "🌊",
  },
  {
    id: "clean_energy_integration",
    name: "Clean Energy Integration",
    description: "Unified renewable energy systems with storage, smart grids, and demand optimization",
    cost: 600,
    tier: 4,
    field: "renewable",
    requires: ["energy_storage", "smart_grid"],
    effects: {
      projectBonus: {
        solar: { co2Reduction: 1.2, income: 1.15 },
        wind: { co2Reduction: 1.2, income: 1.15 },
        offshoreWind: { co2Reduction: 1.2, income: 1.15 },
      },
    },
    icon: "⚡",
  },
  {
    id: "tidal_wave_energy",
    name: "Tidal & Wave Energy",
    description: "Harness ocean currents and waves for predictable, high-density renewable power",
    cost: 280,
    tier: 2,
    field: "renewable",
    effects: {
      projectBonus: { offshoreWind: { co2Reduction: 1.15, income: 1.1 } },
    },
    icon: "🌊",
  },
  {
    id: "heat_pump_technology",
    name: "Heat Pump Technology",
    description: "Electrify heating and cooling with 300-400% efficiency, dramatically reducing building emissions",
    cost: 200,
    tier: 2,
    field: "efficiency",
    requires: ["building_efficiency"],
    effects: {
      projectBonus: {
        solar: { income: 1.1 },
        wind: { income: 1.1 },
      },
    },
    icon: "🌡️",
  },
  {
    id: "ev_infrastructure",
    name: "Electric Vehicle Infrastructure",
    description: "Charging networks and grid integration enable mass EV adoption, reducing transport emissions",
    cost: 250,
    tier: 2,
    field: "efficiency",
    requires: ["smart_grid"],
    effects: {
      projectBonus: {
        solar: { income: 1.15 },
        wind: { income: 1.15 },
      },
    },
    icon: "🚗",
  },
  {
    id: "urban_green_infrastructure",
    name: "Urban Green Infrastructure",
    description: "Green roofs, urban forests, and permeable surfaces reduce heat islands and sequester carbon",
    cost: 160,
    tier: 2,
    field: "adaptation",
    effects: {
      projectBonus: { forest: { co2Reduction: 1.15, costReduction: 0.9 } },
    },
    icon: "🏙️",
  },
  {
    id: "fusion_research",
    name: "Advanced Fusion Research",
    description: "Breakthrough fusion technology promises virtually unlimited clean energy with zero emissions",
    cost: 1000,
    tier: 4,
    field: "efficiency",
    requires: ["modular_nuclear"],
    effects: {
      projectBonus: {
        nuclear: { co2Reduction: 1.5, income: 1.3, costReduction: 0.7 },
      },
    },
    icon: "🔮",
  },

  // ═══════════════════════════════════════════════════════════════
  // CCS TECHNOLOGIES - Carbon Capture and Storage Tech Tree
  // Starting from scratch in 2025, these technologies unlock advanced
  // CCS capabilities through research progression.
  // ═══════════════════════════════════════════════════════════════

  // TIER 1 - FOUNDATION
  {
    id: "ccs_fundamentals",
    name: "CCS Fundamentals",
    description: "Basic understanding of carbon capture, transport, and storage. Foundation for all CCS development.",
    cost: 80,
    tier: 1,
    field: "carbon",
    effects: {
      projectBonus: { carbonCapture: { co2Reduction: 1.1 } },
    },
    icon: "📚",
  },
  {
    id: "amine_solvents",
    name: "Amine Solvent Technology",
    description: "Chemical solvents that absorb CO2 from flue gas. Enables post-combustion capture.",
    cost: 120,
    tier: 1,
    field: "carbon",
    requires: ["ccs_fundamentals"],
    effects: {
      projectBonus: { carbonCapture: { co2Reduction: 1.15, costReduction: 0.95 } },
    },
    icon: "🧪",
  },

  // TIER 2 - CAPTURE METHODS & BASIC TRANSPORT
  {
    id: "post_combustion_capture",
    name: "Post-Combustion Capture",
    description: "Retrofittable capture for existing fossil plants. Uses amine scrubbing to remove CO2 from flue gas.",
    cost: 200,
    tier: 2,
    field: "carbon",
    requires: ["amine_solvents"],
    effects: {
      projectBonus: { postCombustionCapture: { co2Reduction: 1.2, costReduction: 0.9 } },
    },
    icon: "🏭",
  },
  {
    id: "pre_combustion_capture",
    name: "Pre-Combustion Capture",
    description: "Gasification-based capture producing hydrogen and CO2. Currently $60/tonne, targeting $30/tonne.",
    cost: 250,
    tier: 2,
    field: "carbon",
    requires: ["ccs_fundamentals"],
    effects: {
      projectBonus: { preCombustionCapture: { co2Reduction: 1.15, income: 1.1 } },
    },
    icon: "⚗️",
  },
  {
    id: "oxyfuel_combustion",
    name: "Oxy-Fuel Combustion",
    description: "Burns fuel with pure oxygen for >90% CO2 concentration in exhaust. Highest capture efficiency.",
    cost: 280,
    tier: 2,
    field: "carbon",
    requires: ["ccs_fundamentals"],
    effects: {
      projectBonus: { oxyfuelCapture: { co2Reduction: 1.25 } },
    },
    icon: "🔥",
  },
  {
    id: "pipeline_transport",
    name: "CO2 Pipeline Networks",
    description: "Onshore pipelines transport CO2 at €1.5-5/tonne. Essential infrastructure for large-scale CCS.",
    cost: 180,
    tier: 2,
    field: "carbon",
    requires: ["ccs_fundamentals"],
    effects: {
      projectBonus: {
        co2Pipeline: { costReduction: 0.85 },
        carbonCapture: { costReduction: 0.95 },
      },
    },
    icon: "🔧",
  },
  {
    id: "offshore_pipeline",
    name: "Offshore Pipeline Technology",
    description: "Subsea pipelines for offshore storage. Cost €3.5-9.5/tonne. Required for offshore sequestration.",
    cost: 220,
    tier: 2,
    field: "carbon",
    requires: ["pipeline_transport"],
    effects: {
      projectBonus: { co2OffshorePipeline: { costReduction: 0.85 } },
    },
    icon: "🌊",
  },
  {
    id: "co2_truck_transport",
    name: "CO2 Truck Transport",
    description: "Road-based CO2 transport for smaller volumes and shorter distances. Most flexible option, ideal for remote capture sites without pipeline access.",
    cost: 150,
    tier: 2,
    field: "carbon",
    requires: ["ccs_fundamentals"],
    effects: {
      projectBonus: {
        co2TruckTransport: { costReduction: 0.85 },
        carbonCapture: { costReduction: 0.97 },
      },
    },
    icon: "🚛",
  },

  // TIER 3 - STORAGE & ADVANCED TRANSPORT
  {
    id: "depleted_reservoir_storage",
    name: "Depleted Reservoir Storage",
    description: "Store CO2 in depleted oil/gas fields. Reuses existing infrastructure. €1-14/tonne depending on location.",
    cost: 300,
    tier: 3,
    field: "carbon",
    requires: ["pipeline_transport"],
    effects: {
      projectBonus: { depletedReservoirStorage: { costReduction: 0.8, co2Reduction: 1.2 } },
    },
    icon: "🛢️",
  },
  {
    id: "saline_aquifer_storage",
    name: "Deep Saline Aquifer Storage",
    description: "Store CO2 in porous rock formations saturated with brine. Largest storage capacity globally. €6-20/tonne.",
    cost: 350,
    tier: 3,
    field: "carbon",
    requires: ["offshore_pipeline"],
    effects: {
      projectBonus: { salineAquiferStorage: { co2Reduction: 1.3 } },
    },
    icon: "💎",
  },
  {
    id: "co2_shipping",
    name: "CO2 Shipping Technology",
    description: "Ship-based CO2 transport at €11-16/tonne. Flexible, enables cross-border CCS and remote storage access.",
    cost: 320,
    tier: 3,
    field: "carbon",
    requires: ["ccs_fundamentals", "offshore_pipeline"],
    effects: {
      projectBonus: { co2ShipTerminal: { costReduction: 0.85 } },
    },
    icon: "🚢",
  },
  {
    id: "enhanced_oil_recovery",
    name: "Enhanced Oil Recovery (EOR)",
    description: "Inject CO2 into oil reservoirs to extract more oil while permanently storing CO2. Generates revenue.",
    cost: 280,
    tier: 3,
    field: "carbon",
    requires: ["depleted_reservoir_storage"],
    effects: {
      projectBonus: {
        depletedReservoirStorage: { income: 1.5 },
        carbonCapture: { income: 1.2 },
      },
    },
    icon: "💰",
  },

  // TIER 4 - ADVANCED CCS TECHNOLOGIES
  {
    id: "direct_air_capture_tech",
    name: "Direct Air Capture (DAC)",
    description: "Capture CO2 directly from ambient air (~420ppm). Most expensive but location-independent negative emissions.",
    cost: 800,
    tier: 4,
    field: "carbon",
    requires: ["amine_solvents", "saline_aquifer_storage"],
    effects: {
      projectBonus: { directAirCapture: { co2Reduction: 1.5, costReduction: 0.85 } },
    },
    icon: "🌀",
  },
  {
    id: "beccs_technology",
    name: "BECCS (Bioenergy with CCS)",
    description: "Burn biomass for energy and capture emissions. Only technology that produces energy AND removes CO2.",
    cost: 900,
    tier: 4,
    field: "carbon",
    requires: ["post_combustion_capture", "depleted_reservoir_storage"],
    effects: {
      projectBonus: { beccsPlant: { co2Reduction: 1.3, income: 1.2 } },
    },
    icon: "🌿",
  },
  {
    id: "ccs_optimization",
    name: "CCS System Optimization",
    description: "AI-driven optimization reduces costs across all CCS operations by 20%. Integrates capture, transport, storage.",
    cost: 600,
    tier: 4,
    field: "carbon",
    requires: ["depleted_reservoir_storage", "saline_aquifer_storage", "co2_shipping"],
    effects: {
      projectBonus: {
        carbonCapture: { costReduction: 0.8, co2Reduction: 1.15 },
        postCombustionCapture: { costReduction: 0.8 },
        preCombustionCapture: { costReduction: 0.8 },
        oxyfuelCapture: { costReduction: 0.8 },
        directAirCapture: { costReduction: 0.8 },
        beccsPlant: { costReduction: 0.8 },
      },
    },
    icon: "🤖",
  },
];

// Research points generated per Research Center per month (legacy - used for regional research projects)
const RESEARCH_POINTS_PER_CENTER = 5;

// ═══════════════════════════════════════════════════════════════
// NEW REGIONAL RESEARCH SYSTEM
// Research centers are built in allied regions, generate RP/month
// toward assigned technologies within their research field.
// ═══════════════════════════════════════════════════════════════

// Research Center Scaling - no max level, uses formulas
const RESEARCH_CENTER_BASE = {
  buildCost: 8,  // $8B to build level 1
  // Named levels for flavor (higher levels use "Level X Research Center")
  levelNames: {
    1: "Basic Lab",
    2: "Advanced Facility",
    3: "Research Institute",
    4: "National Laboratory",
    5: "World-Class Institute",
  }
};

// Get RP per month for a given level: 5, 10, 18, 26, 35, 45, ...
// Formula: floor(5 * level * (1 + 0.1 * (level - 1)))
function getResearchCenterRPPerMonth(level) {
  if (level < 1) return 0;
  return Math.floor(5 * level * (1 + 0.1 * (level - 1)));
}

// Get upgrade cost to reach the next level: 12, 20, 28, 36, ...
// Formula: 4 + 8 * level (cost to upgrade FROM level to level+1)
function getResearchCenterUpgradeCost(currentLevel) {
  if (currentLevel < 1) return 0;
  return 4 + 8 * currentLevel;
}

// Get the display name for a research center level
function getResearchCenterName(level) {
  return RESEARCH_CENTER_BASE.levelNames[level] || `Level ${level} Research Center`;
}

// Get all data for a level (convenience function)
function getResearchCenterLevelData(level) {
  return {
    level: level,
    rpPerMonth: getResearchCenterRPPerMonth(level),
    upgradeCost: getResearchCenterUpgradeCost(level),
    name: getResearchCenterName(level)
  };
}

// Calculate total monthly operating cost for all research centers
// Formula: $0.5B base + $0.3B per level for each center
function getResearchCenterMonthlyCost() {
  if (!state.regionalResearchCenters) return 0;
  let totalCost = 0;
  for (const regionId in state.regionalResearchCenters) {
    const center = state.regionalResearchCenters[regionId];
    if (center && center.level > 0) {
      totalCost += 0.5 + 0.3 * center.level;
    }
  }
  return totalCost;
}

// Research Fields - switching between fields has cost and cooldown
const RESEARCH_FIELDS = {
  renewable: {
    id: "renewable",
    name: "Renewable Energy",
    icon: "☀️",
    switchCost: 8,    // $8B to switch to this field
    switchTime: 2,    // 2 months cooldown
    description: "Solar, wind, and hydrogen technologies"
  },
  carbon: {
    id: "carbon",
    name: "Carbon Capture",
    icon: "🏭",
    switchCost: 10,   // $10B to switch
    switchTime: 3,    // 3 months cooldown
    description: "CCS technologies and CO2 storage"
  },
  efficiency: {
    id: "efficiency",
    name: "Energy Efficiency",
    icon: "⚡",
    switchCost: 6,    // $6B to switch
    switchTime: 2,    // 2 months cooldown
    description: "Nuclear and grid optimization"
  },
  adaptation: {
    id: "adaptation",
    name: "Climate Adaptation",
    icon: "🛡️",
    switchCost: 8,    // $8B to switch
    switchTime: 2,    // 2 months cooldown
    description: "Nature-based solutions and resilience"
  },
};

// ═══════════════════════════════════════════════════════════════
// REGIONAL RESEARCH CENTER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Check if a region can have a research center built
function canBuildRegionalCenter(regionId) {
  const region = state.regions?.[regionId];
  if (!region) return { can: false, reason: "Region not found" };

  // Must have alliance
  if (!state.alliance || state.alliance[regionId]?.status !== 'allied') {
    return { can: false, reason: "No alliance with this region" };
  }

  // Check if already has a center
  if (state.regionalResearchCenters && state.regionalResearchCenters[regionId]) {
    return { can: false, reason: "Already has a research center" };
  }

  // Check cost
  const buildCost = RESEARCH_CENTER_BASE.buildCost;
  if (state.funds < buildCost) {
    return { can: false, reason: `Not enough funds (need $${buildCost}B)` };
  }

  return { can: true };
}

// Build a research center in an allied region
function buildRegionalCenter(regionId) {
  const check = canBuildRegionalCenter(regionId);
  if (!check.can) {
    showResearchNotification(check.reason, 'warning');
    return false;
  }

  const buildCost = RESEARCH_CENTER_BASE.buildCost;
  state.funds -= buildCost;

  // Initialize the center at level 1 with no assignment
  if (!state.regionalResearchCenters) state.regionalResearchCenters = {};
  state.regionalResearchCenters[regionId] = {
    level: 1,
    field: null,      // Not assigned to any field yet
    projectId: null,  // Not assigned to any project yet
  };

  const region = state.regions?.[regionId];
  const levelData = getResearchCenterLevelData(1);
  showResearchNotification(`Built ${levelData.name} in ${region.name}! (+${levelData.rpPerMonth} RP/mo)`, 'success');

  renderTechTree();
  updateUI();
  saveGame();
  return true;
}

// Check if a regional center can be upgraded (no max level)
function canUpgradeRegionalCenter(regionId) {
  if (!state.regionalResearchCenters || !state.regionalResearchCenters[regionId]) {
    return { can: false, reason: "No research center in this region" };
  }

  const center = state.regionalResearchCenters[regionId];
  const currentLevel = center.level;

  // No max level - can always upgrade
  const upgradeCost = getResearchCenterUpgradeCost(currentLevel);

  if (state.funds < upgradeCost) {
    return { can: false, reason: `Not enough funds (need $${upgradeCost}B)` };
  }

  return { can: true, cost: upgradeCost, nextLevel: currentLevel + 1 };
}

// Upgrade a regional research center
function upgradeRegionalCenter(regionId) {
  const check = canUpgradeRegionalCenter(regionId);
  if (!check.can) {
    showResearchNotification(check.reason, 'warning');
    return false;
  }

  state.funds -= check.cost;
  state.regionalResearchCenters[regionId].level = check.nextLevel;

  const region = state.regions?.[regionId];
  const levelData = getResearchCenterLevelData(check.nextLevel);
  showResearchNotification(`Upgraded to ${levelData.name} in ${region.name}! (+${levelData.rpPerMonth} RP/mo)`, 'success');

  renderTechTree();
  updateUI();
  saveGame();
  return true;
}

// Get the RP/month output for a center based on its level
function getCenterRPPerMonth(level) {
  return getResearchCenterRPPerMonth(level);
}

// Assign a research center to a field and project
function assignCenterToProject(regionId, fieldId, techId) {
  if (!state.regionalResearchCenters || !state.regionalResearchCenters[regionId]) {
    showResearchNotification("No research center in this region", 'warning');
    return false;
  }

  const center = state.regionalResearchCenters[regionId];
  const tech = TECHNOLOGIES.find(t => t.id === techId);

  if (!tech) {
    showResearchNotification("Technology not found", 'error');
    return false;
  }

  // Check if tech field matches the requested field
  if (tech.field !== fieldId) {
    showResearchNotification("Technology doesn't belong to this field", 'error');
    return false;
  }

  // Check if tech is already unlocked
  if (state.unlockedTechs && state.unlockedTechs.includes(techId)) {
    showResearchNotification("Technology already unlocked", 'warning');
    return false;
  }

  // Check prerequisites
  if (tech.requires && tech.requires.length > 0) {
    const hasAllPrereqs = tech.requires.every(
      reqId => state.unlockedTechs && state.unlockedTechs.includes(reqId)
    );
    if (!hasAllPrereqs) {
      showResearchNotification("Prerequisites not met", 'warning');
      return false;
    }
  }

  const oldField = center.field;
  const oldProject = center.projectId;

  // Check if switching fields (not just projects within same field)
  if (oldField && oldField !== fieldId) {
    const fieldData = RESEARCH_FIELDS[fieldId];

    // Check if can afford field switch cost
    if (state.funds < fieldData.switchCost) {
      showResearchNotification(`Not enough funds to switch fields (need $${fieldData.switchCost}B)`, 'warning');
      return false;
    }

    // Deduct switch cost and set cooldown
    state.funds -= fieldData.switchCost;
    if (!state.centerCooldowns) state.centerCooldowns = {};
    state.centerCooldowns[regionId] = fieldData.switchTime;

    showResearchNotification(`Switching to ${fieldData.name} field - ${fieldData.switchTime} months cooldown`, 'info');
  }

  // If switching project before completion, reset progress on old project
  if (oldProject && oldProject !== techId) {
    if (!state.techProgress) state.techProgress = {};
    // Reset progress on old project (it was not completed)
    state.techProgress[oldProject] = 0;
  }

  // Assign the new field and project
  center.field = fieldId;
  center.projectId = techId;

  // Initialize progress for the new tech if not exists
  if (!state.techProgress) state.techProgress = {};
  if (state.techProgress[techId] === undefined) {
    state.techProgress[techId] = 0;
  }

  const region = state.regions?.[regionId];
  showResearchNotification(`${region.name} center now researching: ${tech.name}`, 'success');

  renderTechTree();
  updateUI();
  saveGame();
  return true;
}

// Process monthly research - accumulate RP toward assigned projects
function processMonthlyResearch() {
  if (!state.regionalResearchCenters) return;

  // Decrement cooldowns first
  if (state.centerCooldowns) {
    for (const regionId in state.centerCooldowns) {
      if (state.centerCooldowns[regionId] > 0) {
        state.centerCooldowns[regionId]--;
      }
    }
  }

  // Process each active center
  for (const regionId in state.regionalResearchCenters) {
    const center = state.regionalResearchCenters[regionId];

    // Skip if on cooldown
    if (state.centerCooldowns && state.centerCooldowns[regionId] > 0) {
      continue;
    }

    // Skip if not assigned to a project
    if (!center.projectId) continue;

    // Skip if tech already unlocked
    if (state.unlockedTechs && state.unlockedTechs.includes(center.projectId)) {
      continue;
    }

    // Add RP to the project
    const rpPerMonth = getCenterRPPerMonth(center.level);
    if (!state.techProgress) state.techProgress = {};
    if (state.techProgress[center.projectId] === undefined) {
      state.techProgress[center.projectId] = 0;
    }
    state.techProgress[center.projectId] += rpPerMonth;

    // Check if tech is now unlocked
    const tech = TECHNOLOGIES.find(t => t.id === center.projectId);
    if (tech && state.techProgress[center.projectId] >= tech.cost) {
      // Unlock the technology!
      if (!state.unlockedTechs) state.unlockedTechs = [];
      state.unlockedTechs.push(center.projectId);

      const region = state.regions?.[regionId];
      showResearchNotification(`${tech.name} research complete!`, 'success');

      // Clear the assignment so player can choose next project
      center.projectId = null;
    }
  }
}

// Get total RP/month from all active regional centers
function getTotalRegionalRPPerMonth() {
  if (!state.regionalResearchCenters) return 0;

  let total = 0;
  for (const regionId in state.regionalResearchCenters) {
    const center = state.regionalResearchCenters[regionId];

    // Skip if on cooldown
    if (state.centerCooldowns && state.centerCooldowns[regionId] > 0) {
      continue;
    }

    total += getCenterRPPerMonth(center.level);
  }
  return total;
}

// Get RP/month from centers that are assigned to projects (actively researching)
function getAssignedRPPerMonth() {
  if (!state.regionalResearchCenters) return 0;

  let assigned = 0;
  for (const regionId in state.regionalResearchCenters) {
    const center = state.regionalResearchCenters[regionId];

    // Skip if on cooldown
    if (state.centerCooldowns && state.centerCooldowns[regionId] > 0) {
      continue;
    }

    // Only count if assigned to a project
    if (center.projectId) {
      assigned += getCenterRPPerMonth(center.level);
    }
  }
  return assigned;
}

// Destroy a research center when alliance is lost
function destroyRegionalCenter(regionId) {
  if (!state.regionalResearchCenters || !state.regionalResearchCenters[regionId]) {
    return;
  }

  const region = state.regions?.[regionId];
  delete state.regionalResearchCenters[regionId];

  // Also clean up cooldown if any
  if (state.centerCooldowns && state.centerCooldowns[regionId]) {
    delete state.centerCooldowns[regionId];
  }

  if (region) {
    showResearchNotification(`Research center in ${region.name} destroyed - alliance lost!`, 'warning');
  }

  renderTechTree();
}

// Get list of regions where player can build research centers
function getAvailableRegionsForResearch() {
  if (!state.alliance) return [];

  // Get allied regions from state.alliance object
  const alliedRegions = Object.keys(state.alliance).filter(regionId =>
    state.alliance[regionId].status === 'allied'
  );

  return alliedRegions.filter(regionId => {
    // Must not already have a center
    return !state.regionalResearchCenters || !state.regionalResearchCenters[regionId];
  });
}

// Get technologies available for research in a field
function getTechsInField(fieldId) {
  return TECHNOLOGIES.filter(tech => tech.field === fieldId);
}

// Get researchable technologies in a field (prerequisites met, not unlocked)
function getResearchableTechsInField(fieldId) {
  return TECHNOLOGIES.filter(tech => {
    if (tech.field !== fieldId) return false;
    if (state.unlockedTechs && state.unlockedTechs.includes(tech.id)) return false;

    // Check prerequisites
    if (tech.requires && tech.requires.length > 0) {
      const hasAllPrereqs = tech.requires.every(
        reqId => state.unlockedTechs && state.unlockedTechs.includes(reqId)
      );
      if (!hasAllPrereqs) return false;
    }

    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// END REGIONAL RESEARCH CENTER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Global Research Centers - Generate RP monthly and provide tech discounts
// Based on real-world R&D facility costs and outputs
const RESEARCH_CENTERS = {
  categories: [
    {
      id: 'renewable',
      name: 'Renewable Energy',
      icon: '☀️',
      centers: [
        {
          id: 'solar_research',
          name: 'Solar Energy Research Institute',
          description: 'Advanced photovoltaic and concentrated solar research.',
          buildCost: 8,      // $8B
          monthlyCost: 0.4,  // $0.4B/month
          rpPerMonth: 8,
          techBonus: { category: 'renewable', discount: 0.10 },
          realWorldRef: 'Similar to NREL Solar Energy Research Facility'
        },
        {
          id: 'wind_research',
          name: 'Advanced Wind Laboratory',
          description: 'Next-generation wind turbine and offshore wind research.',
          buildCost: 6,
          monthlyCost: 0.3,
          rpPerMonth: 6,
          techBonus: { category: 'renewable', discount: 0.08 },
          realWorldRef: 'Similar to DTU Wind Energy'
        }
      ]
    },
    {
      id: 'carbon',
      name: 'Carbon Capture',
      icon: '🌿',
      centers: [
        {
          id: 'carbon_hub',
          name: 'Carbon Capture Innovation Hub',
          description: 'Point-source capture and storage technology development.',
          buildCost: 10,
          monthlyCost: 0.5,
          rpPerMonth: 10,
          techBonus: { category: 'carbon', discount: 0.12 },
          realWorldRef: 'Similar to Global CCS Institute facilities'
        },
        {
          id: 'dac_center',
          name: 'Direct Air Capture Center',
          description: 'Atmospheric CO2 removal technology research.',
          buildCost: 12,
          monthlyCost: 0.6,
          rpPerMonth: 9,
          techBonus: { category: 'carbon', discount: 0.15 },
          realWorldRef: 'Similar to Climeworks R&D Center'
        }
      ]
    },
    {
      id: 'efficiency',
      name: 'Energy Efficiency',
      icon: '⚡',
      centers: [
        {
          id: 'storage_lab',
          name: 'Energy Storage Research Lab',
          description: 'Battery technology and grid-scale storage solutions.',
          buildCost: 7,
          monthlyCost: 0.35,
          rpPerMonth: 7,
          techBonus: { category: 'efficiency', discount: 0.10 },
          realWorldRef: 'Similar to Argonne National Laboratory'
        },
        {
          id: 'grid_center',
          name: 'Smart Grid Technology Center',
          description: 'Grid optimization and demand response research.',
          buildCost: 5,
          monthlyCost: 0.25,
          rpPerMonth: 5,
          techBonus: { category: 'efficiency', discount: 0.08 },
          realWorldRef: 'Similar to EPRI facilities'
        }
      ]
    },
    {
      id: 'adaptation',
      name: 'Climate Adaptation',
      icon: '🛡️',
      centers: [
        {
          id: 'resilience_institute',
          name: 'Climate Resilience Institute',
          description: 'Infrastructure adaptation and disaster preparedness research.',
          buildCost: 15,
          monthlyCost: 0.8,
          rpPerMonth: 12,
          techBonus: { category: 'adaptation', discount: 0.15 },
          realWorldRef: 'Similar to CSIRO Climate Adaptation Flagship'
        },
        {
          id: 'agriculture_lab',
          name: 'Sustainable Agriculture Lab',
          description: 'Climate-resilient crops and sustainable farming practices.',
          buildCost: 4,
          monthlyCost: 0.2,
          rpPerMonth: 4,
          techBonus: { category: 'adaptation', discount: 0.06 },
          realWorldRef: 'Similar to CGIAR research centers'
        }
      ]
    }
  ]
};

// Random Events System
const EVENTS = [
  // Climate Events
  {
    id: "heat_wave",
    name: "Extreme Heat Wave",
    category: "climate",
    description: "Record-breaking temperatures sweep across multiple regions, straining power grids and reducing agricultural output.",
    probability: 0.03,
    duration: 3,  // months
    effects: {
      incomeMultiplier: 0.9,  // -10% income
    },
    icon: "🌡️",
  },
  {
    id: "hurricane",
    name: "Major Hurricane Season",
    category: "climate",
    description: "An unusually active hurricane season causes widespread damage and disrupts renewable energy projects.",
    probability: 0.025,
    duration: 2,
    effects: {
      projectEffectiveness: 0.85,  // -15% project effectiveness
    },
    icon: "🌀",
  },
  {
    id: "drought",
    name: "Severe Drought",
    category: "climate",
    description: "Prolonged drought affects hydropower and agricultural regions, reducing overall energy production.",
    probability: 0.025,
    duration: 4,
    effects: {
      incomeMultiplier: 0.85,
    },
    icon: "☀️",
  },
  {
    id: "flooding",
    name: "Catastrophic Flooding",
    category: "climate",
    description: "Unprecedented rainfall causes massive flooding, damaging infrastructure and displacing populations.",
    probability: 0.02,
    duration: 2,
    effects: {
      projectEffectiveness: 0.8,
      incomeMultiplier: 0.9,
    },
    icon: "🌊",
  },

  // Political Events
  {
    id: "climate_summit",
    name: "International Climate Summit",
    category: "political",
    description: "A major climate summit results in new international cooperation and increased climate finance commitments.",
    probability: 0.02,
    duration: 6,
    effects: {
      incomeMultiplier: 1.15,  // +15% income
    },
    icon: "🌍",
  },
  {
    id: "policy_change",
    name: "Progressive Policy Shift",
    category: "political",
    description: "A wave of pro-climate politicians takes office, making climate campaigns more effective.",
    probability: 0.02,
    duration: 12,
    effects: {
      campaignEffectiveness: 1.25,  // +25% campaign effectiveness
    },
    icon: "🗳️",
  },
  {
    id: "fossil_lobby",
    name: "Fossil Fuel Lobbying",
    category: "political",
    description: "Fossil fuel companies launch a major lobbying campaign, slowing down climate initiatives.",
    probability: 0.025,
    duration: 6,
    effects: {
      projectCostMultiplier: 1.1,  // +10% project costs
      campaignEffectiveness: 0.8,  // -20% campaign effectiveness
    },
    icon: "🛢️",
  },
  {
    id: "youth_movement",
    name: "Global Youth Climate Movement",
    category: "political",
    description: "A new generation of climate activists mobilizes worldwide, putting pressure on governments to act.",
    probability: 0.02,
    duration: 8,
    effects: {
      campaignEffectiveness: 1.3,
    },
    icon: "✊",
  },

  // Economic Events
  {
    id: "recession",
    name: "Global Economic Recession",
    category: "economic",
    description: "A worldwide economic downturn reduces government budgets for climate action.",
    probability: 0.015,
    duration: 12,
    effects: {
      incomeMultiplier: 0.75,  // -25% income
    },
    icon: "📉",
  },
  {
    id: "economic_boom",
    name: "Green Economic Boom",
    category: "economic",
    description: "Investment in green technology drives economic growth and increases funding for climate projects.",
    probability: 0.02,
    duration: 8,
    effects: {
      incomeMultiplier: 1.2,  // +20% income
      projectCostMultiplier: 0.9,  // -10% project costs
    },
    icon: "📈",
  },
  {
    id: "oil_crisis",
    name: "Oil Price Spike",
    category: "economic",
    description: "A sudden spike in oil prices makes renewable energy more competitive but strains overall budgets.",
    probability: 0.02,
    duration: 6,
    effects: {
      incomeMultiplier: 0.9,
      projectEffectiveness: 1.1,  // Renewables more effective
    },
    icon: "⛽",
  },

  // Breakthrough Events
  {
    id: "solar_breakthrough",
    name: "Solar Technology Breakthrough",
    category: "breakthrough",
    description: "Scientists achieve a major breakthrough in solar panel efficiency, permanently improving solar projects.",
    probability: 0.01,
    duration: 0,  // Permanent
    effects: {
      permanentBonus: { solar: { co2Reduction: 1.15 } },
    },
    icon: "🔬",
  },
  {
    id: "battery_breakthrough",
    name: "Battery Storage Revolution",
    category: "breakthrough",
    description: "A new battery technology enables better energy storage, boosting all renewable project income.",
    probability: 0.01,
    duration: 0,  // Permanent
    effects: {
      permanentBonus: { solar: { income: 1.2 }, wind: { income: 1.2 }, offshoreWind: { income: 1.2 } },
    },
    icon: "🔋",
  },
  {
    id: "ccs_advancement",
    name: "Carbon Capture Advancement",
    category: "breakthrough",
    description: "New materials make carbon capture more efficient and cost-effective.",
    probability: 0.01,
    duration: 0,  // Permanent
    effects: {
      permanentBonus: { carbonCapture: { co2Reduction: 1.25, costReduction: 0.85 } },
    },
    icon: "🌱",
  },
  {
    id: "fusion_progress",
    name: "Fusion Energy Progress",
    category: "breakthrough",
    description: "Significant progress toward fusion energy generates optimism and increases research funding.",
    probability: 0.008,
    duration: 0,  // Permanent
    effects: {
      researchPointsBonus: 2,  // +2 RP per research center
    },
    icon: "⚡",
  },
];

// Natural Disasters System - Regional, temperature-dependent disasters
const NATURAL_DISASTERS = [
  {
    id: "heatWave",
    name: "Extreme Heat Wave",
    icon: "🌡️",
    baseProbability: 0.005,      // 0.5% base chance per vulnerable region per month
    tempScaling: 2.5,            // Multiplier increase per °C above 1.2
    baseIncomeReduction: 0.15,   // 15% income reduction
    minDuration: 2,
    maxDuration: 3,
    descriptions: [
      "Record-breaking temperatures cause widespread power outages and agricultural losses",
      "Deadly heat wave overwhelms healthcare systems and strains infrastructure",
      "Extreme heat forces mass evacuations and halts outdoor economic activity",
    ],
  },
  {
    id: "hurricane",
    name: "Major Hurricane",
    icon: "🌀",
    baseProbability: 0.004,
    tempScaling: 2.0,            // Hurricanes intensify with warming
    baseIncomeReduction: 0.25,   // 25% - most damaging
    minDuration: 1,
    maxDuration: 2,
    descriptions: [
      "Category 4 hurricane makes landfall, causing catastrophic damage",
      "Devastating cyclone destroys coastal infrastructure and displaces thousands",
      "Unprecedented storm surge floods major cities and industrial areas",
    ],
  },
  {
    id: "flooding",
    name: "Catastrophic Flooding",
    icon: "🌊",
    baseProbability: 0.005,
    tempScaling: 1.8,
    baseIncomeReduction: 0.20,
    minDuration: 1,
    maxDuration: 2,
    descriptions: [
      "Unprecedented rainfall causes rivers to overflow, flooding cities and farmland",
      "Flash floods devastate communities as climate change intensifies precipitation",
      "Monsoon flooding reaches historic levels, destroying homes and infrastructure",
    ],
  },
  {
    id: "drought",
    name: "Severe Drought",
    icon: "☀️",
    baseProbability: 0.003,
    tempScaling: 3.0,            // Droughts scale strongly with temperature
    baseIncomeReduction: 0.20,
    minDuration: 3,
    maxDuration: 6,
    descriptions: [
      "Multi-year drought devastates agriculture and strains water supplies",
      "Worst drought in decades forces rationing and causes crop failures",
      "Prolonged water crisis threatens food security and economic stability",
    ],
  },
  {
    id: "wildfire",
    name: "Devastating Wildfires",
    icon: "🔥",
    baseProbability: 0.003,
    tempScaling: 2.8,
    baseIncomeReduction: 0.15,
    minDuration: 2,
    maxDuration: 4,
    descriptions: [
      "Unprecedented wildfires burn millions of hectares, destroying communities",
      "Fire season reaches catastrophic levels as drought and heat create tinderbox conditions",
      "Megafires force mass evacuations and cause billions in damage",
    ],
  },
  {
    id: "extremeCold",
    name: "Extreme Cold Snap",
    icon: "❄️",
    baseProbability: 0.002,
    tempScaling: 1.2,            // Paradoxically increases slightly (polar vortex disruption)
    baseIncomeReduction: 0.10,
    minDuration: 1,
    maxDuration: 2,
    descriptions: [
      "Polar vortex disruption brings record-breaking cold and energy crisis",
      "Extreme cold snap strains heating systems and causes widespread power failures",
      "Arctic air mass causes transportation chaos and infrastructure damage",
    ],
  },
  {
    id: "volcano",
    name: "Volcanic Eruption",
    icon: "🌋",
    baseProbability: 0.001,       // Rare event
    tempScaling: 0,               // Not climate-dependent (geological)
    baseIncomeReduction: 0.20,    // Significant economic disruption
    minDuration: 1,
    maxDuration: 3,
    co2Emission: 0.5,             // Gigatons of CO2 released (varies by eruption size)
    isGeological: true,           // Flag for non-climate disaster
    descriptions: [
      "Major volcanic eruption releases massive amounts of CO2 and disrupts regional activity",
      "Volcanic activity forces evacuations and releases greenhouse gases into atmosphere",
      "Eruption spews ash and CO2, causing temporary cooling but long-term warming contribution",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// NATURAL DISASTER SYSTEM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Default vulnerability values based on region for countries without explicit data
const DEFAULT_VULNERABILITY_BY_REGION = {
  europe: {
    heatWave: 0.4, hurricane: 0.0, flooding: 0.5, drought: 0.3, wildfire: 0.3, extremeCold: 0.3, volcano: 0.2, resilience: 0.7,
  },
  asia: {
    heatWave: 0.6, hurricane: 0.3, flooding: 0.6, drought: 0.4, wildfire: 0.2, extremeCold: 0.2, volcano: 0.6, resilience: 0.5,
  },
  north_america: {
    heatWave: 0.5, hurricane: 0.4, flooding: 0.5, drought: 0.4, wildfire: 0.5, extremeCold: 0.4, volcano: 0.3, resilience: 0.7,
  },
  south_america: {
    heatWave: 0.5, hurricane: 0.2, flooding: 0.6, drought: 0.5, wildfire: 0.4, extremeCold: 0.0, volcano: 0.5, resilience: 0.4,
  },
  africa: {
    heatWave: 0.7, hurricane: 0.1, flooding: 0.5, drought: 0.7, wildfire: 0.3, extremeCold: 0.0, volcano: 0.2, resilience: 0.3,
  },
  oceania: {
    heatWave: 0.7, hurricane: 0.3, flooding: 0.4, drought: 0.7, wildfire: 0.8, extremeCold: 0.0, volcano: 0.6, resilience: 0.6,
  },
  middle_east: {
    heatWave: 0.9, hurricane: 0.0, flooding: 0.3, drought: 0.8, wildfire: 0.1, extremeCold: 0.0, volcano: 0.1, resilience: 0.5,
  },
};

/**
 * Get disaster vulnerability for a country
 * Returns explicit data if available, otherwise uses region-based defaults
 */
function getDisasterVulnerability(regionId) {
  const countryData = CLIMATE_DATA[regionId];
  if (countryData && countryData.disasterVulnerability) {
    return countryData.disasterVulnerability;
  }
  // Fall back to region-based defaults
  const region = countryData?.region || "europe";
  let defaultRegion = region;
  // Map country regions to vulnerability regions
  if (region === "asia" && countryData) {
    // Check if it's Middle East
    const middleEastCountries = ["saudi_arabia", "iran", "iraq", "uae", "kuwait", "qatar", "bahrain", "oman", "jordan", "lebanon", "syria", "yemen", "israel", "palestine"];
    if (middleEastCountries.includes(regionId)) {
      defaultRegion = "middle_east";
    }
  }
  return DEFAULT_VULNERABILITY_BY_REGION[defaultRegion] || DEFAULT_VULNERABILITY_BY_REGION.europe;
}

/**
 * Calculate disaster probability based on temperature
 */
function calculateDisasterProbability(disaster, vulnerability, temperature) {
  if (vulnerability === 0) return 0;

  // Temperature multiplier: scales up as temperature rises above 1.2°C
  const tempAboveBaseline = Math.max(0, temperature - 1.2);
  const tempMultiplier = 1 + (tempAboveBaseline * disaster.tempScaling);

  // Base probability × vulnerability × temperature scaling.
  // Clamp to [0,1] so extreme temperatures don't silently produce a >1
  // "probability" that always fires (consumed as Math.random() < probability).
  return Math.min(1, disaster.baseProbability * vulnerability * tempMultiplier);
}

/**
 * Roll for disasters each month
 * Returns array of new disasters that occurred
 */
function rollForDisasters(temperature) {
  const newDisasters = [];
  const difficulty = getDifficulty();

  // Limit disasters based on difficulty
  const maxNewDisasters = difficulty.id === "tutorial" ? 0 :
                          difficulty.id === "easy" ? 1 :
                          difficulty.id === "normal" ? 2 :
                          difficulty.id === "hard" ? 3 : 4;

  if (maxNewDisasters === 0) return newDisasters; // Tutorial mode - no disasters

  // Check each region for each disaster type
  Object.keys(state.regions).forEach((regionId) => {
    // Skip if region already has an active disaster
    if (state.activeDisasters.some(d => d.regionId === regionId)) return;

    const vulnerability = getDisasterVulnerability(regionId);
    const countryData = CLIMATE_DATA[regionId];

    NATURAL_DISASTERS.forEach((disaster) => {
      if (newDisasters.length >= maxNewDisasters) return;

      const vulnScore = vulnerability[disaster.id] || 0;
      if (vulnScore === 0) return; // This disaster can't happen in this region

      const probability = calculateDisasterProbability(disaster, vulnScore, temperature);

      if (Math.random() < probability) {
        // Disaster occurs!
        const duration = Math.floor(Math.random() * (disaster.maxDuration - disaster.minDuration + 1)) + disaster.minDuration;

        // Calculate income reduction based on resilience
        const resilience = vulnerability.resilience || 0.5;
        const incomeReduction = disaster.baseIncomeReduction * (1.5 - resilience); // Lower resilience = more damage

        // Check if region is in climate alliance
        const isInAlliance = state.alliance?.[regionId]?.status === ALLIANCE_STATUS.ALLIED;

        const newDisaster = {
          id: `disaster_${regionId}_${disaster.id}_${state.year}_${state.month}`,
          type: disaster.id,
          typeName: disaster.name,
          icon: disaster.icon,
          regionId: regionId,
          regionName: countryData?.name || regionId,
          startMonth: state.month,
          startYear: state.year,
          duration: duration,
          remainingMonths: duration,
          incomeReduction: Math.min(incomeReduction, 0.5), // Cap at 50% reduction
          description: disaster.descriptions[Math.floor(Math.random() * disaster.descriptions.length)],
          // New properties for alliance reactions and CO2 effects
          isClimateRelated: !disaster.isGeological,  // Most disasters are climate-induced
          co2Emission: disaster.co2Emission || 0,    // CO2 released (volcanoes)
          regionInAlliance: isInAlliance,            // Track alliance status when disaster hit
        };

        newDisasters.push(newDisaster);
      }
    });
  });

  return newDisasters;
}

/**
 * Get total income multiplier from disasters for a region
 * Returns 1.0 if no disasters, less than 1.0 if disaster active
 */
function getDisasterIncomeMultiplier(regionId) {
  const activeDisaster = state.activeDisasters.find(d => d.regionId === regionId);
  if (!activeDisaster) return 1.0;
  return 1.0 - activeDisaster.incomeReduction;
}

/**
 * Update disaster awareness for a region when disaster occurs
 * Higher severity = more awareness = easier campaigns
 */
function updateDisasterAwareness(regionId, incomeReduction) {
  if (!state.disasterHistory[regionId]) {
    state.disasterHistory[regionId] = {
      totalDisasters: 0,
      recentDisasters: 0,
      lastDisasterMonth: 0,
      climateAwarenessBoost: 0,
    };
  }

  const history = state.disasterHistory[regionId];
  const gameMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;

  history.totalDisasters++;
  history.recentDisasters++;
  history.lastDisasterMonth = gameMonth;

  // Awareness boost based on disaster severity
  let awarenessBoost;
  if (incomeReduction >= 0.25) {
    awarenessBoost = 0.08; // Severe disaster: +8%
  } else if (incomeReduction >= 0.15) {
    awarenessBoost = 0.05; // Moderate disaster: +5%
  } else {
    awarenessBoost = 0.03; // Minor disaster: +3%
  }

  history.climateAwarenessBoost = Math.min(history.climateAwarenessBoost + awarenessBoost, 0.4); // Cap at 40%
}

/**
 * Get campaign difficulty modifier based on disaster history
 * Returns 1.0 for no history, less for regions with disaster experience
 */
function getDisasterAwarenessModifier(regionId) {
  const history = state.disasterHistory[regionId];
  if (!history) return 1.0;
  return 1.0 - history.climateAwarenessBoost;
}

/**
 * Decay disaster awareness over time (called yearly)
 * Awareness fades by 1% per year if no new disasters
 */
function decayDisasterAwareness() {
  const gameMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;

  Object.keys(state.disasterHistory).forEach((regionId) => {
    const history = state.disasterHistory[regionId];
    // If no disaster in the last 24 months, decay awareness
    if (gameMonth - history.lastDisasterMonth > 24) {
      history.climateAwarenessBoost = Math.max(0, history.climateAwarenessBoost - 0.01);
      history.recentDisasters = 0;
    }
  });
}

/**
 * Process disaster effects on alliance interest and happiness
 * Climate disasters affect regions differently based on alliance membership:
 * - Non-alliance regions: +interest boost (see need for climate action)
 * - Alliance regions: +happiness boost (feel validated for taking action)
 * - Neighboring non-alliance regions: +interest (see nearby climate impact)
 */
function processDisasterAllianceEffects(disaster) {
  if (!disaster.isClimateRelated) return; // Only climate disasters trigger this

  const regionId = disaster.regionId;
  const alliance = state.alliance?.[regionId];
  const isInAlliance = alliance?.status === ALLIANCE_STATUS.ALLIED;
  const severity = disaster.incomeReduction; // 0.1 to 0.5

  // Calculate effect magnitude based on severity
  const interestBoost = Math.round(severity * 20);   // +2 to +10 interest
  const happinessBoost = Math.round(severity * 10);  // +1 to +5 happiness

  if (isInAlliance) {
    // Alliance members: Feel validated for taking climate action
    // Apply happiness bonus (they're doing something about it)
    if (alliance.happiness !== undefined) {
      alliance.happiness = Math.min(100, alliance.happiness + happinessBoost);
    }
    pushMessage(`${disaster.regionName}'s population feels validated in their climate commitment after experiencing ${disaster.typeName.toLowerCase()}.`, "neutral");
  } else {
    // Non-alliance regions: Climate disaster increases interest in joining
    if (alliance?.interest !== undefined) {
      alliance.interest = Math.min(100, alliance.interest + interestBoost);
    }
    pushMessage(`${disaster.typeName} increases climate concern in ${disaster.regionName}. Interest in climate alliance grows.`, "neutral");
  }

  // Neighboring non-alliance regions also get interest boost (seeing nearby disasters)
  const neighbors = getNeighboringRegions(regionId);
  neighbors.forEach((neighborId) => {
    const neighborAlliance = state.alliance?.[neighborId];
    if (neighborAlliance && neighborAlliance.status !== ALLIANCE_STATUS.ALLIED) {
      const neighborBoost = Math.round(interestBoost * 0.5); // Half the boost
      neighborAlliance.interest = Math.min(100, (neighborAlliance.interest || 0) + neighborBoost);
    }
  });
}

/**
 * Get neighboring regions for a given region
 * Uses geographic proximity from CLIMATE_DATA or region groupings
 */
function getNeighboringRegions(regionId) {
  const countryData = CLIMATE_DATA[regionId];
  if (countryData?.neighbors) {
    return countryData.neighbors;
  }
  // Fallback: Return regions in the same geographic area
  const region = countryData?.region;
  if (!region) return [];

  return Object.keys(state.regions).filter((id) => {
    if (id === regionId) return false;
    return CLIMATE_DATA[id]?.region === region;
  }).slice(0, 3); // Limit to 3 neighbors
}

/**
 * Apply CO2 emissions from volcanic eruptions
 * Volcanoes release CO2 directly into atmosphere (unlike climate disasters)
 */
function applyVolcanicCO2Emission(disaster) {
  if (disaster.co2Emission && disaster.co2Emission > 0) {
    // Convert GT CO2 to ppm using the engine's own conversion constant.
    // NOTE: 2.12 ppm/Gt is the factor for Gt of *carbon*, not Gt CO2; co2Emission
    // is documented as Gt CO2, so use EMISSIONS_TO_PPM_FACTOR (~0.1277 ppm/Gt CO2)
    // to stay consistent with the rest of the carbon model.
    const ppmIncrease = disaster.co2Emission * EMISSIONS_TO_PPM_FACTOR;
    state.co2 += ppmIncrease;
    pushMessage(`${disaster.icon} Volcanic eruption releases ${disaster.co2Emission.toFixed(1)} GT of CO2, adding ${ppmIncrease.toFixed(2)} ppm to atmosphere.`, "bad");
  }
}

/**
 * Process disasters at end of month
 * - Decrement remaining months
 * - Remove expired disasters
 * - Generate recovery messages
 */
function processDisasterDurations() {
  const expiredDisasters = [];

  state.activeDisasters = state.activeDisasters.filter((disaster) => {
    disaster.remainingMonths--;

    if (disaster.remainingMonths <= 0) {
      expiredDisasters.push(disaster);
      return false;
    }
    return true;
  });

  // Generate recovery messages
  expiredDisasters.forEach((disaster) => {
    pushMessage(`${disaster.regionName} recovers from ${disaster.typeName.toLowerCase()}. Economic activity returning to normal.`, "good");
  });
}

// Achievement System
const ACHIEVEMENTS = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Build your first climate project",
    icon: "🌱",
    condition: (state) => {
      let totalProjects = 0;
      Object.values(state.regions).forEach((r) => { totalProjects += r.projects.length; });
      return totalProjects >= 1;
    },
  },
  {
    id: "getting_started",
    name: "Getting Started",
    description: "Build 10 climate projects",
    icon: "🏗️",
    condition: (state) => {
      let totalProjects = 0;
      Object.values(state.regions).forEach((r) => { totalProjects += r.projects.length; });
      return totalProjects >= 10;
    },
  },
  {
    id: "renewable_revolution",
    name: "Renewable Revolution",
    description: "Build 50 renewable energy projects (solar, wind, offshore wind)",
    icon: "⚡",
    condition: (state) => {
      let renewables = 0;
      Object.values(state.regions).forEach((r) => {
        r.projects.forEach((p) => {
          const type = typeof p === "string" ? p : p.type;
          if (["solar", "wind", "offshoreWind"].includes(type)) renewables++;
        });
      });
      return renewables >= 50;
    },
  },
  {
    id: "tech_leader",
    name: "Tech Leader",
    description: "Unlock all technologies in the research tree",
    icon: "🔬",
    condition: (state) => {
      return state.unlockedTechs && state.unlockedTechs.length >= TECHNOLOGIES.length;
    },
  },
  {
    id: "carbon_neutral",
    name: "Carbon Neutral",
    description: "Achieve net-zero emissions (CO2 reduction equals or exceeds natural increase)",
    icon: "🌍",
    condition: (state) => {
      if (!state.history || state.history.length < 2) return false;
      const latest = state.history[state.history.length - 1];
      return latest.totalReduction >= getCo2IncreaseRate();
    },
  },
  {
    id: "climate_champion",
    name: "Climate Champion",
    description: "Reduce global temperature below +1.1°C",
    icon: "🏆",
    condition: (state) => {
      // Must have actually reduced temperature below 1.1°C from the starting value (CAR-37).
      // Guard: if startingTemp is already ≤ 1.1°C the game starts below threshold, so
      // also require the player has reduced temperature below the starting point.
      const belowThreshold = state.temperature < 1.1;
      const reducedFromStart = state.temperature < GAME_CONFIG.startingTemp;
      return belowThreshold && reducedFromStart;
    },
  },
  {
    id: "speed_run",
    name: "Speed Run",
    description: "Win the game in the earliest possible year (2050)",
    icon: "⏱️",
    condition: (state) => {
      return state.won && state.year === 2050;
    },
  },
  {
    id: "against_all_odds",
    name: "Against All Odds",
    description: "Win the game on Extreme difficulty",
    icon: "💪",
    condition: (state) => {
      return state.won && state.difficulty === "extreme";
    },
  },
  {
    id: "global_coalition",
    name: "Global Coalition",
    description: "Run climate campaigns in 20 or more different countries",
    icon: "🤝",
    condition: (state) => {
      if (!state.campaignHistory) return false;
      const uniqueCountries = new Set(state.campaignHistory);
      return uniqueCountries.size >= 20;
    },
  },
  {
    id: "research_pioneer",
    name: "Research Pioneer",
    description: "Accumulate 500 research points",
    icon: "📚",
    condition: (state) => {
      return (state.researchPoints || 0) + getTotalSpentRP(state) >= 500;
    },
  },
  {
    id: "forest_guardian",
    name: "Forest Guardian",
    description: "Plant 25 reforestation projects",
    icon: "🌲",
    condition: (state) => {
      let forests = 0;
      Object.values(state.regions).forEach((r) => {
        r.projects.forEach((p) => {
          const type = typeof p === "string" ? p : p.type;
          if (type === "forest") forests++;
        });
      });
      return forests >= 25;
    },
  },
  {
    id: "nuclear_age",
    name: "Nuclear Age",
    description: "Build 10 nuclear power plants",
    icon: "⚛️",
    condition: (state) => {
      let nuclear = 0;
      Object.values(state.regions).forEach((r) => {
        r.projects.forEach((p) => {
          const type = typeof p === "string" ? p : p.type;
          if (type === "nuclear") nuclear++;
        });
      });
      return nuclear >= 10;
    },
  },
  {
    id: "carbon_capture_master",
    name: "Carbon Capture Master",
    description: "Build 15 carbon capture facilities",
    icon: "🌀",
    condition: (state) => {
      let ccs = 0;
      Object.values(state.regions).forEach((r) => {
        r.projects.forEach((p) => {
          const type = typeof p === "string" ? p : p.type;
          if (type === "carbonCapture") ccs++;
        });
      });
      return ccs >= 15;
    },
  },
  {
    id: "big_spender",
    name: "Big Spender",
    description: "Spend $1 trillion on climate projects",
    icon: "💰",
    condition: (state) => {
      return (state.totalSpent || 0) >= 1000;
    },
  },
  {
    id: "survivor",
    name: "Survivor",
    description: "Reach the year 2075 without triggering any tipping points",
    icon: "🛡️",
    condition: (state) => {
      return state.year >= 2075 && (!state.tippingPointsTriggered || state.tippingPointsTriggered.length === 0);
    },
  },
];

// Helper to calculate total spent research points
function getTotalSpentRP(state) {
  if (!state.unlockedTechs) return 0;
  let total = 0;
  state.unlockedTechs.forEach((techId) => {
    const tech = TECHNOLOGIES.find((t) => t.id === techId);
    if (tech) total += tech.cost;
  });
  return total;
}

// Check for newly unlocked achievements
function checkAchievements() {
  if (!state.achievements) {
    state.achievements = [];
  }

  ACHIEVEMENTS.forEach((achievement) => {
    // Skip if already unlocked
    if (state.achievements.includes(achievement.id)) {
      return;
    }

    // Check condition
    try {
      if (achievement.condition(state)) {
        // Unlock the achievement
        state.achievements.push(achievement.id);
        showAchievementNotification(achievement);
        pushMessage(`Achievement unlocked: ${achievement.name}!`, "good");
      }
    } catch (e) {
      console.warn(`Error checking achievement ${achievement.id}:`, e);
    }
  });
}

// Show achievement notification toast
function showAchievementNotification(achievement) {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <div class="achievement-toast-icon">${achievement.icon}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-title">Achievement Unlocked!</div>
      <div class="achievement-toast-name">${achievement.name}</div>
      <div class="achievement-toast-desc">${achievement.description}</div>
    </div>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove after animation
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 4000);
}

// ═══════════════════════════════════════════════════════════════
// EVENT POPUP SYSTEM
// ═══════════════════════════════════════════════════════════════

// Queue for pending popups
const popupQueue = [];
let isPopupShowing = false;
let activeDialogState = null;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function getFocusableElements(dialog) {
  return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.hasAttribute("disabled")) return false;
      return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    });
}

function deactivateDialog(container, options = {}) {
  const { restoreFocus = true } = options;
  if (!activeDialogState || activeDialogState.container !== container) return;

  document.removeEventListener("keydown", activeDialogState.handleKeydown, true);
  const previouslyFocused = activeDialogState.previouslyFocused;
  activeDialogState = null;

  if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
    previouslyFocused.focus();
  }
}

function activateDialog(container, dialog, onClose) {
  if (!container || !dialog) return;
  if (activeDialogState) {
    deactivateDialog(activeDialogState.container, { restoreFocus: false });
  }

  const previouslyFocused = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

  const handleKeydown = (event) => {
    if (!activeDialogState || activeDialogState.container !== container) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  activeDialogState = { container, handleKeydown, previouslyFocused };
  document.addEventListener("keydown", handleKeydown, true);

  const focusTarget = getFocusableElements(dialog)[0] || dialog;
  focusTarget.focus();
}

/**
 * Show an event popup to the user
 * @param {Object} config - Popup configuration
 * @param {string} config.type - 'disaster' | 'tipping-point' | 'research' | 'breakthrough'
 * @param {string} config.title - Main title
 * @param {string} config.icon - Emoji icon
 * @param {string} config.description - Main description text
 * @param {string|Array} config.details - Details text or array of detail items
 */
function showEventPopup(config) {
  popupQueue.push(config);
  if (!isPopupShowing) {
    displayNextPopup();
  }
}

/**
 * Display the next popup from the queue
 */
function displayNextPopup() {
  if (popupQueue.length === 0) {
    isPopupShowing = false;
    return;
  }

  isPopupShowing = true;
  const config = popupQueue.shift();

  const container = document.getElementById("event-popup-container");
  const popup = document.getElementById("event-popup");
  const iconEl = popup.querySelector(".popup-icon");
  const titleEl = popup.querySelector(".popup-title");
  const descEl = popup.querySelector(".popup-description");
  const detailsEl = popup.querySelector(".popup-details");
  const dismissBtn = popup.querySelector(".popup-dismiss");

  // Set popup type class
  popup.className = `event-popup ${config.type}`;

  // Set content
  iconEl.textContent = config.icon || "";
  titleEl.textContent = config.title || "";
  descEl.textContent = config.description || "";

  // Handle details - can be string or array
  if (Array.isArray(config.details)) {
    detailsEl.innerHTML = `<ul class="popup-details-list">
      ${config.details.map(item => `<li><span class="detail-icon">${item.icon || "•"}</span> ${item.text}</li>`).join("")}
    </ul>`;
  } else if (config.details) {
    detailsEl.innerHTML = config.details;
  } else {
    detailsEl.innerHTML = "";
  }

  // Show container
  container.classList.remove("hidden");

  // Setup dismiss handler
  const handleDismiss = () => {
    hideEventPopup();
  };
  dismissBtn.addEventListener("click", handleDismiss, { once: true });

  // Also allow clicking overlay to dismiss
  const overlay = container.querySelector(".popup-overlay");
  const handleOverlayClick = () => {
    hideEventPopup();
  };
  overlay.addEventListener("click", handleOverlayClick, { once: true });

  activateDialog(container, popup, hideEventPopup);
}

/**
 * Hide the current popup and show next if queued
 */
function hideEventPopup() {
  const container = document.getElementById("event-popup-container");
  deactivateDialog(container);
  container.classList.add("hidden");

  // Small delay before showing next popup
  setTimeout(() => {
    displayNextPopup();
  }, 200);
}

// ═══════════════════════════════════════════════════════════════
// CARBON BALANCE POPUP
// ═══════════════════════════════════════════════════════════════

/**
 * Open the carbon balance detail popup
 */
function openCarbonBalancePopup() {
  const container = document.getElementById("carbon-balance-popup");
  if (!container) return;

  // Calculate fresh carbon balance
  const balance = calculateCarbonBalance();

  // Populate regions list (new regional view)
  populateCarbonRegionsList();

  // Populate emissions list (global summary)
  populateCarbonEmissionsList(balance);

  // Populate removals list
  populateCarbonRemovalsList(balance);

  // Populate net balance
  const netBalance = document.getElementById("carbon-net-balance");
  if (netBalance) {
    const isPositive = balance.netEmissions > 0;
    const sign = isPositive ? "+" : "";
    const colorClass = isPositive ? "net-positive" : "net-negative";
    netBalance.textContent = "";
    const span = document.createElement("span");
    span.className = colorClass;
    span.textContent = `${sign}${balance.netEmissions.toFixed(2)} Gt CO2/year`;
    netBalance.appendChild(span);
  }

  // Populate ppm change
  const ppmChange = document.getElementById("carbon-ppm-change");
  if (ppmChange) {
    const isPositive = balance.ppmChange > 0;
    const sign = isPositive ? "+" : "";
    ppmChange.textContent = `→ ${sign}${(balance.ppmChange * 12).toFixed(2)} ppm/year (${sign}${balance.ppmChange.toFixed(3)} ppm/month)`;
  }

  container.classList.remove("hidden");
  activateDialog(
    container,
    container.querySelector(".carbon-balance-dialog"),
    closeCarbonBalancePopup
  );
}

/**
 * Populate the carbon emissions list (global summary tab)
 */
function populateCarbonEmissionsList(balance) {
  const emissionsList = document.getElementById("carbon-emissions-list");
  if (!emissionsList || !balance.emissions) return;

  const emissionItems = [
    { icon: "⬛", label: "Coal Power", value: balance.emissions.powerCoal, colorClass: "coal" },
    { icon: "🔥", label: "Gas Power", value: balance.emissions.powerGas, colorClass: "gas" },
    { icon: "🏭", label: "Industry", value: balance.emissions.industry, colorClass: "" },
    { icon: "🚗", label: "Transport", value: balance.emissions.transport, colorClass: "" },
    { icon: "🏢", label: "Buildings", value: balance.emissions.buildings, colorClass: "" },
    { icon: "🌾", label: "Agriculture", value: balance.emissions.agriculture, colorClass: "" },
    { icon: "🔧", label: "Embodied Carbon", value: balance.emissions.embodied, colorClass: "" },
  ];

  emissionsList.textContent = "";
  emissionItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "carbon-item" + (item.colorClass ? " " + item.colorClass : "");

    const icon = document.createElement("span");
    icon.className = "carbon-icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "carbon-label";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "carbon-value emissions";
    value.textContent = `${item.value.toFixed(2)} Gt/yr`;

    div.append(icon, label, value);
    emissionsList.appendChild(div);
  });

  // Populate emissions total
  const emissionsTotal = document.getElementById("carbon-emissions-total");
  if (emissionsTotal) {
    emissionsTotal.textContent = "";
    const strong = document.createElement("strong");
    strong.textContent = `Total Emissions: ${balance.emissions.total.toFixed(2)} Gt CO2/year`;
    emissionsTotal.appendChild(strong);
  }
}

/**
 * Populate the carbon removals list
 */
function populateCarbonRemovalsList(balance) {
  const removalsList = document.getElementById("carbon-removals-list");
  if (!removalsList || !balance.removals) return;

  // Check saturation levels for natural sinks
  const oceanSatLevel = getOceanSaturationLevel();
  const oceanWarning = oceanSatLevel < 0.95 ? ` (${Math.round(oceanSatLevel * 100)}% capacity)` : '';

  const landSatLevel = getLandSaturationLevel();
  const landWarning = landSatLevel < 0.95 ? ` (${Math.round(landSatLevel * 100)}% capacity)` : '';

  const forestMod = getForestEffectivenessModifier();
  const forestWarning = forestMod < 1 ? ` (${Math.round(forestMod * 100)}% effective)` : '';

  const removalItems = [
    { icon: "🌊", label: "Ocean Absorption", value: balance.removals.naturalOcean, suffix: oceanWarning, warnColor: "#e67e22" },
    { icon: "🌲", label: "Natural Land", value: balance.removals.naturalLand, suffix: landWarning, warnColor: "#e67e22" },
    { icon: "🌳", label: "Your Forests", value: balance.removals.playerForests, suffix: forestWarning, warnColor: "#e74c3c" },
    { icon: "🏗️", label: "Your CCS/DAC", value: balance.removals.playerCCS, suffix: "", warnColor: null },
  ];

  removalsList.textContent = "";
  removalItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "carbon-item";

    const icon = document.createElement("span");
    icon.className = "carbon-icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "carbon-label";
    label.textContent = item.label;
    if (item.suffix && item.warnColor) {
      const warn = document.createElement("span");
      warn.style.cssText = `color: ${item.warnColor}; font-size: 0.85em; margin-left: 4px;`;
      warn.textContent = item.suffix;
      label.appendChild(warn);
    }

    const value = document.createElement("span");
    value.className = "carbon-value removals";
    value.textContent = `${item.value.toFixed(2)} Gt/yr`;

    div.append(icon, label, value);
    removalsList.appendChild(div);
  });

  // Populate removals total
  const removalsTotal = document.getElementById("carbon-removals-total");
  if (removalsTotal) {
    removalsTotal.textContent = "";
    const strong = document.createElement("strong");
    strong.textContent = `Total Removals: ${balance.removals.total.toFixed(2)} Gt CO2/year`;
    removalsTotal.appendChild(strong);
  }
}

/**
 * Populate the carbon regions list with per-region emissions
 */
function populateCarbonRegionsList() {
  const regionsList = document.getElementById("carbon-regions-list");
  if (!regionsList) return;

  const regionEmissions = getRegionEmissionsBreakdown();
  const globalTotal = regionEmissions.reduce((sum, r) => sum + r.total, 0);

  regionsList.textContent = "";

  regionEmissions.forEach(region => {
    // Get trends
    const monthTrend = getEmissionsTrend(region.regionId, 1);
    const yearTrend = getEmissionsTrend(region.regionId, 12);

    // Calculate percentage of global
    const pctOfGlobal = globalTotal > 0 ? (region.total / globalTotal * 100) : 0;

    // Create region item
    const item = document.createElement("div");
    item.className = "carbon-region-item";
    item.dataset.region = region.regionId;
    item.addEventListener("click", function() { this.classList.toggle("expanded"); });

    // Header
    const header = document.createElement("div");
    header.className = "carbon-region-header";

    const name = document.createElement("span");
    name.className = "carbon-region-name";
    name.textContent = region.regionName;

    const total = document.createElement("span");
    total.className = "carbon-region-total";
    total.textContent = `${region.total.toFixed(2)} Gt/yr`;

    const trends = document.createElement("div");
    trends.className = "carbon-region-trends";
    trends.appendChild(createTrendElement(monthTrend, "mo"));
    trends.appendChild(createTrendElement(yearTrend, "yr"));

    const expand = document.createElement("span");
    expand.className = "carbon-region-expand";
    expand.textContent = "▼";

    header.append(name, total, trends, expand);

    // Sectors breakdown
    const sectors = document.createElement("div");
    sectors.className = "carbon-region-sectors";

    const summary = document.createElement("div");
    summary.className = "carbon-sector-summary";
    summary.style.cssText = "margin-bottom: 8px; font-size: 0.8rem; color: var(--text-tertiary);";
    summary.textContent = `${pctOfGlobal.toFixed(1)}% of global emissions`;
    sectors.appendChild(summary);

    // Add sector items
    createSectorItems(region, sectors);

    item.append(header, sectors);
    regionsList.appendChild(item);
  });
}

/**
 * Create a trend indicator element
 */
function createTrendElement(trend, label) {
  const span = document.createElement("span");
  span.className = "carbon-trend";

  if (!trend) {
    span.classList.add("neutral");
    span.title = `No ${label} data`;
    span.textContent = "--";
  } else {
    const sign = trend.change >= 0 ? "+" : "";
    const trendClass = trend.change > 0.01 ? "up" : (trend.change < -0.01 ? "down" : "neutral");
    span.classList.add(trendClass);
    span.title = `${sign}${trend.change.toFixed(2)} Gt/yr (${sign}${trend.percentChange.toFixed(1)}%)`;
    span.textContent = `${sign}${trend.percentChange.toFixed(0)}%/${label}`;
  }

  return span;
}

/**
 * Create sector breakdown items for a region
 */
function createSectorItems(region, container) {
  const sectorData = [
    { icon: "⬛", label: "Coal Power", value: region.powerCoal },
    { icon: "🔥", label: "Gas Power", value: region.powerGas },
    { icon: "🏭", label: "Industry", value: region.industry },
    { icon: "🚗", label: "Transport", value: region.transport },
    { icon: "🏢", label: "Buildings", value: region.buildings },
    { icon: "🌾", label: "Agriculture", value: region.agriculture },
  ];

  const maxValue = Math.max(...sectorData.map(s => s.value), 0.01);

  sectorData.forEach(sector => {
    const item = document.createElement("div");
    item.className = "carbon-sector-item";

    const icon = document.createElement("span");
    icon.className = "carbon-sector-icon";
    icon.textContent = sector.icon;

    const label = document.createElement("span");
    label.className = "carbon-sector-label";
    label.textContent = sector.label;

    const value = document.createElement("span");
    value.className = "carbon-sector-value";
    value.textContent = `${sector.value.toFixed(2)} Gt`;

    const bar = document.createElement("div");
    bar.className = "carbon-sector-bar";
    const fill = document.createElement("div");
    fill.className = "carbon-sector-bar-fill";
    fill.style.width = `${(sector.value / maxValue * 100).toFixed(0)}%`;
    bar.appendChild(fill);

    item.append(icon, label, value, bar);
    container.appendChild(item);
  });
}

/**
 * Switch between carbon balance tabs
 */
function switchCarbonTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".carbon-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll(".carbon-tab-content").forEach(content => {
    content.classList.toggle("active", content.id === `carbon-tab-${tabName}`);
  });
}

/**
 * Close the carbon balance popup
 */
function closeCarbonBalancePopup() {
  const container = document.getElementById("carbon-balance-popup");
  if (container) {
    deactivateDialog(container);
    container.classList.add("hidden");
  }
}

// ═══════════════════════════════════════════════════════════════
// INCOME BREAKDOWN POPUP
// ═══════════════════════════════════════════════════════════════

/**
 * Open the income breakdown popup
 */
function showIncomeBreakdownPopup() {
  const container = document.getElementById("income-breakdown-popup");
  if (!container) return;

  const breakdown = calculateIncomeBreakdown();

  // Populate climate budget list
  const climateList = document.getElementById("income-climate-list");
  if (climateList) {
    climateList.textContent = "";
    const regions = Object.entries(breakdown.climateBudget.byRegion);
    if (regions.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "income-item income-empty";
      emptyDiv.textContent = "No allied regions contributing climate budget";
      climateList.appendChild(emptyDiv);
    } else {
      regions.forEach(([regionId, data]) => {
        const div = document.createElement("div");
        div.className = "income-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "income-item-name";
        nameSpan.textContent = data.name;

        const detailSpan = document.createElement("span");
        detailSpan.className = "income-item-detail";
        detailSpan.textContent = `$${data.gdp.toFixed(1)}T × ${data.dedication.toFixed(1)}%`;

        const valueSpan = document.createElement("span");
        valueSpan.className = "income-item-value";
        valueSpan.textContent = formatCurrency(data.amount);

        div.append(nameSpan, detailSpan, valueSpan);
        climateList.appendChild(div);
      });
    }
  }

  // Populate climate budget total
  const climateTotal = document.getElementById("income-climate-total");
  if (climateTotal) {
    climateTotal.textContent = `Subtotal: ${formatCurrency(breakdown.climateBudget.total)}`;
  }

  // Populate carbon tax list
  const taxList = document.getElementById("income-tax-list");
  if (taxList) {
    taxList.textContent = "";
    const regions = Object.entries(breakdown.carbonTax.byRegion);
    if (regions.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "income-item income-empty";
      emptyDiv.textContent = "No allied regions paying carbon tax";
      taxList.appendChild(emptyDiv);
    } else {
      regions.forEach(([regionId, data]) => {
        const div = document.createElement("div");
        div.className = "income-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "income-item-name";
        nameSpan.textContent = data.name;

        const detailSpan = document.createElement("span");
        detailSpan.className = "income-item-detail";
        detailSpan.textContent = `${(data.emissions * 12).toFixed(2)} Gt/yr × $${data.rate.toFixed(0)}/ton`;

        const valueSpan = document.createElement("span");
        valueSpan.className = "income-item-value";
        valueSpan.textContent = formatCurrency(data.amount);

        div.append(nameSpan, detailSpan, valueSpan);
        taxList.appendChild(div);
      });
    }
  }

  // Populate carbon tax total
  const taxTotal = document.getElementById("income-tax-total");
  if (taxTotal) {
    taxTotal.textContent = `Subtotal: ${formatCurrency(breakdown.carbonTax.total)}`;
  }

  // Populate project income list
  const projectList = document.getElementById("income-project-list");
  if (projectList) {
    projectList.textContent = "";
    const projects = Object.entries(breakdown.projects.byType);
    if (projects.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "income-item income-empty";
      emptyDiv.textContent = "No income-generating projects";
      projectList.appendChild(emptyDiv);
    } else {
      projects.forEach(([projectType, data]) => {
        const div = document.createElement("div");
        div.className = "income-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "income-item-name";
        nameSpan.textContent = data.name;

        const detailSpan = document.createElement("span");
        detailSpan.className = "income-item-detail";
        detailSpan.textContent = `×${data.count}`;

        const valueSpan = document.createElement("span");
        valueSpan.className = "income-item-value";
        valueSpan.textContent = formatCurrency(data.amount);

        div.append(nameSpan, detailSpan, valueSpan);
        projectList.appendChild(div);
      });
    }
  }

  // Populate project income total
  const projectTotal = document.getElementById("income-project-total");
  if (projectTotal) {
    projectTotal.textContent = `Subtotal: ${formatCurrency(breakdown.projects.total)}`;
  }

  // Populate totals
  const grossTotal = document.getElementById("income-gross-total");
  if (grossTotal) {
    grossTotal.textContent = formatCurrency(breakdown.grossTotal);
  }

  const costs = document.getElementById("income-costs");
  if (costs) {
    const operatingCosts = breakdown.costs.researchCenters + breakdown.costs.projectUpkeep;
    costs.textContent = `-${formatCurrency(operatingCosts)}`;
  }

  const netTotal = document.getElementById("income-net-total");
  if (netTotal) {
    netTotal.textContent = formatCurrency(breakdown.netTotal);
  }

  // Event multiplier note
  const multiplierNote = document.getElementById("income-multiplier-note");
  if (multiplierNote) {
    if (breakdown.eventMultiplier !== 1) {
      multiplierNote.textContent = `Event modifier: ×${breakdown.eventMultiplier.toFixed(2)}`;
      multiplierNote.classList.remove("hidden");
    } else {
      multiplierNote.classList.add("hidden");
    }
  }

  container.classList.remove("hidden");
  activateDialog(
    container,
    container.querySelector(".income-breakdown-dialog"),
    closeIncomeBreakdownPopup
  );
}

/**
 * Close the income breakdown popup
 */
function closeIncomeBreakdownPopup() {
  const container = document.getElementById("income-breakdown-popup");
  if (container) {
    deactivateDialog(container);
    container.classList.add("hidden");
  }
}

// ═══════════════════════════════════════════════════════════════
// STAT DETAIL POPUP
// ═══════════════════════════════════════════════════════════════

/**
 * Open stat detail popup for a given stat type
 */
function openStatDetail(statType) {
  const container = document.getElementById("stat-detail-popup");
  const titleEl = document.getElementById("stat-detail-title");
  const iconEl = document.getElementById("stat-detail-icon");
  const bodyEl = document.getElementById("stat-detail-body");

  if (!container || !bodyEl) return;

  const statConfig = {
    alliance: {
      icon: "🤝",
      title: "Climate Alliance",
      getContent: getAllianceDetailContent
    },
    research: {
      icon: "🔬",
      title: "Research Points",
      getContent: getResearchDetailContent
    },
    projects: {
      icon: "🏗️",
      title: "Built Projects",
      getContent: getProjectsDetailContent
    },
    building: {
      icon: "🚧",
      title: "Under Construction",
      getContent: getBuildingDetailContent
    },
    capture: {
      icon: "🌿",
      title: "Carbon Capture",
      getContent: getCaptureDetailContent
    },
    tech: {
      icon: "⚡",
      title: "Technologies",
      getContent: getTechDetailContent
    },
    disasters: {
      icon: "🌪️",
      title: "Climate Disasters",
      getContent: getDisasterDetailContent
    }
  };

  const config = statConfig[statType];
  if (!config) return;

  titleEl.textContent = config.title;
  iconEl.textContent = config.icon;
  bodyEl.innerHTML = config.getContent();

  container.classList.remove("hidden");
  activateDialog(
    container,
    container.querySelector(".stat-detail-dialog"),
    closeStatDetailPopup
  );
}

/**
 * Close the stat detail popup
 */
function closeStatDetailPopup() {
  const container = document.getElementById("stat-detail-popup");
  if (container) {
    deactivateDialog(container);
    container.classList.add("hidden");
  }
}

/**
 * Get alliance detail content
 */
function getAllianceDetailContent() {
  const alliedRegions = [];
  const pendingRegions = [];
  const unalliedRegions = [];

  Object.entries(state.alliance || {}).forEach(([regionId, alliance]) => {
    const regionName = getRegionName(regionId);
    if (alliance.status === ALLIANCE_STATUS.ALLIED) {
      alliedRegions.push({ id: regionId, name: regionName, happiness: alliance.happiness || 50 });
    } else if (state.activeCampaigns?.some(c => c.regionId === regionId)) {
      pendingRegions.push({ id: regionId, name: regionName, progress: alliance.campaignProgress || 0 });
    } else {
      unalliedRegions.push({ id: regionId, name: regionName });
    }
  });

  let html = '<div class="stat-detail-section">';

  // Allied regions
  html += '<h4>🤝 Allied Regions</h4>';
  if (alliedRegions.length > 0) {
    html += '<div class="stat-detail-list">';
    alliedRegions.forEach(r => {
      const happinessClass = r.happiness >= 70 ? 'good' : r.happiness >= 40 ? 'warning' : 'danger';
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${r.name}</span>
          <span class="item-value ${happinessClass}">${r.happiness}% happy</span>
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p class="stat-detail-empty">No allied regions yet</p>';
  }

  // Pending campaigns
  if (pendingRegions.length > 0) {
    html += '<h4>📣 Active Campaigns</h4>';
    html += '<div class="stat-detail-list">';
    pendingRegions.forEach(r => {
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${r.name}</span>
          <span class="item-value">${Math.round(r.progress)}% progress</span>
        </div>`;
    });
    html += '</div>';
  }

  // Unallied
  if (unalliedRegions.length > 0) {
    html += '<h4>🌍 Other Regions</h4>';
    html += '<p class="stat-detail-hint">' + unalliedRegions.map(r => r.name).join(', ') + '</p>';
  }

  html += '</div>';
  return html;
}

/**
 * Get research detail content
 */
function getResearchDetailContent() {
  const regionalCenters = countResearchCenters();
  const globalCenters = state.globalResearchCenters || [];
  const regionalRP = regionalCenters * RESEARCH_POINTS_PER_CENTER;
  const globalRP = getResearchCenterRPPerMonth();
  const totalRPPerMonth = regionalRP + globalRP;

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value">${state.researchPoints}</span>
      <span class="summary-label">Available RP</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">+${totalRPPerMonth}</span>
      <span class="summary-label">per month</span>
    </div>
  </div>`;

  // Research center breakdown
  html += '<h4>Research Centers</h4>';
  html += '<div class="stat-detail-list">';
  html += `
    <div class="stat-detail-item">
      <span class="item-name">Regional Centers</span>
      <span class="item-value">${regionalCenters} (+${regionalRP} RP/mo)</span>
    </div>`;

  if (globalCenters.length > 0) {
    globalCenters.forEach(center => {
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${center.name}</span>
          <span class="item-value">+${center.rpPerMonth} RP/mo</span>
        </div>`;
    });
  }
  html += '</div>';

  // Unlocked technologies count
  const unlockedCount = state.unlockedTechs?.length || 0;
  const totalTechs = TECHNOLOGIES.length;
  html += `<p class="stat-detail-hint">Technologies unlocked: ${unlockedCount}/${totalTechs}</p>`;

  html += '</div>';
  return html;
}

/**
 * Get projects detail content
 */
function getProjectsDetailContent() {
  const projectsByType = {};
  let totalProjects = 0;

  availableRegionIds.forEach(regionId => {
    const region = state.regions[regionId];
    if (!region?.projects) return;
    region.projects.forEach(proj => {
      if (!projectsByType[proj.type]) {
        projectsByType[proj.type] = { count: 0, co2Reduction: 0 };
      }
      projectsByType[proj.type].count++;
      projectsByType[proj.type].co2Reduction += proj.co2Reduction || 0;
      totalProjects++;
    });
  });

  const projectNames = {
    solarFarm: "☀️ Solar Farms",
    windFarm: "🌬️ Wind Farms",
    nuclearPlant: "⚛️ Nuclear Plants",
    hydroPlant: "💧 Hydro Plants",
    geothermal: "🌋 Geothermal",
    forestry: "🌲 Forestry",
    carbonCapture: "🏭 Carbon Capture",
    directAirCapture: "🌿 Direct Air Capture",
    researchCenter: "🔬 Research Centers",
    gridUpgrade: "⚡ Grid Upgrades",
    energyStorage: "🔋 Energy Storage"
  };

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value">${totalProjects}</span>
      <span class="summary-label">Total Projects</span>
    </div>
  </div>`;

  if (totalProjects > 0) {
    html += '<h4>Projects by Type</h4>';
    html += '<div class="stat-detail-list">';
    Object.entries(projectsByType).forEach(([type, data]) => {
      const name = projectNames[type] || type;
      const reduction = data.co2Reduction > 0 ? `-${data.co2Reduction.toFixed(1)} ppm/mo` : '';
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${name}</span>
          <span class="item-value">${data.count} ${reduction}</span>
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p class="stat-detail-empty">No projects built yet</p>';
  }

  html += '</div>';
  return html;
}

/**
 * Get building detail content
 */
function getBuildingDetailContent() {
  const underConstruction = [];

  availableRegionIds.forEach(regionId => {
    const region = state.regions[regionId];
    if (!region?.constructionQueue) return;
    region.constructionQueue.forEach(item => {
      underConstruction.push({
        type: item.type,
        region: getRegionName(regionId),
        monthsLeft: item.monthsLeft
      });
    });
  });

  const projectNames = {
    solarFarm: "☀️ Solar Farm",
    windFarm: "🌬️ Wind Farm",
    nuclearPlant: "⚛️ Nuclear Plant",
    hydroPlant: "💧 Hydro Plant",
    geothermal: "🌋 Geothermal",
    forestry: "🌲 Forestry",
    carbonCapture: "🏭 Carbon Capture",
    directAirCapture: "🌿 Direct Air Capture",
    researchCenter: "🔬 Research Center",
    gridUpgrade: "⚡ Grid Upgrade",
    energyStorage: "🔋 Energy Storage"
  };

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value">${underConstruction.length}</span>
      <span class="summary-label">In Progress</span>
    </div>
  </div>`;

  if (underConstruction.length > 0) {
    html += '<h4>Construction Queue</h4>';
    html += '<div class="stat-detail-list">';
    underConstruction.forEach(item => {
      const name = projectNames[item.type] || item.type;
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${name}</span>
          <span class="item-value">${item.region} (${item.monthsLeft}mo)</span>
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p class="stat-detail-empty">Nothing under construction</p>';
  }

  html += '</div>';
  return html;
}

/**
 * Get carbon capture detail content
 */
function getCaptureDetailContent() {
  const captureProjects = [];
  let totalCapture = 0;

  availableRegionIds.forEach(regionId => {
    const region = state.regions[regionId];
    if (!region?.projects) return;
    region.projects.forEach(proj => {
      if (proj.type === 'carbonCapture' || proj.type === 'directAirCapture') {
        captureProjects.push({
          type: proj.type,
          region: getRegionName(regionId),
          capture: proj.co2Reduction || 0
        });
        totalCapture += proj.co2Reduction || 0;
      }
    });
  });

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value good">${totalCapture > 0 ? '-' + totalCapture.toFixed(1) : '0'}</span>
      <span class="summary-label">ppm/month</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${captureProjects.length}</span>
      <span class="summary-label">Facilities</span>
    </div>
  </div>`;

  if (captureProjects.length > 0) {
    html += '<h4>Capture Facilities</h4>';
    html += '<div class="stat-detail-list">';
    captureProjects.forEach(proj => {
      const name = proj.type === 'directAirCapture' ? '🌿 DAC' : '🏭 CCS';
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${name} - ${proj.region}</span>
          <span class="item-value good">-${proj.capture.toFixed(2)} ppm/mo</span>
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p class="stat-detail-empty">No carbon capture facilities built</p>';
    html += '<p class="stat-detail-hint">Build Carbon Capture (CCS) or Direct Air Capture (DAC) projects to remove CO2 from the atmosphere.</p>';
  }

  html += '</div>';
  return html;
}

/**
 * Get tech detail content
 */
function getTechDetailContent() {
  const unlockedTechs = state.unlockedTechs || [];
  const lockedTechs = TECHNOLOGIES.filter(t => !unlockedTechs.includes(t.id));

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value">${unlockedTechs.length}</span>
      <span class="summary-label">Unlocked</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${lockedTechs.length}</span>
      <span class="summary-label">Remaining</span>
    </div>
  </div>`;

  if (unlockedTechs.length > 0) {
    html += '<h4>✅ Unlocked Technologies</h4>';
    html += '<div class="stat-detail-list">';
    unlockedTechs.forEach(techId => {
      const tech = TECHNOLOGIES.find(t => t.id === techId);
      if (tech) {
        html += `
          <div class="stat-detail-item">
            <span class="item-name">${tech.name}</span>
            <span class="item-value good">Active</span>
          </div>`;
      }
    });
    html += '</div>';
  }

  if (lockedTechs.length > 0) {
    html += '<h4>🔒 Available to Research</h4>';
    html += '<div class="stat-detail-list">';
    lockedTechs.slice(0, 5).forEach(tech => {
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${tech.name}</span>
          <span class="item-value">${tech.cost} RP</span>
        </div>`;
    });
    if (lockedTechs.length > 5) {
      html += `<p class="stat-detail-hint">...and ${lockedTechs.length - 5} more</p>`;
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Get disaster detail content
 */
function getDisasterDetailContent() {
  const activeDisasters = state.activeDisasters || [];

  let html = '<div class="stat-detail-section">';

  html += `<div class="stat-detail-summary">
    <div class="summary-item">
      <span class="summary-value ${activeDisasters.length > 0 ? 'danger' : ''}">${activeDisasters.length}</span>
      <span class="summary-label">Active</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${state.totalDisastersOccurred || 0}</span>
      <span class="summary-label">Total This Game</span>
    </div>
  </div>`;

  // Risk info
  const tempRiskLevel = state.temperature < 1.5 ? 'Low' : state.temperature < 2.0 ? 'Moderate' : state.temperature < 2.5 ? 'High' : 'Extreme';
  const tempRiskClass = state.temperature < 1.5 ? 'good' : state.temperature < 2.0 ? 'warning' : 'danger';
  html += `<p class="stat-detail-hint">Current risk level: <span class="${tempRiskClass}">${tempRiskLevel}</span> (based on temperature)</p>`;

  if (activeDisasters.length > 0) {
    html += '<h4>🌪️ Active Disasters</h4>';
    html += '<div class="stat-detail-list">';
    activeDisasters.forEach(disaster => {
      const regionName = getRegionName(disaster.regionId);
      html += `
        <div class="stat-detail-item">
          <span class="item-name">${disaster.type} - ${regionName}</span>
          <span class="item-value danger">${disaster.monthsRemaining || '?'}mo left</span>
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p class="stat-detail-empty">No active disasters</p>';
  }

  html += '</div>';
  return html;
}

/**
 * Queue multiple events of the same type as a combined popup
 * @param {string} type - Event type
 * @param {string} title - Title for combined popup
 * @param {string} icon - Icon for popup
 * @param {Array} events - Array of event objects with name, description, details
 */
function showCombinedEventPopup(type, title, icon, events) {
  if (events.length === 0) return;

  if (events.length === 1) {
    // Single event - show normal popup
    const evt = events[0];
    showEventPopup({
      type: type,
      title: evt.title || title,
      icon: evt.icon || icon,
      description: evt.description,
      details: evt.details,
    });
  } else {
    // Multiple events - combine into one popup
    const details = events.map(evt => ({
      icon: evt.icon || "•",
      text: evt.summary || evt.description,
    }));

    showEventPopup({
      type: type,
      title: `${events.length} ${title}`,
      icon: icon,
      description: events[0].combinedDescription || `Multiple events occurred this month.`,
      details: details,
    });
  }
}

// Difficulty modes configuration
const DIFFICULTY_MODES = {
  tutorial: {
    name: "Tutorial",
    description: "Learn the basics with a forgiving climate",
    co2Multiplier: 0.6,         // 0.24 ppm/month (base 0.4 × 0.6)
    startingFunds: 50,          // $50B starting (reduced for balance)
    costMultiplier: 0.7,        // -30% project costs
    eventsEnabled: false,
  },
  easy: {
    name: "Easy",
    description: "A gentler introduction to climate management",
    co2Multiplier: 0.8,         // 0.32 ppm/month
    startingFunds: 40,          // $40B starting (reduced for balance)
    costMultiplier: 0.85,       // -15% project costs
    eventsEnabled: true,
    eventSeverity: 0.5,         // Mild events
  },
  normal: {
    name: "Normal",
    description: "The real climate challenge",
    co2Multiplier: 1.0,         // 0.4 ppm/month
    startingFunds: 25,          // $25B starting (reduced for balance)
    costMultiplier: 1.0,        // Normal costs
    eventsEnabled: true,
    eventSeverity: 1.0,         // Normal events
  },
  hard: {
    name: "Hard",
    description: "Political resistance and harsh economics",
    co2Multiplier: 1.2,         // 0.48 ppm/month
    startingFunds: 20,          // $20B starting (reduced for balance)
    costMultiplier: 1.15,       // +15% project costs
    eventsEnabled: true,
    eventSeverity: 1.5,         // Harsh events
  },
  extreme: {
    name: "Extreme",
    description: "Can you save the planet against all odds?",
    co2Multiplier: 1.4,         // 0.56 ppm/month
    startingFunds: 15,          // $15B starting (reduced for balance)
    costMultiplier: 1.3,        // +30% project costs
    eventsEnabled: true,
    eventSeverity: 2.0,         // Extreme events
  },
};

// ═══════════════════════════════════════════════════════════════
// TUTORIAL SYSTEM
// Interactive tutorial with popups and UI highlights
// ═══════════════════════════════════════════════════════════════

const TUTORIAL_STEPS = [
  // 1. Welcome
  {
    id: "welcome",
    type: "popup",
    title: "Welcome to Climate Overseer",
    icon: "🌍",
    content: "You are the leader of a global climate alliance. Your mission is to unite the world and prevent catastrophic climate change.",
    bullets: [
      "Reduce atmospheric CO₂ to 416 ppm (pre-industrial +1.0°C)",
      "Recruit all {REGION_COUNT} regions into your alliance",
      "Avoid reaching 511 ppm (+2.0°C catastrophic warming)"
    ],
  },
  // 2-4. Header elements
  {
    id: "header-budget",
    type: "highlight",
    target: "#credits",
    title: "Your Budget",
    icon: "💰",
    content: "This shows your current funds and monthly income. You earn money from allied regions through climate dedication and carbon taxes.",
    position: "below",
  },
  {
    id: "header-climate",
    type: "highlight",
    target: ".temp-gauge-mini",
    title: "Climate Status",
    icon: "🌡️",
    content: "The temperature gauge shows current warming. The CO₂ bar shows atmospheric carbon dioxide. Click either for detailed breakdowns.",
    position: "below",
  },
  {
    id: "header-stats",
    type: "highlight",
    target: ".header-stats-row",
    title: "Key Statistics",
    icon: "📊",
    content: "These badges show your progress: allied regions, research points, built projects, ongoing construction, CCS capacity, unlocked tech, and climate risk.",
    position: "below",
  },
  // 5. Map intro - NOW HIGHLIGHTS MAP
  {
    id: "map-intro",
    type: "highlight",
    target: "#map-container",
    title: "World Map",
    icon: "🗺️",
    content: "Allied regions are green. Click any region to select it and view details in the sidebar.",
    position: "left",
    popupSize: "small",
  },
  // 6. Sidebar tabs
  {
    id: "sidebar-tabs",
    type: "highlight",
    target: "#sidebar-tabs",
    title: "Information Panels",
    icon: "📋",
    content: "Switch between World (global overview), Region (selected region details), and Tech (research and technology) tabs.",
    position: "below",
  },
  // 7-10. World Tab Deep Dive
  {
    id: "world-global-overview",
    type: "highlight",
    target: "#global-stats-card",
    title: "Global Overview",
    icon: "🌐",
    content: "This card shows key global stats: temperature anomaly, CO₂ levels, net emissions, your budget and income, active projects, and time remaining.",
    position: "left",
    requiredTab: "world",
  },
  {
    id: "world-alliance",
    type: "highlight",
    target: "#alliance-overview",
    title: "Alliance Status",
    icon: "🤝",
    content: "See your allied regions at a glance. The happiness bars show how satisfied each ally is. Keep them happy or they may break the alliance!",
    position: "left",
    requiredTab: "world",
  },
  {
    id: "world-tipping-points",
    type: "highlight",
    target: "#tipping-points-panel",
    title: "Climate Tipping Points",
    icon: "⚠️",
    content: "These are irreversible climate thresholds. Each has a trigger temperature. Once crossed, they create feedback loops that accelerate warming.",
    bullets: [
      "Arctic Ice: Melting reflects less sunlight",
      "Permafrost: Releases trapped methane",
      "Amazon: Rainforest dieback releases carbon",
      "Ocean Circulation: Disrupts global heat distribution"
    ],
    position: "left",
    requiredTab: "world",
  },
  {
    id: "world-disasters",
    type: "highlight",
    target: "#active-disasters-panel",
    title: "Active Disasters",
    icon: "🌪️",
    content: "Climate disasters strike regions as warming increases. They reduce regional income and happiness. Higher temperatures mean more frequent and severe disasters.",
    position: "left",
    requiredTab: "world",
  },
  // 11. Region tab
  {
    id: "region-tab",
    type: "highlight",
    target: "[data-tab='region']",
    title: "Region Tab",
    icon: "🏗️",
    content: "Select a region on the map, then use this tab to build projects: Solar Farms, Wind Turbines, Nuclear Plants, and Carbon Capture facilities.",
    position: "below",
  },
  // 12-17. Region Tab Deep Dive
  {
    id: "region-selection",
    type: "highlight",
    target: "#selected-region",
    title: "Selected Region",
    icon: "📍",
    content: "Shows the currently selected region and its alliance status. Click 'Negotiate' to begin diplomatic talks with neutral or hostile regions.",
    position: "left",
    requiredTab: "region",
  },
  {
    id: "region-income",
    type: "highlight",
    target: "#region-income",
    title: "Regional Income",
    icon: "💰",
    content: "Each allied region contributes monthly income based on their GDP and climate dedication percentage. Higher dedication = more funding for your projects.",
    position: "left",
    requiredTab: "region",
  },
  {
    id: "region-power",
    type: "highlight",
    target: "#power-panel",
    title: "Power Grid",
    icon: "⚡",
    content: "Monitor the region's electricity grid. Demand vs Supply affects stability. Build renewables to shift the energy mix away from fossil fuels.",
    position: "left",
    requiredTab: "region",
  },
  {
    id: "region-emissions",
    type: "highlight",
    target: "#emissions-breakdown",
    title: "Emissions Breakdown",
    icon: "💨",
    content: "See where the region's CO₂ emissions come from by sector. Your projects target specific sectors to reduce these emissions.",
    position: "left",
    requiredTab: "region",
  },
  {
    id: "region-effectiveness",
    type: "highlight",
    target: "#effectiveness-panel",
    title: "Project Effectiveness",
    icon: "⭐",
    content: "Star ratings show how effective each project type is in this region. Build where projects work best for maximum impact!",
    bullets: [
      "⭐⭐⭐⭐⭐ = Ideal conditions",
      "⭐⭐⭐ = Average effectiveness",
      "⭐ = Poor conditions, build elsewhere"
    ],
    position: "left",
    requiredTab: "region",
  },
  {
    id: "region-projects-btn",
    type: "highlight",
    target: "#project-buttons",
    title: "Build Projects",
    icon: "🏗️",
    content: "Click these buttons to build new projects. Each has different costs, build times, and CO₂ reduction effects.",
    position: "left",
    requiredTab: "region",
  },
  // 18. Next Month - MOVED EARLIER
  {
    id: "next-month",
    type: "highlight",
    target: "#next-month",
    title: "Advance Time",
    icon: "⏭️",
    content: "Click this button to advance one month. Projects progress, income is collected, and climate evolves.",
    position: "above",
  },
  // 19. Construction panel (skipIfEmpty)
  {
    id: "region-construction",
    type: "highlight",
    target: "#construction-panel",
    title: "Under Construction",
    icon: "🚧",
    content: "Projects being built appear here with progress bars. Each month, construction advances until completion.",
    position: "left",
    requiredTab: "region",
    skipIfEmpty: true,
  },
  // 20. Tech tab
  {
    id: "tech-tab",
    type: "highlight",
    target: "[data-tab='tech']",
    title: "Technology Tab",
    icon: "🔬",
    content: "Research technologies to improve your projects and unlock new capabilities.",
    position: "below",
  },
  // 21. General tech tree
  {
    id: "tech-tree-general",
    type: "highlight",
    target: ".tech-tree-graph[data-section='energy-&-nature']",
    title: "Energy Technologies",
    icon: "⚡",
    content: "Research energy technologies to improve solar, wind, and nuclear projects. Start with fundamentals, then unlock advanced options.",
    position: "left",
    requiredTab: "tech",
  },
  // 22. CCS tech tree
  {
    id: "tech-tree-ccs",
    type: "highlight",
    target: ".tech-tree-graph[data-section='ccs-technologies']",
    title: "CCS Technologies",
    icon: "🏭",
    content: "Carbon Capture and Storage technologies let you remove CO₂ from the atmosphere. Essential for achieving negative emissions.",
    position: "left",
    requiredTab: "tech",
  },
  // 23. Victory conditions
  {
    id: "victory",
    type: "popup",
    title: "How to Win",
    icon: "🏆",
    content: "Victory requires reducing CO₂ to 416 ppm (keeping warming at or below +1.0°C) by 2050. Defeat occurs if warming reaches +2.0°C or you run out of time by 2100.",
    bullets: [
      "Build renewable energy and CCS aggressively",
      "Keep allies happy by meeting their goals",
      "Research better technologies",
      "Balance your budget carefully"
    ],
  },
  // 30. Complete
  {
    id: "complete",
    type: "popup",
    title: "Tutorial Complete!",
    icon: "✅",
    content: "You now know the basics of Climate Overseer. Good luck saving the planet!",
    bullets: [
      "Start by building Solar Farms in your home region",
      "Negotiate alliances with neighboring regions",
      "Research better technologies",
      "Monitor the climate closely"
    ],
    isFinal: true,
  },
];

// Tutorial state (initialized when tutorial starts)
let tutorialState = {
  active: false,
  currentStep: 0,
  completed: false,
};

// Start the tutorial
function startTutorial() {
  // Prevent starting if already active
  if (tutorialState.active) return;

  tutorialState = {
    active: true,
    currentStep: 0,
    completed: false,
  };
  // Add keyboard listener for navigation
  document.addEventListener("keydown", handleTutorialKeydown);
  showTutorialStep(0);
}

// Show a specific tutorial step
function showTutorialStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= TUTORIAL_STEPS.length) {
    return;
  }

  tutorialState.currentStep = stepIndex;
  const step = TUTORIAL_STEPS[stepIndex];

  // Clear any existing tutorial UI
  clearTutorialUI();

  // Prepare the view based on step requirements
  let delay = 0;

  // Auto-switch tab if step requires it
  if (step.requiredTab) {
    // For region tab, ensure a region is selected first (use home region)
    // Unless skipHomeRegionSelect is set (for alliance negotiation flow)
    if (step.requiredTab === "region" && state?.homeRegion && !step.skipHomeRegionSelect) {
      // Always select home region for tutorial to ensure content is visible
      selectRegion(state.homeRegion);
      delay = 250;
    } else {
      switchToTab(step.requiredTab);
      delay = 150;
    }
  }

  // Show the step after any necessary delays
  if (delay > 0) {
    setTimeout(() => {
      showTutorialStepContent(step, stepIndex);
    }, delay);
  } else {
    showTutorialStepContent(step, stepIndex);
  }
}

// Helper to show the actual tutorial step content
function showTutorialStepContent(step, stepIndex) {
  if (step.type === "popup") {
    showTutorialPopup(step, stepIndex);
  } else if (step.type === "highlight") {
    showTutorialHighlight(step, stepIndex);
  }
}

// Show a tutorial popup (no highlight)
function showTutorialPopup(step, stepIndex) {
  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay";
  overlay.id = "tutorial-overlay";

  const popup = document.createElement("div");
  popup.className = "tutorial-popup centered";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "tutorial-popup-title");
  popup.setAttribute("tabindex", "-1");

  // Build popup header
  const header = document.createElement("div");
  header.className = "tutorial-popup-header";

  const headerTitle = document.createElement("div");
  headerTitle.className = "tutorial-popup-header-title";

  const iconSpan = document.createElement("span");
  iconSpan.className = "tutorial-popup-header-icon";
  iconSpan.textContent = step.icon;

  const labelSpan = document.createElement("span");
  labelSpan.className = "tutorial-popup-header-label";
  labelSpan.textContent = "TUTORIAL";

  headerTitle.appendChild(iconSpan);
  headerTitle.appendChild(labelSpan);

  const skipBtn = document.createElement("button");
  skipBtn.className = "tutorial-popup-close";
  skipBtn.textContent = "✕";
  skipBtn.setAttribute("aria-label", "Skip tutorial");
  skipBtn.onclick = skipTutorial;

  header.appendChild(headerTitle);
  header.appendChild(skipBtn);

  // Build popup content
  const content = document.createElement("div");
  content.className = "tutorial-popup-content";

  // Large icon for centered popup
  const iconLarge = document.createElement("div");
  iconLarge.className = "tutorial-popup-icon-large";
  iconLarge.textContent = step.icon;
  content.appendChild(iconLarge);

  const title = document.createElement("h3");
  title.className = "tutorial-popup-title";
  title.id = "tutorial-popup-title";
  title.textContent = step.title;

  const text = document.createElement("p");
  text.className = "tutorial-popup-text";
  text.textContent = step.content;

  content.appendChild(title);
  content.appendChild(text);

  if (step.bullets) {
    const ul = document.createElement("ul");
    ul.className = "tutorial-popup-bullets";
    step.bullets.forEach(b => {
      const li = document.createElement("li");
      // Replace placeholders with dynamic values
      li.textContent = b.replace("{REGION_COUNT}", availableRegionIds.length);
      ul.appendChild(li);
    });
    content.appendChild(ul);
  }

  // Build popup footer
  const footer = document.createElement("div");
  footer.className = "tutorial-popup-footer";

  const nav = document.createElement("div");
  nav.className = "tutorial-popup-nav";

  if (stepIndex > 0) {
    const backBtn = document.createElement("button");
    backBtn.className = "tutorial-btn tutorial-btn-back";
    backBtn.textContent = "← Back";
    backBtn.onclick = prevTutorialStep;
    nav.appendChild(backBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "tutorial-btn tutorial-btn-next";
  nextBtn.textContent = step.isFinal ? "Start Playing →" : "Continue →";
  nextBtn.onclick = step.isFinal ? completeTutorial : nextTutorialStep;
  nav.appendChild(nextBtn);

  footer.appendChild(nav);

  // Build progress indicator
  const progress = document.createElement("div");
  progress.className = "tutorial-popup-progress";
  progress.textContent = `${stepIndex + 1} / ${TUTORIAL_STEPS.length}`;
  footer.appendChild(progress);

  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(footer);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Show a tutorial highlight with spotlight
function showTutorialHighlight(step, stepIndex) {
  const targetEl = document.querySelector(step.target);

  // Handle waitForElement - set up observer to wait for element to appear
  if (!targetEl && step.waitForElement) {
    // Element not found, set up observer to wait for it
    const observer = new MutationObserver((mutations, obs) => {
      const el = document.querySelector(step.target);
      if (el) {
        obs.disconnect();
        window._tutorialMutationObserver = null;
        // Remove waiting overlay
        const waitingOverlay = document.getElementById("tutorial-waiting-overlay");
        if (waitingOverlay) {
          waitingOverlay.remove();
        }
        // Small delay to let element render fully
        setTimeout(() => showTutorialHighlight(step, stepIndex), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store reference for cleanup
    window._tutorialMutationObserver = observer;

    // Show waiting message overlay
    showTutorialWaitingOverlay(step);
    return;
  }

  if (!targetEl) {
    console.warn("Tutorial target not found:", step.target);
    nextTutorialStep();
    return;
  }

  // Handle skipIfEmpty for construction panel
  if (step.skipIfEmpty) {
    const panel = targetEl;
    const hasContent = panel && panel.style.display !== "none" &&
                       panel.children.length > 0 &&
                       panel.querySelector(".construction-item, .project-progress");
    if (!hasContent) {
      // Skip this step if panel is empty
      nextTutorialStep();
      return;
    }
  }

  // Smart scroll that accounts for popup position
  // Popup is ~250px tall, so we need to leave room for it
  const popupHeight = 280;
  const popupWidth = 380;
  const margin = 30;
  const position = step.position || "below";

  // First, scroll any parent scrollable containers
  scrollParentContainers(targetEl, position);

  // Then scroll the main viewport with offset based on popup position
  const rect = targetEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let scrollOptions = { behavior: "smooth" };

  if (position === "below") {
    // Element should be in upper portion of screen to leave room for popup below
    // Scroll so element is about 15% down from top
    const targetY = rect.top + window.scrollY - (viewportHeight * 0.15);
    window.scrollTo({ top: Math.max(0, targetY), ...scrollOptions });
  } else if (position === "above") {
    // Element should be in lower portion of screen to leave room for popup above
    // Scroll so element is about 70% down from top
    const targetY = rect.top + window.scrollY - (viewportHeight * 0.7);
    window.scrollTo({ top: Math.max(0, targetY), ...scrollOptions });
  } else if (position === "right") {
    // For right position, scroll element to left side and center vertically
    const targetY = rect.top + window.scrollY - (viewportHeight * 0.4);
    window.scrollTo({ top: Math.max(0, targetY), ...scrollOptions });
  } else if (position === "left") {
    // For left position, center vertically
    const targetY = rect.top + window.scrollY - (viewportHeight * 0.4);
    window.scrollTo({ top: Math.max(0, targetY), ...scrollOptions });
  } else {
    // Default: center vertically
    targetEl.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }

  // Wait for scroll to complete before positioning spotlight
  setTimeout(() => {
    showTutorialHighlightAfterScroll(step, stepIndex, targetEl);
  }, 500);
}

// Scroll parent scrollable containers to make element visible
function scrollParentContainers(element, position = "below") {
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const isScrollable = (
      style.overflow === 'auto' ||
      style.overflow === 'scroll' ||
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll'
    );

    if (isScrollable && parent.scrollHeight > parent.clientHeight) {
      // This parent is scrollable, scroll the element into view within it
      const parentRect = parent.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate where element is relative to parent's visible area
      const elementTopInParent = elementRect.top - parentRect.top + parent.scrollTop;

      // Position element with room for popup
      let targetScroll;
      if (position === "below") {
        // Put element near top (20% down) to leave room for popup below
        targetScroll = elementTopInParent - (parent.clientHeight * 0.2);
      } else if (position === "above") {
        // Put element near bottom (70% down) to leave room for popup above
        targetScroll = elementTopInParent - (parent.clientHeight * 0.7);
      } else {
        // Center the element
        targetScroll = elementTopInParent - (parent.clientHeight / 2) + (elementRect.height / 2);
      }

      parent.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth"
      });
    }
    parent = parent.parentElement;
  }
}

// Show waiting overlay while waiting for element to appear
function showTutorialWaitingOverlay(step) {
  // Remove any existing waiting overlay
  const existingOverlay = document.getElementById("tutorial-waiting-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "tutorial-waiting-overlay";
  overlay.className = "tutorial-overlay";

  const message = document.createElement("div");
  message.className = "tutorial-waiting-message";

  const icon = document.createElement("span");
  icon.className = "tutorial-waiting-icon";
  icon.textContent = step.icon || "👆";

  const text = document.createElement("span");
  text.className = "tutorial-waiting-text";
  text.textContent = step.waitingMessage || "Complete the action to continue...";

  const skipBtn = document.createElement("button");
  skipBtn.className = "tutorial-btn tutorial-btn-skip";
  skipBtn.textContent = "Skip Tutorial";
  skipBtn.onclick = skipTutorial;

  message.appendChild(icon);
  message.appendChild(text);
  message.appendChild(skipBtn);
  overlay.appendChild(message);
  document.body.appendChild(overlay);
}

// Continue showing highlight after scroll completes
function showTutorialHighlightAfterScroll(step, stepIndex, targetEl) {
  // Create overlay with cutout
  const overlay = document.createElement("div");
  overlay.className = "tutorial-overlay tutorial-highlight-mode";
  overlay.id = "tutorial-overlay";

  // Create spotlight element
  const spotlight = document.createElement("div");
  spotlight.className = "tutorial-spotlight";
  spotlight.id = "tutorial-spotlight";

  // Position spotlight over target
  const rect = targetEl.getBoundingClientRect();
  const padding = 8;
  spotlight.style.left = (rect.left - padding) + "px";
  spotlight.style.top = (rect.top - padding) + "px";
  spotlight.style.width = (rect.width + padding * 2) + "px";
  spotlight.style.height = (rect.height + padding * 2) + "px";

  // Add highlight class to target
  targetEl.classList.add("tutorial-target");

  // Store reference for scroll tracking
  window._tutorialTargetEl = targetEl;
  window._tutorialStep = step;

  // Create popup positioned near target
  const popup = document.createElement("div");
  popup.className = "tutorial-popup";
  popup.id = "tutorial-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "tutorial-popup-title");
  popup.setAttribute("tabindex", "-1");

  // Build popup header
  const header = document.createElement("div");
  header.className = "tutorial-popup-header";

  const headerTitle = document.createElement("div");
  headerTitle.className = "tutorial-popup-header-title";

  const iconSpan = document.createElement("span");
  iconSpan.className = "tutorial-popup-header-icon";
  iconSpan.textContent = step.icon;

  const labelSpan = document.createElement("span");
  labelSpan.className = "tutorial-popup-header-label";
  labelSpan.textContent = "TUTORIAL";

  headerTitle.appendChild(iconSpan);
  headerTitle.appendChild(labelSpan);

  const skipBtn = document.createElement("button");
  skipBtn.className = "tutorial-popup-close";
  skipBtn.textContent = "✕";
  skipBtn.setAttribute("aria-label", "Skip tutorial");
  skipBtn.onclick = skipTutorial;

  header.appendChild(headerTitle);
  header.appendChild(skipBtn);

  // Build popup content
  const content = document.createElement("div");
  content.className = "tutorial-popup-content";

  const title = document.createElement("h3");
  title.className = "tutorial-popup-title";
  title.id = "tutorial-popup-title";
  title.textContent = step.title;

  const text = document.createElement("p");
  text.className = "tutorial-popup-text";
  text.textContent = step.content;

  content.appendChild(title);
  content.appendChild(text);

  // Add bullets if present (for highlight steps with bullets)
  if (step.bullets) {
    const ul = document.createElement("ul");
    ul.className = "tutorial-popup-bullets";
    step.bullets.forEach(b => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    content.appendChild(ul);
  }

  // Build popup footer
  const footer = document.createElement("div");
  footer.className = "tutorial-popup-footer";

  const nav = document.createElement("div");
  nav.className = "tutorial-popup-nav";

  if (stepIndex > 0) {
    const backBtn = document.createElement("button");
    backBtn.className = "tutorial-btn tutorial-btn-back";
    backBtn.textContent = "← Back";
    backBtn.onclick = prevTutorialStep;
    nav.appendChild(backBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "tutorial-btn tutorial-btn-next";
  nextBtn.textContent = step.isFinal ? "Start Playing →" : "Continue →";
  nextBtn.onclick = step.isFinal ? completeTutorial : nextTutorialStep;
  nav.appendChild(nextBtn);

  footer.appendChild(nav);

  // Build progress indicator
  const progress = document.createElement("div");
  progress.className = "tutorial-popup-progress";
  progress.textContent = `${stepIndex + 1} / ${TUTORIAL_STEPS.length}`;
  footer.appendChild(progress);

  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(footer);

  // Position popup based on step.position
  positionTutorialPopup(popup, targetEl, step.position || "below");

  // Add small class if specified
  if (step.popupSize === "small") {
    popup.classList.add("small");
  }

  overlay.appendChild(spotlight);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Set up scroll tracking to update spotlight position
  const updateSpotlightPosition = () => {
    const rect = targetEl.getBoundingClientRect();
    const padding = 8;
    spotlight.style.left = (rect.left - padding) + "px";
    spotlight.style.top = (rect.top - padding) + "px";
    spotlight.style.width = (rect.width + padding * 2) + "px";
    spotlight.style.height = (rect.height + padding * 2) + "px";

    // Also update popup position
    if (!popup.classList.contains("centered")) {
      positionTutorialPopup(popup, targetEl, step.position || "below");
    }
  };

  // Store listener reference for cleanup
  window._tutorialScrollHandler = updateSpotlightPosition;
  window.addEventListener("scroll", updateSpotlightPosition, true);

  // Also listen on sidebar scroll
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.addEventListener("scroll", updateSpotlightPosition);
  }
}

// Position tutorial popup relative to target element
function positionTutorialPopup(popup, targetEl, position) {
  const rect = targetEl.getBoundingClientRect();
  const margin = 25;
  const spotlightPadding = 12; // Account for spotlight padding around target

  // Temporarily add popup to measure actual dimensions
  popup.style.visibility = "hidden";
  popup.style.position = "fixed";
  popup.style.left = "0px";
  popup.style.top = "0px";
  document.body.appendChild(popup);
  const popupRect = popup.getBoundingClientRect();
  const popupWidth = popupRect.width;
  const popupHeight = popupRect.height;
  popup.remove();
  popup.style.visibility = "visible";

  let left, top;
  let finalPosition = position;

  // Calculate spotlight boundaries (element + padding)
  const spotlightLeft = rect.left - spotlightPadding;
  const spotlightRight = rect.right + spotlightPadding;
  const spotlightTop = rect.top - spotlightPadding;
  const spotlightBottom = rect.bottom + spotlightPadding;

  // Check available space in each direction
  const spaceBelow = window.innerHeight - spotlightBottom - margin;
  const spaceAbove = spotlightTop - margin;
  const spaceLeft = spotlightLeft - margin;
  const spaceRight = window.innerWidth - spotlightRight - margin;

  // Try the requested position first, fall back if not enough space
  function tryPosition(pos) {
    switch (pos) {
      case "below":
        if (spaceBelow >= popupHeight) {
          left = rect.left + rect.width / 2 - popupWidth / 2;
          top = spotlightBottom + margin;
          return true;
        }
        return false;
      case "above":
        if (spaceAbove >= popupHeight) {
          left = rect.left + rect.width / 2 - popupWidth / 2;
          top = spotlightTop - popupHeight - margin;
          return true;
        }
        return false;
      case "left":
        if (spaceLeft >= popupWidth) {
          left = spotlightLeft - popupWidth - margin;
          top = rect.top + rect.height / 2 - popupHeight / 2;
          return true;
        }
        return false;
      case "right":
        if (spaceRight >= popupWidth) {
          left = spotlightRight + margin;
          top = rect.top + rect.height / 2 - popupHeight / 2;
          return true;
        }
        return false;
    }
    return false;
  }

  // Try positions in order of preference based on requested position
  const positionOrder = {
    "below": ["below", "above", "right", "left"],
    "above": ["above", "below", "right", "left"],
    "left": ["left", "right", "below", "above"],
    "right": ["right", "left", "below", "above"]
  };

  const order = positionOrder[position] || positionOrder["below"];
  let positioned = false;
  for (const pos of order) {
    if (tryPosition(pos)) {
      finalPosition = pos;
      positioned = true;
      break;
    }
  }

  // Fallback: if no position works, use below and let it scroll
  if (!positioned) {
    left = rect.left + rect.width / 2 - popupWidth / 2;
    top = spotlightBottom + margin;
  }

  // Keep popup within viewport horizontally
  left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));

  // Keep popup within viewport vertically, but avoid covering the spotlight
  if (top < margin) {
    top = margin;
  }
  if (top + popupHeight > window.innerHeight - margin) {
    // If we'd go off bottom, and we're positioned below, try to fit above instead
    if (finalPosition === "below" && spaceAbove > popupHeight * 0.5) {
      top = spotlightTop - popupHeight - margin;
    } else {
      top = window.innerHeight - popupHeight - margin;
    }
  }

  popup.style.position = "fixed";
  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

// Clear tutorial UI
function clearTutorialUI() {
  // Remove scroll listener
  if (window._tutorialScrollHandler) {
    window.removeEventListener("scroll", window._tutorialScrollHandler, true);
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.removeEventListener("scroll", window._tutorialScrollHandler);
    }
    window._tutorialScrollHandler = null;
  }

  // Clear stored references
  window._tutorialTargetEl = null;
  window._tutorialStep = null;

  // Remove any mutation observer
  if (window._tutorialMutationObserver) {
    window._tutorialMutationObserver.disconnect();
    window._tutorialMutationObserver = null;
  }

  // Remove waiting overlay
  const waitingOverlay = document.getElementById("tutorial-waiting-overlay");
  if (waitingOverlay) {
    waitingOverlay.remove();
  }

  const overlay = document.getElementById("tutorial-overlay");
  if (overlay) {
    overlay.remove();
  }

  // Remove highlight from any targets
  document.querySelectorAll(".tutorial-target").forEach(el => {
    el.classList.remove("tutorial-target");
  });
}

// Navigate tutorial
function nextTutorialStep() {
  if (tutorialState.currentStep < TUTORIAL_STEPS.length - 1) {
    showTutorialStep(tutorialState.currentStep + 1);
  } else {
    completeTutorial();
  }
}

function prevTutorialStep() {
  if (tutorialState.currentStep > 0) {
    showTutorialStep(tutorialState.currentStep - 1);
  }
}

function skipTutorial() {
  clearTutorialUI();
  tutorialState.active = false;
  tutorialState.completed = false;
  document.removeEventListener("keydown", handleTutorialKeydown);
  pushMessage("Tutorial skipped. You can replay it from the main menu by selecting Tutorial difficulty.");
}

function completeTutorial() {
  clearTutorialUI();
  tutorialState.active = false;
  tutorialState.completed = true;
  document.removeEventListener("keydown", handleTutorialKeydown);
  pushMessage("Tutorial complete! Good luck saving the climate.");
}

// Handle keyboard navigation for tutorial
function handleTutorialKeydown(e) {
  if (!tutorialState.active) return;

  if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
    e.preventDefault();
    const step = TUTORIAL_STEPS[tutorialState.currentStep];
    if (step.isFinal) {
      completeTutorial();
    } else {
      nextTutorialStep();
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevTutorialStep();
  } else if (e.key === "Escape") {
    e.preventDefault();
    skipTutorial();
  }
}

// Expose tutorial functions globally
window.startTutorial = startTutorial;
window.nextTutorialStep = nextTutorialStep;
window.prevTutorialStep = prevTutorialStep;
window.skipTutorial = skipTutorial;
window.completeTutorial = completeTutorial;

// ═══════════════════════════════════════════════════════════════

const DEFAULT_REGION_NAMES = {
  north_america: "North America",
  south_america: "South America",
  europe: "Europe",
  africa: "Africa",
  asia: "Asia",
  oceania: "Oceania",
};

const DEFAULT_REGION_OFFSETS = {
  north_america: -0.15,
  south_america: 0.05,
  europe: -0.2,
  africa: 0.1,
  asia: -0.1,
  oceania: -0.2,
};

const GRANULARITY_CONFIG = {
  continents: {
    map: "assets/maps/mapsvg-world-world.svg",
    selector: "path[id]",
    grouping: "continents",
    level: 1,
  },
  major_regions: {
    map: "assets/maps/mapsvg-world-world.svg",
    selector: "path[id]",
    grouping: "major_regions",
    level: 2,
  },
  countries: {
    map: "assets/maps/mapsvg-world-world.svg",
    selector: "path[id]",
    grouping: "countries",
    level: 3,
  },
};

// Labels are dynamically loaded from CLIMATE_DATA
// These are initialized after CLIMATE_DATA loads
let GRANULARITY_LABELS = {
  continents: {},
  major_regions: {},
  countries: {},
};

// Initialize labels from CLIMATE_DATA when available
function initGranularityLabels() {
  if (!window.CLIMATE_DATA) return;

  const { CONTINENTS, MAJOR_REGIONS } = window.CLIMATE_DATA;

  // Continent labels
  if (CONTINENTS) {
    Object.entries(CONTINENTS).forEach(([id, data]) => {
      GRANULARITY_LABELS.continents[id] = data.name;
    });
  }

  // Major region labels
  if (MAJOR_REGIONS) {
    Object.entries(MAJOR_REGIONS).forEach(([id, data]) => {
      GRANULARITY_LABELS.major_regions[id] = data.name;
    });
  }

  // Country labels are loaded from SVG element titles
}

const GEO_DEFAULTS = {
  minLon: -169.110266,
  maxLat: 83.600842,
  maxLon: 190.486279,
  minLat: -58.508473,
};

const GEO_THRESHOLDS = {
  americasSplitLat: 7,
  northAmericaLat: 40,
  centralAmericaLat: 18,
  northAmericaWestLon: -100,
  caribbeanLon: -85,
  southAmericaSplitLat: -15,
  southAmericaWestLon: -60,
  europeContinentLat: 35,
  europeNorthLat: 55,
  europeSouthLat: 45,
  europeWestLon: 10,
  europeCentralLon: 25,
  africaNorthLat: 20,
  africaSouthLat: -15,
  africaWestLon: 5,
  africaEastLon: 30,
  asiaWestLon: 60,
  asiaCentralLon: 90,
  asiaEastLon: 120,
  asiaSouthLat: 20,
  asiaNorthLat: 40,
  oceaniaLon: 110,
  oceaniaEastLon: 150,
  oceaniaIslandLon: 140,
  oceaniaIslandLat: 5,
  oceaniaSouthLat: -10,
  oceaniaNorthLat: 20,
};

const PROJECT_TYPES = {
  // ═══════════════════════════════════════════════════════════════
  // CLIMATE/ENVIRONMENT PROJECTS
  // ═══════════════════════════════════════════════════════════════
  forest: {
    label: "Reforestation Program",
    cost: 15,                   // $15 billion (increased for balance)
    co2Reduction: 0.02,         // Realistic carbon sink rate (was 2, 100x nerf)
    income: 0,
    category: "climate",
    constructionMonths: 4,     // Planting phase
    description: "Plant trees across the region to absorb carbon.",
  },
  carbonCapture: {
    label: "Basic Carbon Capture",
    cost: 30,                   // CAR-29: $30B - modest premium over reforestation, far below researched post-combustion ($65B)
    co2Reduction: 0.04,         // CAR-29: 2x reforestation's effect (was 0.001, an inconsistent-nerf trap); cost-eff 0.00133/$B matches reforestation, well below post-combustion's 0.08
    income: 0,
    category: "climate",
    subcategory: "ccs_capture",
    constructionMonths: 24,     // CAR-29: trimmed from absurd 42mo; slower than reforestation (4mo) but under post-combustion (36mo)
    description: "First-generation industrial carbon capture. Research advanced CCS for better options.",
  },

  // ═══════════════════════════════════════════════════════════════
  // CCS CAPTURE PROJECTS - Different capture methods unlocked via tech
  // ═══════════════════════════════════════════════════════════════
  postCombustionCapture: {
    label: "Post-Combustion CCS Plant",
    cost: 65,                   // $65B - retrofittable, mature technology
    co2Reduction: 0.08,         // 80 Mt/year (captures from existing plants)
    income: 0,
    category: "climate",
    subcategory: "ccs_capture",
    constructionMonths: 36,     // 3 years
    unlockedBy: "post_combustion_capture",
    description: "Retrofit existing fossil plants with amine-based CO2 capture. Most proven CCS technology.",
  },
  preCombustionCapture: {
    label: "Pre-Combustion CCS (IGCC)",
    cost: 90,                   // $90B - requires new integrated facility
    co2Reduction: 0.1,          // 100 Mt/year
    income: 0.8,                // Produces hydrogen as byproduct
    category: "climate",
    subcategory: "ccs_capture",
    constructionMonths: 48,     // 4 years
    unlockedBy: "pre_combustion_capture",
    description: "Integrated gasification combined cycle. Produces hydrogen and concentrated CO2 stream.",
  },
  oxyfuelCapture: {
    label: "Oxy-Fuel CCS Plant",
    cost: 85,                   // $85B
    co2Reduction: 0.12,         // 120 Mt/year - high capture rate
    income: 0,
    category: "climate",
    subcategory: "ccs_capture",
    constructionMonths: 42,     // 3.5 years
    unlockedBy: "oxyfuel_combustion",
    description: "Burns fuel with pure oxygen for >90% CO2 concentration in exhaust. Highest capture efficiency.",
  },
  directAirCapture: {
    label: "Direct Air Capture Facility",
    cost: 120,                  // $120B - very expensive
    co2Reduction: 0.04,         // 40 Mt/year (small scale but from ambient air)
    income: 0,
    category: "climate",
    subcategory: "ccs_capture",
    constructionMonths: 24,     // 2 years (modular construction)
    unlockedBy: "direct_air_capture_tech",
    description: "Captures CO2 directly from atmosphere. Location-independent negative emissions technology.",
  },
  beccsPlant: {
    label: "BECCS Power Plant",
    cost: 110,                  // $110B
    co2Reduction: 0.07,         // 70 Mt/year net removal
    income: 1.2,                // Produces electricity
    category: "climate",
    subcategory: "ccs_capture",
    powerCategory: "baseload",
    capacityGW: 0.5,            // 500 MW
    stabilityContribution: 8,
    constructionMonths: 54,     // 4.5 years
    unlockedBy: "beccs_technology",
    description: "Biomass power with carbon capture. Generates electricity while achieving negative emissions.",
  },

  // ═══════════════════════════════════════════════════════════════
  // CCS TRANSPORT INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════
  co2Pipeline: {
    label: "CO2 Pipeline Network (Onshore)",
    cost: 25,                   // $25B
    co2Reduction: 0,            // Transport only - enables storage
    income: 0.3,                // Transport fees from other capture projects
    category: "climate",
    subcategory: "ccs_transport",
    constructionMonths: 24,
    unlockedBy: "pipeline_transport",
    transportCapacity: 0.2,     // 200 Mt/year capacity
    description: "Onshore pipeline network for CO2 transport. €1.5-5/tonne operating cost. Enables regional CCS.",
  },
  co2OffshorePipeline: {
    label: "CO2 Pipeline Network (Offshore)",
    cost: 45,                   // $45B - more expensive offshore
    co2Reduction: 0,
    income: 0.4,
    category: "climate",
    subcategory: "ccs_transport",
    constructionMonths: 36,
    unlockedBy: "offshore_pipeline",
    transportCapacity: 0.15,    // 150 Mt/year capacity
    description: "Subsea pipeline for offshore storage sites. €3.5-9.5/tonne operating cost. Required for offshore sequestration.",
  },
  co2ShipTerminal: {
    label: "CO2 Shipping Terminal",
    cost: 35,                   // $35B
    co2Reduction: 0,
    income: 0.5,                // Higher income from cross-border transport
    category: "climate",
    subcategory: "ccs_transport",
    constructionMonths: 30,
    unlockedBy: "co2_shipping",
    transportCapacity: 0.1,     // 100 Mt/year (more flexible, smaller scale)
    description: "Port facility for CO2 ship loading/unloading. €11-16/tonne but enables flexible cross-border CCS.",
  },

  // ═══════════════════════════════════════════════════════════════
  // CCS STORAGE INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════
  depletedReservoirStorage: {
    label: "Depleted Oil/Gas Field Storage",
    cost: 40,                   // $40B
    co2Reduction: 0,            // Storage enables negative emissions when combined with capture
    income: 0.6,                // Revenue from EOR or storage fees
    category: "climate",
    subcategory: "ccs_storage",
    constructionMonths: 24,
    unlockedBy: "depleted_reservoir_storage",
    storageCapacity: 0.5,       // 500 Mt total capacity
    storageRate: 0.05,          // 50 Mt/year injection rate
    description: "Permanent CO2 storage in depleted hydrocarbon reservoirs. €1-14/tonne. Reuses existing infrastructure.",
  },
  salineAquiferStorage: {
    label: "Deep Saline Aquifer Storage",
    cost: 55,                   // $55B
    co2Reduction: 0,
    income: 0.2,                // Lower income but larger capacity
    category: "climate",
    subcategory: "ccs_storage",
    constructionMonths: 36,
    unlockedBy: "saline_aquifer_storage",
    storageCapacity: 2.0,       // 2 Gt total capacity - largest
    storageRate: 0.1,           // 100 Mt/year injection rate
    description: "Store CO2 in deep porous formations. €6-20/tonne offshore. Largest long-term storage potential.",
  },

  // ═══════════════════════════════════════════════════════════════
  // CCS INTEGRATED HUBS - Combined capture/transport/storage
  // ═══════════════════════════════════════════════════════════════
  ccsHubSmall: {
    label: "Regional CCS Hub",
    cost: 70,                   // $70B (bundled discount)
    co2Reduction: 0.06,         // 60 Mt/year removal
    income: 0.4,
    category: "climate",
    subcategory: "ccs_integrated",
    constructionMonths: 36,
    unlockedBy: "pipeline_transport",
    description: "Integrated capture-transport-storage hub. Bundles infrastructure for cost savings.",
  },
  ccsHubMajor: {
    label: "Major CCS Industrial Complex",
    cost: 150,                  // $150B
    co2Reduction: 0.15,         // 150 Mt/year removal
    income: 1.0,
    category: "climate",
    subcategory: "ccs_integrated",
    constructionMonths: 60,     // 5 years
    unlockedBy: "ccs_optimization",
    description: "Large-scale integrated CCS with multiple capture sources, transport networks, and storage sites.",
  },

  research: {
    label: "Climate Innovation Hub",
    cost: 15,                   // $15B (based on Sintef Horizon ~$28.7M, scaled for ~523 centers)
    co2Reduction: 0,            // No direct CO2 reduction (confirmed by sources)
    income: 3,
    category: "climate",
    constructionMonths: 30,     // 2.5 years (Sintef Horizon construction timeline)
    description: "Climate technology innovation hub. Generates regional income but does not produce Research Points — use the Tech tab to build a Research Center for RP.",
  },

  // ═══════════════════════════════════════════════════════════════
  // VARIABLE POWER (Solar, Wind) - Causes grid instability
  // ═══════════════════════════════════════════════════════════════
  solar: {
    label: "Utility Solar Farm",
    cost: 25,                   // $25 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 0.8,                // Reduced income for balance
    category: "power",
    powerCategory: "variable",
    capacityGW: 0.5,            // 500 MW per project
    stabilityContribution: -5,  // Hurts grid stability
    constructionMonths: 9,     // 6-12 months typical
    description: "Large-scale solar power. Variable output depends on sunlight.",
  },
  wind: {
    label: "Wind Farm",
    cost: 22,                   // $22 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 0.8,                // Reduced income for balance
    category: "power",
    powerCategory: "variable",
    capacityGW: 0.3,            // 300 MW per project
    stabilityContribution: -4,  // Hurts grid stability
    constructionMonths: 15,    // 12-18 months onshore
    description: "Onshore wind power. Output varies with wind conditions.",
  },
  offshoreWind: {
    label: "Offshore Wind",
    cost: 60,                   // $60 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 1.2,                // Reduced income for balance
    category: "power",
    powerCategory: "variable",
    capacityGW: 0.8,            // 800 MW per project
    stabilityContribution: -3,  // Less unstable than onshore
    constructionMonths: 30,    // 24-36 months offshore
    description: "Offshore wind farms. More consistent than onshore wind.",
  },

  // ═══════════════════════════════════════════════════════════════
  // BASELOAD POWER (Nuclear, Fossil, Hydro, Geothermal) - Stable
  // ═══════════════════════════════════════════════════════════════
  nuclear: {
    label: "Nuclear Plant",
    cost: 120,                  // $120 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 1.5,                // Reduced income for balance
    category: "power",
    powerCategory: "baseload",
    capacityGW: 1.2,            // 1.2 GW per plant
    stabilityContribution: 15,  // Very stable baseload
    constructionMonths: 84,    // 7 years average
    description: "Zero-carbon baseload power. Expensive but very reliable.",
  },
  coal: {
    label: "Coal Power Plant",
    cost: 8,                    // $8 billion (cheap to build)
    co2Reduction: 0,            // Emissions calculated from power generation (0.9 Mt CO2/TWh)
    income: 1.5,                // Reduced income for balance
    category: "power",
    powerCategory: "baseload",
    capacityGW: 1.0,            // 1 GW per plant
    stabilityContribution: 10,  // Very stable
    constructionMonths: 48,    // 36-60 months typical
    description: "Cheap reliable power but HIGH CO2 emissions. Use sparingly!",
  },
  naturalGas: {
    label: "Natural Gas Plant",
    cost: 12,                   // $12 billion
    co2Reduction: 0,            // Emissions calculated from power generation (0.4 Mt CO2/TWh)
    income: 1.2,                // Reduced income for balance
    category: "power",
    powerCategory: "baseload",
    capacityGW: 0.8,            // 800 MW per plant
    stabilityContribution: 8,   // Stable and flexible
    constructionMonths: 24,    // 18-30 months typical
    description: "Flexible baseload power. Lower emissions than coal.",
  },
  geothermal: {
    label: "Geothermal Plant",
    cost: 45,                   // $45 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 0.8,                // Reduced income for balance
    category: "power",
    powerCategory: "baseload",
    capacityGW: 0.3,            // 300 MW per plant
    stabilityContribution: 8,   // Stable
    potentialKey: "geothermal",
    constructionMonths: 36,    // 24-48 months typical
    description: "Clean stable power from Earth's heat. Location dependent.",
  },
  hydropower: {
    label: "Hydroelectric Dam",
    cost: 65,                   // $65 billion (increased for balance)
    co2Reduction: 0,            // Only reduces CO2 when replacing fossil (calculated from retired capacity)
    income: 1.0,                // Reduced income for balance
    category: "power",
    powerCategory: "baseload",
    capacityGW: 0.5,            // 500 MW per dam
    stabilityContribution: 12,  // Can ramp quickly, very stable
    potentialKey: "hydro",
    constructionMonths: 60,    // 5 years average
    description: "Zero-carbon dispatchable power. Can adjust output rapidly.",
  },

  // ═══════════════════════════════════════════════════════════════
  // ENERGY STORAGE - Smooths grid variability
  // ═══════════════════════════════════════════════════════════════
  batteryStorage: {
    label: "Battery Storage",
    cost: 20,                   // $20 billion
    co2Reduction: 0,            // No direct CO2 impact
    income: 0.5,                // Arbitrage income
    category: "power",
    powerCategory: "storage",
    capacityGW: 0.2,            // 200 MW power rating
    storageGWh: 0.8,            // 800 MWh (4 hours)
    stabilityContribution: 15,  // Excellent for stability
    constructionMonths: 9,     // 6-12 months typical
    description: "Lithium-ion batteries. Smooths renewable variability (4-hour storage).",
  },
  pumpedHydro: {
    label: "Pumped Hydro Storage",
    cost: 40,                   // $40 billion
    co2Reduction: 0,            // No direct CO2 impact
    income: 0.8,                // Arbitrage income
    category: "power",
    powerCategory: "storage",
    capacityGW: 0.5,            // 500 MW power rating
    storageGWh: 6.0,            // 6 GWh (12 hours)
    stabilityContribution: 20,  // Best for large-scale stability
    potentialKey: "hydro",
    constructionMonths: 48,    // Large-scale hydro project
    description: "Large-scale water-based storage. 12-hour capacity.",
  },

  // ═══════════════════════════════════════════════════════════════
  // ECONOMIC PROJECTS - Boost happiness and GDP, no CO2 reduction
  // ═══════════════════════════════════════════════════════════════
  infrastructure: {
    label: "Infrastructure Development",
    cost: 30,
    co2Reduction: 0,
    income: 4.5,
    gdpBoost: 0.02,            // +2% regional GDP
    happiness: 10,
    category: "economic",
    constructionMonths: 24,    // 18-36 months typical
    description: "Roads, ports, and utilities development.",
  },
  education: {
    label: "Education Hub",
    cost: 22.5,
    co2Reduction: 0,
    income: 3,
    gdpBoost: 0.01,
    happiness: 15,
    category: "economic",
    constructionMonths: 18,    // Similar to research center
    description: "Universities and research institutions.",
  },
  healthcare: {
    label: "Healthcare System",
    cost: 37.5,
    co2Reduction: 0,
    income: 3,
    gdpBoost: 0.01,
    happiness: 20,
    category: "economic",
    constructionMonths: 24,    // Similar to infrastructure
    description: "Hospitals and public health infrastructure.",
  },
  trade: {
    label: "Trade Agreement",
    cost: 15,
    co2Reduction: 0,
    income: 6,
    gdpBoost: 0.03,
    happiness: 5,
    category: "economic",
    constructionMonths: 6,     // Quick negotiations
    description: "International trade partnerships.",
  },
  tourism: {
    label: "Tourism Development",
    cost: 18,
    co2Reduction: 0,
    income: 4.5,
    gdpBoost: 0.02,
    happiness: 8,
    category: "economic",
    constructionMonths: 12,    // Relatively quick
    description: "Tourism infrastructure and promotion.",
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTOR ELECTRIFICATION - Shifts emissions from sectors to power grid
  // ═══════════════════════════════════════════════════════════════
  evInfrastructure: {
    label: "EV Charging Network",
    cost: 25,                   // $25 billion
    co2Reduction: 0,            // Shifts emissions, doesn't directly reduce
    income: 1.5,                // Charging fees
    category: "electrification",
    constructionMonths: 18,    // 12-24 months typical
    description: "Electric vehicle charging infrastructure. Shifts transport emissions to power grid.",
    sectorReduction: {
      transport: { road: 0.15 } // 15% of road transport electrified
    },
    electrification: {
      sector: "transport",
      powerDemandIncrease: 0.05 // Increases regional power demand by 5%
    },
  },
  heatPumps: {
    label: "Heat Pump Program",
    cost: 15,                   // $15 billion
    co2Reduction: 0,            // Shifts emissions, doesn't directly reduce
    income: 0.5,
    category: "electrification",
    constructionMonths: 12,    // Relatively quick rollout
    description: "Electrify building heating. Shifts heating emissions to power grid.",
    sectorReduction: {
      buildings: { residential: 0.20 } // 20% of residential heating electrified
    },
    electrification: {
      sector: "buildings",
      powerDemandIncrease: 0.08 // Increases regional power demand by 8%
    },
  },
  industrialElectrification: {
    label: "Industrial Electrification",
    cost: 40,                   // $40 billion (expensive)
    co2Reduction: 0,
    income: 2,
    category: "electrification",
    constructionMonths: 30,    // Long implementation
    description: "Electrify industrial processes. Shifts industrial emissions to power grid.",
    sectorReduction: {
      industry: { other: 0.10 } // 10% of industrial processes electrified
    },
    electrification: {
      sector: "industry",
      powerDemandIncrease: 0.10 // Increases regional power demand by 10%
    },
  },
};

function getProjectMonthlyUpkeep(projectType) {
  const project = PROJECT_TYPES[projectType];
  if (!project) {
    return 0;
  }

  if (project.subcategory?.startsWith("ccs_")) {
    return PROJECT_UPKEEP_RATES.ccs;
  }

  return PROJECT_UPKEEP_RATES[project.category] ?? PROJECT_UPKEEP_RATES.default;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let state = {};
let selectedRegionId = null;
let regionOffsets = {};
let svgDoc = null;
let svgRegions = new Map();
let pendingColorUpdate = false; // Flag to ensure color update after SVG loads
let svgClickHandler = null; // Reference for event delegation cleanup
let svgGeoBounds = null;
let svgSize = null;
let regionGeoCache = new Map();
let mapColors = {};
let currentGranularity = "continents";
let currentMapMode = "alliance";
let availableRegionIds = [];
let regionNames = { ...DEFAULT_REGION_NAMES };
let pendingInit = false;
let currentDifficulty = "normal";
let isSetupMode = true; // Start in setup mode

// ═══════════════════════════════════════════════════════════════
// SAVE/LOAD SYSTEM
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = "carbonCaptureGameSave";

function saveGame() {
  if (isSetupMode || state.gameOver) return;
  const saveData = {
    state,
    selectedRegionId,
    currentGranularity,
    currentMapMode,
    currentDifficulty,
    version: 1,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn("Failed to save game:", e);
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    const saveData = JSON.parse(saved);
    if (!saveData.state || saveData.state.gameOver) return false;

    state = saveData.state;
    selectedRegionId = saveData.selectedRegionId;
    currentGranularity = saveData.currentGranularity || "continents";
    currentMapMode = saveData.currentMapMode || "alliance";
    currentDifficulty = saveData.currentDifficulty || "normal";
    isSetupMode = false;
    mapDebug('[Map] Game loaded, isSetupMode:', isSetupMode);

    // Migration: Add underConstruction array if missing
    if (!state.underConstruction) {
      state.underConstruction = [];
    }

    if (typeof state.winStreakMonths !== "number") {
      state.winStreakMonths = 0;
    }
    if (typeof state.loseStreakMonths !== "number") {
      state.loseStreakMonths = 0;
    }

    // Migration: ensure runtime collections the monthly loop accesses unguarded
    // exist. Saves predating any of these fields would otherwise throw on the
    // first tick (e.g. state.activeDisasters.some(...), Object.keys(disasterHistory)).
    if (!Array.isArray(state.activeDisasters)) {
      state.activeDisasters = [];
    }
    if (!state.disasterHistory || typeof state.disasterHistory !== "object") {
      state.disasterHistory = {};
    }
    if (!Array.isArray(state.tippingPointsTriggered)) {
      state.tippingPointsTriggered = [];
    }
    if (!Array.isArray(state.campaignHistory)) {
      state.campaignHistory = [];
    }

    // Migration: Add retiredFossilGW to regions if missing
    if (state.regions) {
      Object.values(state.regions).forEach(region => {
        if (!region.retiredFossilGW) {
          region.retiredFossilGW = { coal: 0, gas: 0 };
        }
      });
    }

    // Migration: Re-initialize sectorEmissions from climate data
    // Old saves may have incorrect low values from before the data flow fix
    // This works for both continents and major regions
    if (state.regions) {
      Object.entries(state.regions).forEach(([regionId, region]) => {
        // Check if sectorEmissions are using old fallback defaults (total < 0.5 Gt for any region)
        const currentTotal = ['industry', 'transport', 'buildings', 'agriculture']
          .reduce((sum, s) => sum + (region.sectorEmissions?.[s]?.baseline || 0), 0);

        // Use a lower threshold (0.5 Gt) to catch all fallback values
        // Real major regions should have at least 0.5 Gt total
        if (currentTotal < 0.5) {
          // Re-initialize from climate data (works for both continents and major regions)
          const climateData = getClimateDataForRegion(regionId);
          if (climateData?.sectorEmissions) {
            region.sectorEmissions = initializeSectorEmissions(climateData);
            const newTotal = ['industry', 'transport', 'buildings', 'agriculture']
              .reduce((sum, s) => sum + (region.sectorEmissions?.[s]?.current || 0), 0);
            console.log(`Migrated sectorEmissions for ${regionId}: ${currentTotal.toFixed(2)} -> ${newTotal.toFixed(2)} Gt`);
          }
        }
      });
    }

    // Regenerate regionOffsets from loaded regions (not saved in localStorage)
    if (state.regions) {
      regionOffsets = {};
      Object.keys(state.regions).forEach(regionId => {
        regionOffsets[regionId] = getRegionOffset(regionId);
      });
    }

    return true;
  } catch (e) {
    console.warn("Failed to load game:", e);
    return false;
  }
}

function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
}

// Get current difficulty settings
function getDifficulty() {
  return DIFFICULTY_MODES[currentDifficulty] || DIFFICULTY_MODES.normal;
}

// Get adjusted project cost based on difficulty
function getAdjustedCost(baseCost) {
  const difficulty = getDifficulty();
  return Math.round(baseCost * difficulty.costMultiplier * 10) / 10;
}

// Get CO2 increase rate based on carbon balance and difficulty
function getCo2IncreaseRate() {
  const carbonBalance = getCarbonBalance();
  if (carbonBalance && carbonBalance.ppmChange !== undefined) {
    const difficulty = getDifficulty();
    return carbonBalance.ppmChange * difficulty.co2Multiplier;
  }
  // Fallback to config value if carbon balance not yet calculated
  const difficulty = getDifficulty();
  return GAME_CONFIG.co2Increase * difficulty.co2Multiplier;
}

// Check if any new tipping points have been crossed
function checkTippingPoints() {
  if (!state.tippingPointsTriggered) {
    state.tippingPointsTriggered = [];
  }

  const newlyTriggered = [];

  TIPPING_POINTS.forEach((tp) => {
    // Skip if already triggered
    if (state.tippingPointsTriggered.includes(tp.id)) {
      return;
    }

    // Check if threshold crossed
    if (state.temperature >= tp.threshold) {
      state.tippingPointsTriggered.push(tp.id);
      newlyTriggered.push(tp);
    }
  });

  // Show dramatic alerts for newly triggered tipping points
  const tippingPointPopupEvents = [];
  newlyTriggered.forEach((tp) => {
    pushMessage(`TIPPING POINT CROSSED: ${tp.name} at +${tp.threshold}C! ${tp.description}`, "bad");

    // Add specific impact messages for certain tipping points
    if (tp.id === 'amazon_dieback') {
      pushMessage(`Forest project effectiveness reduced by 50%! All reforestation projects now less effective.`, "bad");
    }
    if (tp.id === 'ocean_circulation') {
      pushMessage(`Ocean CO2 absorption reduced by 30%! Natural carbon sinks weakened.`, "bad");
    }

    // Collect for popup
    let additionalDetails = "";
    if (tp.id === 'amazon_dieback') {
      additionalDetails = "<br><br><strong>Gameplay Impact:</strong> All forest/reforestation projects are now 50% less effective at removing CO2.";
    }
    if (tp.id === 'ocean_circulation') {
      additionalDetails = "<br><br><strong>Gameplay Impact:</strong> Ocean CO2 absorption is now 30% less effective. Natural carbon removal is weakened.";
    }

    tippingPointPopupEvents.push({
      icon: "⚠️",
      title: "TIPPING POINT CROSSED",
      description: tp.name,
      summary: `${tp.name} (+${tp.threshold}°C)`,
      details: `<strong>Threshold:</strong> +${tp.threshold}°C<br><br>${tp.description}${additionalDetails}<br><br><em>This effect is irreversible.</em>`,
      combinedDescription: "Critical climate thresholds have been crossed:",
    });
  });

  // Show tipping point popup(s)
  if (tippingPointPopupEvents.length > 0) {
    showCombinedEventPopup("tipping-point", "Tipping Points Crossed", "⚠️", tippingPointPopupEvents);
  }

  // Update UI if new tipping points were triggered
  if (newlyTriggered.length > 0) {
    updateUI();
  }

  return newlyTriggered;
}

// Calculate additional CO2 from triggered tipping points
function getTippingPointCO2Modifier() {
  if (!state.tippingPointsTriggered) {
    return 0;
  }

  let modifier = 0;
  state.tippingPointsTriggered.forEach((tpId) => {
    const tp = TIPPING_POINTS.find((t) => t.id === tpId);
    if (tp) {
      modifier += tp.co2Modifier;
    }
  });

  return modifier;
}

// Calculate feedback loop effects based on current state
function getFeedbackLoopEffects() {
  let totalEffect = 0;

  // Ice-albedo feedback
  const iceAlbedo = FEEDBACK_LOOPS.iceAlbedo;
  if (state.temperature > iceAlbedo.startTemp) {
    const progress = Math.min(1, (state.temperature - iceAlbedo.startTemp) / (iceAlbedo.maxTemp - iceAlbedo.startTemp));
    totalEffect += iceAlbedo.maxEffect * progress;
  }

  // Ocean saturation feedback
  const oceanSat = FEEDBACK_LOOPS.oceanSaturation;
  if (state.co2 > oceanSat.startCO2) {
    const progress = Math.min(1, (state.co2 - oceanSat.startCO2) / (oceanSat.maxCO2 - oceanSat.startCO2));
    totalEffect += oceanSat.maxEffect * progress;
  }

  // Vegetation stress feedback
  const vegStress = FEEDBACK_LOOPS.vegetationStress;
  if (state.temperature > vegStress.startTemp) {
    const progress = Math.min(1, (state.temperature - vegStress.startTemp) / (vegStress.maxTemp - vegStress.startTemp));
    totalEffect += vegStress.maxEffect * progress;
  }

  return totalEffect;
}

// Get forest project effectiveness modifier (reduced by Amazon dieback)
function getForestEffectivenessModifier() {
  if (!state.tippingPointsTriggered) {
    return 1;
  }

  if (state.tippingPointsTriggered.includes("amazon_dieback")) {
    return TIPPING_POINTS.find((tp) => tp.id === "amazon_dieback").effects.forestEffectiveness;
  }

  return 1;
}

// Get ocean absorption modifier (reduced by ocean circulation weakening)
function getOceanAbsorptionModifier() {
  if (!state.tippingPointsTriggered) {
    return 1;
  }

  if (state.tippingPointsTriggered.includes("ocean_circulation")) {
    return TIPPING_POINTS.find((tp) => tp.id === "ocean_circulation").effects.oceanAbsorption;
  }

  return 1;
}

// Get total climate feedback (tipping points + feedback loops)
function getTotalClimateFeedback() {
  return getTippingPointCO2Modifier() + getFeedbackLoopEffects();
}

// Count the number of research centers across all regions
function countResearchCenters() {
  let count = 0;
  Object.values(state.regions).forEach((region) => {
    region.projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      if (projectType === "research") {
        count += 1;
      }
    });
  });
  return count;
}

// Generate research points - now uses regional research center system
function generateResearchPoints() {
  // Process the new regional research system - accumulates RP toward assigned projects
  processMonthlyResearch();

  // Return total RP/month for display purposes
  return getTotalRegionalRPPerMonth();
}

// Check if a technology can be unlocked
function canUnlockTechnology(techId) {
  const tech = TECHNOLOGIES.find((t) => t.id === techId);
  if (!tech) return false;

  // Already unlocked?
  if (state.unlockedTechs && state.unlockedTechs.includes(techId)) {
    return false;
  }

  // Check prerequisites
  if (tech.requires && tech.requires.length > 0) {
    const hasAllPrereqs = tech.requires.every(
      (reqId) => state.unlockedTechs && state.unlockedTechs.includes(reqId)
    );
    if (!hasAllPrereqs) return false;
  }

  // Have enough research points?
  return (state.researchPoints || 0) >= tech.cost;
}

// Get list of missing prerequisites for a technology
function getMissingPrerequisites(techId) {
  const tech = TECHNOLOGIES.find((t) => t.id === techId);
  if (!tech || !tech.requires) return [];

  return tech.requires.filter(
    (reqId) => !state.unlockedTechs || !state.unlockedTechs.includes(reqId)
  );
}

// Check if a project type is unlocked (via technology research)
function isProjectUnlocked(projectType) {
  const project = PROJECT_TYPES[projectType];
  if (!project) return false;

  // No unlock requirement = always available
  if (!project.unlockedBy) return true;

  // Check if required tech is unlocked
  return state.unlockedTechs && state.unlockedTechs.includes(project.unlockedBy);
}

// Calculate a tech's depth in the tree (for tree visualization)
// Depth 0 = no prerequisites, Depth N = max parent depth + 1
function calculateTechDepth(techId, techs, memo = {}) {
  if (memo[techId] !== undefined) return memo[techId];

  const tech = techs.find((t) => t.id === techId);
  if (!tech || !tech.requires || tech.requires.length === 0) {
    memo[techId] = 0;
    return 0;
  }

  const maxParentDepth = Math.max(
    ...tech.requires.map((reqId) => calculateTechDepth(reqId, techs, memo))
  );
  memo[techId] = maxParentDepth + 1;
  return memo[techId];
}

// Organize technologies by their depth level for tree rendering
function organizeTechsByDepth(techs) {
  const memo = {};
  const depths = {};

  techs.forEach((tech) => {
    const depth = calculateTechDepth(tech.id, techs, memo);
    if (!depths[depth]) depths[depth] = [];
    depths[depth].push(tech);
  });

  return depths;
}

// Unlock a technology
function unlockTechnology(techId) {
  const tech = TECHNOLOGIES.find((t) => t.id === techId);
  if (!tech) return false;

  if (!canUnlockTechnology(techId)) {
    return false;
  }

  // Deduct research points
  state.researchPoints -= tech.cost;

  // Add to unlocked list
  if (!state.unlockedTechs) {
    state.unlockedTechs = [];
  }
  state.unlockedTechs.push(techId);

  // Show news message
  pushMessage(`🔬 Technology Unlocked: ${tech.name}! ${tech.description}`, "good");

  // Show popup for research completion
  showEventPopup({
    type: "research",
    title: "Research Complete!",
    icon: tech.icon || "🔬",
    description: tech.name,
    details: tech.description,
  });

  updateUI();
  return true;
}

// Get the combined technology bonus multiplier for a project type
function getTechBonusForProject(projectType, bonusType) {
  let multiplier = 1;

  if (!state.unlockedTechs) return multiplier;

  state.unlockedTechs.forEach((techId) => {
    const tech = TECHNOLOGIES.find((t) => t.id === techId);
    if (!tech || !tech.effects || !tech.effects.projectBonus) return;

    const projectBonus = tech.effects.projectBonus[projectType];
    if (projectBonus && projectBonus[bonusType]) {
      multiplier *= projectBonus[bonusType];
    }
  });

  return multiplier;
}

// Get cost reduction multiplier from technologies
function getTechCostReduction(projectType) {
  return getTechBonusForProject(projectType, "costReduction");
}

// Get CO2 reduction multiplier from technologies
function getTechCO2Bonus(projectType) {
  return getTechBonusForProject(projectType, "co2Reduction");
}

// Get income multiplier from technologies
function getTechIncomeBonus(projectType) {
  return getTechBonusForProject(projectType, "income");
}

// Roll for random events each month
function rollForEvents() {
  const difficulty = getDifficulty();

  // Skip events if disabled for this difficulty
  if (!difficulty.eventsEnabled) {
    return null;
  }

  // Adjust probability based on difficulty event severity
  const severityMult = difficulty.eventSeverity || 1;

  // Check each event for triggering
  for (const event of EVENTS) {
    // Skip events that are already active
    if (state.activeEvents && state.activeEvents.some((e) => e.id === event.id)) {
      continue;
    }

    // Skip breakthrough events that have already occurred (permanent)
    if (event.duration === 0 && state.triggeredBreakthroughs && state.triggeredBreakthroughs.includes(event.id)) {
      continue;
    }

    // Roll for this event
    const adjustedProb = event.probability * severityMult;
    if (Math.random() < adjustedProb) {
      return triggerEvent(event);
    }
  }

  return null;
}

// Trigger an event
function triggerEvent(event) {
  if (!state.activeEvents) {
    state.activeEvents = [];
  }
  if (!state.triggeredBreakthroughs) {
    state.triggeredBreakthroughs = [];
  }

  // For breakthrough events (permanent), add to triggered list
  if (event.duration === 0) {
    state.triggeredBreakthroughs.push(event.id);

    // Apply permanent bonuses
    if (event.effects.permanentBonus) {
      if (!state.eventBonuses) {
        state.eventBonuses = {};
      }
      Object.entries(event.effects.permanentBonus).forEach(([projectType, bonuses]) => {
        if (!state.eventBonuses[projectType]) {
          state.eventBonuses[projectType] = {};
        }
        Object.entries(bonuses).forEach(([bonusType, value]) => {
          state.eventBonuses[projectType][bonusType] = (state.eventBonuses[projectType][bonusType] || 1) * value;
        });
      });
    }

    // Apply research points bonus
    if (event.effects.researchPointsBonus) {
      if (!state.researchPointsMultiplier) {
        state.researchPointsMultiplier = 1;
      }
      state.researchPointsMultiplier += event.effects.researchPointsBonus / RESEARCH_POINTS_PER_CENTER;
    }

    pushMessage(`${event.icon} BREAKTHROUGH: ${event.name}! ${event.description}`, "good");

    // Show popup for breakthrough event
    showEventPopup({
      type: "breakthrough",
      title: "Scientific Breakthrough!",
      icon: event.icon || "💡",
      description: event.name,
      details: event.description,
    });
  } else {
    // Temporary event
    state.activeEvents.push({
      id: event.id,
      monthsRemaining: event.duration,
    });

    const isPositive = (event.effects.incomeMultiplier || 1) >= 1 &&
                       (event.effects.projectEffectiveness || 1) >= 1 &&
                       (event.effects.campaignEffectiveness || 1) >= 1;

    const tone = isPositive ? "good" : "bad";
    pushMessage(`${event.icon} EVENT: ${event.name} (${event.duration} months). ${event.description}`, tone);
  }

  return event;
}

// Process active events (decrement duration, remove expired)
function processEvents() {
  if (!state.activeEvents) {
    state.activeEvents = [];
    return;
  }

  const expiredEvents = [];

  state.activeEvents = state.activeEvents.filter((activeEvent) => {
    activeEvent.monthsRemaining -= 1;
    if (activeEvent.monthsRemaining <= 0) {
      expiredEvents.push(activeEvent);
      return false;
    }
    return true;
  });

  // Notify about expired events
  expiredEvents.forEach((expired) => {
    const event = EVENTS.find((e) => e.id === expired.id);
    if (event) {
      pushMessage(`${event.icon} Event ended: ${event.name}`, "neutral");
    }
  });
}

// Get combined event modifier for a specific effect type
function getEventModifier(effectType) {
  let modifier = 1;

  if (!state.activeEvents) return modifier;

  state.activeEvents.forEach((activeEvent) => {
    const event = EVENTS.find((e) => e.id === activeEvent.id);
    if (event && event.effects && event.effects[effectType]) {
      modifier *= event.effects[effectType];
    }
  });

  return modifier;
}

// Get event bonus for project type (from breakthrough events)
function getEventBonusForProject(projectType, bonusType) {
  if (!state.eventBonuses || !state.eventBonuses[projectType]) {
    return 1;
  }
  return state.eventBonuses[projectType][bonusType] || 1;
}

// Get total income multiplier from active events
function getEventIncomeMultiplier() {
  return getEventModifier("incomeMultiplier");
}

// Get total project effectiveness multiplier from active events
function getEventProjectEffectiveness() {
  return getEventModifier("projectEffectiveness");
}

// Get campaign effectiveness multiplier from active events
function getEventCampaignEffectiveness() {
  return getEventModifier("campaignEffectiveness");
}

// Get project cost multiplier from active events
function getEventProjectCostMultiplier() {
  return getEventModifier("projectCostMultiplier");
}

// Map mode color schemes - 5-point scales for better differentiation
const MAP_MODE_COLORS = {
  temperature: {
    veryLow: "#1a5fb4",   // Deep blue (cold)
    low: "#62a0ea",       // Light blue
    medium: "#f5c211",    // Bright yellow
    high: "#ff7800",      // Orange
    veryHigh: "#c01c28",  // Deep red (hot)
  },
  emissions: {
    veryLow: "#26a269",   // Dark green (clean)
    low: "#8ff0a4",       // Light green
    medium: "#f9f06b",    // Bright yellow
    high: "#ff7800",      // Orange
    veryHigh: "#a51d2d",  // Dark red (polluted)
  },
  renewables: {
    veryLow: "#63452c",   // Dark brown (poor)
    low: "#b5835a",       // Light brown
    medium: "#99c1f1",    // Light blue
    high: "#57e389",      // Bright green
    veryHigh: "#1a8c3d",  // Dark green (excellent)
  },
  economy: {
    veryLow: "#daf5e6",   // Very light green (small)
    low: "#8ff0a4",       // Light green
    medium: "#62a0ea",    // Blue
    high: "#1c71d8",      // Dark blue
    veryHigh: "#0d2444",  // Very dark blue (large)
  },
  power: {
    veryLow: "#c01c28",   // Dark red (severe shortage)
    low: "#ff7800",       // Orange (shortage)
    medium: "#f5c211",    // Yellow (near balance)
    high: "#57e389",      // Bright green (surplus)
    veryHigh: "#26a269",  // Dark green (large surplus)
  },
  stability: {
    veryLow: "#c01c28",   // Dark red (critical)
    low: "#ff7800",       // Orange (warning)
    medium: "#f5c211",    // Yellow (ok)
    high: "#62a0ea",      // Blue (good)
    veryHigh: "#26a269",  // Green (excellent)
  },
  alliance: {
    notAllied: "#1a1a2e", // Dark/black for non-alliance
    allied: "#26a269",    // Green for alliance members
  },
  allianceHappiness: {
    veryLow: "#c01c28",   // Dark red (very unhappy ~30%)
    low: "#ff7800",       // Orange (unhappy)
    medium: "#f5c211",    // Yellow (neutral)
    high: "#57e389",      // Light green (happy)
    veryHigh: "#26a269",  // Dark green (very happy ~90%)
    notAllied: "#1a1a2e", // Dark/black for non-alliance
  },
};

const creditsEl = document.getElementById("credits");
const temperatureEl = document.getElementById("temperature");
const co2El = document.getElementById("co2");
const dateEl = document.getElementById("date");
const incomeEl = document.getElementById("income");
const netCo2El = document.getElementById("net-co2");
const feedbackStatEl = document.getElementById("feedback");
const totalProjectsEl = document.getElementById("total-projects");
const researchPointsEl = document.getElementById("research-points");
const campaignsEl = document.getElementById("campaigns");
const disastersEl = document.getElementById("disasters");
const tippingCountEl = document.getElementById("tipping-count");
const yearsLeftEl = document.getElementById("years-left");
const nextMonthButton = document.getElementById("next-month");
const advanceYearButton = document.getElementById("advance-year");
const howToPlayButton = document.getElementById("how-to-play-button");
const restartButton = document.getElementById("restart-button");
const selectedRegionEl = document.getElementById("selected-region");
const projectButtonsEl = document.getElementById("project-buttons");
const regionProjectsEl = document.getElementById("region-projects");
const newsLogEl = document.getElementById("news-log");
const mapObject = document.getElementById("map-object");
const statsInfoToggle = document.getElementById("stats-info-toggle");
const statsInfoPanel = document.getElementById("stats-info");
const statsStrip = document.getElementById("stats-strip");
const emissionsBreakdownEl = document.getElementById("emissions-breakdown");
const effectivenessPanelEl = document.getElementById("effectiveness-panel");
const regionFactEl = document.getElementById("region-fact");
const mapModeSelector = document.getElementById("map-mode");
const mapLegendEl = document.getElementById("map-legend");
const regionIncomeEl = document.getElementById("region-income");
const underConstructionEl = document.getElementById("under-construction");

function loadMapColors() {
  const styles = getComputedStyle(document.documentElement);
  mapColors = {
    good: styles.getPropertyValue("--region-good").trim(),
    mild: styles.getPropertyValue("--region-mild").trim(),
    warm: styles.getPropertyValue("--region-warm").trim(),
    hot: styles.getPropertyValue("--region-hot").trim(),
  };
}

function calculateTemperature(co2) {
  // T(c) = c * 0.0105 - 3.37
  return co2 * GAME_CONFIG.tempFactor + GAME_CONFIG.tempOffset;
}

/**
 * Calculate projected monthly income based on current state
 * Used to display income in stats bar - mirrors nextMonth() calculation
 */
function calculateProjectedIncome() {
  // Use calculateIncomeBreakdown which properly handles all granularity levels
  // and includes all income sources (climate budget, carbon tax, projects)
  const breakdown = calculateIncomeBreakdown();
  return breakdown.netTotal;
}

/**
 * Calculate diminishing returns multiplier for project stacking
 * Each additional project of the same type is 15% less effective
 * 1st = 100%, 2nd = 85%, 3rd = 72%, 4th = 61%, etc.
 */
function getStackingMultiplier(projectIndex) {
  return Math.pow(0.85, projectIndex);
}

/**
 * Calculate net CO2 change rate per month
 * Combines base increase, actual carbon removal projects, and feedback effects
 *
 * IMPORTANT: Power projects (solar, wind, nuclear, etc.) have co2Reduction: 0
 * because they only reduce emissions when REPLACING fossil fuels.
 * That reduction is calculated in calculateRegionEmissions() based on retired fossil capacity.
 *
 * Only actual carbon REMOVAL projects (forest, carbonCapture) directly reduce CO2 here.
 */
function calculateNetCO2Rate() {
  if (!state?.regions) {
    return 0;
  }
  let rate = getCo2IncreaseRate();

  // Count projects by type across all regions for diminishing returns
  const projectCountByType = {};

  // Subtract CO2 reductions ONLY from actual carbon removal projects (not power)
  // Power projects reduce emissions by replacing fossil fuels, tracked separately
  Object.values(state.regions).forEach(region => {
    region.projects.forEach(proj => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];

      // Only apply CO2 reduction for non-power projects (forest, carbonCapture)
      // Power projects have co2Reduction: 0 - their effect comes from fossil retirement
      if (project && project.co2Reduction && project.category !== "power") {
        // Initialize count for this project type if needed
        if (!projectCountByType[projectType]) {
          projectCountByType[projectType] = 0;
        }
        // Get stacking multiplier based on how many of this type we've already counted
        const stackMult = getStackingMultiplier(projectCountByType[projectType]);
        projectCountByType[projectType]++;

        // Apply both effect multiplier and stacking multiplier
        rate -= project.co2Reduction * effectMult * stackMult;
      }
    });
  });

  // Add feedback loop effects
  rate += getTotalClimateFeedback();

  return rate;
}

/**
 * Count total projects across all regions
 */
function countTotalProjects() {
  let count = 0;
  Object.values(state.regions).forEach(region => {
    count += region.projects.length;
  });
  return count;
}

/**
 * Count total active disasters across all regions
 */
function countActiveDisasters() {
  // state.activeDisasters is an array of disaster objects
  return state.activeDisasters?.length || 0;
}

function getRegionIds() {
  if (availableRegionIds.length) {
    return availableRegionIds;
  }
  return Object.keys(DEFAULT_REGION_NAMES);
}

function getRegionName(regionId) {
  return regionNames[regionId] || DEFAULT_REGION_NAMES[regionId] || regionId;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
}

function getRegionOffset(regionId) {
  if (currentGranularity === "continents" && DEFAULT_REGION_OFFSETS[regionId] !== undefined) {
    return DEFAULT_REGION_OFFSETS[regionId];
  }
  const seed = hashString(regionId);
  return ((seed % 1000) / 1000 - 0.5) * 0.5;
}

function getRegionLabelFromElement(regionEl) {
  if (!regionEl) {
    return "";
  }
  const directTitle = regionEl.getAttribute("title");
  if (directTitle) {
    return directTitle.trim();
  }
  const titleEl = regionEl.querySelector("title");
  if (titleEl && titleEl.textContent) {
    return titleEl.textContent.trim();
  }
  return regionEl.id || "";
}

function parseGeoViewBox() {
  if (!svgDoc) {
    return null;
  }
  const raw = svgDoc.documentElement.getAttribute("mapsvg:geoViewBox");
  if (!raw) {
    return null;
  }
  const parts = raw.trim().split(/\s+/).map((value) => Number(value));
  if (parts.length < 4 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }
  return {
    minLon: parts[0],
    maxLat: parts[1],
    maxLon: parts[2],
    minLat: parts[3],
  };
}

function parseSvgSize() {
  if (!svgDoc) {
    return null;
  }
  const viewBox = svgDoc.documentElement.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/\s+/).map((value) => Number(value));
    if (parts.length === 4 && parts.every((value) => !Number.isNaN(value))) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const width = parseFloat(svgDoc.documentElement.getAttribute("width"));
  const height = parseFloat(svgDoc.documentElement.getAttribute("height"));
  if (!Number.isNaN(width) && !Number.isNaN(height) && width > 0 && height > 0) {
    return { width, height };
  }
  return null;
}

function loadSvgGeoData() {
  svgGeoBounds = parseGeoViewBox() || { ...GEO_DEFAULTS };
  svgSize = parseSvgSize();
  regionGeoCache = new Map();
}

function getRegionGeoCenter(regionEl) {
  if (!regionEl || !svgGeoBounds || !svgSize) {
    return null;
  }
  const regionId = regionEl.id;
  if (regionGeoCache.has(regionId)) {
    return regionGeoCache.get(regionId);
  }
  let bbox;
  try {
    bbox = regionEl.getBBox();
  } catch (error) {
    return null;
  }
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const lon = svgGeoBounds.minLon + (centerX / svgSize.width) * (svgGeoBounds.maxLon - svgGeoBounds.minLon);
  const lat = svgGeoBounds.maxLat - (centerY / svgSize.height) * (svgGeoBounds.maxLat - svgGeoBounds.minLat);
  const geo = { lon, lat };
  regionGeoCache.set(regionId, geo);
  return geo;
}

function getContinentId(geo) {
  const { lon, lat } = geo;
  if (lon < -30) {
    return lat >= GEO_THRESHOLDS.americasSplitLat ? "north_america" : "south_america";
  }
  if (lon < 60) {
    return lat >= GEO_THRESHOLDS.europeContinentLat ? "europe" : "africa";
  }
  if (lon >= GEO_THRESHOLDS.oceaniaLon && lat <= GEO_THRESHOLDS.oceaniaSouthLat) {
    return "oceania";
  }
  if (lon >= GEO_THRESHOLDS.oceaniaEastLon && lat <= GEO_THRESHOLDS.oceaniaNorthLat) {
    return "oceania";
  }
  if (lon >= GEO_THRESHOLDS.oceaniaIslandLon && lat <= GEO_THRESHOLDS.oceaniaIslandLat) {
    return "oceania";
  }
  return "asia";
}

function getMacroRegionId(continent, geo) {
  const { lon, lat } = geo;
  // Use naming consistent with CLIMATE_DATA.MAJOR_REGIONS
  switch (continent) {
    case "north_america":
      if (lat < GEO_THRESHOLDS.centralAmericaLat) {
        return "central_america_caribbean";
      }
      return "north_america";
    case "south_america":
      return "south_america";
    case "europe":
      if (lat >= GEO_THRESHOLDS.europeNorthLat) {
        return "northern_europe";
      }
      if (lat < GEO_THRESHOLDS.europeSouthLat) {
        return "southern_europe";
      }
      if (lon < GEO_THRESHOLDS.europeWestLon) {
        return "western_europe";
      }
      return "eastern_europe";
    case "africa":
      return lat >= GEO_THRESHOLDS.africaNorthLat ? "north_africa" : "sub_saharan_africa";
    case "asia":
      if (lon < GEO_THRESHOLDS.asiaWestLon) {
        return "west_asia";
      }
      if (lon < GEO_THRESHOLDS.asiaCentralLon && lat >= GEO_THRESHOLDS.asiaNorthLat) {
        return "central_asia";
      }
      if (lat < GEO_THRESHOLDS.asiaSouthLat) {
        return "south_asia";
      }
      if (lon >= GEO_THRESHOLDS.asiaEastLon) {
        return "east_asia";
      }
      return "southeast_asia";
    case "oceania":
      return "oceania";
    default:
      return continent;
  }
}

function getRegionalRegionId(continent, geo) {
  const { lon, lat } = geo;
  // Use naming consistent with CLIMATE_DATA conventions
  switch (continent) {
    case "north_america":
      if (lat >= GEO_THRESHOLDS.northAmericaLat) {
        return "north_america_north";
      }
      if (lat >= GEO_THRESHOLDS.centralAmericaLat) {
        return lon < GEO_THRESHOLDS.northAmericaWestLon ? "north_america_west" : "north_america_east";
      }
      return lon < GEO_THRESHOLDS.caribbeanLon ? "central_america_caribbean" : "caribbean";
    case "south_america":
      return lat >= GEO_THRESHOLDS.southAmericaSplitLat ? "south_america_north" : "south_america_south";
    case "europe":
      if (lat >= GEO_THRESHOLDS.europeNorthLat) {
        return "northern_europe";
      }
      if (lat < GEO_THRESHOLDS.europeSouthLat) {
        return "southern_europe";
      }
      if (lon < GEO_THRESHOLDS.europeWestLon) {
        return "western_europe";
      }
      if (lon < GEO_THRESHOLDS.europeCentralLon) {
        return "central_europe";
      }
      return "eastern_europe";
    case "africa":
      if (lat >= GEO_THRESHOLDS.africaNorthLat) {
        return "north_africa";
      }
      if (lat < GEO_THRESHOLDS.africaSouthLat) {
        return "southern_africa";
      }
      if (lon < GEO_THRESHOLDS.africaWestLon) {
        return "west_africa";
      }
      if (lon > GEO_THRESHOLDS.africaEastLon) {
        return "east_africa";
      }
      return "central_africa";
    case "asia":
      if (lon < GEO_THRESHOLDS.asiaWestLon) {
        return "west_asia";
      }
      if (lon < GEO_THRESHOLDS.asiaCentralLon && lat >= GEO_THRESHOLDS.asiaNorthLat) {
        return "central_asia";
      }
      if (lat < GEO_THRESHOLDS.asiaSouthLat) {
        return "south_asia";
      }
      if (lon >= GEO_THRESHOLDS.asiaEastLon) {
        return "east_asia";
      }
      return "southeast_asia";
    case "oceania":
      return lon < GEO_THRESHOLDS.oceaniaEastLon && lat < GEO_THRESHOLDS.oceaniaSouthLat
        ? "oceania_australia"
        : "oceania_pacific";
    default:
      return continent;
  }
}

function getSubregionalRegionId(continent, geo) {
  const { lon, lat } = geo;
  switch (continent) {
    case "north_america":
      if (lat >= GEO_THRESHOLDS.northAmericaLat) {
        return lon < GEO_THRESHOLDS.northAmericaWestLon ? "north_america_northwest" : "north_america_northeast";
      }
      if (lat >= GEO_THRESHOLDS.centralAmericaLat) {
        return lon < GEO_THRESHOLDS.northAmericaWestLon ? "north_america_southwest" : "north_america_southeast";
      }
      return lon < GEO_THRESHOLDS.caribbeanLon ? "central_america" : "caribbean";
    case "south_america": {
      const northSouth = lat >= GEO_THRESHOLDS.southAmericaSplitLat ? "north" : "south";
      const westEast = lon < GEO_THRESHOLDS.southAmericaWestLon ? "west" : "east";
      return `south_america_${northSouth}${westEast}`;
    }
    case "europe":
      if (lat >= GEO_THRESHOLDS.europeNorthLat) {
        return lon < GEO_THRESHOLDS.europeCentralLon ? "europe_northwest" : "europe_northeast";
      }
      if (lat < GEO_THRESHOLDS.europeSouthLat) {
        return lon < GEO_THRESHOLDS.europeCentralLon ? "europe_southwest" : "europe_southeast";
      }
      if (lon < GEO_THRESHOLDS.europeWestLon) {
        return "europe_west";
      }
      if (lon < GEO_THRESHOLDS.europeCentralLon) {
        return "europe_central";
      }
      return "europe_east";
    case "africa":
      if (lat >= GEO_THRESHOLDS.africaNorthLat) {
        return lon < GEO_THRESHOLDS.africaEastLon ? "africa_northwest" : "africa_northeast";
      }
      if (lat < GEO_THRESHOLDS.africaSouthLat) {
        return lon < GEO_THRESHOLDS.africaEastLon ? "africa_southwest" : "africa_southeast";
      }
      if (lon < GEO_THRESHOLDS.africaWestLon) {
        return "africa_west";
      }
      if (lon > GEO_THRESHOLDS.africaEastLon) {
        return "africa_east";
      }
      return "africa_central";
    case "asia":
      if (lon < GEO_THRESHOLDS.asiaWestLon) {
        return "asia_west";
      }
      if (lon < GEO_THRESHOLDS.asiaCentralLon && lat >= GEO_THRESHOLDS.asiaNorthLat) {
        return "asia_central";
      }
      if (lat < GEO_THRESHOLDS.asiaSouthLat) {
        return "asia_south";
      }
      if (lon >= GEO_THRESHOLDS.asiaEastLon && lat >= GEO_THRESHOLDS.asiaNorthLat) {
        return "asia_northeast";
      }
      if (lon >= GEO_THRESHOLDS.asiaEastLon) {
        return "asia_east";
      }
      return "asia_southeast";
    case "oceania":
      return lon < GEO_THRESHOLDS.oceaniaEastLon ? "oceania_australia" : "oceania_pacific";
    default:
      return continent;
  }
}

function getRegionIdForGranularity(regionEl, granularity) {
  const regionId = regionEl?.id;
  if (!regionId) {
    return "";
  }

  // For countries, use the ISO code directly
  if (granularity === "countries") {
    return regionId;
  }

  // Use CLIMATE_DATA mapping for continents and major_regions
  if (window.CLIMATE_DATA?.getParentRegion) {
    const config = GRANULARITY_CONFIG[granularity];
    const level = config?.level || 1;
    const parentRegion = window.CLIMATE_DATA.getParentRegion(regionId, level);
    if (parentRegion) {
      return parentRegion;
    }
  }

  // Fallback to geo-based detection for unmapped countries
  const geo = getRegionGeoCenter(regionEl);
  if (!geo) {
    return "";
  }
  const continent = getContinentId(geo);
  if (granularity === "continents") {
    return continent;
  }
  if (granularity === "major_regions") {
    return getMacroRegionId(continent, geo);
  }
  return regionId;
}

function getRegionLabelForGranularity(regionId, regionEl, granularity) {
  if (granularity === "countries") {
    return getRegionLabelFromElement(regionEl);
  }
  return GRANULARITY_LABELS[granularity]?.[regionId] || regionId;
}

function ensureSvgStyles() {
  if (!svgDoc) {
    return;
  }
  const styleId = "game-region-styles";
  let styleEl = svgDoc.getElementById(styleId);

  if (!styleEl) {
    styleEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.setAttribute("id", styleId);
    svgDoc.documentElement.appendChild(styleEl);
  }

  // At countries level: show light borders between all countries
  // At higher granularity: no individual strokes - region borders applied via filter on groups
  const isCountryLevel = currentGranularity === "countries";
  // At country level: visible borders; at region level: no strokes (filter handles borders)
  const strokeStyle = isCountryLevel ? "#d7e3f5" : "none";
  const strokeWidth = isCountryLevel ? "1.5" : "0";

  // At countries level: use CSS :hover for individual paths
  // At other levels: use .region-hover class applied via JS for group hover
  const hoverSelector = isCountryLevel ? ".region:hover" : ".region.region-hover";

  // Region group styling for outline filter (non-country levels only)
  const regionGroupStyles = isCountryLevel
    ? ""
    : `
    .region-group {
      filter: url(#region-outline-filter);
      pointer-events: auto;
      cursor: pointer;
    }
  `;

  styleEl.textContent = `
    .region {
      fill: #2f4f4f;
      stroke: ${strokeStyle};
      stroke-width: ${strokeWidth};
      cursor: pointer;
      transition: fill 0.2s ease, transform 0.2s ease, stroke 0.2s ease;
      transform-origin: center;
      outline: none;
      pointer-events: auto;
    }
    ${hoverSelector} {
      filter: brightness(1.12);
      transform: translateY(-2px);
    }
    .region:focus,
    .region:focus-visible {
      outline: none !important;
    }
    .region.selected {
      stroke: ${isCountryLevel ? "#d7e3f5" : "rgba(255, 255, 255, 0.6)"};
      stroke-width: ${isCountryLevel ? "1.5" : "1.5"};
      filter: none;
      transform: none;
    }
    ${regionGroupStyles}
  `;

  // Add SVG filter for region outlines at higher granularity
  ensureOutlineFilter();
}

function ensureOutlineFilter() {
  if (!svgDoc) return;

  const filterId = "region-outline-filter";
  let defs = svgDoc.querySelector("defs");

  if (!defs) {
    defs = svgDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgDoc.documentElement.insertBefore(defs, svgDoc.documentElement.firstChild);
  }

  // Remove existing filter if present
  const existingFilter = svgDoc.getElementById(filterId);
  if (existingFilter) {
    existingFilter.remove();
  }

  // Only add outline filter for non-country granularity
  if (currentGranularity === "countries") return;

  // Create outline filter using morphology to expand shape, then composite
  const filter = svgDoc.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", filterId);
  filter.setAttribute("x", "-5%");
  filter.setAttribute("y", "-5%");
  filter.setAttribute("width", "110%");
  filter.setAttribute("height", "110%");

  // Morphology dilate to expand the shape for region borders
  const morphology = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
  morphology.setAttribute("in", "SourceAlpha");
  morphology.setAttribute("operator", "dilate");
  morphology.setAttribute("radius", "1.5");
  morphology.setAttribute("result", "expanded");

  // Flood with outline color - soft lavender, light and distinct from map colors
  const flood = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feFlood");
  flood.setAttribute("flood-color", "#e8daf0");
  flood.setAttribute("result", "color");

  // Composite flood with expanded shape
  const composite1 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feComposite");
  composite1.setAttribute("in", "color");
  composite1.setAttribute("in2", "expanded");
  composite1.setAttribute("operator", "in");
  composite1.setAttribute("result", "outline");

  // Merge outline behind original
  const merge = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feMerge");
  const mergeNode1 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  mergeNode1.setAttribute("in", "outline");
  const mergeNode2 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  mergeNode2.setAttribute("in", "SourceGraphic");
  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);

  filter.appendChild(morphology);
  filter.appendChild(flood);
  filter.appendChild(composite1);
  filter.appendChild(merge);
  defs.appendChild(filter);
}

function applyRegionGrouping() {
  // Only apply grouping for non-country granularity levels
  if (currentGranularity === "countries" || !svgDoc || !svgRegions.size) {
    return;
  }

  // Remove any existing region groups
  const existingGroups = svgDoc.querySelectorAll(".region-group");
  existingGroups.forEach((g) => {
    // Move children back to parent before removing group
    while (g.firstChild) {
      g.parentNode.insertBefore(g.firstChild, g);
    }
    g.remove();
  });

  // Create SVG group elements for each region and apply outline filter
  svgRegions.forEach((paths, regionId) => {
    if (paths.length === 0) return;

    // Create a group element
    const group = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("region-group");
    group.setAttribute("data-region", regionId);

    // Insert group before the first path
    const firstPath = paths[0];
    const parent = firstPath.parentNode;
    parent.insertBefore(group, firstPath);

    // Move all paths for this region into the group
    paths.forEach((path) => {
      group.appendChild(path);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// ALLIANCE SYSTEM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Initialize alliance state for all regions
function initializeAllianceState(regions) {
  const allianceState = {};

  Object.keys(regions).forEach((regionId) => {
    const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
    const diplomatic = regionData?.diplomatic || {
      joinDifficulty: 5,
      baseDemands: ["carbonTaxLimit"],
      personality: "cooperative",
    };

    allianceState[regionId] = {
      status: ALLIANCE_STATUS.NEUTRAL,
      happiness: 70, // Start at content level
      gdpContribution: 1.0, // 100% of their climate finance
      carbonTax: 0,
      demands: [],
      turnsInAlliance: 0,
      isHomeRegion: false,
      hostileUntil: null,
      spentInRegion: 0, // Track spending in this region
      totalContributed: 0, // Track total contribution from this region
      economicProjectCount: 0,
      jobProjectCount: 0,
      hasNuclear: false,
      // Interest system for non-allied regions
      interest: 50, // 0-100, starts at neutral
      interestFactors: {
        globalTemp: 0,
        allianceSuccess: 0,
        neighborInfluence: 0,
        economicBenefit: 0,
        disasterAwareness: 0,
      },
      lastApproached: null, // Month timestamp when last negotiation attempted
      // Terms system (set when joining)
      acceptedTerms: null, // Will hold { climateDedicationMin, climateDedicationMax, powerStabilityGoal, powerSupplyGoal, goalDeadlineYears }
      termCompliance: {}, // Track compliance status for each term
      // Enhanced tracking
      grievances: [], // List of current complaints (for UI display)
      warningTurns: 0, // Turns since warning state started (for leave mechanic)
    };
  });

  return allianceState;
}

// ═══════════════════════════════════════════════════════════════
// INTEREST SYSTEM - For Non-Allied Regions
// ═══════════════════════════════════════════════════════════════

/**
 * Update interest levels for all non-allied regions each turn
 * Interest represents how interested a neutral region is in joining the alliance
 */
function updateRegionInterest() {
  if (!state.alliance) return;

  // Calculate alliance-wide metrics for reference
  const alliedCount = getAlliedRegionsCount();
  const netCO2Rate = calculateNetCO2Rate();
  const isReducingCO2 = netCO2Rate < 0;

  Object.entries(state.alliance).forEach(([regionId, alliance]) => {
    // Only update interest for non-allied regions
    if (alliance.status === ALLIANCE_STATUS.ALLIED) return;

    const factors = alliance.interestFactors;
    let interestChange = 0;

    // Factor 1: Global Temperature - higher temps increase urgency
    const tempFactor = Math.max(0, (state.temperature - 1.2) * 10);
    factors.globalTemp = Math.round(tempFactor);
    interestChange += tempFactor * 0.3; // +3 interest per 1°C above 1.2

    // Factor 2: Alliance Size - bandwagon effect
    const sizeFactor = Math.max(0, (alliedCount - 2) * 2);
    factors.allianceSuccess = Math.round(sizeFactor);
    interestChange += sizeFactor * 0.2; // +0.4 interest per ally above 2

    // Factor 3: Neighbor Influence - allied neighbors increase interest
    const neighborBonus = countAlliedNeighbors(regionId) * 5;
    factors.neighborInfluence = neighborBonus;
    interestChange += neighborBonus * 0.3; // +1.5 interest per allied neighbor

    // Factor 4: Player Success - are we actually reducing CO2?
    if (isReducingCO2) {
      factors.economicBenefit = 10;
      interestChange += 2; // +2 interest if alliance is succeeding
    } else {
      factors.economicBenefit = -5;
      interestChange -= 1; // -1 interest if alliance is failing
    }

    // Factor 5: Recent Disasters - disasters in region increase awareness
    const disasterBonus = getDisasterAwarenessBonus(regionId);
    factors.disasterAwareness = disasterBonus;
    interestChange += disasterBonus * 0.5; // +0.5 per awareness point

    // Factor 6: Hostile regions slowly recover interest (after cooldown)
    if (alliance.status === ALLIANCE_STATUS.HOSTILE) {
      interestChange -= 2; // Hostile regions lose interest over time
    }

    // Apply change with decay toward neutral (50)
    const currentInterest = alliance.interest;
    let newInterest = currentInterest + interestChange;

    // Gentle decay toward 50 if no strong factors
    if (Math.abs(interestChange) < 1) {
      if (currentInterest > 50) newInterest -= 0.5;
      else if (currentInterest < 50) newInterest += 0.5;
    }

    // Clamp to 0-100
    alliance.interest = Math.max(0, Math.min(100, Math.round(newInterest)));
  });
}

/**
 * Count how many allied neighbors a region has
 */
function countAlliedNeighbors(regionId) {
  // Define neighbor relationships based on geography
  const neighbors = getRegionNeighbors(regionId);
  let count = 0;

  neighbors.forEach(neighborId => {
    if (state.alliance?.[neighborId]?.status === ALLIANCE_STATUS.ALLIED) {
      count++;
    }
  });

  return count;
}

/**
 * Get list of neighboring regions for a given region
 * This is a simplified geographic adjacency map
 */
function getRegionNeighbors(regionId) {
  // Continent-level neighbors
  const continentNeighbors = {
    europe: ["asia", "africa"],
    asia: ["europe", "africa", "oceania"],
    africa: ["europe", "asia"],
    north_america: ["south_america"],
    south_america: ["north_america"],
    oceania: ["asia"],
  };

  // Major region neighbors
  const majorRegionNeighbors = {
    western_europe: ["northern_europe", "southern_europe", "eastern_europe"],
    northern_europe: ["western_europe", "eastern_europe"],
    southern_europe: ["western_europe", "eastern_europe", "north_africa"],
    eastern_europe: ["western_europe", "northern_europe", "southern_europe", "west_asia", "central_asia"],
    north_africa: ["southern_europe", "sub_saharan_africa", "west_asia"],
    sub_saharan_africa: ["north_africa"],
    west_asia: ["eastern_europe", "south_asia", "central_asia", "north_africa"],
    central_asia: ["eastern_europe", "west_asia", "south_asia", "east_asia"],
    south_asia: ["west_asia", "central_asia", "southeast_asia", "east_asia"],
    east_asia: ["central_asia", "south_asia", "southeast_asia"],
    southeast_asia: ["south_asia", "east_asia", "oceania"],
    north_america: ["central_america"],
    central_america: ["north_america", "south_america"],
    south_america: ["central_america"],
    oceania: ["southeast_asia"],
  };

  // Check which neighbor map to use
  if (continentNeighbors[regionId]) {
    return continentNeighbors[regionId];
  }
  if (majorRegionNeighbors[regionId]) {
    return majorRegionNeighbors[regionId];
  }

  // For country-level, try to infer from continent
  const climateData = getClimateDataForRegion(regionId);
  if (climateData?.continent) {
    // Return other regions in same continent as neighbors
    return [climateData.continent];
  }

  return [];
}

/**
 * Get disaster awareness bonus for a region (based on recent disasters)
 */
function getDisasterAwarenessBonus(regionId) {
  const awarenessData = state.disasterHistory?.[regionId];
  if (!awarenessData) return 0;

  // awareness decays over time, but recent disasters provide bonus
  return Math.min(20, awarenessData.awareness || 0);
}

/**
 * Get interest level label for UI display
 */
function getInterestLabel(interest) {
  if (interest >= INTEREST_THRESHOLDS.VERY_HIGH) return "Very High";
  if (interest >= INTEREST_THRESHOLDS.HIGH) return "High";
  if (interest >= INTEREST_THRESHOLDS.MODERATE) return "Moderate";
  if (interest >= INTEREST_THRESHOLDS.LOW) return "Low";
  return "Very Low";
}

/**
 * Get CSS class for interest level
 */
function getInterestClass(interest) {
  if (interest >= INTEREST_THRESHOLDS.VERY_HIGH) return "interest-very-high";
  if (interest >= INTEREST_THRESHOLDS.HIGH) return "interest-high";
  if (interest >= INTEREST_THRESHOLDS.MODERATE) return "interest-moderate";
  if (interest >= INTEREST_THRESHOLDS.LOW) return "interest-low";
  return "interest-very-low";
}

// ==================== SETUP MODE ====================

// Enter setup mode for initial game configuration
function enterSetupMode() {
  isSetupMode = true;
  mapDebug('[Map] Entered setup mode, isSetupMode:', isSetupMode);
  selectedRegionId = null;

  // Add setup mode class to body for CSS control
  document.body.classList.add("setup-mode");

  // Show setup panel, hide game panel and header controls
  const setupPanel = document.getElementById("setup-panel");
  const gamePanel = document.getElementById("game-panel");
  const headerControls = document.getElementById("header-controls");
  if (setupPanel) setupPanel.style.display = "block";
  if (gamePanel) gamePanel.style.display = "none";
  if (headerControls) headerControls.style.display = "none";

  // Update UI for setup mode
  updateSetupUI();
  updateMapColors();
  updateMapLegend();

  // Reset top bar displays to initial/default values
  if (creditsEl) creditsEl.textContent = formatCurrency(GAME_CONFIG.startingFunds);
  if (temperatureEl) temperatureEl.textContent = `+${GAME_CONFIG.startingTemp.toFixed(2)}°C`;
  if (co2El) co2El.textContent = `${GAME_CONFIG.startingCo2.toFixed(1)} ppm`;
  if (dateEl) dateEl.textContent = `${MONTHS[GAME_CONFIG.startMonth - 1]} ${GAME_CONFIG.startYear}`;

  // Reset CO2 rate display
  const co2RateEl = document.querySelector('.co2-rate');
  if (co2RateEl) co2RateEl.textContent = '+0.00/mo';

  // Reset income display
  const incomeDisplayEl = document.getElementById('income-display');
  if (incomeDisplayEl) {
    incomeDisplayEl.textContent = '+$0.0 B/mo';
    incomeDisplayEl.classList.remove('income-negative');
  }

  // Reset RP display
  const rpDisplayEl = document.getElementById('rp-display');
  if (rpDisplayEl) rpDisplayEl.textContent = '0/0';

  // Reset header secondary stats to initial values
  const allianceProgressEl = document.getElementById('alliance-progress');
  if (allianceProgressEl) allianceProgressEl.textContent = '0/6';

  const projectsDisplayEl = document.getElementById('projects-display');
  if (projectsDisplayEl) projectsDisplayEl.textContent = '0';

  const buildingDisplayEl = document.getElementById('building-display');
  if (buildingDisplayEl) buildingDisplayEl.textContent = '0';

  const captureRateEl = document.getElementById('capture-rate');
  if (captureRateEl) captureRateEl.textContent = '0';

  const techDisplayEl = document.getElementById('tech-display');
  if (techDisplayEl) techDisplayEl.textContent = '0/19';

  const riskDisplayEl = document.getElementById('risk-display');
  if (riskDisplayEl) riskDisplayEl.textContent = '0';

  // Reset Global Status panel to initial values
  renderGlobalStatsCardSetup();
}

// Update setup UI when a region is selected
function updateSetupUI() {
  const setupSelectedRegion = document.getElementById("setup-selected-region");
  const confirmBtn = document.getElementById("confirm-setup-btn");

  if (!setupSelectedRegion || !confirmBtn) return;

  if (!selectedRegionId) {
    setupSelectedRegion.innerHTML = `<p class="no-selection">No region selected. Click on the map to choose.</p>`;
    confirmBtn.disabled = true;
    return;
  }

  // Get region data
  const regionName = getRegionName(selectedRegionId);
  const climateData = getClimateDataForRegion(selectedRegionId);
  const region = state?.regions?.[selectedRegionId];

  // Build region info HTML
  let html = `
    <div class="setup-region-info">
      <h3>${regionName}</h3>
      <div class="setup-stats">
  `;

  if (climateData) {
    const diplomatic = climateData.diplomatic || {};
    const difficultyStars = "★".repeat(diplomatic.joinDifficulty || 5);
    const emptyStars = "☆".repeat(10 - (diplomatic.joinDifficulty || 5));

    html += `
      <div class="stat-row">
        <span class="stat-label">GDP:</span>
        <span class="stat-value">$${(climateData.gdp || 0).toFixed(1)}T</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Base Income:</span>
        <span class="stat-value">$${climateData.baseIncome || 0}B/month</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Join Difficulty:</span>
        <span class="stat-value difficulty">${difficultyStars}${emptyStars}</span>
      </div>
    `;

    if (diplomatic.personality) {
      html += `
        <div class="stat-row">
          <span class="stat-label">Personality:</span>
          <span class="stat-value personality-${diplomatic.personality}">${diplomatic.personality.charAt(0).toUpperCase() + diplomatic.personality.slice(1)}</span>
        </div>
      `;
    }

    if (diplomatic.description) {
      html += `<p class="region-description">${diplomatic.description}</p>`;
    }
  }

  // Add temperature info
  if (region) {
    html += `
      <div class="stat-row">
        <span class="stat-label">Temperature:</span>
        <span class="stat-value">+${region.temp.toFixed(2)}°C</span>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  setupSelectedRegion.innerHTML = html;
  confirmBtn.disabled = false;
}

// Confirm setup and start the actual game
function confirmSetupAndStartGame() {
  if (!selectedRegionId) return;

  // Save the selected region before initGame() clears it
  const homeRegion = selectedRegionId;

  // Reinitialize game state with current granularity's region IDs
  // This ensures state.regions matches availableRegionIds when granularity changed in setup
  initGame();

  // Set this region as home and allied
  state.homeRegion = homeRegion;
  state.alliance[homeRegion] = {
    ...state.alliance[homeRegion],
    status: ALLIANCE_STATUS.ALLIED,
    happiness: 100, // Start at max happiness for home region
    isHomeRegion: true,
    turnsInAlliance: 1,
    carbonTax: {
      ratePerTon: NEGOTIABLE_TERMS.carbonTaxRate.default,
      yearlyGrowthRate: NEGOTIABLE_TERMS.carbonTaxGrowth.default,
    },
  };

  // Exit setup mode
  isSetupMode = false;
  mapDebug('[Map] Game started, isSetupMode:', isSetupMode);

  // Remove setup mode class from body
  document.body.classList.remove("setup-mode");

  // Show game panel, header controls, and sidebar tabs, hide setup panel
  const setupPanel = document.getElementById("setup-panel");
  const gamePanel = document.getElementById("game-panel");
  const headerControls = document.getElementById("header-controls");
  if (setupPanel) setupPanel.style.display = "none";
  if (gamePanel) gamePanel.style.display = "block";
  if (headerControls) headerControls.style.display = "flex";
  showSidebarTabs();

  // Get region name for message
  const regionName = getRegionName(homeRegion);

  clearNews();
  const difficulty = getDifficulty();
  pushMessage(`${regionName} has joined your Climate Alliance as your home region!`);
  pushMessage(`Global initiative launched on ${difficulty.name} difficulty.`);
  pushMessage(`Recruit more regions to grow your alliance and combat climate change.`);

  updateUI();
  updateMapLegend();
  updateAllianceMapVisuals();
  saveGame();

  // Start tutorial if tutorial difficulty is selected
  if (currentDifficulty === "tutorial") {
    // Small delay to let UI fully render before tutorial starts
    setTimeout(() => {
      startTutorial();
    }, 500);
  }
}

// Check if a region is allied
function isRegionAllied(regionId) {
  return state.alliance?.[regionId]?.status === ALLIANCE_STATUS.ALLIED;
}

// Check if a region is hostile (can't negotiate)
function isRegionHostile(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status !== ALLIANCE_STATUS.HOSTILE) {
    return false;
  }
  // Check if cooldown has passed
  if (alliance.hostileUntil) {
    const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
    if (currentMonth >= alliance.hostileUntil) {
      // Cooldown passed, reset to neutral
      alliance.status = ALLIANCE_STATUS.NEUTRAL;
      alliance.hostileUntil = null;
      return false;
    }
  }
  return true;
}

// Get allied regions count
function getAlliedRegionsCount() {
  if (!state.alliance) return 0;
  return Object.values(state.alliance).filter(
    (a) => a.status === ALLIANCE_STATUS.ALLIED
  ).length;
}

// Update map visuals based on alliance status
function updateAllianceMapVisuals() {
  const mapObject = document.getElementById("map-object");
  const svg = mapObject?.contentDocument?.querySelector("svg");
  if (!svg) return;

  Object.entries(state.alliance || {}).forEach(([regionId, alliance]) => {
    const group = svg.querySelector(`g[data-region="${regionId}"]`);
    if (!group) return;

    // Remove existing alliance classes
    group.classList.remove("allied", "neutral", "hostile", "negotiating");

    // Add new class based on status
    group.classList.add(alliance.status);

    // Update paths within the group for coloring
    const paths = group.querySelectorAll("path");
    paths.forEach((path) => {
      path.classList.remove("allied-region", "neutral-region", "hostile-region", "negotiating-region");
      path.classList.add(`${alliance.status}-region`);
    });
  });
}

// Check term compliance for an allied region
function checkTermCompliance(regionId, alliance) {
  const terms = alliance.acceptedTerms;
  if (!terms) return { compliant: true, details: {} };

  const region = state.regions?.[regionId];
  // Get climate data using direct methods (granularity-independent)
  // Try continent, then major region, then country
  const climateData = CLIMATE_DATA.getContinentData?.(regionId) ||
                      CLIMATE_DATA.getMajorRegionData?.(regionId) ||
                      CLIMATE_DATA.getCountryByIso?.(regionId) ||
                      CLIMATE_DATA.COUNTRY_DATA?.[regionId];
  const details = {};

  // Check climate dedication minimum (% of GDP dedicated to climate action)
  if (terms.climateDedicationMin !== undefined) {
    const currentDedication = climateData?.climateFinance?.currentPercent || 3;
    const compliant = currentDedication >= terms.climateDedicationMin;

    details.climateDedicationMin = {
      compliant,
      required: terms.climateDedicationMin,
      actual: currentDedication.toFixed(1),
      reason: `Climate dedication: ${currentDedication.toFixed(1)}% vs ${terms.climateDedicationMin}% minimum`,
    };
  }

  // Check climate dedication maximum (% of GDP dedicated to climate action)
  if (terms.climateDedicationMax !== undefined) {
    const currentDedication = climateData?.climateFinance?.currentPercent || 3;
    const compliant = currentDedication <= terms.climateDedicationMax;

    details.climateDedicationMax = {
      compliant,
      required: terms.climateDedicationMax,
      actual: currentDedication.toFixed(1),
      reason: `Climate dedication: ${currentDedication.toFixed(1)}% vs ${terms.climateDedicationMax}% maximum`,
    };
  }

  // Check power stability goal progress
  if (terms.powerStabilityGoal !== undefined) {
    const currentStability = region?.power?.stability || 70;
    const yearsInAlliance = alliance.turnsInAlliance / 12;
    const deadlineYears = terms.goalDeadlineYears || 15;

    // Calculate progress ratio (how much time has passed vs deadline)
    const timeProgress = Math.min(1, yearsInAlliance / deadlineYears);

    // Check if stability meets goal, or if we're on track (linear progress)
    const startingStability = alliance.startingStability || 70;
    const neededProgress = terms.powerStabilityGoal - startingStability;
    const expectedStability = startingStability + (neededProgress * timeProgress);

    // Compliant if at goal OR making good progress (within 10% of expected)
    const compliant = currentStability >= terms.powerStabilityGoal ||
                      currentStability >= expectedStability - 10;

    details.powerStabilityGoal = {
      compliant,
      required: terms.powerStabilityGoal,
      actual: currentStability.toFixed(0),
      reason: `Grid stability: ${currentStability.toFixed(0)}% vs ${terms.powerStabilityGoal}% goal`,
    };
  }

  // Check power supply goal progress (supply/demand ratio)
  if (terms.powerSupplyGoal !== undefined) {
    const supply = region?.power?.supply || 100;
    const demand = region?.power?.demand || 100;
    const supplyRatio = demand > 0 ? (supply / demand) * 100 : 100;

    const yearsInAlliance = alliance.turnsInAlliance / 12;
    const deadlineYears = terms.goalDeadlineYears || 15;
    const timeProgress = Math.min(1, yearsInAlliance / deadlineYears);

    // Check if supply ratio meets goal, or if we're on track
    const startingRatio = alliance.startingSupplyRatio || 85;
    const neededProgress = terms.powerSupplyGoal - startingRatio;
    const expectedRatio = startingRatio + (neededProgress * timeProgress);

    const compliant = supplyRatio >= terms.powerSupplyGoal ||
                      supplyRatio >= expectedRatio - 5;

    details.powerSupplyGoal = {
      compliant,
      required: terms.powerSupplyGoal,
      actual: supplyRatio.toFixed(0),
      reason: `Power supply: ${supplyRatio.toFixed(0)}% vs ${terms.powerSupplyGoal}% goal`,
    };
  }

  // Check deadline - if past deadline, goals MUST be met
  if (terms.goalDeadlineYears !== undefined) {
    const yearsInAlliance = alliance.turnsInAlliance / 12;
    const deadlineReached = yearsInAlliance >= terms.goalDeadlineYears;

    if (deadlineReached) {
      // Override compliance - must meet actual goals
      if (details.powerStabilityGoal) {
        const currentStability = region?.power?.stability || 70;
        details.powerStabilityGoal.compliant = currentStability >= terms.powerStabilityGoal;
      }
      if (details.powerSupplyGoal) {
        const supply = region?.power?.supply || 100;
        const demand = region?.power?.demand || 100;
        const supplyRatio = demand > 0 ? (supply / demand) * 100 : 100;
        details.powerSupplyGoal.compliant = supplyRatio >= terms.powerSupplyGoal;
      }
    }

    details.goalDeadline = {
      compliant: !deadlineReached || (details.powerStabilityGoal?.compliant !== false && details.powerSupplyGoal?.compliant !== false),
      required: terms.goalDeadlineYears,
      actual: yearsInAlliance.toFixed(1),
      reason: deadlineReached ? `Deadline reached (${terms.goalDeadlineYears} years)` : `${(terms.goalDeadlineYears - yearsInAlliance).toFixed(1)} years remaining`,
    };
  }

  const allCompliant = Object.values(details).every(d => d.compliant);
  return { compliant: allCompliant, details };
}

// Helper to count specific project types in a region
function countProjectsInRegion(regionId, projectTypes) {
  if (!state.projects) return 0;
  return Object.values(state.projects).filter(
    p => p.region === regionId && projectTypes.some(type => p.projectId.toLowerCase().includes(type))
  ).length;
}

// Helper to calculate current emissions for a region (for alliance calculations)
// Note: For emissions with retired fossil tracking, use calculateRegionEmissions() at line ~872
function calculateAllianceRegionEmissions(regionId) {
  // Use the region's tracked emissions from alliance state, or fallback to baseline
  const alliance = state.alliance?.[regionId];
  if (alliance?.currentEmissions !== undefined) {
    return alliance.currentEmissions;
  }

  // Fallback: Use the main calculateRegionEmissions which accounts for retired fossil
  return calculateRegionEmissions(regionId);
}

// Calculate carbon intensity improvement for a region (% improvement vs baseline)
function calculateCarbonIntensityImprovement(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const alliance = state.alliance?.[regionId];
  if (!regionData) return 0;

  const baselineEmissions = regionData?.co2EmissionsBaseline || 0;
  const currentEmissions = calculateRegionEmissions(regionId);
  const baselineGdp = regionData?.gdp || 1;
  const currentGdp = alliance?.gdp || baselineGdp;

  if (baselineGdp <= 0 || baselineEmissions <= 0) return 0;

  const baseIntensity = baselineEmissions / baselineGdp;
  const currentIntensity = currentEmissions / currentGdp;
  const improvement = ((baseIntensity - currentIntensity) / baseIntensity) * 100;

  return Math.max(0, improvement); // Can't be negative
}

// Calculate alliance average carbon intensity improvement
function calculateAllianceAvgIntensityReduction() {
  if (!state.alliance) return 0;

  let totalImprovement = 0;
  let allyCount = 0;

  Object.entries(state.alliance).forEach(([regionId, alliance]) => {
    if (alliance.status === ALLIANCE_STATUS.ALLIED) {
      totalImprovement += calculateCarbonIntensityImprovement(regionId);
      allyCount++;
    }
  });

  return allyCount > 0 ? totalImprovement / allyCount : 0;
}

// Update happiness for all allied regions and handle leaving
function updateAllianceHappiness() {
  if (!state.alliance) return;

  const alliedCount = getAlliedRegionsCount();
  const regionsToLeave = [];

  // Calculate alliance average for equal contribution comparison
  const allianceAvgImprovement = calculateAllianceAvgIntensityReduction();

  Object.entries(state.alliance).forEach(([regionId, alliance]) => {
    if (alliance.status !== ALLIANCE_STATUS.ALLIED) return;

    let happinessChange = 0;
    const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
    const regionName = regionData?.name || regionId;

    // DECREASE factors

    // High carbon tax hurts happiness
    if (alliance.carbonTax > 30) {
      happinessChange -= (alliance.carbonTax - 30) * 0.2;
    }

    // Not spending their money back in their region
    const spendRatio = alliance.totalContributed > 0
      ? alliance.spentInRegion / alliance.totalContributed
      : 0.5; // Default if no contribution yet
    alliance.spendRatio = spendRatio;
    if (spendRatio < 0.3) {
      happinessChange -= 5;
    }

    // Unmet demands
    const unmetDemands = alliance.demands.filter(d => {
      const demandType = DEMAND_TYPES[d.type];
      return demandType && !demandType.check(alliance, d.value);
    });
    happinessChange -= unmetDemands.length * 3;

    // Term compliance checking (for regions that joined with terms)
    if (alliance.acceptedTerms) {
      const complianceResult = checkTermCompliance(regionId, alliance);
      alliance.termCompliance = complianceResult.details;

      // -3 happiness per failed term
      const failedTerms = Object.values(complianceResult.details).filter(t => !t.compliant).length;
      if (failedTerms > 0) {
        happinessChange -= failedTerms * 3;

        // Track grievances for failed terms
        if (!alliance.grievances) alliance.grievances = [];
        const newGrievances = Object.entries(complianceResult.details)
          .filter(([key, detail]) => !detail.compliant)
          .map(([key, detail]) => detail.reason);
        alliance.grievances = newGrievances; // Replace with current grievances
      } else {
        alliance.grievances = [];
      }
    }

    // Equal contribution factor (CO2/GDP - carbon intensity improvement)
    // Regions that aren't pulling their weight compared to alliance average get unhappy
    if (allianceAvgImprovement > 0 && alliedCount > 1) {
      const regionImprovement = calculateCarbonIntensityImprovement(regionId);
      const performanceRatio = regionImprovement / allianceAvgImprovement;

      // Store for UI display
      alliance.carbonIntensityImprovement = regionImprovement;
      alliance.allianceAvgImprovement = allianceAvgImprovement;

      // Happiness impact based on relative performance
      if (performanceRatio < 0.5) {
        // Way below alliance average - region feels neglected
        happinessChange -= 8;
        if (!alliance.grievances) alliance.grievances = [];
        if (!alliance.grievances.includes("Falling behind alliance average on emissions reduction")) {
          alliance.grievances.push("Falling behind alliance average on emissions reduction");
        }
      } else if (performanceRatio < 0.8) {
        // Below average - slight penalty
        happinessChange -= 3;
      } else if (performanceRatio > 1.2) {
        // Above average - they're pulling more weight, slight bonus
        happinessChange += 3;
      }
    }

    // INCREASE factors

    // Loyalty bonus (long-term members)
    if (alliance.turnsInAlliance > 12) {
      happinessChange += 0.5;
    }

    // Safety in numbers (more allies = more stable)
    if (alliedCount > 3) {
      happinessChange += 2;
    }

    // Home region bonus
    if (alliance.isHomeRegion) {
      happinessChange += 1;
    }

    // Power grid happiness impact
    const powerHappiness = calculatePowerHappinessImpact(regionId);
    happinessChange += powerHappiness;

    // GLOBAL factors (affect all regions)

    // Global temperature penalty - higher temps make everyone less happy
    // At 1.5°C = no penalty
    // At 2.0°C = -2.5 happiness/turn
    // At 2.5°C = -5 happiness/turn
    const tempPenalty = Math.max(0, (state.temperature - 1.5) * 5);
    if (tempPenalty > 0) {
      happinessChange -= tempPenalty;
    }

    // Apply happiness change
    alliance.happiness = Math.max(0, Math.min(100, alliance.happiness + happinessChange));

    // Check happiness thresholds and take action
    if (alliance.happiness >= HAPPINESS_THRESHOLDS.HAPPY) {
      // May increase contribution slightly
      if (Math.random() < 0.1 && alliance.gdpContribution < 1.5) {
        alliance.gdpContribution = Math.min(1.5, alliance.gdpContribution + 0.05);
        pushMessage(`${regionName} is happy with the alliance! They increased their climate contribution.`, "good");
      }
    } else if (alliance.happiness < HAPPINESS_THRESHOLDS.CONCERNED && alliance.happiness >= HAPPINESS_THRESHOLDS.UNHAPPY) {
      // Warning - region is concerned
      if (Math.random() < 0.2) {
        pushMessage(`${regionName} is concerned about the alliance. Consider addressing their needs.`, "warning");
      }
    } else if (alliance.happiness < HAPPINESS_THRESHOLDS.UNHAPPY) {
      // Critical (0-19) - chance to leave the alliance
      if (Math.random() < 0.5 && !alliance.isHomeRegion) {
        regionsToLeave.push(regionId);
      } else if (Math.random() < 0.3) {
        // If they don't leave, they may reduce contribution
        alliance.gdpContribution = Math.max(0.5, alliance.gdpContribution - 0.1);
        pushMessage(`${regionName} is critically unhappy! They may leave the alliance soon.`, "bad");
      }
    }
  });

  // Process regions leaving
  regionsToLeave.forEach(regionId => {
    handleRegionLeaving(regionId);
  });
}

/**
 * Calculate happiness factors breakdown for a region (for display purposes)
 * Returns an object with all factors affecting happiness
 */
function calculateHappinessFactors(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status !== ALLIANCE_STATUS.ALLIED) return null;

  const factors = [];
  const alliedCount = getAlliedRegionsCount();
  const allianceAvgImprovement = calculateAllianceAvgIntensityReduction();

  // High carbon tax
  const taxRate = alliance.carbonTax?.ratePerTon || alliance.acceptedTerms?.carbonTaxRate || 0;
  if (taxRate > 30) {
    const penalty = -((taxRate - 30) * 0.2);
    factors.push({ label: "High carbon tax", value: penalty, icon: "💸" });
  }

  // Spending ratio
  const spendRatio = alliance.spendRatio || 0.5;
  if (spendRatio < 0.3) {
    factors.push({ label: "Low reinvestment in region", value: -5, icon: "📤" });
  }

  // Unmet demands
  if (alliance.demands && alliance.demands.length > 0) {
    const unmetDemands = alliance.demands.filter(d => {
      const demandType = DEMAND_TYPES[d.type];
      return demandType && !demandType.check(alliance, d.value);
    });
    if (unmetDemands.length > 0) {
      factors.push({ label: `Unmet demands (${unmetDemands.length})`, value: -(unmetDemands.length * 3), icon: "📋" });
    }
  }

  // Term compliance
  if (alliance.acceptedTerms && alliance.termCompliance) {
    const failedTerms = Object.values(alliance.termCompliance).filter(t => !t.compliant).length;
    if (failedTerms > 0) {
      factors.push({ label: `Failed agreement terms (${failedTerms})`, value: -(failedTerms * 3), icon: "⚠️" });
    }
  }

  // Carbon intensity performance
  if (allianceAvgImprovement > 0 && alliedCount > 1) {
    const regionImprovement = calculateCarbonIntensityImprovement(regionId);
    const performanceRatio = regionImprovement / allianceAvgImprovement;

    if (performanceRatio < 0.5) {
      factors.push({ label: "Far below alliance emissions avg", value: -8, icon: "📉" });
    } else if (performanceRatio < 0.8) {
      factors.push({ label: "Below alliance emissions avg", value: -3, icon: "📉" });
    } else if (performanceRatio > 1.2) {
      factors.push({ label: "Above alliance emissions avg", value: +3, icon: "📈" });
    }
  }

  // Loyalty bonus
  if (alliance.turnsInAlliance > 12) {
    factors.push({ label: "Long-term member loyalty", value: +0.5, icon: "🏆" });
  }

  // Safety in numbers
  if (alliedCount > 3) {
    factors.push({ label: "Strong alliance (4+ members)", value: +2, icon: "🤝" });
  }

  // Home region bonus
  if (alliance.isHomeRegion) {
    factors.push({ label: "Home region", value: +1, icon: "🏠" });
  }

  // Power grid impact
  const powerHappiness = calculatePowerHappinessImpact(regionId);
  if (powerHappiness !== 0) {
    const region = state.regions?.[regionId];
    const stability = region?.power?.stability || 100;
    const price = region?.power?.pricePerKwh || POWER_CONFIG.basePrice;

    if (stability >= POWER_CONFIG.stabilityThresholds.excellent) {
      factors.push({ label: "Excellent grid stability", value: +2, icon: "⚡" });
    } else if (stability < POWER_CONFIG.stabilityThresholds.critical) {
      factors.push({ label: "Critical grid instability", value: -10, icon: "⚡" });
    } else if (stability < POWER_CONFIG.stabilityThresholds.warning) {
      factors.push({ label: "Poor grid stability", value: -5, icon: "⚡" });
    }

    if (price > POWER_CONFIG.priceThresholds.expensive) {
      factors.push({ label: "High electricity prices", value: Math.round(-((price - POWER_CONFIG.priceThresholds.expensive) / 0.05) * POWER_CONFIG.happinessHighPricePenalty), icon: "💡" });
    }
  }

  // Global temperature penalty
  const tempPenalty = Math.max(0, (state.temperature - 1.5) * 5);
  if (tempPenalty > 0) {
    factors.push({ label: `Global warming (+${state.temperature.toFixed(1)}°C)`, value: -tempPenalty, icon: "🌡️" });
  }

  // Generate tips based on current state
  const tips = [];
  const region = state.regions?.[regionId];

  // Tip: Build projects in the region
  tips.push({
    icon: "🏗️",
    label: "Build projects in this region",
    value: "+5 to +8",
    description: "Economic projects give +8, others give +5 (nuclear: +0)"
  });

  // Tip: If spending ratio is low
  if (spendRatio < 0.5) {
    tips.push({
      icon: "💰",
      label: "Spend more of their contributions here",
      value: "+5",
      description: "Currently only " + Math.round(spendRatio * 100) + "% spent back"
    });
  }

  // Tip: If grid stability is poor
  if (region?.power?.stability < 70) {
    tips.push({
      icon: "🔋",
      label: "Build storage or baseload power",
      value: "+2 to +10",
      description: "Improves grid stability (currently " + Math.round(region.power.stability) + "%)"
    });
  }

  // Tip: If there are unmet demands
  if (alliance.demands && alliance.demands.length > 0) {
    const unmetDemands = alliance.demands.filter(d => {
      const demandType = DEMAND_TYPES[d.type];
      return demandType && !demandType.check(alliance, d.value);
    });
    if (unmetDemands.length > 0) {
      tips.push({
        icon: "📋",
        label: "Meet their demands",
        value: "+" + (unmetDemands.length * 3),
        description: unmetDemands.length + " unmet demand(s)"
      });
    }
  }

  // Tip: If failed terms
  if (alliance.termCompliance) {
    const failedTerms = Object.entries(alliance.termCompliance).filter(([k, t]) => !t.compliant);
    if (failedTerms.length > 0) {
      failedTerms.forEach(([key, detail]) => {
        if (key === 'powerStability') {
          tips.push({
            icon: "⚡",
            label: "Improve grid stability to " + alliance.acceptedTerms?.powerStabilityGoal + "%",
            value: "+3",
            description: "Build storage or nuclear plants"
          });
        } else if (key === 'powerSupply') {
          tips.push({
            icon: "🔌",
            label: "Increase power supply to " + alliance.acceptedTerms?.powerSupplyGoal + "%",
            value: "+3",
            description: "Build more power generation"
          });
        }
      });
    }
  }

  // Tip: Grow the alliance
  if (alliedCount <= 3) {
    tips.push({
      icon: "🤝",
      label: "Recruit more allies (need 4+)",
      value: "+2",
      description: "Currently " + alliedCount + " allies"
    });
  }

  // Tip: Reduce global temperature toward the win threshold (winTemp)
  if (state.temperature > GAME_CONFIG.winTemp) {
    tips.push({
      icon: "🌡️",
      label: `Reduce global temperature below ${GAME_CONFIG.winTemp}°C`,
      value: "+" + Math.round((state.temperature - GAME_CONFIG.winTemp) * 5),
      description: "Build carbon capture & renewables"
    });
  }

  return {
    factors,
    tips,
    currentHappiness: alliance.happiness,
    totalChange: factors.reduce((sum, f) => sum + f.value, 0),
  };
}

/**
 * Update carbon tax rate for a region
 */
function updateCarbonTaxRate(regionId, newRate) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status !== ALLIANCE_STATUS.ALLIED) return;

  newRate = parseFloat(newRate);
  if (!alliance.carbonTax) {
    alliance.carbonTax = {
      ratePerTon: NEGOTIABLE_TERMS.carbonTaxRate.default,
      yearlyGrowthRate: NEGOTIABLE_TERMS.carbonTaxGrowth.default,
    };
  }
  alliance.carbonTax.ratePerTon = newRate;

  // Update display
  const rateDisplay = document.getElementById(`carbon-tax-rate-display-${regionId}`);
  if (rateDisplay) {
    // Check if there's a carbon tax limit demand
    const taxLimitDemand = alliance.demands?.find(d => d.type === 'carbonTaxLimit');
    const taxLimitWarning = taxLimitDemand && newRate > taxLimitDemand.value;
    rateDisplay.textContent = `$${newRate}/ton`;
    rateDisplay.style.color = taxLimitWarning ? 'var(--warning-color)' : 'var(--text-primary)';
  }

  // Update the popup's Monthly Revenue stat live to reflect the new rate
  const revenueDisplay = document.getElementById(`carbon-tax-revenue-display-${regionId}`);
  if (revenueDisplay) {
    const climateData = getClimateDataForRegion(regionId);
    let monthlyRevenue = 0;
    if (climateData && climateData.emissions) {
      const yearlyEmissions = typeof climateData.emissions === 'number'
        ? climateData.emissions
        : climateData.emissions.total || 0;
      monthlyRevenue = (yearlyEmissions / 12) * newRate;
    }
    revenueDisplay.textContent = `+${formatCurrency(monthlyRevenue)}/mo`;
  }

  // Re-render the region panel to update the carbon-tax row revenue display
  updateSelectedRegionPanel();
}

/**
 * Update carbon tax yearly growth rate for a region
 */
function updateCarbonTaxGrowth(regionId, newGrowth) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status !== ALLIANCE_STATUS.ALLIED) return;

  newGrowth = parseFloat(newGrowth);
  if (!alliance.carbonTax) {
    alliance.carbonTax = {
      ratePerTon: NEGOTIABLE_TERMS.carbonTaxRate.default,
      yearlyGrowthRate: NEGOTIABLE_TERMS.carbonTaxGrowth.default,
    };
  }
  alliance.carbonTax.yearlyGrowthRate = newGrowth;

  // Update display
  const growthDisplay = document.getElementById(`carbon-tax-growth-display-${regionId}`);
  if (growthDisplay) {
    growthDisplay.textContent = `+${newGrowth}%/yr`;
  }

  // Re-render the region panel so the carbon-tax row reflects the new growth projection
  updateSelectedRegionPanel();
}

/**
 * Show popup with happiness factors breakdown
 */
function showHappinessFactorsPopup(regionId) {
  const breakdown = calculateHappinessFactors(regionId);
  if (!breakdown) return;

  const regionName = getRegionName(regionId);

  let factorsHtml = breakdown.factors.length > 0
    ? breakdown.factors.map(f => {
        const valueClass = f.value >= 0 ? 'positive' : 'negative';
        const sign = f.value >= 0 ? '+' : '';
        return `<div class="factor-row">
          <span class="factor-icon">${f.icon}</span>
          <span class="factor-label">${f.label}</span>
          <span class="factor-value ${valueClass}">${sign}${f.value.toFixed(1)}/mo</span>
        </div>`;
      }).join('')
    : '<div class="factor-row"><span class="factor-label">No active modifiers</span></div>';

  const totalClass = breakdown.totalChange >= 0 ? 'positive' : 'negative';
  const totalSign = breakdown.totalChange >= 0 ? '+' : '';

  // Build tips HTML
  let tipsHtml = '';
  if (breakdown.tips && breakdown.tips.length > 0) {
    tipsHtml = `
      <div class="factors-tips">
        <div class="tips-header">💡 How to Increase Happiness</div>
        <div class="tips-list">
          ${breakdown.tips.map(tip => `
            <div class="tip-row">
              <span class="tip-icon">${tip.icon}</span>
              <div class="tip-content">
                <span class="tip-label">${tip.label}</span>
                <span class="tip-desc">${tip.description}</span>
              </div>
              <span class="tip-value">${tip.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const content = `
    <div class="factors-breakdown">
      <div class="factors-header">
        <span>Current Happiness: <strong>${Math.round(breakdown.currentHappiness)}%</strong></span>
      </div>
      <div class="factors-section-label">Current Factors</div>
      <div class="factors-list">
        ${factorsHtml}
      </div>
      <div class="factors-total">
        <span>Monthly Change:</span>
        <span class="factor-value ${totalClass}">${totalSign}${breakdown.totalChange.toFixed(1)}/mo</span>
      </div>
      ${tipsHtml}
      <div class="factors-note">
        Happiness affects alliance stability. Below 20% risks departure.
      </div>
    </div>
  `;

  showGenericFactorsPopup("😊", `${regionName} Happiness Factors`, content);
}

/**
 * Show popup with carbon tax breakdown and controls
 */
function showCarbonTaxPopup(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status !== ALLIANCE_STATUS.ALLIED) return;

  const regionName = getRegionName(regionId);
  const carbonTax = alliance.carbonTax || { ratePerTon: NEGOTIABLE_TERMS.carbonTaxRate.default, yearlyGrowthRate: NEGOTIABLE_TERMS.carbonTaxGrowth.default };
  const currentRate = carbonTax.ratePerTon || NEGOTIABLE_TERMS.carbonTaxRate.default;
  const currentGrowth = carbonTax.yearlyGrowthRate || NEGOTIABLE_TERMS.carbonTaxGrowth.default;

  // Calculate monthly revenue from this region
  const climateData = getClimateDataForRegion(regionId);
  let monthlyRevenue = 0;
  let yearlyEmissions = 0;
  if (climateData && climateData.emissions) {
    yearlyEmissions = typeof climateData.emissions === 'number' ? climateData.emissions : climateData.emissions.total || 0;
    monthlyRevenue = (yearlyEmissions / 12) * currentRate;
  }

  // Check if there's a carbon tax limit demand
  const taxLimitDemand = alliance.demands?.find(d => d.type === 'carbonTaxLimit');
  const taxLimitWarning = taxLimitDemand && currentRate > taxLimitDemand.value;

  const content = `
    <div class="carbon-tax-popup-content">
      <div class="carbon-tax-stats">
        <div class="carbon-tax-stat">
          <span class="stat-label">Monthly Revenue</span>
          <span id="carbon-tax-revenue-display-${regionId}" class="stat-value positive">+${formatCurrency(monthlyRevenue)}/mo</span>
        </div>
        <div class="carbon-tax-stat">
          <span class="stat-label">Yearly Emissions</span>
          <span class="stat-value">${yearlyEmissions.toFixed(2)} Gt CO2/yr</span>
        </div>
      </div>

      <div class="carbon-tax-control-group">
        <div class="control-header">
          <span>Tax Rate</span>
          <span id="carbon-tax-rate-display-${regionId}" class="${taxLimitWarning ? 'warning' : ''}">$${currentRate}/ton</span>
        </div>
        <input type="range"
          id="carbon-tax-rate-${regionId}"
          min="${NEGOTIABLE_TERMS.carbonTaxRate.min}"
          max="${NEGOTIABLE_TERMS.carbonTaxRate.max}"
          step="${NEGOTIABLE_TERMS.carbonTaxRate.step}"
          value="${currentRate}"
          class="carbon-tax-slider"
          oninput="updateCarbonTaxRate('${regionId}', this.value)"
        >
        ${taxLimitWarning ? `<div class="tax-warning">⚠️ Demand: Keep below $${taxLimitDemand.value}/ton</div>` : ''}
      </div>

      <div class="carbon-tax-control-group">
        <div class="control-header">
          <span>Yearly Growth</span>
          <span id="carbon-tax-growth-display-${regionId}">+${currentGrowth}%/yr</span>
        </div>
        <input type="range"
          id="carbon-tax-growth-${regionId}"
          min="${NEGOTIABLE_TERMS.carbonTaxGrowth.min}"
          max="${NEGOTIABLE_TERMS.carbonTaxGrowth.max}"
          step="${NEGOTIABLE_TERMS.carbonTaxGrowth.step}"
          value="${currentGrowth}"
          class="carbon-tax-slider"
          oninput="updateCarbonTaxGrowth('${regionId}', this.value)"
        >
      </div>

      <div class="carbon-tax-note">
        Carbon tax generates revenue based on regional emissions. Higher rates may affect happiness.
      </div>
    </div>
  `;

  showGenericFactorsPopup("💰", `${regionName} Carbon Tax`, content);
}

/**
 * Show popup with interest factors breakdown
 */
function showInterestFactorsPopup(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || alliance.status === ALLIANCE_STATUS.ALLIED) return;

  const regionName = getRegionName(regionId);
  const factors = alliance.interestFactors || {};
  const factorsList = [];

  if (factors.globalTemp > 0) {
    factorsList.push({ icon: "🌡️", label: "Climate urgency", value: factors.globalTemp, description: "Higher global temps increase concern" });
  }
  if (factors.allianceSuccess > 0) {
    factorsList.push({ icon: "🤝", label: "Alliance momentum", value: factors.allianceSuccess, description: "More allies = bandwagon effect" });
  }
  if (factors.neighborInfluence > 0) {
    factorsList.push({ icon: "🏘️", label: "Allied neighbors", value: factors.neighborInfluence, description: "Nearby allies encourage joining" });
  }
  if (factors.economicBenefit > 0) {
    factorsList.push({ icon: "📈", label: "Alliance succeeding", value: factors.economicBenefit, description: "Alliance is reducing CO2" });
  } else if (factors.economicBenefit < 0) {
    factorsList.push({ icon: "📉", label: "Alliance struggling", value: factors.economicBenefit, description: "Alliance not reducing CO2" });
  }
  if (factors.disasterAwareness > 0) {
    factorsList.push({ icon: "🌪️", label: "Disaster awareness", value: factors.disasterAwareness, description: "Recent climate disasters in region" });
  }

  let factorsHtml = factorsList.length > 0
    ? factorsList.map(f => {
        const valueClass = f.value >= 0 ? 'positive' : 'negative';
        const sign = f.value >= 0 ? '+' : '';
        return `<div class="factor-row">
          <span class="factor-icon">${f.icon}</span>
          <span class="factor-label">${f.label}</span>
          <span class="factor-value ${valueClass}">${sign}${f.value}</span>
        </div>`;
      }).join('')
    : '<div class="factor-row"><span class="factor-label">No active factors</span></div>';

  const content = `
    <div class="factors-breakdown">
      <div class="factors-header">
        <span>Current Interest: <strong>${Math.round(alliance.interest || 50)}%</strong></span>
      </div>
      <div class="factors-list">
        ${factorsHtml}
      </div>
      <div class="factors-note">
        Higher interest = better negotiation odds. At 80%+, they may request to join!
      </div>
    </div>
  `;

  showGenericFactorsPopup("🎯", `${regionName} Interest Factors`, content);
}

/**
 * Generic popup for showing factors
 */
function showGenericFactorsPopup(icon, title, content) {
  // Remove any existing popup
  const existing = document.getElementById('factors-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'factors-popup';
  popup.className = 'popup-container';
  popup.innerHTML = `
    <div class="popup-overlay" onclick="closeFactorsPopup()"></div>
    <div class="factors-popup-dialog" role="dialog" aria-modal="true" aria-labelledby="factors-popup-title" tabindex="-1">
      <div class="popup-header">
        <span class="popup-icon">${icon}</span>
        <h3 class="popup-title" id="factors-popup-title">${title}</h3>
        <button class="popup-close" onclick="closeFactorsPopup()" aria-label="Close">&times;</button>
      </div>
      <div class="popup-body">
        ${content}
      </div>
      <button class="popup-dismiss" onclick="closeFactorsPopup()">Close</button>
    </div>
  `;

  document.body.appendChild(popup);
  activateDialog(popup, popup.querySelector(".factors-popup-dialog"), closeFactorsPopup);
}

function closeFactorsPopup() {
  const popup = document.getElementById('factors-popup');
  if (popup) {
    deactivateDialog(popup);
    popup.remove();
  }
}

// Handle a region leaving the alliance
function handleRegionLeaving(regionId) {
  const alliance = state.alliance[regionId];
  if (!alliance) return;

  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;

  // Set to hostile
  alliance.status = ALLIANCE_STATUS.HOSTILE;
  const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
  alliance.hostileUntil = currentMonth + HOSTILE_COOLDOWN_MONTHS;

  // Destroy any research center in this region
  destroyRegionalCenter(regionId);

  // Domino effect - other allies lose happiness
  Object.entries(state.alliance).forEach(([otherId, otherAlliance]) => {
    if (otherId !== regionId && otherAlliance.status === ALLIANCE_STATUS.ALLIED) {
      otherAlliance.happiness = Math.max(0, otherAlliance.happiness - 10);
    }
  });

  // Show dramatic notification
  pushMessage(`${regionName} has LEFT the Climate Alliance! Other allies are shaken.`, "bad");

  // Queue a popup
  showEventPopup({
    type: "alliance_leave",
    icon: "🚪",
    title: `${regionName} Leaves Alliance`,
    description: `${regionName} has withdrawn from the Climate Alliance due to low satisfaction. Their projects are now inactive and they cannot be recruited for ${HOSTILE_COOLDOWN_MONTHS} months.`,
    buttonText: "Acknowledge",
    displayType: "full",
  });
}

// Check for spontaneous join requests from high-interest regions
function checkSpontaneousJoining() {
  if (!state.alliance) return;

  // Only one spontaneous request per turn
  let requestMade = false;

  Object.entries(state.alliance).forEach(([regionId, alliance]) => {
    if (requestMade) return;
    if (alliance.status !== ALLIANCE_STATUS.NEUTRAL) return;

    const interest = alliance.interest || 50;

    // Only regions with very high interest (80+) can request to join
    if (interest >= INTEREST_THRESHOLDS.VERY_HIGH) {
      // 5% chance per month
      if (Math.random() < 0.05) {
        requestMade = true;
        showSpontaneousJoinRequest(regionId);
      }
    }
  });
}

// Show popup when a region requests to join spontaneously
function showSpontaneousJoinRequest(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;
  const diplomatic = regionData?.diplomatic || {};
  const alliance = state.alliance?.[regionId];
  const interest = alliance?.interest || 50;

  // Set status to negotiating
  if (state.alliance[regionId]) {
    state.alliance[regionId].status = ALLIANCE_STATUS.NEGOTIATING;
  }

  // Store pending spontaneous request
  state.pendingSpontaneousRequest = {
    regionId,
  };

  pushMessage(`${regionName} has expressed interest in joining the Climate Alliance!`, "good");

  // Create popup
  const overlay = document.createElement("div");
  overlay.id = "spontaneous-join-overlay";
  overlay.className = "negotiation-overlay";

  overlay.innerHTML = `
    <div class="negotiation-popup" role="dialog" aria-modal="true" aria-labelledby="spontaneous-join-title" tabindex="-1">
      <div class="negotiation-header">
        <div class="negotiation-flag">${diplomatic.flag || "🌍"}</div>
        <div class="negotiation-region-info">
          <h3 id="spontaneous-join-title">${regionName}</h3>
          <span class="interest-badge" style="color: var(--success-color);">Interest: ${interest}% (Very High)</span>
        </div>
      </div>

      <div class="negotiation-content">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">
          ${regionName} has approached the Climate Alliance seeking membership.
          They are highly interested in joining based on the alliance's success and global climate trends.
        </p>

        <p style="color: var(--text-color); margin-bottom: 16px;">
          <strong>Do you want to accept them into the alliance?</strong>
        </p>

        <p style="color: var(--text-secondary); font-size: 0.85rem;">
          If accepted, they will join with default terms (you can negotiate stricter terms by approaching them yourself).
        </p>
      </div>

      <div class="negotiation-buttons" style="display: flex; gap: 12px; margin-top: 20px;">
        <button class="negotiate-submit-btn" onclick="acceptSpontaneousRequest('${regionId}')" style="flex: 1;">
          Accept Into Alliance
        </button>
        <button class="negotiate-cancel-btn" onclick="rejectSpontaneousRequest('${regionId}')" style="flex: 1;">
          Decline Request
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  updateAllianceMapVisuals();
}

// Accept a spontaneous join request
function acceptSpontaneousRequest(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;

  // Close popup
  const overlay = document.getElementById("spontaneous-join-overlay");
  if (overlay) {
    overlay.remove();
  }

  // Add with default terms
  const defaultTerms = {};
  Object.entries(NEGOTIABLE_TERMS).forEach(([key, config]) => {
    defaultTerms[key] = config.default;
  });

  state.alliance[regionId] = {
    ...state.alliance[regionId],
    status: ALLIANCE_STATUS.ALLIED,
    happiness: 75, // Slightly higher starting happiness since they requested
    demands: [], // No demands when they request
    turnsInAlliance: 1,
    acceptedTerms: defaultTerms,
    termCompliance: {},
  };

  pushMessage(`${regionName} has joined the Climate Alliance!`, "good");

  showEventPopup({
    type: "alliance_join",
    icon: "🤝",
    title: `${regionName} Joins!`,
    description: `${regionName} has eagerly joined the Climate Alliance! Their high interest in climate cooperation means they start with higher satisfaction.`,
    buttonText: "Welcome!",
    displayType: "full",
  });

  state.pendingSpontaneousRequest = null;
  updateAllianceMapVisuals();
  updateUI();
}

// Reject a spontaneous join request
function rejectSpontaneousRequest(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;

  // Close popup
  const overlay = document.getElementById("spontaneous-join-overlay");
  if (overlay) {
    overlay.remove();
  }

  // Reset to neutral but reduce interest slightly (they were rejected)
  state.alliance[regionId] = {
    ...state.alliance[regionId],
    status: ALLIANCE_STATUS.NEUTRAL,
    interest: Math.max(0, (state.alliance[regionId].interest || 50) - 15), // Reduce interest by 15
  };

  pushMessage(`${regionName}'s request to join was declined. Their interest has decreased.`, "warning");

  state.pendingSpontaneousRequest = null;
  updateAllianceMapVisuals();
  updateUI();
}

// Get happiness level class for styling
function getHappinessClass(happiness) {
  if (happiness >= HAPPINESS_THRESHOLDS.HAPPY) return "happy";
  if (happiness >= HAPPINESS_THRESHOLDS.CONTENT) return "content";
  if (happiness >= HAPPINESS_THRESHOLDS.CONCERNED) return "concerned";
  if (happiness >= HAPPINESS_THRESHOLDS.UNHAPPY) return "unhappy";
  return "critical";
}

// Generate demands for a region based on its personality
function generateDemandsForRegion(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const diplomatic = regionData?.diplomatic || {};
  const baseDemands = diplomatic.baseDemands || ["carbonTaxLimit"];
  const personality = diplomatic.personality || "cooperative";

  // Determine number of demands based on personality
  let numDemands;
  switch (personality) {
    case "cooperative":
      numDemands = 1 + Math.floor(Math.random() * 2); // 1-2
      break;
    case "demanding":
      numDemands = 2 + Math.floor(Math.random() * 2); // 2-3
      break;
    case "isolationist":
      numDemands = 3 + Math.floor(Math.random() * 2); // 3-4
      break;
    default:
      numDemands = 2;
  }

  // Generate demands from base demands and random additional ones
  const demands = [];
  const usedTypes = new Set();

  // First add from base demands
  baseDemands.forEach(demandType => {
    if (demands.length < numDemands && DEMAND_TYPES[demandType]) {
      const value = DEMAND_TYPES[demandType].generateValue();
      demands.push({
        type: demandType,
        value,
        accepted: true, // Default to accepted
      });
      usedTypes.add(demandType);
    }
  });

  // Add random demands if needed
  const allDemandTypes = Object.keys(DEMAND_TYPES);
  while (demands.length < numDemands) {
    const randomType = allDemandTypes[Math.floor(Math.random() * allDemandTypes.length)];
    if (!usedTypes.has(randomType)) {
      const value = DEMAND_TYPES[randomType].generateValue();
      demands.push({
        type: randomType,
        value,
        accepted: true,
      });
      usedTypes.add(randomType);
    }
  }

  return demands;
}

// Calculate negotiation cost based on region GDP and interest
function calculateNegotiationCost(regionId) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const alliance = state.alliance?.[regionId];
  const gdp = regionData?.gdp || 1000; // GDP in billions
  const interest = alliance?.interest || 50;

  // Base cost: 0.1% of region GDP (scaled)
  const baseCost = gdp * 0.001; // 0.1% of GDP

  // Interest modifier: higher interest = lower cost
  // At 80+ interest (Very High): 0.5x cost
  // At 60-79 interest (High): 0.7x cost
  // At 40-59 interest (Moderate): 1.0x cost (default)
  // At 20-39 interest (Low): 1.5x cost
  // At 0-19 interest (Very Low): 1.5x cost (can negotiate but success capped at 50%)
  let interestMultiplier = 1.0;
  if (interest >= INTEREST_THRESHOLDS.VERY_HIGH) {
    interestMultiplier = 0.5;
  } else if (interest >= INTEREST_THRESHOLDS.HIGH) {
    interestMultiplier = 0.7;
  } else if (interest < INTEREST_THRESHOLDS.MODERATE) {
    // Both Low and Very Low pay 1.5x
    interestMultiplier = 1.5;
  }

  return Math.round(baseCost * interestMultiplier * 10) / 10; // Round to 1 decimal
}

// Check if region is on negotiation cooldown
function isOnNegotiationCooldown(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || !alliance.lastApproached) return false;

  const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
  return currentMonth < alliance.lastApproached + NEGOTIATION_COOLDOWN_MONTHS;
}

// Get remaining cooldown months
function getNegotiationCooldownRemaining(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance || !alliance.lastApproached) return 0;

  const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
  const remaining = (alliance.lastApproached + NEGOTIATION_COOLDOWN_MONTHS) - currentMonth;
  return Math.max(0, remaining);
}

// Start negotiation with a region
function startNegotiation(regionId) {
  if (isRegionHostile(regionId)) {
    const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
    const regionName = regionData?.name || regionId;
    pushMessage(`${regionName} is hostile and won't negotiate right now.`, "bad");
    return;
  }

  if (isRegionAllied(regionId)) {
    pushMessage("This region is already part of the alliance.", "info");
    return;
  }

  // Check cooldown (separate from hostile cooldown)
  if (isOnNegotiationCooldown(regionId)) {
    const remaining = getNegotiationCooldownRemaining(regionId);
    const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
    const regionName = regionData?.name || regionId;
    pushMessage(`${regionName} needs ${remaining} more month(s) before we can approach them again.`, "warning");
    return;
  }

  // Check cost
  const cost = calculateNegotiationCost(regionId);
  if (state.funds < cost) {
    pushMessage(`Not enough budget to initiate negotiations. Need $${cost}B.`, "bad");
    return;
  }

  // Deduct cost
  state.funds -= cost;
  pushMessage(`Spent $${cost}B on diplomatic negotiations.`, "info");

  // Record approach time (for cooldown)
  const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
  if (state.alliance[regionId]) {
    state.alliance[regionId].lastApproached = currentMonth;
  }

  // Generate demands for this negotiation
  const demands = generateDemandsForRegion(regionId);

  // Store pending negotiation
  state.pendingNegotiation = {
    regionId,
    demands,
  };

  // Set status to negotiating
  if (state.alliance[regionId]) {
    state.alliance[regionId].status = ALLIANCE_STATUS.NEGOTIATING;
  }

  // Show negotiation popup
  showNegotiationPopup(regionId, demands);
  updateAllianceMapVisuals();
}

// Show the negotiation popup
function showNegotiationPopup(regionId, demands) {
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;
  const diplomatic = regionData?.diplomatic || {};
  const alliance = state.alliance?.[regionId];
  const interest = alliance?.interest || 50;

  // Initialize terms with minimum values to maximize acceptance probability
  state.pendingNegotiation.terms = {};
  Object.entries(NEGOTIABLE_TERMS).forEach(([key, config]) => {
    state.pendingNegotiation.terms[key] = config.min;
  });

  const overlay = document.createElement("div");
  overlay.id = "negotiation-overlay";
  overlay.className = "popup-overlay";

  const personalityText = {
    cooperative: "They seem open to joining.",
    demanding: "They have strong expectations.",
    isolationist: "They are skeptical of international cooperation.",
  };

  // Generate terms sliders HTML - start at min values to maximize acceptance
  const termsHTML = Object.entries(NEGOTIABLE_TERMS).map(([key, config]) => {
    const displayValue = config.step % 1 === 0 ? config.min : config.min.toFixed(1);
    return `
    <div class="term-slider-row">
      <div class="term-info">
        <span class="term-label">${config.label}</span>
        <span class="term-description">${config.description}</span>
      </div>
      <div class="term-control">
        <input type="range"
          id="term-${key}"
          class="term-slider"
          min="${config.min}"
          max="${config.max}"
          step="${config.step}"
          value="${config.min}"
          oninput="updateTermValue('${key}', this.value)"
        />
        <span id="term-value-${key}" class="term-value">${displayValue}${config.unit}</span>
      </div>
    </div>
  `;
  }).join("");

  overlay.innerHTML = `
    <div class="popup negotiation-popup" role="dialog" aria-modal="true" aria-labelledby="negotiation-popup-title" tabindex="-1">
      <div class="negotiation-header">
        <div class="negotiation-flag">🌍</div>
        <div class="negotiation-region-info">
          <h3 id="negotiation-popup-title">${regionName}</h3>
          <p>${personalityText[diplomatic.personality] || "They are open to discussion."}</p>
          <p class="interest-display">Interest: <strong>${interest}%</strong> (${getInterestLabel(interest)})</p>
        </div>
      </div>

      <div class="negotiation-content">
        <div class="terms-section">
          <h4>Your Alliance Terms:</h4>
          <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 12px;">Set the requirements for joining. Higher demands reduce success chance.</p>
          ${termsHTML}
        </div>

        <div class="income-preview-section">
          <h4>Projected Monthly Income</h4>
          <div class="income-preview-grid">
            <div class="income-preview-row">
              <span class="income-label">Climate Budget</span>
              <span class="income-detail" id="income-climate-detail">GDP × Dedication</span>
              <span class="income-value" id="income-climate-value">$0B - $0B</span>
            </div>
            <div class="income-preview-row">
              <span class="income-label">Carbon Tax Revenue</span>
              <span class="income-detail" id="income-tax-detail">Emissions × Rate</span>
              <span class="income-value" id="income-tax-value">$0B</span>
            </div>
            <div class="income-preview-row income-total">
              <span class="income-label">Total Projected</span>
              <span class="income-detail"></span>
              <span class="income-value" id="income-total-value">$0B - $0B/mo</span>
            </div>
          </div>
        </div>

        <div class="demands-section">
          <h4>Their Conditions for Joining:</h4>
          <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 12px;">Click to accept or reject each demand. Rejecting demands reduces success chance.</p>
          ${demands.map((demand, index) => {
            const demandType = DEMAND_TYPES[demand.type];
            const text = demandType.text.replace("{value}", demand.value);
            return `
              <div class="demand-item accepted" data-index="${index}" onclick="toggleDemand(${index})">
                <div class="demand-checkbox">✓</div>
                <span class="demand-text">${text}</span>
                <span class="demand-difficulty ${demandType.difficulty}">${demandType.difficulty}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="negotiation-footer">
        <div class="success-probability">
          <span class="probability-label">Success Probability:</span>
          <span id="negotiation-probability" class="probability-value high">90%</span>
        </div>
        <div class="negotiation-actions">
          <button class="cancel-negotiation-btn" onclick="cancelNegotiation()">Cancel</button>
          <button class="submit-offer-btn" onclick="submitNegotiationOffer()">Make Offer</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Calculate and display the actual probability (not the hardcoded 90%)
  updateNegotiationProbability();

  // Calculate and display income preview
  updateIncomePreview();
}

// Update term value when slider changes
function updateTermValue(termKey, value) {
  if (!state.pendingNegotiation?.terms) return;

  const config = NEGOTIABLE_TERMS[termKey];
  if (!config) return;

  // Round to step to avoid floating point issues during slider drag
  const numValue = parseFloat(value);
  const snappedValue = Math.round(numValue / config.step) * config.step;
  state.pendingNegotiation.terms[termKey] = snappedValue;

  // Update display with snapped value
  const valueEl = document.getElementById(`term-value-${termKey}`);
  if (valueEl) {
    // Format display: show decimals only if step has decimals
    const displayValue = config.step % 1 === 0 ? snappedValue : snappedValue.toFixed(1);
    valueEl.textContent = `${displayValue}${config.unit}`;

    // Highlight based on term type and whether it helps or hurts probability
    valueEl.classList.remove("above-default", "beneficial", "detrimental");

    if (config.higherIsBetter) {
      // Power goals: higher = better for region
      if (snappedValue > config.default) {
        valueEl.classList.add("beneficial");
      } else if (snappedValue < config.default) {
        valueEl.classList.add("detrimental");
      }
    } else if (config.shorterIsBetter) {
      // Deadline: shorter = better for region
      if (snappedValue < config.default) {
        valueEl.classList.add("beneficial");
      } else if (snappedValue > config.default) {
        valueEl.classList.add("detrimental");
      }
    } else {
      // Climate dedication: higher demands = worse for success rate
      if (snappedValue > config.default) {
        valueEl.classList.add("above-default");
      }
    }
  }

  // Recalculate probability
  updateNegotiationProbability();

  // Update income preview
  updateIncomePreview();
}

// Toggle a demand's acceptance
function toggleDemand(index) {
  if (!state.pendingNegotiation) return;

  const demand = state.pendingNegotiation.demands[index];
  if (!demand) return;

  demand.accepted = !demand.accepted;

  // Update UI
  const demandItems = document.querySelectorAll(".demand-item");
  const item = demandItems[index];
  if (item) {
    item.classList.toggle("accepted", demand.accepted);
    item.classList.toggle("rejected", !demand.accepted);
    const checkbox = item.querySelector(".demand-checkbox");
    if (checkbox) {
      checkbox.textContent = demand.accepted ? "✓" : "✗";
    }
  }

  // Update probability
  updateNegotiationProbability();
}

// Calculate and update the success probability using election-style mechanics
// Interest represents voter support percentage, with polling uncertainty (±15%)
function updateNegotiationProbability() {
  if (!state.pendingNegotiation) return;

  const regionId = state.pendingNegotiation.regionId;
  const alliance = state.alliance?.[regionId];
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const diplomatic = regionData?.diplomatic || {};
  const joinDifficulty = diplomatic.joinDifficulty || 5;

  // Interest represents voter support percentage
  const interest = alliance?.interest || 50;

  // Modifiers affect the effective support
  let effectiveSupport = interest;

  // Difficulty modifier (reduces effective support by up to ±8%)
  const difficultyPenalty = (joinDifficulty - 5) * 2; // -8 to +8
  effectiveSupport -= difficultyPenalty;

  // Demands: accepting gives bonus, rejecting gives penalty
  const demands = state.pendingNegotiation.demands;
  const acceptedCount = demands.filter(d => d.accepted).length;
  const rejectedCount = demands.filter(d => !d.accepted).length;
  effectiveSupport += acceptedCount * 3;  // Bonus for accepting their demands
  effectiveSupport -= rejectedCount * 5;  // Penalty for rejecting

  // Terms: impact depends on term type
  const terms = state.pendingNegotiation.terms;
  if (terms) {
    Object.entries(terms).forEach(([termKey, value]) => {
      const termConfig = NEGOTIABLE_TERMS[termKey];
      if (!termConfig) return;

      const stepsFromDefault = Math.round((value - termConfig.default) / termConfig.step);

      if (termConfig.higherIsBetter) {
        // Power goals: higher values = more attractive (we're promising to help more)
        // Above default = bonus, below default = penalty
        effectiveSupport += termConfig.impactPerStep * stepsFromDefault;
      } else if (termConfig.shorterIsBetter) {
        // Deadline: shorter = more attractive (faster help)
        // Below default = bonus, above default = penalty
        effectiveSupport -= termConfig.impactPerStep * stepsFromDefault;
      } else {
        // Climate dedication terms: higher demands = less attractive
        // Below default = bonus (lenient), above default = penalty (strict)
        if (value < termConfig.default) {
          const stepsBelowDefault = Math.abs(stepsFromDefault);
          effectiveSupport += Math.abs(termConfig.impactPerStep) * 0.5 * stepsBelowDefault;
        } else if (value > termConfig.default) {
          effectiveSupport += termConfig.impactPerStep * stepsFromDefault;
        }
      }
    });
  }

  // Clamp effective support
  effectiveSupport = Math.max(0, Math.min(100, effectiveSupport));

  // Calculate probability using election model with ±15% polling uncertainty
  // Probability = chance that (effectiveSupport + random(-15, +15)) >= 50
  // This follows a triangular distribution approximation
  const uncertainty = 15;
  let probability;

  if (effectiveSupport >= 50 + uncertainty) {
    // Support high enough that even worst-case swing succeeds
    probability = 100;
  } else if (effectiveSupport <= 50 - uncertainty) {
    // Support too low - even best-case swing fails
    probability = 0;
  } else {
    // Linear interpolation between extremes
    // At 35% support: 0% chance, at 65% support: 100% chance
    probability = ((effectiveSupport - (50 - uncertainty)) / (2 * uncertainty)) * 100;
  }

  // Very Low interest (<20): cap success at 50% maximum regardless of terms
  if (interest < INTEREST_THRESHOLDS.LOW) {
    probability = Math.min(probability, 50);
  }

  // Ensure minimum 5% chance if they're willing to negotiate at all
  probability = Math.max(5, Math.min(100, probability));

  // Update UI
  const probEl = document.getElementById("negotiation-probability");
  if (probEl) {
    probEl.textContent = `${Math.round(probability)}%`;
    probEl.className = "probability-value " +
      (probability >= 70 ? "high" : probability >= 40 ? "medium" : "low");
  }

  // Store for reference (both the display probability and effective support for the roll)
  state.pendingNegotiation.currentProbability = probability;
  state.pendingNegotiation.effectiveSupport = effectiveSupport;

  return probability;
}

// Update income preview in negotiation popup
function updateIncomePreview() {
  if (!state.pendingNegotiation) return;

  const regionId = state.pendingNegotiation.regionId;
  const climateData = getClimateDataForRegion(regionId);
  const terms = state.pendingNegotiation.terms;
  if (!climateData || !terms) return;

  // Get region's economic data (same source as region info panel)
  const gdpTrillions = climateData.gdp || 0;
  // Handle both emissions formats (direct number or object with .total)
  const emissionsGtYear = climateData.emissions?.total || climateData.emissions || 0;

  // Get current term values
  const dedicationMin = terms.climateDedicationMin || NEGOTIABLE_TERMS.climateDedicationMin.min;
  const dedicationMax = terms.climateDedicationMax || NEGOTIABLE_TERMS.climateDedicationMax.min;
  const carbonTaxRate = terms.carbonTaxRate || NEGOTIABLE_TERMS.carbonTaxRate.default;

  // Calculate climate budget income range (in billions/month)
  // Formula: (GDP_trillions × dedication%) / 12 × 1000 = billions/month
  const climateBudgetMin = (gdpTrillions * dedicationMin / 100) / 12 * 1000;
  const climateBudgetMax = (gdpTrillions * dedicationMax / 100) / 12 * 1000;

  // Calculate carbon tax revenue (in billions/month)
  // Formula: (emissions_Gt/year / 12) × rate_$/ton = billions/month
  // 1 GtCO2 = 1 billion tons, so emissions × rate = billions
  const carbonTaxRevenue = (emissionsGtYear / 12) * carbonTaxRate;

  // Calculate totals
  const totalMin = climateBudgetMin + carbonTaxRevenue;
  const totalMax = climateBudgetMax + carbonTaxRevenue;

  // Update UI elements
  const climateDetailEl = document.getElementById("income-climate-detail");
  const climateValueEl = document.getElementById("income-climate-value");
  const taxDetailEl = document.getElementById("income-tax-detail");
  const taxValueEl = document.getElementById("income-tax-value");
  const totalValueEl = document.getElementById("income-total-value");

  if (climateDetailEl) {
    climateDetailEl.textContent = `$${gdpTrillions.toFixed(1)}T × ${dedicationMin}-${dedicationMax}%`;
  }
  if (climateValueEl) {
    climateValueEl.textContent = `$${climateBudgetMin.toFixed(1)}B - $${climateBudgetMax.toFixed(1)}B`;
  }
  if (taxDetailEl) {
    taxDetailEl.textContent = `${emissionsGtYear.toFixed(1)} Gt × $${carbonTaxRate}/ton`;
  }
  if (taxValueEl) {
    taxValueEl.textContent = `$${carbonTaxRevenue.toFixed(1)}B`;
  }
  if (totalValueEl) {
    totalValueEl.textContent = `$${totalMin.toFixed(1)}B - $${totalMax.toFixed(1)}B/mo`;
  }
}

// Cancel the negotiation
function cancelNegotiation() {
  if (state.pendingNegotiation) {
    const regionId = state.pendingNegotiation.regionId;
    if (state.alliance[regionId]) {
      state.alliance[regionId].status = ALLIANCE_STATUS.NEUTRAL;
    }
    state.pendingNegotiation = null;
  }

  const overlay = document.getElementById("negotiation-overlay");
  if (overlay) {
    overlay.remove();
  }

  updateAllianceMapVisuals();
}

// Submit the negotiation offer
function submitNegotiationOffer() {
  if (!state.pendingNegotiation) return;

  updateNegotiationProbability();
  const regionId = state.pendingNegotiation.regionId;
  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;
  const alliance = state.alliance?.[regionId];
  const interest = alliance?.interest || 50;

  // Election-style roll: simulate an election with polling uncertainty
  // effectiveSupport represents the "true" voter support, add random ±15% swing
  const effectiveSupport = state.pendingNegotiation.effectiveSupport || 50;
  const uncertainty = 15;
  const pollingSwing = (Math.random() - 0.5) * 2 * uncertainty; // Random value between -15 and +15
  const electionResult = effectiveSupport + pollingSwing;

  // Success if election result >= 50% (majority vote)
  let success = electionResult >= 50;

  // Very Low interest (<20): cap at 50% success rate even if terms would push higher
  if (interest < INTEREST_THRESHOLDS.LOW && success) {
    // Even if election succeeded, 50% chance it still fails due to political instability
    success = Math.random() < 0.5;
  }

  // Close popup
  const overlay = document.getElementById("negotiation-overlay");
  if (overlay) {
    overlay.remove();
  }

  if (success) {
    // Success! Region joins alliance
    const acceptedDemands = state.pendingNegotiation.demands
      .filter(d => d.accepted)
      .map(d => ({ type: d.type, value: d.value }));

    // Store the negotiated terms
    const acceptedTerms = state.pendingNegotiation.terms ? { ...state.pendingNegotiation.terms } : null;

    // Get starting values for power goals tracking
    const region = state.regions?.[regionId];
    const startingStability = region?.power?.stability || 70;
    const supply = region?.power?.supply || 100;
    const demand = region?.power?.demand || 100;
    const startingSupplyRatio = demand > 0 ? (supply / demand) * 100 : 85;

    state.alliance[regionId] = {
      ...state.alliance[regionId],
      status: ALLIANCE_STATUS.ALLIED,
      happiness: 70, // Start at content level
      demands: acceptedDemands,
      turnsInAlliance: 1,
      acceptedTerms: acceptedTerms, // Store the terms they agreed to
      termCompliance: {}, // Track compliance status for each term
      startingStability: startingStability, // For power stability goal tracking
      startingSupplyRatio: startingSupplyRatio, // For power supply goal tracking
      carbonTax: {
        ratePerTon: acceptedTerms?.carbonTaxRate || NEGOTIABLE_TERMS.carbonTaxRate.default,
        yearlyGrowthRate: acceptedTerms?.carbonTaxGrowth || NEGOTIABLE_TERMS.carbonTaxGrowth.default,
      },
    };

    // Apply negotiated climate dedication to the region
    // Handle three cases: continents, major regions, and single countries
    if (acceptedTerms?.climateDedicationMin) {
      const continent = CLIMATE_DATA.CONTINENTS?.[regionId];
      const majorRegion = CLIMATE_DATA.MAJOR_REGIONS?.[regionId];

      if (continent && continent.majorRegions) {
        // Continent: get all ISO codes from all major regions, then update via getCountryByIso
        continent.majorRegions.forEach(mrId => {
          const mr = CLIMATE_DATA.MAJOR_REGIONS?.[mrId];
          if (mr && mr.countries) {
            mr.countries.forEach(isoCode => {
              const countryData = CLIMATE_DATA.getCountryByIso?.(isoCode);
              if (countryData?.climateFinance) {
                countryData.climateFinance.currentPercent = acceptedTerms.climateDedicationMin;
                if (acceptedTerms?.climateDedicationMax) {
                  countryData.climateFinance.maxPercent = acceptedTerms.climateDedicationMax;
                }
              }
            });
          }
        });
      } else if (majorRegion && majorRegion.countries) {
        // Major region: update all countries in this region
        majorRegion.countries.forEach(isoCode => {
          const countryData = CLIMATE_DATA.getCountryByIso?.(isoCode);
          if (countryData?.climateFinance) {
            countryData.climateFinance.currentPercent = acceptedTerms.climateDedicationMin;
            if (acceptedTerms?.climateDedicationMax) {
              countryData.climateFinance.maxPercent = acceptedTerms.climateDedicationMax;
            }
          }
        });
      } else {
        // Single country: try direct lookup
        const countryData = CLIMATE_DATA.getCountryByIso?.(regionId) || CLIMATE_DATA.COUNTRY_DATA?.[regionId];
        if (countryData?.climateFinance) {
          countryData.climateFinance.currentPercent = acceptedTerms.climateDedicationMin;
          if (acceptedTerms?.climateDedicationMax) {
            countryData.climateFinance.maxPercent = acceptedTerms.climateDedicationMax;
          }
        }
      }
    }

    pushMessage(`${regionName} has joined the Climate Alliance!`, "good");

    // Show success popup
    showEventPopup({
      type: "alliance_join",
      icon: "🤝",
      title: `${regionName} Joins!`,
      description: `${regionName} has agreed to join the Climate Alliance! They will now contribute their climate finance and you can build projects in their territory.`,
      buttonText: "Welcome Aboard!",
      displayType: "full",
    });
  } else {
    // Failed - region becomes hostile for 3 months
    const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
    state.alliance[regionId] = {
      ...state.alliance[regionId],
      status: ALLIANCE_STATUS.HOSTILE,
      hostileUntil: currentMonth + 3, // Shorter cooldown for failed negotiation
    };

    pushMessage(`${regionName} rejected the offer and is now hostile for 3 months.`, "bad");

    showEventPopup({
      type: "negotiation_failed",
      icon: "❌",
      title: "Negotiation Failed",
      description: `${regionName} was not convinced by your offer. They are now hostile and cannot be approached for 3 months.`,
      buttonText: "Understood",
      displayType: "full",
    });
  }

  state.pendingNegotiation = null;
  updateAllianceMapVisuals();
  updateUI();
}

// Get the negotiate button HTML for region panel
function getNegotiateButtonHTML(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance) return "";

  if (alliance.status === ALLIANCE_STATUS.ALLIED) {
    return ""; // Already allied, no negotiate button needed
  }

  if (alliance.status === ALLIANCE_STATUS.HOSTILE) {
    const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
    const monthsLeft = alliance.hostileUntil ? alliance.hostileUntil - currentMonth : 0;
    return `
      <button class="negotiate-btn hostile" disabled>
        Hostile (${monthsLeft} months)
      </button>
    `;
  }

  if (alliance.status === ALLIANCE_STATUS.NEGOTIATING) {
    return `
      <button class="negotiate-btn" disabled>
        Negotiating...
      </button>
    `;
  }

  // Check for cooldown (separate from hostile)
  if (isOnNegotiationCooldown(regionId)) {
    const remaining = getNegotiationCooldownRemaining(regionId);
    return `
      <button class="negotiate-btn cooldown" disabled>
        Cooldown (${remaining} months)
      </button>
    `;
  }

  // Calculate and show cost
  const cost = calculateNegotiationCost(regionId);
  const canAfford = state.funds >= cost;
  const costClass = canAfford ? "" : "cannot-afford";

  return `
    <button class="negotiate-btn ${costClass}" onclick="startNegotiation('${regionId}')" ${!canAfford ? "disabled" : ""}>
      Negotiate Alliance ($${cost}B)
    </button>
  `;
}

// Get alliance status HTML for region panel
function getAllianceStatusHTML(regionId) {
  const alliance = state.alliance?.[regionId];
  if (!alliance) return "";

  // Badge is now rendered in header row, so just start with empty HTML
  let html = "";

  // Show happiness meter for allied regions
  if (alliance.status === ALLIANCE_STATUS.ALLIED) {
    // Show accepted terms and compliance status FIRST (at top) if any
    if (alliance.acceptedTerms) {
      const compliance = alliance.termCompliance || {};
      const yearsInAlliance = (alliance.turnsInAlliance || 0) / 12;
      const deadlineYears = alliance.acceptedTerms.goalDeadlineYears || 15;
      const yearsRemaining = Math.max(0, deadlineYears - yearsInAlliance);

      const helpTooltip = `Alliance Term Goals:
• Climate Dedication: The region's GDP % for climate action must stay within the agreed range
• Power Stability: Build baseload plants (nuclear) and storage to stabilize the grid
• Power Supply: Build more power generation to meet demand (solar, wind, nuclear)
• Deadline: You have ${yearsRemaining.toFixed(1)} years to achieve the power goals

Tip: Check Project Effectiveness ratings to see which projects work best in each region!`;

      html += `<div style="margin-bottom: 12px; font-size: 0.8rem; color: var(--text-secondary); position: relative; background: var(--bg-tertiary); padding: 10px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: var(--text-primary);">Alliance Commitments</strong>
          <span class="terms-help-icon" title="${helpTooltip.replace(/"/g, '&quot;')}" style="cursor: help; color: var(--accent-color); font-size: 0.9rem; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--accent-color); border-radius: 50%;">?</span>
        </div>
        <ul style="margin: 0; padding: 0 0 0 16px;">
          ${Object.entries(alliance.acceptedTerms).map(([key, value]) => {
            const term = NEGOTIABLE_TERMS[key];
            if (!term) return '';
            const complianceStatus = compliance[key];
            const isCompliant = complianceStatus?.compliant ?? true;
            const actual = complianceStatus?.actual ?? '?';
            const color = isCompliant ? 'var(--success-color)' : 'var(--warning-color)';
            const icon = isCompliant ? '✓' : '✗';
            return `<li style="color: ${color}; margin: 2px 0;">
              ${term.label}: ${actual}${term.unit} / ${value}${term.unit} ${icon}
            </li>`;
          }).join("")}
        </ul>
      </div>`;

      // Show grievances if any
      if (alliance.grievances && alliance.grievances.length > 0) {
        html += `<div style="margin-bottom: 12px; font-size: 0.8rem; color: var(--warning-color); background: rgba(255, 152, 0, 0.1); padding: 8px 10px; border-radius: 6px;">
          <strong>⚠️ Concerns:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            ${alliance.grievances.map(g => `<li>${g}</li>`).join("")}
          </ul>
        </div>`;
      }
    }

    // Happiness bar - clickable like world page
    const happiness = Math.round(alliance.happiness || 50);
    // Calculate color: red (0%) -> yellow (50%) -> green (100%)
    const red = Math.round(255 * Math.max(0, Math.min(1, 2 - happiness / 50)));
    const green = Math.round(255 * Math.max(0, Math.min(1, happiness / 50)));
    const barColor = `rgb(${red}, ${green}, 50)`;

    html += `
      <div class="region-happiness-row" onclick="showHappinessFactorsPopup('${regionId}')" title="Click for happiness breakdown">
        <span class="region-happiness-label">Happiness</span>
        <div class="region-happiness-bar-container">
          <div class="region-happiness-bar" style="width: ${happiness}%; background: ${barColor};"></div>
        </div>
        <span class="region-happiness-value">${happiness}%</span>
      </div>
    `;

    // Carbon Tax - Clickable row that opens popup
    const carbonTax = alliance.carbonTax || { ratePerTon: NEGOTIABLE_TERMS.carbonTaxRate.default, yearlyGrowthRate: NEGOTIABLE_TERMS.carbonTaxGrowth.default };
    const currentRate = carbonTax.ratePerTon || NEGOTIABLE_TERMS.carbonTaxRate.default;

    // Calculate monthly revenue from this region
    const climateData = getClimateDataForRegion(regionId);
    let monthlyRevenue = 0;
    if (climateData && climateData.emissions) {
      const emissionValue = typeof climateData.emissions === 'number' ? climateData.emissions : climateData.emissions.total || 0;
      monthlyRevenue = (emissionValue / 12) * currentRate;
    }

    // Check if there's a carbon tax limit demand for warning indicator
    const taxLimitDemand = alliance.demands?.find(d => d.type === 'carbonTaxLimit');
    const taxLimitWarning = taxLimitDemand && currentRate > taxLimitDemand.value;

    html += `
      <div class="region-carbon-tax-row" onclick="showCarbonTaxPopup('${regionId}')" title="Click to adjust carbon tax">
        <span class="region-carbon-tax-label">💰 Carbon Tax</span>
        <span class="region-carbon-tax-rate ${taxLimitWarning ? 'warning' : ''}">$${currentRate}/ton</span>
        <span class="region-carbon-tax-revenue">+${formatCurrency(monthlyRevenue)}/mo</span>
      </div>
    `;

    // Show active demands
    if (alliance.demands && alliance.demands.length > 0) {
      html += `<div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary);">
        <strong>Active Demands:</strong>
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          ${alliance.demands.map(d => {
            const demandType = DEMAND_TYPES[d.type];
            const met = demandType?.check(alliance, d.value);
            const text = demandType?.text.replace("{value}", d.value) || d.type;
            return `<li style="color: ${met ? 'var(--success-color)' : 'var(--warning-color)'}">${text} ${met ? '✓' : '✗'}</li>`;
          }).join("")}
        </ul>
      </div>`;
    }
  }

  // Show interest meter for non-allied regions (NEUTRAL and HOSTILE)
  if (alliance.status === ALLIANCE_STATUS.NEUTRAL || alliance.status === ALLIANCE_STATUS.HOSTILE) {
    const interest = alliance.interest || 50;
    const interestClass = getInterestClass(interest);
    const interestLabel = getInterestLabel(interest);

    html += `
      <div class="interest-meter" style="margin-top: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--text-secondary); font-size: 0.85rem;">Interest in Joining:</span>
          <button class="factor-help-btn" onclick="showInterestFactorsPopup('${regionId}')" title="View interest factors">?</button>
        </div>
        <div class="interest-bar" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <div style="flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
            <div class="${interestClass}" style="width: ${interest}%; height: 100%; transition: width 0.3s;"></div>
          </div>
          <span class="interest-value" style="font-size: 0.85rem; min-width: 80px;">${interest}% (${interestLabel})</span>
        </div>
      </div>
    `;

    // Show factors affecting interest
    const factors = alliance.interestFactors || {};
    const factorsList = [];
    if (factors.globalTemp > 0) factorsList.push(`🌡️ Climate urgency: +${factors.globalTemp}`);
    if (factors.allianceSuccess > 0) factorsList.push(`🤝 Alliance momentum: +${factors.allianceSuccess}`);
    if (factors.neighborInfluence > 0) factorsList.push(`🏘️ Neighbor influence: +${factors.neighborInfluence}`);
    if (factors.economicBenefit > 0) factorsList.push(`📈 Alliance success: +${factors.economicBenefit}`);
    if (factors.economicBenefit < 0) factorsList.push(`📉 Alliance struggling: ${factors.economicBenefit}`);
    if (factors.disasterAwareness > 0) factorsList.push(`🌪️ Disaster awareness: +${factors.disasterAwareness}`);

    if (factorsList.length > 0) {
      html += `<div style="margin-top: 6px; font-size: 0.75rem; color: var(--text-tertiary);">
        ${factorsList.join('<br>')}
      </div>`;
    }

    // Show cooldown info for hostile regions
    if (alliance.status === ALLIANCE_STATUS.HOSTILE && alliance.hostileUntil) {
      const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
      const monthsRemaining = alliance.hostileUntil - currentMonth;
      if (monthsRemaining > 0) {
        html += `<div style="margin-top: 6px; font-size: 0.8rem; color: var(--warning-color);">
          ⏳ Cannot negotiate for ${monthsRemaining} more month${monthsRemaining > 1 ? 's' : ''}
        </div>`;
      }
    }

    // Show approach cooldown
    if (alliance.lastApproached) {
      const currentMonth = (state.year - GAME_CONFIG.startYear) * 12 + state.month;
      const monthsSinceApproach = currentMonth - alliance.lastApproached;
      const cooldownRemaining = NEGOTIATION_COOLDOWN_MONTHS - monthsSinceApproach;
      if (cooldownRemaining > 0 && alliance.status !== ALLIANCE_STATUS.HOSTILE) {
        html += `<div style="margin-top: 6px; font-size: 0.8rem; color: var(--text-tertiary);">
          ⏳ Recently approached - wait ${cooldownRemaining} month${cooldownRemaining > 1 ? 's' : ''}
        </div>`;
      }
    }
  }

  return html;
}

function initGame() {
  clearSavedGame();
  const regionIds = getRegionIds();
  const regions = {};
  regionOffsets = {};
  regionIds.forEach((regionId) => {
    const offset = getRegionOffset(regionId);
    regionOffsets[regionId] = offset;

    // Get base income from climate data
    const climateData = getClimateDataForRegion(regionId);
    const baseIncome = climateData?.baseIncome || GAME_CONFIG.baseIncome;
    const sectorIncome = climateData?.sectorIncome || null;

    // Get power data from climate data
    const powerData = climateData?.power || {};
    const baseDemandGW = powerData.baseDemandGW || 100;
    const currentMix = powerData.currentMixTWh;

    // Initialize power state with existing infrastructure based on real power mix
    let existingSupply, existingBaseload, existingVariable;

    if (currentMix) {
      // Use real 2024 power mix data to calculate ratios
      const totalTWh = (currentMix.coal || 0) + (currentMix.gas || 0) +
                       (currentMix.nuclear || 0) + (currentMix.hydro || 0) +
                       (currentMix.wind || 0) + (currentMix.solar || 0) +
                       (currentMix.other || 0);
      const variableTWh = (currentMix.wind || 0) + (currentMix.solar || 0);
      const baseloadTWh = totalTWh - variableTWh;

      const variableRatio = totalTWh > 0 ? variableTWh / totalTWh : 0.15;
      const baseloadRatio = totalTWh > 0 ? baseloadTWh / totalTWh : 0.70;

      existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;
      existingVariable = existingSupply * variableRatio;
      existingBaseload = existingSupply * baseloadRatio;
    } else {
      existingSupply = baseDemandGW * POWER_CONFIG.existingSupplyRatio;
      existingBaseload = existingSupply * POWER_CONFIG.existingBaseloadRatio;
      existingVariable = existingSupply * POWER_CONFIG.existingVariableRatio;
    }

    // Get GDP from climate data for economy tracking
    const regionGdp = climateData?.gdp || 1.0;
    const regionGrowthRate = getRegionGrowthRate(regionId);

    regions[regionId] = {
      temp: GAME_CONFIG.startingTemp + offset,
      projects: [],
      baseIncome,
      sectorIncome: sectorIncome ? { ...sectorIncome } : null,
      incomeModifiers: {}, // Track income changes from projects
      // Power grid state
      power: {
        demand: baseDemandGW,              // GW needed
        supply: existingSupply,            // GW available (starts at ~85% of demand)
        stability: 85,                     // Grid stability (0-100)
        variableCapacity: existingVariable, // GW from solar/wind
        baseloadCapacity: existingBaseload, // GW from nuclear/coal/gas/hydro
        storageCapacity: 0,                // GWh of storage
        pricePerKwh: POWER_CONFIG.basePrice, // $/kWh
        gdpModifier: 1.0,                  // Multiplier on income
        blackoutRisk: false,               // true if stability < 30
        // Track new player-built capacity separately
        playerVariableGW: 0,
        playerBaseloadGW: 0,
        playerStorageGWh: 0,
      },
      // Economy tracking (GDP growth)
      economy: {
        gdp: regionGdp,                    // Current GDP in trillions
        baseGdp: regionGdp,                // Starting GDP for reference
        growthRate: regionGrowthRate,      // Annual growth rate
      },
      // Emissions tracking
      emissions: {
        current: calculateRegionEmissions(regionId, climateData),
        baseline: climateData?.emissions?.total || 0,
        trend: 0,                          // Monthly change %
      },
      // Sector emissions (non-power) - initialized from baseline
      sectorEmissions: initializeSectorEmissions(climateData),
      // Retired fossil capacity (for replacement builds)
      retiredFossilGW: {
        coal: 0,
        gas: 0,
      },
    };
  });

  const difficulty = getDifficulty();

  state = {
    funds: difficulty.startingFunds,
    co2: GAME_CONFIG.startingCo2,
    temperature: GAME_CONFIG.startingTemp,
    year: GAME_CONFIG.startYear,
    month: GAME_CONFIG.startMonth,
    regions,
    gameOver: false,
    won: false,
    winStreakMonths: 0,
    loseStreakMonths: 0,
    activeCampaigns: [], // Active Climate Policy Campaigns
    difficulty: currentDifficulty,
    // New tracking for advanced features
    researchPoints: 0,  // Legacy - kept for compatibility
    unlockedTechs: [],
    // New regional research system
    regionalResearchCenters: {},  // regionId -> { level, field, projectId }
    techProgress: {},             // techId -> accumulated RP toward unlock
    centerCooldowns: {},          // regionId -> months remaining until active
    achievements: [],
    history: [], // Monthly snapshots for graphs
    emissionsHistory: [], // Monthly emissions snapshots for trends
    tippingPointsTriggered: [],
    activeEvents: [],
    totalSpent: 0, // Track total project spending for achievements
    campaignHistory: [], // Track unique campaign countries for achievements
    // Natural disaster system
    activeDisasters: [],   // Currently active disasters
    disasterHistory: {},   // Track disaster history per region for awareness
    // Diplomatic Alliance system
    alliance: initializeAllianceState(regions),
    homeRegion: null,      // Will be set when player chooses starting region
    pendingNegotiation: null, // Current negotiation in progress
    // Construction system
    underConstruction: [], // Projects currently being built
    // Global carbon tax system
    globalCarbonTax: {
      ratePerTon: 25,        // $/ton CO2 (starting value)
      monthlyGrowthRate: 0.5 // % increase per month
    },
  };

  // Recalculate power stats for all regions (calculates stability from power mix)
  updateAllPowerGrids();

  selectedRegionId = null;

  clearNews();

  // Enter setup mode for region selection
  enterSetupMode();
}

/**
 * Calculate detailed income breakdown for next month (without modifying state)
 * @returns {Object} Breakdown of all income sources
 */
function calculateIncomeBreakdown() {
  const breakdown = {
    climateBudget: { total: 0, byRegion: {} },
    carbonTax: { total: 0, byRegion: {} },
    projects: { total: 0, byType: {} },
    costs: { researchCenters: 0, projectUpkeep: 0, projectUpkeepByType: {} },
    eventMultiplier: getEventIncomeMultiplier(),
    grossTotal: 0,
    netTotal: 0,
  };

  // Calculate climate budget income from each allied region
  Object.entries(state.regions).forEach(([regionId, region]) => {
    // Use getClimateDataForRegion which properly handles all granularity levels
    const climateData = getClimateDataForRegion(regionId);
    const allianceData = state.alliance?.[regionId];
    const isAllied = allianceData?.status === ALLIANCE_STATUS.ALLIED;

    if (!isAllied) return;

    // Get modifiers
    const gdpContributionMod = allianceData?.gdpContribution || 1.0;
    const powerGdpMod = region.power?.gdpModifier || 1.0;
    const disasterMult = getDisasterIncomeMultiplier(regionId);

    // Climate budget income
    let regionClimateBudget = 0;
    let gdpTrillions = 0;
    let climatePercent = 0;

    if (climateData && climateData.climateFinance) {
      gdpTrillions = climateData.gdp || 1;
      climatePercent = climateData.climateFinance.currentPercent;
      regionClimateBudget = (gdpTrillions * climatePercent / 100) / 12 * 1000;
      regionClimateBudget *= GAME_CONFIG.climateBudgetIncomeMultiplier;
      regionClimateBudget *= disasterMult * gdpContributionMod * powerGdpMod;
    }

    if (regionClimateBudget > 0) {
      const regionName = getRegionName(regionId);
      breakdown.climateBudget.byRegion[regionId] = {
        name: regionName,
        amount: regionClimateBudget,
        gdp: gdpTrillions,
        dedication: climatePercent,
      };
      breakdown.climateBudget.total += regionClimateBudget;
    }

    // Carbon tax revenue
    let emissions = 0;
    if (climateData && climateData.emissions) {
      // Handle emissions as either a number or an object with .total
      const emissionValue = typeof climateData.emissions === 'number'
        ? climateData.emissions
        : climateData.emissions.total || 0;
      emissions = emissionValue / 12;
    }

    const taxRate = allianceData.carbonTax?.ratePerTon || NEGOTIABLE_TERMS.carbonTaxRate.default;
    const taxRevenue = emissions * taxRate;

    if (taxRevenue > 0) {
      const regionName = getRegionName(regionId);
      breakdown.carbonTax.byRegion[regionId] = {
        name: regionName,
        amount: taxRevenue,
        emissions: emissions,
        rate: taxRate,
      };
      breakdown.carbonTax.total += taxRevenue;
    }

    // Project income
    region.projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (!project) return;

      const incomeBonus = getTechIncomeBonus(projectType) * getEventBonusForProject(projectType, "income");
      const projectIncome = project.income * effectMult * incomeBonus * disasterMult;
      const projectUpkeep = getProjectMonthlyUpkeep(projectType);

      if (projectIncome > 0) {
        if (!breakdown.projects.byType[projectType]) {
          breakdown.projects.byType[projectType] = {
            name: project.name,
            count: 0,
            amount: 0,
          };
        }
        breakdown.projects.byType[projectType].count++;
        breakdown.projects.byType[projectType].amount += projectIncome;
        breakdown.projects.total += projectIncome;
      }

      if (projectUpkeep > 0) {
        if (!breakdown.costs.projectUpkeepByType[projectType]) {
          breakdown.costs.projectUpkeepByType[projectType] = {
            name: project.name,
            count: 0,
            amount: 0,
          };
        }
        breakdown.costs.projectUpkeepByType[projectType].count++;
        breakdown.costs.projectUpkeepByType[projectType].amount += projectUpkeep;
        breakdown.costs.projectUpkeep += projectUpkeep;
      }
    });
  });

  // Research center costs
  breakdown.costs.researchCenters = getResearchCenterMonthlyCost();

  // Calculate totals
  let grossIncome = breakdown.climateBudget.total + breakdown.carbonTax.total + breakdown.projects.total;

  // Apply minimum income if needed
  if (grossIncome === 0) {
    grossIncome = GAME_CONFIG.baseIncome;
  }

  // Apply event multiplier
  grossIncome *= breakdown.eventMultiplier;

  breakdown.grossTotal = grossIncome;
  breakdown.netTotal = grossIncome - breakdown.costs.researchCenters - breakdown.costs.projectUpkeep;

  return breakdown;
}

function nextMonth() {
  if (state.gameOver) {
    return;
  }

  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
    // Decay disaster awareness at start of each year
    decayDisasterAwareness();
  }

  // Update power grids for all regions
  updateAllPowerGrids();

  // Update growth systems (GDP and emissions)
  updateRegionalGdp();
  updateRegionalEmissions();
  updateAllSectorEmissions();

  // Update carbon balance (emissions vs removals)
  calculateCarbonBalance();

  // Process construction progress
  processConstruction();

  // Generate power-related warnings
  Object.entries(state.regions).forEach(([regionId, region]) => {
    if (region.power?.blackoutRisk) {
      const regionName = getRegionName(regionId);
      if (Math.random() < 0.3) {
        pushMessage(`${regionName} experiencing rolling blackouts! Grid stability critical.`, "bad");
      }
    }
  });

  // Calculate CO2 change from carbon balance (emissions - removals)
  const carbonBalance = getCarbonBalance();
  const basePpmChange = carbonBalance.ppmChange; // Already calculated in calculateCarbonBalance()

  // Apply difficulty multiplier to the base ppm change
  const difficulty = getDifficulty();
  const adjustedPpmChange = basePpmChange * difficulty.co2Multiplier;

  // Add climate feedback effects (tipping points + feedback loops)
  const feedbackEffect = getTotalClimateFeedback();
  const totalCO2Increase = adjustedPpmChange + feedbackEffect;
  state.co2 += totalCO2Increase;

  // Ensure CO2 doesn't go below pre-industrial baseline (280 ppm)
  state.co2 = Math.max(GAME_CONFIG.baselineCo2, state.co2);

  let totalReduction = 0;
  let totalIncome = 0;

  // Get forest effectiveness modifier (reduced by Amazon dieback tipping point)
  const forestMod = getForestEffectivenessModifier();

  // Calculate income from each country's climate finance (GDP × climate%)
  // ALLIANCE SYSTEM: Only allied regions contribute income
  Object.entries(state.regions).forEach(([regionId, region]) => {
    // Use getClimateDataForRegion which properly handles all granularity levels
    const climateData = getClimateDataForRegion(regionId);

    // Check if region is allied - only allied regions contribute income
    const allianceData = state.alliance?.[regionId];
    const isAllied = allianceData?.status === ALLIANCE_STATUS.ALLIED;

    // Climate finance income (GDP × climate%) - only from allied regions
    if (isAllied) {
      // Get GDP contribution modifier from alliance happiness
      const gdpContributionMod = allianceData?.gdpContribution || 1.0;

      // Get power grid GDP modifier (power shortages, high prices, instability)
      const powerGdpMod = region.power?.gdpModifier || 1.0;

      // Get disaster multiplier
      const disasterMult = getDisasterIncomeMultiplier(regionId);

      if (climateData && climateData.climateFinance) {
        // Monthly income = (GDP in trillions × climate% / 100) / 12
        // Result is in billions per month
        const gdpTrillions = climateData.gdp || 1;
        const climatePercent = climateData.climateFinance.currentPercent;
        let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000; // Convert to billions
        monthlyClimateIncome *= GAME_CONFIG.climateBudgetIncomeMultiplier;
        // Apply all modifiers
        monthlyClimateIncome *= disasterMult * gdpContributionMod * powerGdpMod;
        // Track contribution for happiness calculations
        if (allianceData) {
          allianceData.totalContributed += monthlyClimateIncome;
        }
        totalIncome += monthlyClimateIncome;
      }
    }

    // Add income from projects
    // ALLIANCE SYSTEM: Projects only work in allied regions
    // Get disaster multiplier for this region (affects both income and project effectiveness)
    const disasterMult = getDisasterIncomeMultiplier(regionId);

    // Note: allianceData and isAllied already declared above for this region

    region.projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (!project) {
        return;
      }

      // Projects in non-allied regions are inactive (no reduction or income)
      if (!isAllied) {
        return;
      }

      // Apply forest effectiveness modifier to forest projects
      let reduction = project.co2Reduction * effectMult;
      if (projectType === "forest") {
        reduction *= forestMod;
      }
      // Apply technology bonuses
      reduction *= getTechCO2Bonus(projectType);
      // Apply event bonuses (breakthrough events)
      reduction *= getEventBonusForProject(projectType, "co2Reduction");
      // Apply event project effectiveness modifier (temporary events)
      reduction *= getEventProjectEffectiveness();
      // Apply disaster reduction to project effectiveness (damaged infrastructure)
      reduction *= disasterMult;

      const incomeBonus = getTechIncomeBonus(projectType) * getEventBonusForProject(projectType, "income");
      const projectUpkeep = getProjectMonthlyUpkeep(projectType);

      totalReduction += reduction;
      // Apply disaster reduction to project income (disrupted operations)
      totalIncome += project.income * effectMult * incomeBonus * disasterMult;
      totalIncome -= projectUpkeep;
    });

    // Track alliance turns for loyalty bonus
    if (isAllied && allianceData) {
      allianceData.turnsInAlliance++;
    }
  });

  // Calculate carbon tax revenue from allied regions (using per-region tax rates)
  let carbonTaxRevenue = 0;
  Object.entries(state.regions).forEach(([regionId, region]) => {
    // Use getClimateDataForRegion which properly handles all granularity levels
    const climateData = getClimateDataForRegion(regionId);
    const allianceData = state.alliance?.[regionId];
    const isAllied = allianceData?.status === ALLIANCE_STATUS.ALLIED;

    if (isAllied && climateData) {
      // Get regional emissions (GtCO2/year, convert to monthly)
      let emissions = 0;
      if (climateData.emissions) {
        // Handle emissions as either a number or an object with .total
        const emissionValue = typeof climateData.emissions === 'number'
          ? climateData.emissions
          : climateData.emissions.total || 0;
        emissions = emissionValue / 12; // Monthly GtCO2
      }

      // Get per-region carbon tax rate (fallback to default if not set)
      const regionTaxRate = allianceData.carbonTax?.ratePerTon || NEGOTIABLE_TERMS.carbonTaxRate.default;

      // Revenue = emissions (GtCO2) * rate ($/ton)
      // 1 GtCO2 = 1 billion tons, so emissions * rate gives billions of dollars
      carbonTaxRevenue += emissions * regionTaxRate;
    }
  });
  totalIncome += carbonTaxRevenue;

  // Apply yearly carbon tax growth in January for all allied regions
  if (state.month === 1) {
    Object.entries(state.alliance).forEach(([regionId, alliance]) => {
      if (alliance.status === ALLIANCE_STATUS.ALLIED && alliance.carbonTax) {
        const yearlyGrowth = alliance.carbonTax.yearlyGrowthRate || NEGOTIABLE_TERMS.carbonTaxGrowth.default;
        alliance.carbonTax.ratePerTon *= (1 + yearlyGrowth / 100);
      }
    });
  }

  // Fallback minimum income
  if (totalIncome === 0) {
    totalIncome = GAME_CONFIG.baseIncome;
  }

  // Apply event income multiplier
  totalIncome *= getEventIncomeMultiplier();

  // Process active Climate Policy Campaigns
  processCampaigns();

  // Note: project CO2 reductions are already included in calculateCarbonBalance() (Path A, line ~10602).
  // Do NOT subtract totalReduction from state.co2 again here — that was a duplicate application
  // with wrong units (raw Gt/yr values instead of ppm), causing ~94× over-strong CO2 removal.
  state.funds += totalIncome;

  // Deduct global research center operating costs
  const rcMonthlyCost = getResearchCenterMonthlyCost();
  state.funds -= rcMonthlyCost;

  state.temperature = calculateTemperature(state.co2);
  updateRegionTemps();

  // Check for new tipping points crossed
  checkTippingPoints();

  // Process existing events and roll for new ones
  processEvents();
  rollForEvents();

  // Process natural disasters
  processDisasterDurations();
  const newDisasters = rollForDisasters(state.temperature);
  state.newDisastersThisMonth = newDisasters.length; // Track for header display
  const disasterPopupEvents = [];
  newDisasters.forEach((disaster) => {
    state.activeDisasters.push(disaster);
    updateDisasterAwareness(disaster.regionId, disaster.incomeReduction);

    // Apply volcanic CO2 emissions (geological events release CO2)
    if (disaster.co2Emission && disaster.co2Emission > 0) {
      applyVolcanicCO2Emission(disaster);
    }

    // Process alliance-differentiated effects (interest/happiness based on alliance status)
    processDisasterAllianceEffects(disaster);

    const reductionPercent = Math.round(disaster.incomeReduction * 100);
    pushMessage(`${disaster.icon} ${disaster.typeName} strikes ${disaster.regionName}! ${disaster.description} Income reduced by ${reductionPercent}% for ${disaster.duration} months.`, "bad");

    // Collect for popup
    disasterPopupEvents.push({
      icon: disaster.icon,
      title: disaster.typeName,
      description: disaster.description,
      summary: `${disaster.regionName}: -${reductionPercent}% income for ${disaster.duration} months`,
      details: `<strong>${disaster.regionName}</strong><br>Income reduced by ${reductionPercent}% for ${disaster.duration} months`,
      combinedDescription: "Multiple climate disasters struck this month:",
    });
  });

  // Show disaster popup(s)
  if (disasterPopupEvents.length > 0) {
    showCombinedEventPopup("disaster", "Natural Disasters", "🌪️", disasterPopupEvents);
  }

  // Update alliance happiness and check for leaving regions
  updateAllianceHappiness();

  // Update interest for non-allied regions
  updateRegionInterest();

  // Check for spontaneous join requests from high-interest regions
  checkSpontaneousJoining();

  // Update alliance map visuals
  updateAllianceMapVisuals();

  // Generate research points from research centers
  const researchPointsGained = generateResearchPoints();

  // Track history for graphs
  if (state.history) {
    state.history.push({
      year: state.year,
      month: state.month,
      co2: state.co2,
      temperature: state.temperature,
      funds: state.funds,
      totalReduction,
      totalIncome,
      feedbackEffect,
      tippingPointsActive: state.tippingPointsTriggered.length,
      researchPoints: state.researchPoints,
      researchPointsGained,
    });
  }

  // Track emissions history for trends (keep last 24 months)
  if (state.emissionsHistory) {
    state.emissionsHistory.push(getEmissionsSnapshot());
    if (state.emissionsHistory.length > 24) {
      state.emissionsHistory.shift();
    }
  }

  const netChange = totalReduction - totalCO2Increase;
  const tone = netChange >= 0 ? "good" : "bad";

  // Build message with feedback info if significant
  let message = `Month advanced. Income: +${formatCurrency(totalIncome)}. CO2: ${state.co2.toFixed(1)} ppm.`;
  if (feedbackEffect > 0.01) {
    message += ` (Feedback: +${feedbackEffect.toFixed(2)} ppm)`;
  }
  pushMessage(message, tone);

  // Check for newly unlocked achievements
  checkAchievements();

  updateEndgameStreaks();
  checkWinLose();
  updateUI();
  saveGame();
}

function isPlayerPromptOpen() {
  return (
    isPopupShowing ||
    popupQueue.length > 0 ||
    !!document.querySelector(
      ".popup-container:not(.hidden), .assignment-modal-overlay, #spontaneous-join-overlay, #negotiation-overlay, #build-mode-overlay"
    )
  );
}

function advanceOneYear() {
  for (let i = 0; i < 12; i++) {
    if (state.gameOver || isPlayerPromptOpen()) {
      break;
    }

    nextMonth();

    if (state.gameOver || isPlayerPromptOpen()) {
      break;
    }
  }
}

// Format currency as "$X.X B"
function formatCurrency(amount) {
  if (amount >= 1000) {
    return `${GAME_CONFIG.currencySymbol}${(amount / 1000).toFixed(1)} T`;
  }
  return `${GAME_CONFIG.currencySymbol}${amount.toFixed(1)} ${GAME_CONFIG.currencyUnit}`;
}

function formatCO2ReductionValue(value, decimals) {
  const rounded = Number(value.toFixed(decimals));
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  return normalized.toFixed(decimals);
}

function formatCO2ReductionDisplay(value, decimals, unit) {
  const formattedMagnitude = formatCO2ReductionValue(Math.abs(value), decimals);
  const roundedMagnitude = Number(formattedMagnitude);
  const sign = roundedMagnitude === 0 ? "" : value > 0 ? "-" : "+";
  return `${sign}${formattedMagnitude} ${unit}`;
}

// Process ongoing Climate Policy Campaigns
function processCampaigns() {
  if (!state.activeCampaigns) {
    state.activeCampaigns = [];
  }

  const completedCampaigns = [];

  state.activeCampaigns.forEach((campaign, index) => {
    campaign.monthsRemaining -= 1;

    if (campaign.monthsRemaining <= 0) {
      // Campaign complete - increase climate dedication
      if (campaign.isAggregate && campaign.countries) {
        // Aggregate campaign - apply effect to all constituent countries
        let totalOldPercent = 0;
        let totalNewPercent = 0;
        let countriesAffected = 0;

        campaign.countries.forEach(countryId => {
          const countryData = CLIMATE_DATA.COUNTRY_DATA?.[countryId];
          if (countryData && countryData.climateFinance) {
            const oldPercent = countryData.climateFinance.currentPercent;
            const newPercent = Math.min(
              countryData.climateFinance.maxPercent,
              oldPercent + campaign.increaseAmount
            );
            countryData.climateFinance.currentPercent = newPercent;
            totalOldPercent += oldPercent;
            totalNewPercent += newPercent;
            countriesAffected++;
          }
        });

        if (countriesAffected > 0) {
          const avgOld = totalOldPercent / countriesAffected;
          const avgNew = totalNewPercent / countriesAffected;
          pushMessage(
            `Regional Climate Policy Campaign succeeded! ${campaign.countryName} region (${countriesAffected} countries) increased average climate spending from ${avgOld.toFixed(1)}% to ${avgNew.toFixed(1)}% of GDP.`,
            "good"
          );
        }
      } else {
        // Single country campaign
        const countryData = CLIMATE_DATA.COUNTRY_DATA?.[campaign.regionId] || CLIMATE_DATA[campaign.regionId];
        if (countryData && countryData.climateFinance) {
          const oldPercent = countryData.climateFinance.currentPercent;
          const newPercent = Math.min(
            countryData.climateFinance.maxPercent,
            oldPercent + campaign.increaseAmount
          );
          countryData.climateFinance.currentPercent = newPercent;

          const countryName = countryData.name || campaign.regionId;
          pushMessage(
            `Climate Policy Campaign succeeded! ${countryName} increased climate spending from ${oldPercent.toFixed(1)}% to ${newPercent.toFixed(1)}% of GDP.`,
            "good"
          );
        }
      }
      completedCampaigns.push(index);
    }
  });

  // Remove completed campaigns (in reverse order to maintain indices)
  completedCampaigns.reverse().forEach((index) => {
    state.activeCampaigns.splice(index, 1);
  });
}

// Helper function to get climate finance data for any region type
function getRegionClimateData(regionId) {
  // Try country-level data first
  const countryData = CLIMATE_DATA.COUNTRY_DATA?.[regionId];
  if (countryData && countryData.climateFinance) {
    return {
      name: countryData.name,
      gdp: countryData.gdp || 1,
      climateFinance: countryData.climateFinance,
      isAggregate: false
    };
  }

  // Try region aggregate (continent level)
  const aggregateData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  if (aggregateData && aggregateData.countries) {
    // Aggregate climate finance from constituent countries
    const countries = aggregateData.countries
      .map(id => CLIMATE_DATA.COUNTRY_DATA?.[id])
      .filter(c => c && c.climateFinance);

    if (countries.length === 0) {
      return null;
    }

    // Calculate weighted averages based on GDP
    const totalGdp = countries.reduce((sum, c) => sum + (c.gdp || 1), 0);
    const weightedCurrentPercent = countries.reduce((sum, c) =>
      sum + (c.climateFinance.currentPercent * (c.gdp || 1)), 0) / totalGdp;
    const weightedMaxPercent = countries.reduce((sum, c) =>
      sum + (c.climateFinance.maxPercent * (c.gdp || 1)), 0) / totalGdp;
    const weightedMinPercent = countries.reduce((sum, c) =>
      sum + (c.climateFinance.minPercent * (c.gdp || 1)), 0) / totalGdp;
    const avgDifficulty = countries.reduce((sum, c) =>
      sum + c.climateFinance.difficulty, 0) / countries.length;
    const avgResistance = countries.reduce((sum, c) =>
      sum + c.climateFinance.politicalResistance, 0) / countries.length;

    return {
      name: aggregateData.name,
      gdp: aggregateData.gdp || totalGdp,
      climateFinance: {
        currentPercent: weightedCurrentPercent,
        maxPercent: weightedMaxPercent,
        minPercent: weightedMinPercent,
        difficulty: avgDifficulty,
        politicalResistance: avgResistance
      },
      isAggregate: true,
      countries: aggregateData.countries
    };
  }

  return null;
}

// Start a Climate Policy Campaign in a region
function startClimateCampaign(regionId) {
  const regionData = getRegionClimateData(regionId);
  if (!regionData) {
    pushMessage("Cannot start campaign: no climate finance data for this region.", "bad");
    return false;
  }

  const finance = regionData.climateFinance;

  // Check if already at max
  if (finance.currentPercent >= finance.maxPercent) {
    pushMessage(`${regionData.name} is already at maximum climate dedication (${finance.maxPercent.toFixed(1)}% of GDP).`, "bad");
    return false;
  }

  // Check if campaign already active for this region
  if (state.activeCampaigns.some((c) => c.regionId === regionId)) {
    pushMessage(`A Climate Policy Campaign is already active in ${regionData.name}.`, "bad");
    return false;
  }

  // Calculate campaign cost and duration
  const gdpTrillions = regionData.gdp || 1;
  // Apply disaster awareness modifier - regions that experienced disasters are easier to campaign
  const awarenessModifier = getDisasterAwarenessModifier(regionId);
  // Aggregate campaigns cost more due to complexity
  const aggregateMultiplier = regionData.isAggregate ? 1.5 : 1.0;
  const cost = gdpTrillions * GAME_CONFIG.lobbyCostFactor * finance.difficulty * awarenessModifier * aggregateMultiplier * 1000; // In billions
  const duration = Math.ceil(
    GAME_CONFIG.lobbyBaseMonths * finance.difficulty * finance.politicalResistance * awarenessModifier * aggregateMultiplier
  );

  // Smart increase based on remaining room to max
  // More room = larger increase, close to max = smaller increase (diminishing returns)
  const remainingRoom = Math.max(0, finance.maxPercent - finance.currentPercent);
  const difficultyMultiplier = 1 - finance.difficulty * 0.5; // 0.5 to 1.0 (easier = higher)
  // Take 20-30% of remaining room based on difficulty
  const increasePercent = 0.2 + (0.1 * difficultyMultiplier);
  const increaseAmount = Math.max(
    GAME_CONFIG.lobbyMinIncrease * 0.5, // Minimum useful increase
    Math.min(remainingRoom * increasePercent, remainingRoom) // Cap at remaining room
  );

  // Check if player can afford it
  if (state.funds < cost) {
    pushMessage(`Cannot afford Climate Policy Campaign in ${regionData.name}. Cost: ${formatCurrency(cost)}.`, "bad");
    return false;
  }

  // Deduct cost and start campaign
  state.funds -= cost;
  state.activeCampaigns.push({
    regionId,
    countryName: regionData.name,
    monthsRemaining: duration,
    totalMonths: duration,
    increaseAmount,
    cost,
    isAggregate: regionData.isAggregate,
    countries: regionData.countries // Track which countries are affected for aggregate campaigns
  });

  // Track campaign history for achievements
  if (!state.campaignHistory) state.campaignHistory = [];
  if (!state.campaignHistory.includes(regionId)) {
    state.campaignHistory.push(regionId);
  }

  const campaignType = regionData.isAggregate ? "Regional Climate Policy Campaign" : "Climate Policy Campaign";
  pushMessage(
    `${campaignType} started in ${regionData.name}! Cost: ${formatCurrency(cost)}. Duration: ${formatConstructionTime(duration)}. Expected increase: +${increaseAmount.toFixed(2)}% GDP.`,
    "good"
  );

  updateUI();
  return true;
}

function updateRegionTemps() {
  if (!state?.regions) {
    return;
  }
  Object.keys(state.regions).forEach((regionId) => {
    state.regions[regionId].temp = state.temperature + regionOffsets[regionId];
  });
}

function selectRegion(regionId) {
  mapDebug('[Map] selectRegion:', regionId, 'isSetupMode:', isSetupMode);

  // In setup mode, allow selection without state.regions check
  if (isSetupMode) {
    selectedRegionId = regionId;
    updateSetupUI();
    updateMapColors();
    return;
  }

  // Normal game mode - check state availability
  if (!state?.regions) {
    console.warn('[Map] selectRegion: state.regions not initialized');
    return;
  }

  if (!state.regions[regionId]) {
    console.warn('[Map] selectRegion: region not in state:', regionId);
    // Still update selection visually even if region not in state
    selectedRegionId = regionId;
    updateMapColors();
    return;
  }

  selectedRegionId = regionId;
  updateUI();

  // Auto-switch to Region tab when a region is clicked
  switchToTab('region');
}

// ═══════════════════════════════════════════════════════════════
// CONSTRUCTION SYSTEM
// ═══════════════════════════════════════════════════════════════

function formatConstructionTime(months) {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years}y`;
    }
    return `${years}y ${remainingMonths}mo`;
  }
  return `${months}mo`;
}

function startConstruction(regionId, projectType, cost, effectMultiplier, buildMode, replaceCapacityGW = 0, replaceFossilType = null) {
  const project = PROJECT_TYPES[projectType];
  const region = state.regions[regionId];
  const allianceData = state.alliance?.[regionId];

  // Deduct funds
  state.funds -= cost;

  // Track total spending for achievements
  if (!state.totalSpent) state.totalSpent = 0;
  state.totalSpent += cost;

  // Track spending in this region for happiness calculation
  if (allianceData) {
    allianceData.spentInRegion += cost;

    // Track project types for demand compliance
    if (project.category === "economic") {
      allianceData.economicProjectCount++;
    }
    if (project.income > 0) {
      allianceData.jobProjectCount++;
    }
    if (projectType === "nuclear") {
      allianceData.hasNuclear = true;
    }

    // Building projects increases happiness slightly
    // Nuclear is controversial and has neutral happiness effect
    let happinessBonus = 0;
    if (projectType === "nuclear") {
      happinessBonus = 0; // Nuclear is controversial - neutral effect
    } else if (project.category === "economic") {
      happinessBonus = 8;
    } else {
      happinessBonus = 5;
    }
    allianceData.happiness = Math.min(100, allianceData.happiness + happinessBonus);
  }

  const constructionMonths = project.constructionMonths || 1;

  // Add to under construction list
  state.underConstruction.push({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    regionId,
    type: projectType,
    effectMultiplier: effectMultiplier || 1.0,
    cost,
    monthsTotal: constructionMonths,
    monthsRemaining: constructionMonths,
    startDate: { year: state.year, month: state.month },
    buildMode: buildMode || "add",
    replaceCapacityGW: replaceCapacityGW || 0,
    replaceFossilType: replaceFossilType || null,
  });

  const regionName = getRegionName(regionId);
  const timeStr = formatConstructionTime(constructionMonths);

  let modeStr = "";
  if (buildMode === "replace" && replaceCapacityGW > 0) {
    modeStr = ` Will retire ${replaceCapacityGW.toFixed(1)} GW ${replaceFossilType} on completion.`;
  }

  pushMessage(`Construction started: ${project.label} in ${regionName}. ${timeStr} to completion.${modeStr}`, "good");
  updateUI();
}

function processConstruction() {
  if (!state.underConstruction || state.underConstruction.length === 0) {
    return;
  }

  // Process all projects
  const completed = [];
  state.underConstruction.forEach(c => {
    c.monthsRemaining -= 1;
    if (c.monthsRemaining <= 0) {
      completed.push(c);
    }
  });

  // Complete finished projects
  completed.forEach(c => {
    completeConstruction(c);
  });

  // Remove completed projects
  state.underConstruction = state.underConstruction.filter(c => c.monthsRemaining > 0);
}

function completeConstruction(construction) {
  const region = state.regions[construction.regionId];
  const project = PROJECT_TYPES[construction.type];
  const regionName = getRegionName(construction.regionId);

  if (!region || !project) {
    console.warn("Cannot complete construction - region or project not found");
    return;
  }

  // Add to completed projects (with effectMultiplier if applicable)
  if (construction.effectMultiplier && construction.effectMultiplier !== 1.0) {
    region.projects.push({
      type: construction.type,
      effectMultiplier: construction.effectMultiplier,
    });
  } else {
    region.projects.push(construction.type);
  }

  // Update power grid if it's a power project
  if (project.category === "power" && region.power) {
    const capacityGW = project.capacityGW || 0;
    const storageGWh = project.storageGWh || 0;
    const stabilityBonus = project.stabilityContribution || 0;

    // Add capacity based on power category
    if (project.powerCategory === "variable") {
      region.power.playerVariableGW += capacityGW;
      region.power.variableCapacity += capacityGW;
    } else if (project.powerCategory === "baseload") {
      region.power.playerBaseloadGW += capacityGW;
      region.power.baseloadCapacity += capacityGW;
    } else if (project.powerCategory === "storage") {
      region.power.playerStorageGWh += storageGWh;
      region.power.storageCapacity += storageGWh;
    }

    // Add stability contribution
    region.power.stability = Math.max(0, Math.min(100, region.power.stability + stabilityBonus));
  }

  // Handle fossil replacement
  if (construction.buildMode === "replace" && construction.replaceCapacityGW > 0 && construction.replaceFossilType) {
    region.retiredFossilGW[construction.replaceFossilType] += construction.replaceCapacityGW;
    pushMessage(`${regionName}: Retired ${construction.replaceCapacityGW.toFixed(1)} GW of ${construction.replaceFossilType} power.`, "good");
  }

  // Apply sector reductions if this is a sector reduction project
  if (project.sectorReduction && region.sectorEmissions) {
    applySectorReduction(region, project.sectorReduction);
  }

  // Handle electrification projects - increase power demand
  if (project.electrification) {
    const climateData = getClimateDataForRegion(construction.regionId);
    if (climateData?.power) {
      // Increase base power demand (stored in climate data for the region)
      const demandIncrease = project.electrification.powerDemandIncrease || 0;
      if (!region.power) {
        region.power = {};
      }
      // Track cumulative electrification demand increase
      region.power.electrificationDemandMultiplier = (region.power.electrificationDemandMultiplier || 1.0) * (1 + demandIncrease);
      pushMessage(`${regionName}: Power demand increased by ${Math.round(demandIncrease * 100)}% from electrification.`, "neutral");
    }
  }

  pushMessage(`${project.label} completed in ${regionName}!`, "good");
}

function getConstructionForRegion(regionId) {
  if (!state.underConstruction) return [];
  return state.underConstruction.filter(c => c.regionId === regionId);
}

function getTotalUnderConstruction() {
  return state.underConstruction?.length || 0;
}

function buildProject(regionId, projectType) {
  const region = state.regions[regionId];
  const project = PROJECT_TYPES[projectType];
  if (!region || !project || state.gameOver) {
    return;
  }

  // ALLIANCE SYSTEM: Check if region is allied before allowing project building
  const allianceData = state.alliance?.[regionId];
  if (!allianceData || allianceData.status !== ALLIANCE_STATUS.ALLIED) {
    const regionName = getRegionName(regionId);
    if (allianceData?.status === ALLIANCE_STATUS.HOSTILE) {
      pushMessage(`Cannot build in ${regionName} - they are hostile. Wait for cooldown to negotiate.`, "bad");
    } else {
      pushMessage(`Cannot build in ${regionName} - they must join the Climate Alliance first.`, "bad");
    }
    return;
  }

  // REGIONAL CAP CHECK: Limit projects of each type per region
  const regionalCap = REGIONAL_PROJECT_CAPS[projectType];
  if (regionalCap !== undefined && regionalCap !== null) {
    // Count existing projects of this type in this region (completed + under construction)
    const existingCount = region.projects.filter(p => {
      const pType = typeof p === "string" ? p : p.type;
      return pType === projectType;
    }).length;
    const underConstructionCount = (state.underConstruction || []).filter(c =>
      c.regionId === regionId && c.projectType === projectType
    ).length;
    const totalCount = existingCount + underConstructionCount;

    if (totalCount >= regionalCap) {
      const regionName = getRegionName(regionId);
      pushMessage(`${regionName} has reached maximum ${project.label} capacity (${regionalCap}). Try another region.`, "bad");
      return;
    }
  }

  // Apply difficulty-based cost multiplier
  const adjustedCost = getAdjustedCost(project.cost);

  if (state.funds < adjustedCost) {
    pushMessage(`Not enough funds for that project. Need ${formatCurrency(adjustedCost)}.`, "bad");
    return;
  }

  // Power projects with capacityGW > 0 get a build mode dialog
  if (project.capacityGW && project.capacityGW > 0) {
    showPowerBuildModeDialog(regionId, projectType, adjustedCost);
    return;
  }

  // Non-power projects start construction directly
  startConstruction(regionId, projectType, adjustedCost, 1.0, "add");
}

function showPowerBuildModeDialog(regionId, projectType, cost) {
  const project = PROJECT_TYPES[projectType];
  const region = state.regions[regionId];
  const regionName = getRegionName(regionId);
  const climateData = getClimateDataForRegion(regionId);

  // Get available fossil capacity from climate data
  const powerMix = climateData?.power?.currentMixTWh || {};
  const coalTWh = powerMix.coal || 0;
  const gasTWh = powerMix.gas || 0;

  // Use correct capacity factors
  const coalCapacityFactor = CAPACITY_FACTORS?.coal || 0.50;
  const gasCapacityFactor = CAPACITY_FACTORS?.naturalGas || 0.45;

  // Convert TWh to GW: GW = TWh / (capacity_factor * 8.76)
  const coalGW = coalTWh / (coalCapacityFactor * 8.76);
  const gasGW = gasTWh / (gasCapacityFactor * 8.76);

  // Subtract already retired capacity
  const retiredCoal = region.retiredFossilGW?.coal || 0;
  const retiredGas = region.retiredFossilGW?.gas || 0;
  const availableCoalGW = Math.max(0, coalGW - retiredCoal);
  const availableGasGW = Math.max(0, gasGW - retiredGas);

  const capacityGW = project.capacityGW || 0;
  const cleanCapacityFactor = CAPACITY_FACTORS[projectType] || 0.30;
  const constructionMonths = project.constructionMonths || 1;
  const timeStr = formatConstructionTime(constructionMonths);

  // Calculate annual clean energy generation (TWh/year)
  const cleanEnergyTWh = capacityGW * cleanCapacityFactor * 8.76;

  // Auto-calculate equivalent fossil capacity to retire
  // Fossil to retire = Clean TWh / (Fossil capacity factor * 8.76)
  const autoRetireCoalGW = Math.min(cleanEnergyTWh / (coalCapacityFactor * 8.76), availableCoalGW);
  const autoRetireGasGW = Math.min(cleanEnergyTWh / (gasCapacityFactor * 8.76), availableGasGW);

  // Calculate emissions avoided for each fossil type
  // Emissions = Fossil retired GW × capacity factor × 8.76 hours × emission factor
  const coalEmissionFactor = GROWTH_CONFIG.emissionsPerTWhCoal; // 0.9 Mt/TWh
  const gasEmissionFactor = GROWTH_CONFIG.emissionsPerTWhGas;   // 0.4 Mt/TWh

  const coalEmissionsAvoided = autoRetireCoalGW * coalCapacityFactor * 8.76 * coalEmissionFactor;
  const gasEmissionsAvoided = autoRetireGasGW * gasCapacityFactor * 8.76 * gasEmissionFactor;

  // Default to coal if available, otherwise gas
  const defaultFossilType = availableCoalGW > 0 ? 'coal' : 'gas';
  const defaultRetireGW = defaultFossilType === 'coal' ? autoRetireCoalGW : autoRetireGasGW;
  const defaultEmissionsAvoided = defaultFossilType === 'coal' ? coalEmissionsAvoided : gasEmissionsAvoided;

  const overlay = document.createElement("div");
  overlay.id = "build-mode-overlay";
  overlay.className = "popup-overlay";

  overlay.innerHTML = `
    <div class="popup build-mode-popup" role="dialog" aria-modal="true" aria-labelledby="build-mode-title" tabindex="-1">
      <div class="build-mode-header">
        <h3 id="build-mode-title">Build ${project.label}</h3>
        <p class="build-mode-region">in ${regionName}</p>
      </div>

      <div class="build-mode-stats">
        <div class="build-stat">
          <span class="build-stat-label">Cost</span>
          <span class="build-stat-value">${formatCurrency(cost)}</span>
        </div>
        <div class="build-stat">
          <span class="build-stat-label">Capacity</span>
          <span class="build-stat-value">${capacityGW.toFixed(1)} GW</span>
        </div>
        <div class="build-stat">
          <span class="build-stat-label">Annual Output</span>
          <span class="build-stat-value">${cleanEnergyTWh.toFixed(1)} TWh</span>
        </div>
        <div class="build-stat">
          <span class="build-stat-label">Construction</span>
          <span class="build-stat-value">${timeStr}</span>
        </div>
      </div>

      <div class="build-mode-options">
        <h4>Choose Build Mode:</h4>

        <label class="build-mode-option selected" data-mode="add">
          <input type="radio" name="buildMode" value="add" checked>
          <div class="option-content">
            <span class="option-title">Add Capacity</span>
            <span class="option-desc">Add ${capacityGW.toFixed(1)} GW clean power to the grid (no CO2 reduction)</span>
          </div>
        </label>

        <label class="build-mode-option" data-mode="replace">
          <input type="radio" name="buildMode" value="replace">
          <div class="option-content">
            <span class="option-title">Replace Fossil</span>
            <span class="option-desc">Retire fossil capacity to reduce CO2 emissions</span>
          </div>
        </label>

        <div class="replace-options hidden" id="replace-options">
          <div class="fossil-type-selector">
            <label class="fossil-option ${availableCoalGW > 0 ? '' : 'disabled'}">
              <input type="radio" name="fossilType" value="coal"
                ${availableCoalGW > 0 ? 'checked' : 'disabled'}
                data-auto-retire="${autoRetireCoalGW.toFixed(2)}"
                data-emissions="${coalEmissionsAvoided.toFixed(2)}">
              <span>Coal (${availableCoalGW.toFixed(1)} GW available)</span>
            </label>
            <label class="fossil-option ${availableGasGW > 0 ? '' : 'disabled'}">
              <input type="radio" name="fossilType" value="gas"
                ${availableGasGW > 0 && availableCoalGW <= 0 ? 'checked' : ''}
                ${availableGasGW > 0 ? '' : 'disabled'}
                data-auto-retire="${autoRetireGasGW.toFixed(2)}"
                data-emissions="${gasEmissionsAvoided.toFixed(2)}">
              <span>Natural Gas (${availableGasGW.toFixed(1)} GW available)</span>
            </label>
          </div>
          <div class="replace-amount">
            <label>Fossil to retire: <input type="number" id="replace-amount" value="${defaultRetireGW.toFixed(2)}" min="0.1" max="${Math.max(availableCoalGW, availableGasGW).toFixed(1)}" step="0.1"> GW</label>
            <p class="auto-calc-note">Auto-calculated to match ${cleanEnergyTWh.toFixed(1)} TWh/year output</p>
          </div>
          <div class="emissions-avoided-display">
            <span class="emissions-label">CO2 Emissions Avoided:</span>
            <span class="emissions-value" id="emissions-avoided-value">${defaultEmissionsAvoided.toFixed(2)} Mt/year</span>
          </div>
        </div>
      </div>

      <div class="build-mode-actions">
        <button class="cancel-build-btn" onclick="cancelBuildModeDialog()">Cancel</button>
        <button class="confirm-build-btn" onclick="confirmBuildModeDialog('${regionId}', '${projectType}', ${cost})">Start Construction</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners for build mode selection
  const addOption = overlay.querySelector('[data-mode="add"]');
  const replaceOption = overlay.querySelector('[data-mode="replace"]');
  const replaceOptionsDiv = overlay.querySelector('#replace-options');

  addOption.addEventListener('click', () => {
    addOption.classList.add('selected');
    replaceOption.classList.remove('selected');
    replaceOptionsDiv.classList.add('hidden');
  });

  replaceOption.addEventListener('click', () => {
    replaceOption.classList.add('selected');
    addOption.classList.remove('selected');
    replaceOptionsDiv.classList.remove('hidden');
  });

  // Add event listeners for fossil type selection to update retirement amount and emissions
  const fossilTypeInputs = overlay.querySelectorAll('input[name="fossilType"]');
  const replaceAmountInput = overlay.querySelector('#replace-amount');
  const emissionsDisplay = overlay.querySelector('#emissions-avoided-value');

  fossilTypeInputs.forEach(input => {
    input.addEventListener('change', () => {
      const autoRetire = parseFloat(input.dataset.autoRetire) || 0;
      const emissions = parseFloat(input.dataset.emissions) || 0;
      replaceAmountInput.value = autoRetire.toFixed(2);
      emissionsDisplay.textContent = `${emissions.toFixed(2)} Mt/year`;
    });
  });

  // Update emissions when retirement amount changes
  replaceAmountInput.addEventListener('input', () => {
    const selectedFossil = overlay.querySelector('input[name="fossilType"]:checked');
    if (selectedFossil) {
      const fossilType = selectedFossil.value;
      const retireGW = parseFloat(replaceAmountInput.value) || 0;
      const capFactor = fossilType === 'coal' ? coalCapacityFactor : gasCapacityFactor;
      const emissionFactor = fossilType === 'coal' ? coalEmissionFactor : gasEmissionFactor;
      const emissions = retireGW * capFactor * 8.76 * emissionFactor;
      emissionsDisplay.textContent = `${emissions.toFixed(2)} Mt/year`;
    }
  });
}

function cancelBuildModeDialog() {
  const overlay = document.getElementById("build-mode-overlay");
  if (overlay) {
    overlay.remove();
  }
}

function confirmBuildModeDialog(regionId, projectType, cost) {
  const overlay = document.getElementById("build-mode-overlay");
  if (!overlay) return;

  const buildMode = overlay.querySelector('input[name="buildMode"]:checked')?.value || "add";
  let replaceCapacityGW = 0;
  let replaceFossilType = null;

  if (buildMode === "replace") {
    replaceFossilType = overlay.querySelector('input[name="fossilType"]:checked')?.value || "coal";
    replaceCapacityGW = parseFloat(overlay.querySelector('#replace-amount')?.value) || 0;

    // Validate replacement amount
    const region = state.regions[regionId];
    const climateData = getClimateDataForRegion(regionId);
    const powerMix = climateData?.power?.currentMixTWh || {};

    const coalCapacityFactor = CAPACITY_FACTORS?.coal || 0.50;
    const gasCapacityFactor = CAPACITY_FACTORS?.naturalGas || 0.45;

    if (replaceFossilType === "coal") {
      const coalTWh = powerMix.coal || 0;
      const coalGW = coalTWh / (coalCapacityFactor * 8.76);
      const retiredCoal = region.retiredFossilGW?.coal || 0;
      const availableCoalGW = Math.max(0, coalGW - retiredCoal);
      replaceCapacityGW = Math.min(replaceCapacityGW, availableCoalGW);
    } else {
      const gasTWh = powerMix.gas || 0;
      const gasGW = gasTWh / (gasCapacityFactor * 8.76);
      const retiredGas = region.retiredFossilGW?.gas || 0;
      const availableGasGW = Math.max(0, gasGW - retiredGas);
      replaceCapacityGW = Math.min(replaceCapacityGW, availableGasGW);
    }
  }

  // Close dialog
  overlay.remove();

  // Start construction
  startConstruction(regionId, projectType, cost, 1.0, buildMode, replaceCapacityGW, replaceFossilType);
}

function updateUI() {
  creditsEl.textContent = formatCurrency(state.funds);
  temperatureEl.textContent = `${state.temperature >= 0 ? "+" : ""}${state.temperature.toFixed(2)}°C`;
  co2El.textContent = `${state.co2.toFixed(1)} ppm`;
  dateEl.textContent = `${MONTHS[state.month - 1]} ${state.year}`;

  // ========== HEADER GAUGE UPDATES ==========

  // Temperature Gauge - position marker and set color
  const tempMarker = document.getElementById('temp-marker');
  const tempValue = document.querySelector('.temp-value');
  const tempGauge = document.querySelector('.temp-gauge');
  if (tempMarker) {
    // Scale: 1.0°C to 3.0°C (2.0 range)
    const minTemp = 1.0;
    const maxTemp = 3.0;
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, state.temperature));
    const tempPercent = ((clampedTemp - minTemp) / (maxTemp - minTemp)) * 100;
    tempMarker.style.left = `${tempPercent}%`;

    // Set temperature color class
    if (tempValue) {
      tempValue.classList.remove('temp-safe', 'temp-warning', 'temp-danger', 'temp-critical');
      if (state.temperature < 1.4) {
        tempValue.classList.add('temp-safe');
      } else if (state.temperature < 1.7) {
        tempValue.classList.add('temp-warning');
      } else if (state.temperature < 2.4) {
        tempValue.classList.add('temp-danger');
      } else {
        tempValue.classList.add('temp-critical');
      }
    }

    // Pulse animation for danger
    if (tempGauge) {
      if (state.temperature >= 2.4) {
        tempGauge.classList.add('in-danger');
      } else {
        tempGauge.classList.remove('in-danger');
      }
    }
  }

  // Update tipping point markers
  const tippingMarkers = document.querySelectorAll('.tipping-marker');
  const triggeredTemps = (state.tippingPointsTriggered || []).map(tp => {
    const thresholds = { arctic_ice: 1.4, permafrost: 1.7, amazon_dieback: 2.1, ocean_circulation: 2.4 };
    return thresholds[tp];
  });
  tippingMarkers.forEach(marker => {
    const temp = parseFloat(marker.dataset.temp);
    if (triggeredTemps.includes(temp)) {
      marker.classList.add('triggered');
    } else {
      marker.classList.remove('triggered');
    }
  });

  // CO2 Bar - update fill width and color
  const co2BarFill = document.getElementById('co2-bar-fill');
  const co2Bar = document.querySelector('.co2-bar');
  if (co2BarFill) {
    // Scale: 280 ppm to 500 ppm (220 range)
    const minCO2 = 280;
    const maxCO2 = 500;
    const clampedCO2 = Math.max(minCO2, Math.min(maxCO2, state.co2));
    const co2Percent = ((clampedCO2 - minCO2) / (maxCO2 - minCO2)) * 100;
    co2BarFill.style.width = `${co2Percent}%`;

    // Set CO2 color class
    co2BarFill.classList.remove('co2-safe', 'co2-warning', 'co2-danger', 'co2-critical');
    if (state.co2 < 350) {
      co2BarFill.classList.add('co2-safe');
    } else if (state.co2 < 420) {
      co2BarFill.classList.add('co2-warning');
    } else if (state.co2 < 460) {
      co2BarFill.classList.add('co2-danger');
    } else {
      co2BarFill.classList.add('co2-critical');
    }

    // Pulse animation for danger
    if (co2Bar) {
      if (state.co2 >= 460) {
        co2Bar.classList.add('in-danger');
      } else {
        co2Bar.classList.remove('in-danger');
      }
    }
  }

  // Net CO2 Rate - update arrow and color
  const netRate = calculateNetCO2Rate();
  const netCo2Arrow = document.getElementById('net-co2-arrow');
  if (netCo2Arrow) {
    netCo2Arrow.classList.remove('arrow-up', 'arrow-down', 'arrow-neutral');
    if (netRate > 0.05) {
      netCo2Arrow.innerHTML = '&#8593;'; // Up arrow
      netCo2Arrow.classList.add('arrow-up');
    } else if (netRate < -0.05) {
      netCo2Arrow.innerHTML = '&#8595;'; // Down arrow
      netCo2Arrow.classList.add('arrow-down');
    } else {
      netCo2Arrow.innerHTML = '&#8596;'; // Horizontal arrow
      netCo2Arrow.classList.add('arrow-neutral');
    }
  }

  // Update net CO2 rate display (compact header)
  netCo2El.textContent = `${netRate >= 0 ? '+' : ''}${netRate.toFixed(2)}/mo`;
  netCo2El.classList.remove('rate-positive', 'rate-negative', 'rate-neutral');
  if (netRate > 0.05) {
    netCo2El.classList.add('rate-positive');
  } else if (netRate < -0.05) {
    netCo2El.classList.add('rate-negative');
  } else {
    netCo2El.classList.add('rate-neutral');
  }

  // Years countdown color (compact header)
  const yearsLeft = 2100 - state.year;
  yearsLeftEl.textContent = yearsLeft;
  const dateYears = document.querySelector('.date-years');
  if (dateYears) {
    dateYears.classList.remove('years-low', 'years-critical');
    if (yearsLeft <= 25) {
      dateYears.classList.add('years-critical');
    } else if (yearsLeft <= 50) {
      dateYears.classList.add('years-low');
    }
  }

  // ========== INCOME DISPLAY (compact header) ==========

  // Calculate and display projected income
  const projectedIncome = calculateProjectedIncome();

  // Update compact header income display
  const incomeDisplay = document.getElementById('income-display');
  if (incomeDisplay) {
    const sign = projectedIncome >= 0 ? '+' : '';
    incomeDisplay.textContent = `${sign}${formatCurrency(projectedIncome)}/mo`;
    incomeDisplay.classList.remove('income-negative');
    if (projectedIncome < 0) {
      incomeDisplay.classList.add('income-negative');
    }
  }

  // Also update hidden income element for sidebar reference
  incomeEl.textContent = `+${formatCurrency(projectedIncome)}`;

  if (state.lastDisplayedIncome !== undefined) {
    if (projectedIncome > state.lastDisplayedIncome) {
      incomeEl.classList.add('income-up');
      incomeEl.classList.remove('income-down');
    } else if (projectedIncome < state.lastDisplayedIncome) {
      incomeEl.classList.add('income-down');
      incomeEl.classList.remove('income-up');
    } else {
      incomeEl.classList.remove('income-up', 'income-down');
    }
  }
  state.lastDisplayedIncome = projectedIncome;

  // Feedback Effect with color coding
  const feedback = getTotalClimateFeedback();
  feedbackStatEl.textContent = `+${feedback.toFixed(2)}`;
  feedbackStatEl.className = 'value ' + (feedback === 0 ? 'stat-good' : feedback < 0.2 ? 'stat-warning' : 'stat-bad');

  // Total Projects
  totalProjectsEl.textContent = countTotalProjects();

  // Under Construction
  const constructionCount = getTotalUnderConstruction();
  if (underConstructionEl) {
    underConstructionEl.textContent = constructionCount;
    underConstructionEl.className = 'value' + (constructionCount > 0 ? ' stat-warning' : '');
  }

  // Research Points with generation rate (regional + global centers)
  const regionalRP = countResearchCenters() * RESEARCH_POINTS_PER_CENTER;
  const globalRP = getResearchCenterRPPerMonth();
  const rpPerMonth = regionalRP + globalRP;
  researchPointsEl.textContent = rpPerMonth > 0 ? `${state.researchPoints}(+${rpPerMonth})` : state.researchPoints;

  // Active Campaigns
  campaignsEl.textContent = state.activeCampaigns?.length || 0;

  // Active Disasters with color coding
  const disasterCount = countActiveDisasters();
  disastersEl.textContent = disasterCount;
  disastersEl.className = 'value ' + (disasterCount === 0 ? 'stat-good' : disasterCount < 3 ? 'stat-warning' : 'stat-bad');

  // Tipping Points with color coding
  const tippingCount = state.tippingPointsTriggered?.length || 0;
  tippingCountEl.textContent = `${tippingCount}/4`;
  tippingCountEl.className = 'value ' + (tippingCount === 0 ? 'stat-good' : tippingCount < 3 ? 'stat-warning' : 'stat-bad');

  // ========== SECONDARY HEADER STATS ==========

  // Alliance Progress
  const allianceProgressEl = document.getElementById('alliance-progress');
  if (allianceProgressEl && state.alliance) {
    const alliedCount = Object.values(state.alliance).filter(a => a.status === ALLIANCE_STATUS.ALLIED).length;
    const totalRegions = Object.keys(state.alliance).length;
    allianceProgressEl.textContent = `${alliedCount}/${totalRegions}`;
  }

  // Research Points - show assigned/total RP per month
  const rpDisplayEl = document.getElementById('rp-display');
  if (rpDisplayEl) {
    const assignedRP = getAssignedRPPerMonth();
    const totalRP = getTotalRegionalRPPerMonth();
    rpDisplayEl.textContent = `${assignedRP}/${totalRP}`;
  }

  // Active Projects
  const projectsDisplayEl = document.getElementById('projects-display');
  if (projectsDisplayEl) {
    projectsDisplayEl.textContent = countTotalProjects();
  }

  // Under Construction
  const buildingDisplayEl = document.getElementById('building-display');
  if (buildingDisplayEl) {
    const buildCount = getTotalUnderConstruction();
    buildingDisplayEl.textContent = buildCount;
  }

  // Carbon Capture Rate
  const captureRateEl = document.getElementById('capture-rate');
  if (captureRateEl) {
    let totalCapture = 0;
    availableRegionIds.forEach(regionId => {
      const region = state.regions[regionId];
      if (!region?.projects) return;
      region.projects.forEach(proj => {
        if (proj.type === 'carbonCapture' || proj.type === 'directAirCapture') {
          totalCapture += proj.co2Reduction || 0;
        }
      });
    });
    captureRateEl.textContent = totalCapture > 0 ? `-${totalCapture.toFixed(1)}` : '0';
    captureRateEl.style.color = totalCapture > 0 ? 'var(--region-good)' : '';
  }

  // Tech Unlocked
  const techProgressEl = document.getElementById('tech-progress');
  if (techProgressEl) {
    const unlockedCount = state.unlockedTechs?.length || 0;
    const totalTechs = TECHNOLOGIES.length;
    techProgressEl.textContent = `${unlockedCount}/${totalTechs}`;
  }

  // Disaster Count with delta
  const disasterCountEl = document.getElementById('disaster-count');
  const disasterDeltaEl = document.getElementById('disaster-delta');
  if (disasterCountEl) {
    const currentDisasters = countActiveDisasters();
    disasterCountEl.textContent = currentDisasters;

    // Track new disasters this month
    if (disasterDeltaEl) {
      const newDisastersThisMonth = state.newDisastersThisMonth || 0;
      if (newDisastersThisMonth > 0) {
        disasterDeltaEl.textContent = `+${newDisastersThisMonth}`;
        disasterDeltaEl.classList.add('positive');
      } else {
        disasterDeltaEl.textContent = '';
        disasterDeltaEl.classList.remove('positive');
      }
    }
  }

  updateSelectedRegionPanel();
  renderProjectButtons();
  renderRegionProjects();
  renderTippingPointsPanel();
  renderTechTreePanel();
  renderTechTree();
  renderActiveEventsPanel();
  renderActiveDisastersPanel();
  renderAchievementsPanel();
  renderHistoryGraph();
  renderGlobalStatsCard();
  renderAllianceOverview();
  updateMapColors();
  updateMapSelection();
  updateControls();
}

// Render the tipping points panel
function renderTippingPointsPanel() {
  const listEl = document.getElementById("tipping-points-list");
  const feedbackEl = document.getElementById("feedback-status");

  if (!listEl || !feedbackEl) return;

  // Render tipping points
  const tpIcons = {
    arctic_ice: "🧊",
    permafrost: "🥶",
    amazon_dieback: "🌳",
    ocean_circulation: "🌊",
  };

  let tpHtml = "";
  TIPPING_POINTS.forEach((tp) => {
    const isTriggered = state.tippingPointsTriggered && state.tippingPointsTriggered.includes(tp.id);
    const distanceToThreshold = tp.threshold - state.temperature;
    const isWarning = !isTriggered && distanceToThreshold < 0.3 && distanceToThreshold > 0;

    let statusClass = "safe";
    let statusText = "Safe";
    let itemClass = "safe";

    if (isTriggered) {
      statusClass = "active";
      statusText = "Active";
      itemClass = "triggered";
    } else if (isWarning) {
      statusClass = "warning";
      statusText = "Warning";
      itemClass = "warning";
    }

    const icon = tpIcons[tp.id] || "⚠️";

    tpHtml += `
      <div class="tipping-point-item ${itemClass}">
        <span class="tp-icon">${icon}</span>
        <div class="tp-info">
          <div class="tp-name">${tp.name}</div>
          <div class="tp-threshold">Threshold: +${tp.threshold}°C ${isTriggered ? `(+${tp.co2Modifier} ppm/month)` : ""}</div>
        </div>
        <span class="tp-status ${statusClass}">${statusText}</span>
      </div>
    `;
  });

  listEl.innerHTML = tpHtml;

  // Render feedback loops status
  const tpModifier = getTippingPointCO2Modifier();
  const feedbackLoopEffect = getFeedbackLoopEffects();
  const totalFeedback = tpModifier + feedbackLoopEffect;

  if (totalFeedback > 0.001 || state.temperature > FEEDBACK_LOOPS.iceAlbedo.startTemp) {
    // Calculate individual feedback values
    const iceAlbedo = FEEDBACK_LOOPS.iceAlbedo;
    let iceEffect = 0;
    if (state.temperature > iceAlbedo.startTemp) {
      const progress = Math.min(1, (state.temperature - iceAlbedo.startTemp) / (iceAlbedo.maxTemp - iceAlbedo.startTemp));
      iceEffect = iceAlbedo.maxEffect * progress;
    }

    const oceanSat = FEEDBACK_LOOPS.oceanSaturation;
    let oceanEffect = 0;
    if (state.co2 > oceanSat.startCO2) {
      const progress = Math.min(1, (state.co2 - oceanSat.startCO2) / (oceanSat.maxCO2 - oceanSat.startCO2));
      oceanEffect = oceanSat.maxEffect * progress;
    }

    const vegStress = FEEDBACK_LOOPS.vegetationStress;
    let vegEffect = 0;
    if (state.temperature > vegStress.startTemp) {
      const progress = Math.min(1, (state.temperature - vegStress.startTemp) / (vegStress.maxTemp - vegStress.startTemp));
      vegEffect = vegStress.maxEffect * progress;
    }

    const getValueClass = (value) => {
      if (value < 0.01) return "low";
      if (value < 0.03) return "medium";
      return "high";
    };

    feedbackEl.innerHTML = `
      <div class="feedback-title">Feedback Loops</div>
      ${tpModifier > 0 ? `
        <div class="feedback-row">
          <span class="feedback-label">Tipping Points</span>
          <span class="feedback-value ${getValueClass(tpModifier)}">+${tpModifier.toFixed(3)} ppm/mo</span>
        </div>
      ` : ""}
      ${iceEffect > 0.001 ? `
        <div class="feedback-row">
          <span class="feedback-label">Ice-Albedo</span>
          <span class="feedback-value ${getValueClass(iceEffect)}">+${iceEffect.toFixed(3)} ppm/mo</span>
        </div>
      ` : ""}
      ${oceanEffect > 0.001 ? `
        <div class="feedback-row">
          <span class="feedback-label">Ocean Saturation</span>
          <span class="feedback-value ${getValueClass(oceanEffect)}">+${oceanEffect.toFixed(3)} ppm/mo</span>
        </div>
      ` : ""}
      ${vegEffect > 0.001 ? `
        <div class="feedback-row">
          <span class="feedback-label">Vegetation Stress</span>
          <span class="feedback-value ${getValueClass(vegEffect)}">+${vegEffect.toFixed(3)} ppm/mo</span>
        </div>
      ` : ""}
      ${totalFeedback > 0.001 ? `
        <div class="feedback-total">
          <span class="label">Total Feedback</span>
          <span class="value">+${totalFeedback.toFixed(3)} ppm/mo</span>
        </div>
      ` : ""}
    `;
  } else {
    feedbackEl.innerHTML = "";
  }
}

// Render a single tech node (Plague Inc style - compact hexagon with hover details)
function renderTechNode(tech) {
  const isUnlocked = state.unlockedTechs?.includes(tech.id);
  const missingPrereqs = getMissingPrerequisites(tech.id);
  const hasPrereqsMet = missingPrereqs.length === 0;

  // Check if any centers are actively researching this tech
  const progress = state.techProgress?.[tech.id] || 0;
  const progressPercent = Math.min(100, (progress / tech.cost) * 100);
  const isBeingResearched = getResearchingCenters(tech.id).length > 0;

  let nodeClass = "locked";
  if (isUnlocked) nodeClass = "unlocked";
  else if (isBeingResearched) nodeClass = "researching";
  else if (hasPrereqsMet) nodeClass = "available";
  else nodeClass = "prereq-locked";

  const categoryClass = tech.field === "carbon" ? "tech-carbon" : "";
  const prereqIds = tech.requires ? tech.requires.join(",") : "";

  // Build requirements list for tooltip
  let requiresHtml = "";
  if (tech.requires && tech.requires.length > 0) {
    const reqNames = tech.requires.map(id => {
      const t = TECHNOLOGIES.find(tech => tech.id === id);
      const isMet = state.unlockedTechs?.includes(id);
      return `<span class="req ${isMet ? 'met' : 'unmet'}">${t ? t.name : id}</span>`;
    }).join("");
    requiresHtml = `<div class="tooltip-reqs"><span class="req-label">Requires:</span> ${reqNames}</div>`;
  }

  // Get assigned centers info
  const assignedCenters = getResearchingCenters(tech.id);
  let centersHtml = "";
  if (assignedCenters.length > 0) {
    const centerNames = assignedCenters.map(regionId => {
      const region = state.regions?.[regionId];
      return region ? region.name : regionId;
    }).join(", ");
    centersHtml = `<div class="tooltip-centers">Researching: ${centerNames}</div>`;
  }

  // Progress bar for non-unlocked techs with progress
  let progressHtml = "";
  if (!isUnlocked && (progress > 0 || isBeingResearched)) {
    progressHtml = `
      <div class="tooltip-progress">
        <div class="tooltip-progress-bar">
          <div class="tooltip-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <span class="tooltip-progress-text">${progress}/${tech.cost} RP</span>
      </div>
    `;
  }

  // Determine status message
  let actionHtml = "";
  if (isUnlocked) {
    actionHtml = `<div class="tooltip-status unlocked">✓ Unlocked</div>`;
  } else if (isBeingResearched) {
    const rpPerMonth = getResearchRPPerMonth(tech.id);
    const monthsRemaining = Math.ceil((tech.cost - progress) / rpPerMonth);
    actionHtml = `<div class="tooltip-status researching">🔬 In Progress (+${rpPerMonth} RP/mo, ~${monthsRemaining} months)</div>`;
  } else if (!hasPrereqsMet) {
    actionHtml = `<div class="tooltip-status locked">🔒 Prerequisites needed</div>`;
  } else {
    actionHtml = `<div class="tooltip-status available">Assign a research center to begin</div>`;
  }

  const nodeHtml = `
    <div class="tech-hex ${nodeClass} ${categoryClass}"
         data-tech-id="${tech.id}"
         data-requires="${prereqIds}">
      <div class="hex-inner">
        <span class="hex-icon">${tech.icon}</span>
        ${isBeingResearched ? `<div class="hex-progress-ring" style="--progress: ${progressPercent}%"></div>` : ''}
      </div>
      <div class="hex-label">${tech.name}</div>
      <div class="hex-tooltip">
        <div class="tooltip-header">
          <span class="tooltip-icon">${tech.icon}</span>
          <span class="tooltip-name">${tech.name}</span>
          <span class="tooltip-cost">${tech.cost} RP</span>
        </div>
        <div class="tooltip-desc">${tech.description}</div>
        ${requiresHtml}
        ${progressHtml}
        ${centersHtml}
        ${actionHtml}
      </div>
    </div>
  `;
  return nodeHtml;
}

// Helper: Get centers researching a specific tech
function getResearchingCenters(techId) {
  if (!state.regionalResearchCenters) return [];

  return Object.keys(state.regionalResearchCenters).filter(regionId => {
    const center = state.regionalResearchCenters[regionId];
    return center.projectId === techId;
  });
}

// Helper: Get total RP/month being contributed to a tech
function getResearchRPPerMonth(techId) {
  if (!state.regionalResearchCenters) return 0;

  let total = 0;
  for (const regionId in state.regionalResearchCenters) {
    const center = state.regionalResearchCenters[regionId];
    if (center.projectId !== techId) continue;

    // Skip if on cooldown
    if (state.centerCooldowns?.[regionId] > 0) continue;

    total += getCenterRPPerMonth(center.level);
  }
  return total;
}

// Render a tree section (CCS or Other technologies) - VERTICAL LAYOUT
// Basic techs at TOP, higher tiers flow DOWN, spread horizontally
function renderTreeSection(title, depthMap, icon) {
  const maxDepth = Math.max(...Object.keys(depthMap).map(Number), 0);

  // Build rows (Basic at top, higher tiers below)
  let rowsHtml = "";
  for (let depth = 0; depth <= maxDepth; depth++) {
    const techs = depthMap[depth] || [];
    if (techs.length === 0) continue;

    const tierName = depth === 0 ? "START" : `TIER ${depth}`;
    let nodesHtml = "";
    techs.forEach((tech) => {
      nodesHtml += renderTechNode(tech);
    });
    rowsHtml += `
      <div class="tech-tree-row" data-depth="${depth}">
        <div class="tech-row-label">${tierName}</div>
        <div class="tech-row-items">${nodesHtml}</div>
      </div>`;
  }

  const sectionHtml = `
    <div class="tech-tree-section">
      <h4 class="tech-tree-section-title">${icon} ${title}</h4>
      <div class="tech-tree-graph" data-section="${title.toLowerCase().replace(/ /g, '-')}">
        <svg class="tech-tree-connections"></svg>
        <div class="tech-tree-rows">
          ${rowsHtml}
        </div>
      </div>
    </div>
  `;
  return sectionHtml;
}

// Draw SVG connection lines between prerequisite techs - VERTICAL LAYOUT
// Parents (prerequisites) are ABOVE, children (higher tier) are BELOW
function drawTreeConnections() {
  document.querySelectorAll(".tech-tree-graph").forEach((graph) => {
    const svg = graph.querySelector(".tech-tree-connections");
    const nodes = graph.querySelectorAll(".tech-hex");

    // Get the rows container as the reference point
    const rowsContainer = graph.querySelector(".tech-tree-rows");
    if (!rowsContainer) return;

    // Get graph padding to offset coordinates (SVG is at 0,0 of graph, content is padded)
    const graphStyle = getComputedStyle(graph);
    const paddingTop = parseFloat(graphStyle.paddingTop) || 0;
    const paddingLeft = parseFloat(graphStyle.paddingLeft) || 0;

    // Clear existing paths
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    nodes.forEach((node) => {
      const requires = node.dataset.requires?.split(",").filter(Boolean) || [];
      if (requires.length === 0) return;

      // Get position relative to the rows container
      const hexInner = node.querySelector(".hex-inner");
      const targetEl = hexInner || node;

      // Calculate position - child node connects from TOP (parent is above)
      let endX = targetEl.offsetLeft + targetEl.offsetWidth / 2;
      let endY = targetEl.offsetTop;
      let el = targetEl.offsetParent;
      while (el && el !== rowsContainer && rowsContainer.contains(el)) {
        endX += el.offsetLeft;
        endY += el.offsetTop;
        el = el.offsetParent;
      }
      // Add padding offset since SVG starts at graph origin
      endX += paddingLeft;
      endY += paddingTop;

      requires.forEach((reqId) => {
        const parentNode = graph.querySelector(`[data-tech-id="${reqId}"]`);
        if (!parentNode) return;

        const parentHex = parentNode.querySelector(".hex-inner");
        const parentEl = parentHex || parentNode;

        // Parent node connects from BOTTOM (child is below)
        let startX = parentEl.offsetLeft + parentEl.offsetWidth / 2;
        let startY = parentEl.offsetTop + parentEl.offsetHeight;
        let pel = parentEl.offsetParent;
        while (pel && pel !== rowsContainer && rowsContainer.contains(pel)) {
          startX += pel.offsetLeft;
          startY += pel.offsetTop;
          pel = pel.offsetParent;
        }
        // Add padding offset since SVG starts at graph origin
        startX += paddingLeft;
        startY += paddingTop;

        // Check if connection should be "unlocked" style
        const isUnlockedPath = node.classList.contains("unlocked");
        const isParentUnlocked = parentNode.classList.contains("unlocked");

        // Calculate vertical distance for smoother curves
        const vertDist = endY - startY;

        // Use smoother bezier with control points that create natural S-curves
        // Control points extend vertically based on distance
        const controlOffset = Math.min(vertDist * 0.4, 60);
        const ctrl1Y = startY + controlOffset;
        const ctrl2Y = endY - controlOffset;

        const pathClass = isUnlockedPath ? "unlocked" : (isParentUnlocked ? "partial" : "");

        // Create path element using DOM API for safety
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M${startX},${startY} C${startX},${ctrl1Y} ${endX},${ctrl2Y} ${endX},${endY}`);
        path.setAttribute("class", `tech-connection ${pathClass}`);
        svg.appendChild(path);
      });
    });
  });
}

// Render the technology tree panel (tech upgrades)
function renderTechTreePanel() {
  const listEl = document.getElementById("tech-tree-list");

  if (!listEl) return;

  const currentRP = state.researchPoints || 0;
  const hasResearchCenters = (state.researchCenters && state.researchCenters.length > 0) || countResearchCenters() > 0;

  // Separate CCS and Other technologies
  const ccsTechs = TECHNOLOGIES.filter((t) => t.field === "carbon");
  const otherTechs = TECHNOLOGIES.filter((t) => t.field !== "carbon");

  // Organize by depth for tree visualization
  const ccsDepths = organizeTechsByDepth(ccsTechs);
  const otherDepths = organizeTechsByDepth(otherTechs);

  let html = "";

  // Show helpful message if no research centers built yet
  if (!hasResearchCenters && currentRP === 0) {
    html += `<div class="tech-tree-tip">
      <span class="tip-icon">💡</span>
      <span>Build Research Centers above to generate Research Points (RP) each month.</span>
    </div>`;
  }

  // Render Technologies sections
  html += renderTreeSection("Energy & Nature", otherDepths, "⚡");
  html += renderTreeSection("CCS Technologies", ccsDepths, "🏭");

  // Note: Using innerHTML here - all content from internal game data, not user input
  listEl.innerHTML = html;

  // Wire up unlock buttons in tooltips
  listEl.querySelectorAll(".tooltip-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const techId = e.target.dataset.techId;
      if (techId) {
        unlockTechnology(techId);
      }
    });
  });

  // Draw connection lines after layout is complete
  // Use setTimeout to ensure DOM is fully laid out (requestAnimationFrame may fire too early)
  setTimeout(() => {
    drawTreeConnections();
  }, 50);
}

// Redraw tree connections on window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (document.querySelector(".tech-tree-graph")) {
      drawTreeConnections();
    }
  }, 100);
});

// ============ GLOBAL RESEARCH CENTERS ============

// Get a research center's data by ID
function getResearchCenterById(centerId) {
  for (const category of RESEARCH_CENTERS.categories) {
    for (const center of category.centers) {
      if (center.id === centerId) {
        return { ...center, categoryId: category.id, categoryName: category.name, categoryIcon: category.icon };
      }
    }
  }
  return null;
}

// Get total RP per month from all regional research centers
function getTotalRegionalRP() {
  if (!state.regionalResearchCenters) return 0;
  let totalRP = 0;
  Object.entries(state.regionalResearchCenters).forEach(([regionId, center]) => {
    // Only count if not on cooldown
    const cooldown = state.centerCooldowns?.[regionId] || 0;
    if (cooldown === 0) {
      totalRP += getResearchCenterRPPerMonth(center.level);
    }
  });
  return totalRP;
}

// Simple toast notification for research centers
function showResearchNotification(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `research-toast research-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Build a global research center
function buildResearchCenter(centerId) {
  if (!state.researchCenters) state.researchCenters = [];

  // Check if already built
  if (state.researchCenters.includes(centerId)) {
    showResearchNotification('Research center already built!', 'warning');
    return;
  }

  const centerData = getResearchCenterById(centerId);
  if (!centerData) {
    showResearchNotification('Invalid research center!', 'error');
    return;
  }

  // Check if player can afford it
  if (state.funds < centerData.buildCost) {
    showResearchNotification(`Not enough funds! Need $${centerData.buildCost}B`, 'warning');
    return;
  }

  // Deduct cost and add to state
  state.funds -= centerData.buildCost;
  state.researchCenters.push(centerId);

  showResearchNotification(`Built: ${centerData.name}! (+${centerData.rpPerMonth} RP/month)`, 'success');

  renderTechTree();
  updateUI();
  saveGame();
}

// Render the tech tree tab content
function renderTechTree() {
  // Update tech panel RP display - show total RP/month from regional centers
  const techRPDisplay = document.getElementById('tech-rp-display');
  const techRPRate = document.getElementById('tech-rp-rate');

  // Count active centers (built regional research centers)
  const centerCount = state.regionalResearchCenters ?
    Object.keys(state.regionalResearchCenters).length : 0;

  if (techRPDisplay) {
    techRPDisplay.textContent = `${centerCount} Centers`;
  }

  if (techRPRate) {
    const totalRP = getTotalRegionalRPPerMonth();
    techRPRate.textContent = `(+${totalRP} RP/mo)`;
  }

  renderRegionalCentersUI();
}

// ═══════════════════════════════════════════════════════════════
// REGIONAL RESEARCH CENTERS UI
// ═══════════════════════════════════════════════════════════════

// Render the regional research centers UI
function renderRegionalCentersUI() {
  const container = document.getElementById('research-center-options');
  if (!container) return;

  let html = '';

  // Get built centers and available regions
  const builtCenters = state.regionalResearchCenters || {};
  const availableRegions = getAvailableRegionsForResearch();
  const buildCost = RESEARCH_CENTER_BASE.buildCost;
  const canAffordBuild = state.funds >= buildCost;

  // Section 1: Active Research Centers
  const centerRegions = Object.keys(builtCenters);
  if (centerRegions.length > 0) {
    html += '<div class="rc-section"><h4 class="rc-section-title">Active Research Centers</h4>';
    html += '<div class="rc-active-grid">';

    centerRegions.forEach(regionId => {
      const center = builtCenters[regionId];
      const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
      const regionName = regionData?.name || regionId;
      const levelData = getResearchCenterLevelData(center.level);
      const cooldown = state.centerCooldowns?.[regionId] || 0;
      const isOnCooldown = cooldown > 0;

      // Get assigned field and project info
      const fieldData = center.field ? RESEARCH_FIELDS[center.field] : null;
      const tech = center.projectId ? TECHNOLOGIES.find(t => t.id === center.projectId) : null;
      const progress = tech ? (state.techProgress?.[center.projectId] || 0) : 0;
      const progressPercent = tech ? Math.min(100, (progress / tech.cost) * 100) : 0;

      // Can upgrade? (no max level - always can upgrade)
      const upgradeCost = getResearchCenterUpgradeCost(center.level);
      const canAffordUpgrade = state.funds >= upgradeCost;

      html += `
        <div class="rc-active-card ${isOnCooldown ? 'on-cooldown' : ''}">
          <div class="rc-active-header">
            <span class="rc-region-name">${regionName}</span>
            <span class="rc-level-badge">${levelData.name}</span>
          </div>
          <div class="rc-active-stats">
            <span class="rc-rp">+${levelData.rpPerMonth} RP/mo</span>
            ${isOnCooldown ? `<span class="rc-cooldown">Switching: ${cooldown}mo</span>` : ''}
          </div>
          ${tech ? `
            <div class="rc-assignment">
              <div class="rc-assignment-header">
                <span class="rc-field-icon">${fieldData?.icon || ''}</span>
                <span class="rc-project-name">${tech.name}</span>
              </div>
              <div class="rc-progress-bar">
                <div class="rc-progress-fill" style="width: ${progressPercent}%"></div>
              </div>
              <div class="rc-progress-text">${progress}/${tech.cost} RP</div>
            </div>
          ` : `
            <div class="rc-no-assignment">
              <span>No project assigned</span>
              <button class="rc-assign-btn" data-region="${regionId}">Assign Research</button>
            </div>
          `}
          <div class="rc-actions">
            ${tech ? `<button class="rc-change-btn" data-region="${regionId}">Change Project</button>` : ''}
            <button class="rc-upgrade-btn" data-region="${regionId}" ${!canAffordUpgrade ? 'disabled' : ''}>
              Upgrade ($${upgradeCost}B)
            </button>
          </div>
        </div>
      `;
    });

    html += '</div></div>';
  }

  // Section 2: Build New Centers
  if (availableRegions.length > 0) {
    html += '<div class="rc-section"><h4 class="rc-section-title">Build Research Center ($' + buildCost + 'B)</h4>';
    html += '<p class="rc-section-desc">Build in allied regions to expand research capacity.</p>';
    html += '<div class="rc-build-grid">';

    availableRegions.forEach(regionId => {
      const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
      const regionName = regionData?.name || regionId;

      html += `
        <div class="rc-build-card ${!canAffordBuild ? 'unaffordable' : ''}">
          <span class="rc-build-region">${regionName}</span>
          <button class="rc-build-btn" data-region="${regionId}" ${!canAffordBuild ? 'disabled' : ''}>
            Build
          </button>
        </div>
      `;
    });

    html += '</div></div>';
  } else if (centerRegions.length === 0) {
    html += `
      <div class="rc-no-allies">
        <p>You need to form alliances with regions before building research centers.</p>
        <p>Go to the Diplomacy tab to recruit allies!</p>
      </div>
    `;
  }

  container.innerHTML = html;

  // Wire up event listeners
  container.querySelectorAll('.rc-build-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const regionId = e.target.dataset.region;
      if (regionId) buildRegionalCenter(regionId);
    });
  });

  container.querySelectorAll('.rc-upgrade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const regionId = e.target.dataset.region;
      if (regionId) upgradeRegionalCenter(regionId);
    });
  });

  container.querySelectorAll('.rc-assign-btn, .rc-change-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const regionId = e.target.dataset.region;
      if (regionId) showAssignmentModal(regionId);
    });
  });
}

// Show modal for assigning a research center to a field and project
function showAssignmentModal(regionId) {
  const center = state.regionalResearchCenters?.[regionId];
  if (!center) return;

  const regionData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
  const regionName = regionData?.name || regionId;
  const currentField = center.field;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'assignment-modal-overlay';

  let html = `
    <div class="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title" tabindex="-1">
      <div class="assignment-modal-header">
        <h3 id="assignment-modal-title">Assign Research - ${regionName}</h3>
        <button class="assignment-modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="assignment-modal-body">
  `;

  // Show fields
  Object.entries(RESEARCH_FIELDS).forEach(([fieldId, field]) => {
    const techs = getResearchableTechsInField(fieldId);
    const isSwitchingField = currentField && currentField !== fieldId;
    const switchCost = isSwitchingField ? field.switchCost : 0;
    const switchTime = isSwitchingField ? field.switchTime : 0;
    const canAffordSwitch = !isSwitchingField || state.funds >= switchCost;

    html += `
      <div class="assignment-field ${techs.length === 0 ? 'no-techs' : ''} ${!canAffordSwitch ? 'unaffordable' : ''}">
        <div class="assignment-field-header">
          <span class="field-icon">${field.icon}</span>
          <span class="field-name">${field.name}</span>
          ${isSwitchingField ? `<span class="field-switch-cost">Switch: $${switchCost}B, ${switchTime}mo cooldown</span>` : ''}
        </div>
        <p class="field-desc">${field.description}</p>
        ${techs.length > 0 ? `
          <div class="assignment-techs">
            ${techs.map(tech => {
              const progress = state.techProgress?.[tech.id] || 0;
              const progressPercent = Math.min(100, (progress / tech.cost) * 100);
              return `
                <div class="assignment-tech">
                  <div class="tech-info">
                    <span class="tech-icon">${tech.icon}</span>
                    <span class="tech-name">${tech.name}</span>
                    <span class="tech-cost">${progress}/${tech.cost} RP</span>
                  </div>
                  <div class="tech-progress-mini">
                    <div class="tech-progress-fill" style="width: ${progressPercent}%"></div>
                  </div>
                  <button class="tech-select-btn" data-region="${regionId}" data-field="${fieldId}" data-tech="${tech.id}"
                    ${!canAffordSwitch ? 'disabled' : ''}>
                    Select
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        ` : '<p class="no-techs-msg">No available technologies (unlock prerequisites first)</p>'}
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  modal.innerHTML = html;
  document.body.appendChild(modal);

  const closeModal = () => {
    deactivateDialog(modal);
    modal.remove();
  };

  // Event listeners
  modal.querySelector('.assignment-modal-close').addEventListener('click', () => {
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelectorAll('.tech-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rId = e.target.dataset.region;
      const fId = e.target.dataset.field;
      const tId = e.target.dataset.tech;
      if (rId && fId && tId) {
        assignCenterToProject(rId, fId, tId);
        closeModal();
      }
    });
  });

  activateDialog(modal, modal.querySelector(".assignment-modal"), closeModal);
}

// Render active events panel
function renderActiveEventsPanel() {
  const listEl = document.getElementById("active-events-list");
  if (!listEl) return;

  if (!state.activeEvents || state.activeEvents.length === 0) {
    listEl.innerHTML = "";
    return;
  }

  let html = "";
  state.activeEvents.forEach((activeEvent) => {
    const event = EVENTS.find((e) => e.id === activeEvent.id);
    if (!event) return;

    // Determine if event is positive or negative
    const isPositive = (event.effects.incomeMultiplier || 1) >= 1 &&
                       (event.effects.projectEffectiveness || 1) >= 1 &&
                       (event.effects.campaignEffectiveness || 1) >= 1 &&
                       (event.effects.projectCostMultiplier || 1) <= 1;

    const itemClass = isPositive ? "positive" : "negative";

    // Redundant non-color valence cue (WCAG 1.4.1) — don't rely on border color alone
    const valenceIcon = isPositive ? "▲" : "▼";
    const valenceLabel = isPositive ? "Positive event" : "Negative event";

    // Build effects list
    const effectsHtml = [];
    if (event.effects.incomeMultiplier) {
      const pct = Math.round((event.effects.incomeMultiplier - 1) * 100);
      const sign = pct >= 0 ? "+" : "";
      const cls = pct >= 0 ? "positive" : "negative";
      effectsHtml.push(`<span class="event-effect ${cls}">Income ${sign}${pct}%</span>`);
    }
    if (event.effects.projectEffectiveness) {
      const pct = Math.round((event.effects.projectEffectiveness - 1) * 100);
      const sign = pct >= 0 ? "+" : "";
      const cls = pct >= 0 ? "positive" : "negative";
      effectsHtml.push(`<span class="event-effect ${cls}">Projects ${sign}${pct}%</span>`);
    }
    if (event.effects.campaignEffectiveness) {
      const pct = Math.round((event.effects.campaignEffectiveness - 1) * 100);
      const sign = pct >= 0 ? "+" : "";
      const cls = pct >= 0 ? "positive" : "negative";
      effectsHtml.push(`<span class="event-effect ${cls}">Campaigns ${sign}${pct}%</span>`);
    }
    if (event.effects.projectCostMultiplier) {
      const pct = Math.round((event.effects.projectCostMultiplier - 1) * 100);
      const sign = pct >= 0 ? "+" : "";
      const cls = pct <= 0 ? "positive" : "negative";
      effectsHtml.push(`<span class="event-effect ${cls}">Costs ${sign}${pct}%</span>`);
    }

    html += `
      <div class="event-item ${itemClass}">
        <span class="event-valence ${itemClass}" title="${valenceLabel}" aria-label="${valenceLabel}">${valenceIcon}</span>
        <span class="event-icon">${event.icon}</span>
        <div class="event-info">
          <div class="event-name">${event.name}</div>
          <div class="event-description">${event.description}</div>
          <div class="event-effects">${effectsHtml.join("")}</div>
        </div>
        <div class="event-duration">${activeEvent.monthsRemaining} mo</div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

// Render active disasters panel
function renderActiveDisastersPanel() {
  const listEl = document.getElementById("active-disasters-list");
  const panelEl = document.getElementById("active-disasters-panel");
  if (!listEl) return;

  if (!state.activeDisasters || state.activeDisasters.length === 0) {
    listEl.innerHTML = "<p class=\"no-disasters\">No active disasters</p>";
    if (panelEl) panelEl.classList.add("empty");
    return;
  }

  if (panelEl) panelEl.classList.remove("empty");

  let html = "";
  state.activeDisasters.forEach((disaster) => {
    const reductionPercent = Math.round(disaster.incomeReduction * 100);

    html += `
      <div class="disaster-item ${disaster.type}">
        <span class="disaster-valence" title="Negative impact" aria-label="Negative impact">▼</span>
        <span class="disaster-icon">${disaster.icon}</span>
        <div class="disaster-info">
          <div class="disaster-name">${disaster.typeName}</div>
          <div class="disaster-location">${disaster.regionName}</div>
          <div class="disaster-effect">Income -${reductionPercent}%</div>
        </div>
        <div class="disaster-duration">${disaster.remainingMonths} mo</div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

// Render achievements panel
function renderAchievementsPanel() {
  const listEl = document.getElementById("achievements-list");
  const countEl = document.getElementById("achievements-count");
  if (!listEl) return;

  const unlockedCount = state.achievements ? state.achievements.length : 0;
  const totalCount = ACHIEVEMENTS.length;

  // Update count display
  if (countEl) {
    countEl.textContent = `${unlockedCount}/${totalCount}`;
  }

  let html = "";
  ACHIEVEMENTS.forEach((achievement) => {
    const isUnlocked = state.achievements && state.achievements.includes(achievement.id);
    const itemClass = isUnlocked ? "unlocked" : "locked";

    html += `
      <div class="achievement-item ${itemClass}">
        <span class="achievement-icon">${isUnlocked ? achievement.icon : "🔒"}</span>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
        ${isUnlocked ? '<span class="achievement-check">✓</span>' : ""}
      </div>
    `;
  });

  listEl.innerHTML = html;
}

// History graph rendering
let currentGraphMetric = "co2";

function formatHistoryGraphChange(change, formatValue) {
  const formattedChange = formatValue(change);
  if (formattedChange.startsWith("+") || formattedChange.startsWith("-") || formattedChange.startsWith("$-")) {
    return formattedChange;
  }
  return `${change >= 0 ? "+" : ""}${formattedChange}`;
}

function renderHistoryGraph() {
  const canvas = document.getElementById("history-graph");
  const statsEl = document.getElementById("graph-stats");
  if (!canvas || !state.history || state.history.length < 2) {
    if (statsEl) statsEl.innerHTML = "<p style='text-align:center;color:var(--muted);font-size:0.7rem;'>Play for a few months to see data</p>";
    return;
  }

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Get data based on selected metric
  const history = state.history;
  let data, label, color, unit, formatValue;

  switch (currentGraphMetric) {
    case "co2":
      data = history.map((h) => h.co2);
      label = "CO2 (ppm)";
      color = "#f59e0b";
      unit = " ppm";
      formatValue = (v) => v.toFixed(1);
      break;
    case "temperature":
      data = history.map((h) => h.temperature);
      label = "Temperature";
      color = "#ef4444";
      unit = "°C";
      formatValue = (v) => (v >= 0 ? "+" : "") + v.toFixed(2);
      break;
    case "funds":
      data = history.map((h) => h.funds);
      label = "Budget";
      color = "#22c55e";
      unit = "B";
      formatValue = (v) => "$" + v.toFixed(0);
      break;
    default:
      return;
  }

  // Calculate min/max with some padding
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.1;
  const yMax = maxVal + range * 0.1;

  // Draw grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (graphHeight * i) / 4;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // Draw Y-axis labels
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (graphHeight * i) / 4;
    const val = yMax - ((yMax - yMin) * i) / 4;
    ctx.fillText(formatValue(val), padding.left - 4, y + 3);
  }

  // Draw line graph
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = padding.left + (i / (data.length - 1)) * graphWidth;
    const y = padding.top + ((yMax - val) / (yMax - yMin)) * graphHeight;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw fill under line
  ctx.lineTo(padding.left + graphWidth, padding.top + graphHeight);
  ctx.lineTo(padding.left, padding.top + graphHeight);
  ctx.closePath();
  ctx.fillStyle = color.replace(")", ",0.1)").replace("rgb", "rgba");
  ctx.fill();

  // Draw X-axis labels (year)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  const startYear = history[0].year;
  const endYear = history[history.length - 1].year;
  ctx.fillText(startYear.toString(), padding.left, height - 4);
  ctx.fillText(endYear.toString(), width - padding.right, height - 4);

  // Update stats
  const start = data[0];
  const end = data[data.length - 1];
  const change = end - start;
  const trend = change > 0 ? "↑" : change < 0 ? "↓" : "→";
  const trendColor = currentGraphMetric === "funds"
    ? (change >= 0 ? "#22c55e" : "#ef4444")
    : (change <= 0 ? "#22c55e" : "#ef4444");

  statsEl.innerHTML = `
    <div class="graph-stat">
      <div class="graph-stat-value">${formatValue(start)}${unit}</div>
      <div class="graph-stat-label">Start</div>
    </div>
    <div class="graph-stat">
      <div class="graph-stat-value" style="color:${trendColor}">${trend} ${formatHistoryGraphChange(change, formatValue)}</div>
      <div class="graph-stat-label">Change</div>
    </div>
    <div class="graph-stat">
      <div class="graph-stat-value">${formatValue(end)}${unit}</div>
      <div class="graph-stat-label">Current</div>
    </div>
  `;
}

function initGraphTabs() {
  const tabs = document.querySelectorAll(".graph-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentGraphMetric = tab.dataset.metric;
      renderHistoryGraph();
    });
  });
}

// ============================
// COLLAPSIBLE SECTIONS SYSTEM
// ============================

const COLLAPSIBLE_SECTIONS = [
  { headerClass: 'income-header', contentSelector: '.income-header ~ *:not(.power-header):not(.construction-header):not(.emissions-header):not(.effectiveness-header):not(.region-fact-section)', id: 'climate-finance' },
  { headerClass: 'power-header', contentSelector: '#power-panel > *:not(.power-header)', id: 'power-grid' },
  { headerClass: 'emissions-header', contentSelector: '.emissions-header ~ *:not(.effectiveness-header):not(.region-fact-section)', id: 'emissions' },
  { headerClass: 'effectiveness-header', contentSelector: '.effectiveness-header ~ *:not(.region-fact-section)', id: 'effectiveness' },
];

// Get collapsed state from localStorage
function getCollapsedSections() {
  try {
    const stored = localStorage.getItem('collapsedSections');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save collapsed state to localStorage
function saveCollapsedSection(sectionId, isCollapsed) {
  try {
    const collapsed = getCollapsedSections();
    collapsed[sectionId] = isCollapsed;
    localStorage.setItem('collapsedSections', JSON.stringify(collapsed));
  } catch {
    // Ignore localStorage errors
  }
}

// Initialize collapsible behavior for region panel sections
function initCollapsibleSections() {
  const collapsed = getCollapsedSections();

  // Process each collapsible section type
  const sectionConfigs = [
    { headerClass: 'income-header', containerId: 'region-income', sectionId: 'climate-finance' },
    { headerClass: 'power-header', containerId: 'power-panel', sectionId: 'power-grid' },
    { headerClass: 'emissions-header', containerId: 'climate-data-panel', sectionId: 'emissions' },
    { headerClass: 'construction-header', containerId: 'construction-panel', sectionId: 'construction', defaultCollapsed: true },
  ];

  sectionConfigs.forEach(config => {
    const container = document.getElementById(config.containerId);
    if (!container) return;

    const header = container.querySelector(`.${config.headerClass}`);
    if (!header || header.classList.contains('collapsible-initialized')) return;

    // Mark as initialized to prevent duplicate handlers
    header.classList.add('collapsible-initialized');
    header.classList.add('collapsible-header');

    // Get all siblings after header as content
    const contentElements = [];
    let sibling = header.nextElementSibling;
    while (sibling) {
      contentElements.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    // Wrap content in a collapsible container if not already wrapped
    if (contentElements.length > 0 && !container.querySelector('.collapsible-content')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'collapsible-content';
      wrapper.dataset.sectionId = config.sectionId;

      contentElements.forEach(el => wrapper.appendChild(el));
      container.appendChild(wrapper);

      // Apply initial collapsed state (use stored state, or default if not set)
      const isCollapsed = config.sectionId in collapsed
        ? collapsed[config.sectionId]
        : (config.defaultCollapsed || false);
      if (isCollapsed) {
        header.classList.add('collapsed');
        wrapper.classList.add('collapsed');
      }
    }

    // Add click handler
    header.addEventListener('click', () => {
      const content = container.querySelector('.collapsible-content');
      if (!content) return;

      const isCollapsed = header.classList.toggle('collapsed');
      content.classList.toggle('collapsed', isCollapsed);
      saveCollapsedSection(config.sectionId, isCollapsed);
    });
  });
}

function updateSelectedRegionPanel() {
  if (!selectedRegionId) {
    selectedRegionEl.textContent = "Select a region to take action.";
    clearClimateDataPanels();
    if (regionIncomeEl) regionIncomeEl.innerHTML = "";
    return;
  }

  const region = state.regions[selectedRegionId];
  const alliance = state.alliance?.[selectedRegionId];
  const isAllied = alliance?.status === ALLIANCE_STATUS.ALLIED;

  selectedRegionEl.innerHTML = "";

  // Alliance status section
  const allianceSection = document.createElement("div");
  allianceSection.className = "alliance-section";
  allianceSection.innerHTML = getAllianceStatusHTML(selectedRegionId);

  // Negotiate button for non-allied regions
  const negotiateButtonHTML = getNegotiateButtonHTML(selectedRegionId);
  if (negotiateButtonHTML) {
    allianceSection.innerHTML += negotiateButtonHTML;
  }

  // Create header with title and ALLIED badge
  const headerRow = document.createElement("div");
  headerRow.className = "region-header-row";

  const title = document.createElement("div");
  title.className = "region-title";
  title.textContent = getRegionName(selectedRegionId);

  headerRow.appendChild(title);

  // Add alliance badge to header row (top right)
  if (alliance) {
    const statusLabels = {
      [ALLIANCE_STATUS.ALLIED]: "Allied",
      [ALLIANCE_STATUS.NEUTRAL]: "Not Allied",
      [ALLIANCE_STATUS.NEGOTIATING]: "Negotiating",
      [ALLIANCE_STATUS.HOSTILE]: "Hostile",
    };
    const badge = document.createElement("span");
    badge.className = `alliance-status-badge header-badge ${alliance.status}`;
    badge.textContent = statusLabels[alliance.status] || alliance.status;
    headerRow.appendChild(badge);
  }

  if (!isAllied) {
    // NON-ALLIED: Header, then alliance section (negotiate button etc)
    selectedRegionEl.append(headerRow, allianceSection);

    // Show basic climate data (GDP, population, potential income) but skip detailed panels
    const climateData = getClimateDataForRegion(selectedRegionId);
    if (climateData) {
      appendBasicRegionInfo(selectedRegionEl, climateData, selectedRegionId);
    }

    // Clear detailed panels
    clearClimateDataPanels();
    if (regionIncomeEl) regionIncomeEl.innerHTML = "";

    // Hide construction panel for non-allied regions
    const constructionEl = document.getElementById("construction-panel");
    if (constructionEl) constructionEl.style.display = "none";

  } else {
    // ALLIED: Header row with title and badge, then alliance details
    selectedRegionEl.append(headerRow, allianceSection);

    // Get climate data and render additional panels
    const climateData = getClimateDataForRegion(selectedRegionId);
    if (climateData) {
      renderRegionIncome(region, climateData);
      renderPowerPanel(selectedRegionId);
      renderEmissionsBreakdown(climateData, selectedRegionId);
      renderEffectivenessPanel(climateData);
      renderRegionFact(climateData);
      // Construction panel at the bottom
      renderConstructionPanel(selectedRegionId);
    } else {
      clearClimateDataPanels();
      if (regionIncomeEl) regionIncomeEl.innerHTML = "";
      renderPowerPanel(selectedRegionId);
      // Construction panel at the bottom
      renderConstructionPanel(selectedRegionId);
    }

    // Initialize collapsible sections after DOM is updated
    setTimeout(initCollapsibleSections, 0);
  }
}

function renderConstructionPanel(regionId) {
  // Find construction panel container (exists in HTML at bottom of region tab)
  const constructionEl = document.getElementById("construction-panel");
  if (!constructionEl) return;

  constructionEl.innerHTML = "";

  const constructions = getConstructionForRegion(regionId);
  if (constructions.length === 0) {
    constructionEl.style.display = "none";
    return; // Don't show section if nothing under construction
  }

  constructionEl.style.display = "block";

  // Header (collapsible - chevron added by collapsible system)
  const header = document.createElement("div");
  header.className = "construction-header";
  header.innerHTML = `
    <h4>Under Construction</h4>
    <span class="construction-count">${constructions.length}</span>
  `;
  constructionEl.appendChild(header);

  // Construction items (appended directly so collapsible system can wrap them)
  constructions.forEach(c => {
    const project = PROJECT_TYPES[c.type];
    if (!project) return;

    const progress = ((c.monthsTotal - c.monthsRemaining) / c.monthsTotal) * 100;
    const timeLeft = formatConstructionTime(c.monthsRemaining);

    const item = document.createElement("div");
    item.className = "construction-item";

    let detailsHTML = "";
    if (c.buildMode === "replace" && c.replaceCapacityGW > 0) {
      detailsHTML = `<span class="replace-note">Will retire ${c.replaceCapacityGW.toFixed(1)} GW ${c.replaceFossilType}</span>`;
    }

    item.innerHTML = `
      <div class="construction-item-header">
        <span class="construction-name">${project.label}</span>
        <span class="construction-time">${timeLeft} left</span>
      </div>
      <div class="construction-progress-bar">
        <div class="construction-progress-fill" style="width: ${progress.toFixed(0)}%"></div>
      </div>
      <div class="construction-details">
        Started ${MONTHS[c.startDate.month - 1]} ${c.startDate.year}
        ${detailsHTML}
      </div>
    `;

    constructionEl.appendChild(item);
  });
}

function renderRegionIncome(region, climateData) {
  if (!regionIncomeEl) return;

  regionIncomeEl.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.className = "income-header";

  const titleEl = document.createElement("span");
  titleEl.className = "income-title";
  titleEl.textContent = "Climate Finance";

  header.appendChild(titleEl);
  regionIncomeEl.appendChild(header);

  // GDP info
  if (climateData.gdp) {
    const gdpEl = document.createElement("div");
    gdpEl.className = "income-gdp";
    gdpEl.textContent = `GDP: $${climateData.gdp.toFixed(1)} trillion`;
    regionIncomeEl.appendChild(gdpEl);
  }

  // Climate Finance info
  if (climateData.climateFinance) {
    const finance = climateData.climateFinance;
    const gdpTrillions = climateData.gdp || 1;
    const monthlyIncome = (gdpTrillions * finance.currentPercent / 100) / 12 * 1000;

    // Current dedication percentage
    const dedicationRow = document.createElement("div");
    dedicationRow.className = "finance-row";

    const dedicationLabel = document.createElement("span");
    dedicationLabel.className = "finance-label";
    dedicationLabel.textContent = "Climate Dedication:";

    const dedicationValue = document.createElement("span");
    dedicationValue.className = "finance-value highlight";
    dedicationValue.textContent = `${finance.currentPercent.toFixed(1)}% of GDP`;

    dedicationRow.append(dedicationLabel, dedicationValue);
    regionIncomeEl.appendChild(dedicationRow);

    // Monthly income
    const incomeRow = document.createElement("div");
    incomeRow.className = "finance-row";

    const incomeLabel = document.createElement("span");
    incomeLabel.className = "finance-label";
    incomeLabel.textContent = "Monthly Income:";

    const incomeValue = document.createElement("span");
    incomeValue.className = "finance-value positive";
    incomeValue.textContent = `+${formatCurrency(monthlyIncome)}`;

    incomeRow.append(incomeLabel, incomeValue);
    regionIncomeEl.appendChild(incomeRow);

    // Progress bar towards max
    const progressContainer = document.createElement("div");
    progressContainer.className = "dedication-progress-container";

    const progressLabel = document.createElement("div");
    progressLabel.className = "progress-label";
    progressLabel.textContent = `Progress to max (${finance.maxPercent.toFixed(1)}%):`;

    const progressBar = document.createElement("div");
    progressBar.className = "dedication-progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "dedication-progress-fill";
    const progressPercent = ((finance.currentPercent - finance.minPercent) / (finance.maxPercent - finance.minPercent)) * 100;
    progressFill.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;

    progressBar.appendChild(progressFill);
    progressContainer.append(progressLabel, progressBar);
    regionIncomeEl.appendChild(progressContainer);

    // Difficulty indicator
    const difficultyRow = document.createElement("div");
    difficultyRow.className = "finance-row";

    const difficultyLabel = document.createElement("span");
    difficultyLabel.className = "finance-label";
    difficultyLabel.textContent = "Political Difficulty:";

    const difficultyValue = document.createElement("span");
    const diffClass = finance.difficulty < 0.4 ? "easy" : finance.difficulty < 0.7 ? "medium" : "hard";
    difficultyValue.className = `finance-value difficulty-${diffClass}`;
    difficultyValue.textContent = finance.difficulty < 0.4 ? "Low" : finance.difficulty < 0.7 ? "Medium" : "High";

    difficultyRow.append(difficultyLabel, difficultyValue);
    regionIncomeEl.appendChild(difficultyRow);

    // Check for active campaign
    const activeCampaign = state.activeCampaigns?.find(c => c.regionId === selectedRegionId);

    if (activeCampaign) {
      // Show campaign progress
      const campaignSection = document.createElement("div");
      campaignSection.className = "campaign-section active";

      const campaignTitle = document.createElement("div");
      campaignTitle.className = "campaign-title";
      campaignTitle.textContent = "🗳️ Campaign in Progress";

      const campaignProgress = document.createElement("div");
      campaignProgress.className = "campaign-progress-container";

      const campaignBar = document.createElement("div");
      campaignBar.className = "campaign-progress-bar";

      const campaignFill = document.createElement("div");
      campaignFill.className = "campaign-progress-fill";
      const campaignPercent = ((activeCampaign.totalMonths - activeCampaign.monthsRemaining) / activeCampaign.totalMonths) * 100;
      campaignFill.style.width = `${campaignPercent}%`;

      campaignBar.appendChild(campaignFill);

      const campaignInfo = document.createElement("div");
      campaignInfo.className = "campaign-info";
      campaignInfo.textContent = `${activeCampaign.monthsRemaining} months remaining • +${activeCampaign.increaseAmount.toFixed(2)}% expected`;

      campaignProgress.append(campaignBar, campaignInfo);
      campaignSection.append(campaignTitle, campaignProgress);
      regionIncomeEl.appendChild(campaignSection);
    } else if (finance.currentPercent < finance.maxPercent) {
      // Show campaign button
      const campaignSection = document.createElement("div");
      campaignSection.className = "campaign-section";

      // Calculate campaign details with disaster awareness modifier
      const awarenessModifier = getDisasterAwarenessModifier(selectedRegionId);
      const cost = gdpTrillions * GAME_CONFIG.lobbyCostFactor * finance.difficulty * awarenessModifier * 1000;
      const duration = Math.ceil(GAME_CONFIG.lobbyBaseMonths * finance.difficulty * finance.politicalResistance * awarenessModifier);
      // Smart increase based on remaining room to max
      const remainingRoom = Math.max(0, finance.maxPercent - finance.currentPercent);
      const difficultyMultiplier = 1 - finance.difficulty * 0.5;
      const increasePercent = 0.2 + (0.1 * difficultyMultiplier);
      const increaseAmount = Math.max(
        GAME_CONFIG.lobbyMinIncrease * 0.5,
        Math.min(remainingRoom * increasePercent, remainingRoom)
      );
      const awarenessBonus = state.disasterHistory?.[selectedRegionId]?.climateAwarenessBoost || 0;

      const campaignBtn = document.createElement("button");
      campaignBtn.className = "campaign-button";
      campaignBtn.disabled = state.gameOver || state.funds < cost;
      campaignBtn.innerHTML = `<span class="campaign-icon">🗳️</span> Climate Policy Campaign`;
      campaignBtn.addEventListener("click", () => startClimateCampaign(selectedRegionId));

      const campaignDetails = document.createElement("div");
      campaignDetails.className = "campaign-details";
      let detailsHtml = `
        <span>Cost: ${formatCurrency(cost)}</span>
        <span>Duration: ${formatConstructionTime(duration)}</span>
        <span>Effect: +${increaseAmount.toFixed(2)}% GDP</span>
      `;
      if (awarenessBonus > 0) {
        detailsHtml += `<span class="awareness-bonus">🌡️ Climate awareness: -${Math.round(awarenessBonus * 100)}% difficulty</span>`;
      }
      campaignDetails.innerHTML = detailsHtml;

      campaignSection.append(campaignBtn, campaignDetails);
      regionIncomeEl.appendChild(campaignSection);
    } else {
      // At max dedication
      const maxMsg = document.createElement("div");
      maxMsg.className = "max-dedication-msg";
      maxMsg.textContent = "✓ Maximum climate dedication reached!";
      regionIncomeEl.appendChild(maxMsg);
    }
  }
}

function getClimateDataForRegion(regionId) {
  if (!window.CLIMATE_DATA) return null;

  // Use granularity-aware data fetching
  const config = GRANULARITY_CONFIG[currentGranularity];
  const level = config?.level || 3;

  // Try the new getDataForGranularity first
  if (window.CLIMATE_DATA.getDataForGranularity) {
    const data = window.CLIMATE_DATA.getDataForGranularity(level, regionId);
    if (data) return data;
  }

  // Fallback to old method for backwards compatibility
  const normalized = regionId.toLowerCase().replace(/[\s-]/g, "_");
  return window.CLIMATE_DATA.getClimateData(normalized);
}

function clearClimateDataPanels() {
  if (emissionsBreakdownEl) emissionsBreakdownEl.innerHTML = "";
  if (effectivenessPanelEl) effectivenessPanelEl.innerHTML = "";
  if (regionFactEl) regionFactEl.textContent = "";
  const powerPanelEl = document.getElementById("power-panel");
  if (powerPanelEl) powerPanelEl.innerHTML = "";
}

function appendBasicRegionInfo(container, climateData, regionId) {
  const basicInfo = document.createElement("div");
  basicInfo.className = "basic-region-info region-stats-card";

  let html = '<div class="region-stats-grid">';

  // GDP
  if (climateData.gdp) {
    html += `
      <div class="region-stat">
        <span class="region-stat-label">GDP</span>
        <span class="region-stat-value">$${climateData.gdp.toFixed(1)}T</span>
      </div>`;
  }

  // Population
  if (climateData.population) {
    const popInBillions = climateData.population / 1000;
    const popDisplay = popInBillions >= 1
      ? `${popInBillions.toFixed(2)}B`
      : `${climateData.population.toFixed(0)}M`;
    html += `
      <div class="region-stat">
        <span class="region-stat-label">Population</span>
        <span class="region-stat-value">${popDisplay}</span>
      </div>`;
  }

  // Climate dedication is now set through alliance negotiation terms
  // So we don't show "Climate Budget %" or "Potential Income" for non-allied regions

  // Emissions if available (emissions.total is already in Gt)
  if (climateData.emissions?.total) {
    html += `
      <div class="region-stat">
        <span class="region-stat-label">CO2 Emissions</span>
        <span class="region-stat-value">${climateData.emissions.total.toFixed(1)} Gt/yr</span>
      </div>`;
  }

  html += '</div>';

  basicInfo.innerHTML = html;
  container.appendChild(basicInfo);
}

function appendPerCapitaInfo(container, climateData) {
  if (!climateData.emissions) return;

  const perCapita = document.createElement("div");
  perCapita.className = "per-capita";

  let text = "";
  if (climateData.emissions.perCapita) {
    text = `${climateData.emissions.perCapita.toFixed(1)} tonnes CO2 per person`;
  }

  if (climateData.emissions.trend !== undefined) {
    const trend = climateData.emissions.trend;
    const trendClass = trend < -1 ? "improving" : trend > 1 ? "worsening" : "stable";
    const trendIcon = trend < -1 ? "\u2193" : trend > 1 ? "\u2191" : "\u2192";
    const trendText = Math.abs(trend).toFixed(1) + "% /yr";

    const trendSpan = document.createElement("span");
    trendSpan.className = `trend-indicator ${trendClass}`;
    trendSpan.textContent = `${trendIcon} ${trendText}`;

    perCapita.textContent = text + " ";
    perCapita.appendChild(trendSpan);
  } else {
    perCapita.textContent = text;
  }

  container.appendChild(perCapita);
}

function renderPowerPanel(regionId) {
  const powerPanelEl = document.getElementById("power-panel");
  if (!powerPanelEl) return;

  const region = state.regions?.[regionId];
  if (!region?.power) {
    powerPanelEl.innerHTML = "";
    return;
  }

  const power = region.power;
  const climateData = getClimateDataForRegion(regionId);
  powerPanelEl.innerHTML = "";

  // Header with status
  const header = document.createElement("div");
  header.className = "power-header";

  const titleEl = document.createElement("span");
  titleEl.className = "power-title";
  titleEl.textContent = "Power Grid";

  const statusEl = document.createElement("span");
  statusEl.className = "power-status";

  // Calculate supply/demand ratio to factor into status
  const supplyRatio = power.demand > 0 ? power.supply / power.demand : 1;
  const hasShortage = supplyRatio < 0.95; // 5%+ deficit is a concern
  const hasCriticalShortage = supplyRatio < 0.85; // 15%+ deficit is critical

  // Determine status considering both stability AND supply/demand
  if (hasCriticalShortage) {
    statusEl.classList.add("critical");
    statusEl.textContent = "Critical";
  } else if (hasShortage || power.stability < POWER_CONFIG.stabilityThresholds.warning) {
    statusEl.classList.add("warning");
    statusEl.textContent = "Warning";
  } else if (power.stability >= POWER_CONFIG.stabilityThresholds.excellent && !hasShortage) {
    statusEl.classList.add("excellent");
    statusEl.textContent = "Excellent";
  } else if (power.stability >= POWER_CONFIG.stabilityThresholds.good) {
    statusEl.classList.add("good");
    statusEl.textContent = "Good";
  } else {
    statusEl.classList.add("warning");
    statusEl.textContent = "Warning";
  }

  header.append(titleEl, statusEl);
  powerPanelEl.appendChild(header);

  // Summary stats
  const summary = document.createElement("div");
  summary.className = "power-summary";

  const demandStat = document.createElement("div");
  demandStat.className = "power-stat";
  demandStat.innerHTML = `
    <span class="power-stat-label">Demand</span>
    <span class="power-stat-value">${power.demand.toFixed(0)} GW</span>
  `;

  const supplyStat = document.createElement("div");
  supplyStat.className = "power-stat";
  const supplyClass = power.supply >= power.demand ? "surplus" : "deficit";
  supplyStat.innerHTML = `
    <span class="power-stat-label">Supply</span>
    <span class="power-stat-value ${supplyClass}">${power.supply.toFixed(0)} GW</span>
  `;

  const stabilityStat = document.createElement("div");
  stabilityStat.className = "power-stat";
  // Determine stability class based on thresholds
  let stabilityClass = "";
  let stabilityHint = "";
  if (power.stability >= POWER_CONFIG.stabilityThresholds.excellent) {
    stabilityClass = "excellent";
    stabilityHint = "Excellent - reliable power, business confidence";
  } else if (power.stability >= POWER_CONFIG.stabilityThresholds.good) {
    stabilityClass = "good";
    stabilityHint = "Good - stable operations";
  } else if (power.stability >= POWER_CONFIG.stabilityThresholds.warning) {
    stabilityClass = "warning";
    stabilityHint = "Unstable - price spikes, GDP penalty";
  } else {
    stabilityClass = "critical";
    stabilityHint = "Critical - blackout risk, severe economic impact";
  }
  stabilityStat.innerHTML = `
    <span class="power-stat-label">Stability</span>
    <span class="power-stat-value ${stabilityClass}" title="${stabilityHint}">${power.stability.toFixed(0)}%</span>
  `;

  const priceStat = document.createElement("div");
  priceStat.className = "power-stat";
  const priceColor = power.pricePerKwh > POWER_CONFIG.priceThresholds.expensive ? "deficit" :
                     power.pricePerKwh < POWER_CONFIG.priceThresholds.normal ? "surplus" : "";
  priceStat.innerHTML = `
    <span class="power-stat-label">Price</span>
    <span class="power-stat-value ${priceColor}">$${power.pricePerKwh.toFixed(2)}/kWh</span>
  `;

  summary.append(demandStat, supplyStat, stabilityStat, priceStat);
  powerPanelEl.appendChild(summary);

  // Supply/Demand bar
  const barContainer = document.createElement("div");
  barContainer.className = "power-bar-container";

  const barLabel = document.createElement("div");
  barLabel.className = "power-bar-label";
  const ratio = power.demand > 0 ? (power.supply / power.demand * 100).toFixed(0) : 0;
  barLabel.innerHTML = `<span>Supply vs Demand</span><span>${ratio}%</span>`;

  const bar = document.createElement("div");
  bar.className = "power-bar";

  const barFill = document.createElement("div");
  barFill.className = "power-bar-fill";
  const fillPercent = Math.min(150, Math.max(0, (power.supply / power.demand) * 100));
  barFill.style.width = `${Math.min(100, fillPercent)}%`;

  if (power.supply >= power.demand * 1.1) {
    barFill.classList.add("surplus");
  } else if (power.supply >= power.demand * 0.95) {
    barFill.classList.add("balanced");
  } else {
    barFill.classList.add("deficit");
  }

  bar.appendChild(barFill);
  barContainer.append(barLabel, bar);
  powerPanelEl.appendChild(barContainer);

  // Power mix
  const totalCapacity = power.variableCapacity + power.baseloadCapacity;
  if (totalCapacity > 0) {
    const mix = document.createElement("div");
    mix.className = "power-mix";

    const mixTitle = document.createElement("div");
    mixTitle.className = "power-mix-title";
    mixTitle.textContent = "Generation Mix";

    const mixBar = document.createElement("div");
    mixBar.className = "power-mix-bar";

    const baseloadPercent = (power.baseloadCapacity / totalCapacity) * 100;
    const variablePercent = (power.variableCapacity / totalCapacity) * 100;

    if (baseloadPercent > 0) {
      const baseloadSeg = document.createElement("div");
      baseloadSeg.className = "power-mix-segment baseload";
      baseloadSeg.style.width = `${baseloadPercent}%`;
      if (baseloadPercent > 15) baseloadSeg.textContent = `${baseloadPercent.toFixed(0)}%`;
      mixBar.appendChild(baseloadSeg);
    }

    if (variablePercent > 0) {
      const variableSeg = document.createElement("div");
      variableSeg.className = "power-mix-segment variable";
      variableSeg.style.width = `${variablePercent}%`;
      if (variablePercent > 15) variableSeg.textContent = `${variablePercent.toFixed(0)}%`;
      mixBar.appendChild(variableSeg);
    }

    const legend = document.createElement("div");
    legend.className = "power-mix-legend";
    legend.innerHTML = `
      <span class="power-legend-item"><span class="power-legend-dot baseload"></span>Baseload</span>
      <span class="power-legend-item"><span class="power-legend-dot variable"></span>Variable</span>
      ${power.storageCapacity > 0 ? '<span class="power-legend-item"><span class="power-legend-dot storage"></span>Storage: ' + power.storageCapacity.toFixed(1) + ' GWh</span>' : ''}
    `;

    mix.append(mixTitle, mixBar, legend);
    powerPanelEl.appendChild(mix);
  }

  // Warnings
  const warnings = document.createElement("div");
  warnings.className = "power-warnings";

  if (power.blackoutRisk) {
    const warning = document.createElement("div");
    warning.className = "power-warning critical";
    warning.textContent = "Blackout risk! Grid critically unstable.";
    warnings.appendChild(warning);
  }

  if (power.supply < power.demand * 0.9) {
    const warning = document.createElement("div");
    warning.className = "power-warning warning";
    const shortage = ((1 - power.supply / power.demand) * 100).toFixed(0);
    warning.textContent = `Power shortage: ${shortage}% deficit`;
    warnings.appendChild(warning);
  }

  const variableShare = power.variableCapacity / totalCapacity;
  if (variableShare > 0.5 && power.storageCapacity < power.variableCapacity * 0.2) {
    const warning = document.createElement("div");
    warning.className = "power-warning info";
    warning.textContent = "High variable generation - consider adding storage";
    warnings.appendChild(warning);
  }

  if (warnings.children.length > 0) {
    powerPanelEl.appendChild(warnings);
  }

  // GDP Impact
  if (power.gdpModifier < 1.0) {
    const gdpImpact = document.createElement("div");
    gdpImpact.className = "power-gdp-impact";

    const gdpLabel = document.createElement("span");
    gdpLabel.className = "power-gdp-label";
    gdpLabel.textContent = "Income Impact:";

    const gdpValue = document.createElement("span");
    gdpValue.className = "power-gdp-value negative";
    const penalty = ((1 - power.gdpModifier) * 100).toFixed(0);
    gdpValue.textContent = `-${penalty}%`;

    gdpImpact.append(gdpLabel, gdpValue);
    powerPanelEl.appendChild(gdpImpact);
  }

  // Growth Trends section
  const selectedRegionData = state.regions?.[regionId];
  if (selectedRegionData?.economy || climateData?.demandGrowthRate) {
    const growthSection = document.createElement("div");
    growthSection.className = "power-growth-trends";

    const growthTitle = document.createElement("div");
    growthTitle.className = "power-growth-title";
    growthTitle.textContent = "Growth Trends";
    growthSection.appendChild(growthTitle);

    const growthGrid = document.createElement("div");
    growthGrid.className = "power-growth-grid";

    // Demand Growth
    const demandGrowth = climateData?.demandGrowthRate || 0;
    const demandRow = document.createElement("div");
    demandRow.className = "power-growth-row";
    demandRow.innerHTML = `
      <span class="growth-label">Demand:</span>
      <span class="growth-value ${demandGrowth > 0 ? "positive" : ""}">${demandGrowth > 0 ? "+" : ""}${(demandGrowth * 100).toFixed(1)}%/yr</span>
    `;
    growthGrid.appendChild(demandRow);

    // GDP Growth
    if (selectedRegionData?.economy) {
      const gdpGrowth = selectedRegionData.economy.growthRate || 0;
      const gdpRow = document.createElement("div");
      gdpRow.className = "power-growth-row";
      gdpRow.innerHTML = `
        <span class="growth-label">GDP:</span>
        <span class="growth-value ${gdpGrowth > 0 ? "positive" : ""}">${gdpGrowth > 0 ? "+" : ""}${(gdpGrowth * 100).toFixed(1)}%/yr</span>
      `;
      growthGrid.appendChild(gdpRow);
    }

    // Emissions Trend
    if (selectedRegionData?.emissions) {
      const emissionsTrend = selectedRegionData.emissions.trend || 0;
      const emissionsRow = document.createElement("div");
      emissionsRow.className = "power-growth-row";
      const trendClass = emissionsTrend > 0 ? "negative" : emissionsTrend < 0 ? "positive" : "";
      emissionsRow.innerHTML = `
        <span class="growth-label">Emissions:</span>
        <span class="growth-value ${trendClass}">${emissionsTrend > 0 ? "+" : ""}${(emissionsTrend * 100).toFixed(1)}%/mo</span>
      `;
      growthGrid.appendChild(emissionsRow);
    }

    growthSection.appendChild(growthGrid);
    powerPanelEl.appendChild(growthSection);
  }
}

function renderEmissionsBreakdown(climateData, regionId) {
  if (!emissionsBreakdownEl || !climateData.emissions?.sources) {
    if (emissionsBreakdownEl) emissionsBreakdownEl.innerHTML = "";
    return;
  }

  const sectors = window.CLIMATE_DATA?.EMISSION_SECTORS || {};
  const region = state.regions?.[regionId];
  emissionsBreakdownEl.innerHTML = "";

  // Header
  const header = document.createElement("div");
  header.className = "emissions-header";

  const titleEl = document.createElement("span");
  titleEl.className = "emissions-title";
  titleEl.textContent = "Emissions by Sector";

  const totalEl = document.createElement("span");
  totalEl.className = "emissions-total";
  totalEl.textContent = climateData.emissions.total
    ? `${climateData.emissions.total.toFixed(2)} Gt CO2/yr`
    : "";

  header.append(titleEl, totalEl);
  emissionsBreakdownEl.appendChild(header);

  // Sort sources by percentage
  const sources = Object.entries(climateData.emissions.sources)
    .sort((a, b) => b[1] - a[1]);

  sources.forEach(([key, value]) => {
    const sector = sectors[key] || { label: key, icon: "\u2022", color: "#f4d370" };
    const percent = Math.round(value * 100);

    // Get player's reduction for this sector
    const reductionMultiplier = region?.sectorEmissions?.[key]?.reductionMultiplier || 1.0;
    const reductionPercent = Math.round((1 - reductionMultiplier) * 100);
    const hasReduction = reductionPercent > 0;

    const row = document.createElement("div");
    row.className = "emission-row" + (hasReduction ? " has-reduction" : "");

    const icon = document.createElement("span");
    icon.className = "emission-icon";
    icon.textContent = sector.icon;

    const label = document.createElement("span");
    label.className = "emission-label";
    label.textContent = sector.label;

    const barContainer = document.createElement("div");
    barContainer.className = "emission-bar-container";

    const barFill = document.createElement("div");
    barFill.className = "emission-bar-fill";
    barFill.style.width = `${percent}%`;
    barFill.style.backgroundColor = sector.color;

    barContainer.appendChild(barFill);

    const percentEl = document.createElement("span");
    percentEl.className = "emission-percent";
    percentEl.textContent = `${percent}%`;

    row.append(icon, label, barContainer, percentEl);

    // Add reduction indicator if player has reduced this sector
    if (hasReduction) {
      const reductionEl = document.createElement("span");
      reductionEl.className = "sector-reduction";
      reductionEl.textContent = `↓${reductionPercent}%`;
      reductionEl.title = `Your projects have reduced ${sector.label} emissions by ${reductionPercent}%`;
      row.appendChild(reductionEl);
    }

    emissionsBreakdownEl.appendChild(row);
  });
}

function renderEffectivenessPanel(climateData) {
  if (!effectivenessPanelEl || !climateData.potential) {
    if (effectivenessPanelEl) effectivenessPanelEl.innerHTML = "";
    return;
  }

  effectivenessPanelEl.innerHTML = "";

  const title = document.createElement("div");
  title.className = "effectiveness-title";
  title.textContent = "Project Effectiveness";
  effectivenessPanelEl.appendChild(title);

  const potentialTypes = [
    { key: "solar", label: "Solar", icon: "\u2600\uFE0F" },
    { key: "wind", label: "Wind", icon: "\uD83D\uDCA8" },
    { key: "forest", label: "Forest", icon: "\uD83C\uDF32" },
    { key: "carbonCapture", label: "CCS", icon: "\uD83C\uDFED" },
  ];

  potentialTypes.forEach(({ key, label, icon }) => {
    let score = climateData.potential[key];
    if (score === undefined) return;

    // Handle object format { score, capacity }
    if (typeof score === "object") {
      score = score.score;
    }

    const row = document.createElement("div");
    row.className = "effectiveness-row";

    const labelEl = document.createElement("span");
    labelEl.className = "effectiveness-label";
    labelEl.textContent = `${icon} ${label}`;

    const starsEl = document.createElement("span");
    starsEl.className = "effectiveness-stars";
    starsEl.textContent = getStarsForScore(score);

    const noteEl = document.createElement("span");
    noteEl.className = "effectiveness-note";
    noteEl.textContent = getEffectivenessNote(score);

    row.append(labelEl, starsEl, noteEl);
    effectivenessPanelEl.appendChild(row);
  });
}

function getStarsForScore(score) {
  const fullStars = Math.round(score * 5);
  return "\u2605".repeat(fullStars) + "\u2606".repeat(5 - fullStars);
}

function getEffectivenessNote(score) {
  if (score >= 0.9) return "Excellent";
  if (score >= 0.75) return "Very Good";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Moderate";
  if (score >= 0.25) return "Limited";
  return "Poor";
}

function renderRegionFact(climateData) {
  if (!regionFactEl) return;

  if (climateData.facts && climateData.facts.length > 0) {
    const randomFact = climateData.facts[Math.floor(Math.random() * climateData.facts.length)];
    regionFactEl.textContent = randomFact;
  } else {
    regionFactEl.textContent = "";
  }
}

// Track selected project category (default to climate)
let selectedProjectCategory = "climate";

// CCS Projects list for dedicated section
const CCS_PROJECTS = [
  'postCombustionCapture', 'preCombustionCapture', 'oxyfuelCapture',
  'directAirCapture', 'beccsPlant', 'co2Pipeline', 'co2OffshorePipeline',
  'co2ShipTerminal', 'depletedReservoirStorage', 'salineAquiferStorage',
  'ccsHubSmall', 'ccsHubMajor'
];

// CCS Capture projects that benefit from infrastructure
const CCS_CAPTURE_PROJECTS = [
  'postCombustionCapture', 'preCombustionCapture', 'oxyfuelCapture',
  'directAirCapture', 'beccsPlant', 'ccsHubSmall', 'ccsHubMajor'
];

// CCS Infrastructure types
const CCS_TRANSPORT_PROJECTS = ['co2Pipeline', 'co2OffshorePipeline', 'co2ShipTerminal'];
const CCS_STORAGE_PROJECTS = ['depletedReservoirStorage', 'salineAquiferStorage'];

/**
 * Calculate infrastructure bonus for CCS capture projects
 * @param {string} regionId - Region to check for infrastructure
 * @returns {Object} { bonus: number, hasTransport: boolean, hasStorage: boolean }
 */
function getCCSInfrastructureBonus(regionId) {
  const region = state.regions[regionId];
  if (!region?.projects) return { bonus: 1.0, hasTransport: false, hasStorage: false };

  let bonus = 1.0;

  // Check for transport infrastructure
  const hasTransport = region.projects.some(p =>
    CCS_TRANSPORT_PROJECTS.includes(p.type)
  );
  if (hasTransport) bonus += 0.25; // +25% effectiveness

  // Check for storage infrastructure
  const hasStorage = region.projects.some(p =>
    CCS_STORAGE_PROJECTS.includes(p.type)
  );
  if (hasStorage) bonus += 0.25; // +25% effectiveness

  // Full chain bonus (transport + storage)
  if (hasTransport && hasStorage) bonus += 0.15; // Extra +15% synergy

  return { bonus, hasTransport, hasStorage };
}

/**
 * Render a locked CCS project card showing requirements
 * @param {string} projectType - The project type ID
 * @param {Object} project - The project definition
 * @returns {HTMLElement} The locked project card element
 */
function renderLockedCCSProject(projectType, project) {
  const card = document.createElement("div");
  card.className = "project-card locked-ccs";

  // Find the required tech
  const requiredTechId = project.unlockedBy;
  const requiredTech = TECHNOLOGIES.find(t => t.id === requiredTechId);

  const button = document.createElement("button");
  button.className = "project-button";
  button.disabled = true;
  button.textContent = `${project.label} (Locked)`;

  const details = document.createElement("p");

  const lockStatus = document.createElement("span");
  lockStatus.className = "project-locked-status";
  lockStatus.textContent = `🔒 Requires: ${requiredTech?.name || 'Unknown Technology'}`;

  const descSpan = document.createElement("span");
  descSpan.className = "project-description-locked";
  descSpan.textContent = project.description;

  details.appendChild(lockStatus);
  details.appendChild(document.createElement("br"));
  details.appendChild(descSpan);

  card.append(button, details);
  return card;
}

/**
 * Render the CCS projects section showing both locked and unlocked projects
 * @param {string} regionId - The region to render for
 * @param {Object} climateData - Climate data for effectiveness calculations
 * @param {Object} difficulty - Difficulty settings
 */
function renderCCSProjectsSection(regionId, climateData, difficulty) {
  const infraBonus = getCCSInfrastructureBonus(regionId);

  // Add infrastructure status indicator if any bonuses active
  if (infraBonus.hasTransport || infraBonus.hasStorage) {
    const statusEl = document.createElement("div");
    statusEl.className = "ccs-infrastructure-status";
    let statusText = "🏗️ Infrastructure Bonus: ";
    const bonusParts = [];
    if (infraBonus.hasTransport) bonusParts.push("📦 Transport (+25%)");
    if (infraBonus.hasStorage) bonusParts.push("💾 Storage (+25%)");
    if (infraBonus.hasTransport && infraBonus.hasStorage) bonusParts.push("🔗 Full Chain (+15%)");
    statusText += bonusParts.join(" | ");
    statusText += ` = +${Math.round((infraBonus.bonus - 1) * 100)}% total`;
    statusEl.textContent = statusText;
    projectButtonsEl.appendChild(statusEl);
  }

  // Render each CCS project
  CCS_PROJECTS.forEach(projectType => {
    const project = PROJECT_TYPES[projectType];
    if (!project) return;

    const isUnlocked = isProjectUnlocked(projectType);

    if (isUnlocked) {
      // Render unlocked project with normal card
      const card = document.createElement("div");
      card.className = "project-card ccs-project";

      const effectiveness = getProjectEffectiveness(projectType, regionId, climateData);
      const adjustedCost = Math.round(effectiveness.cost * difficulty.costMultiplier * 10) / 10;

      // Calculate CO2 reduction with infrastructure bonus
      let adjustedReduction = effectiveness.co2Reduction;
      if (CCS_CAPTURE_PROJECTS.includes(projectType) && infraBonus.bonus > 1) {
        adjustedReduction = adjustedReduction * infraBonus.bonus;
      }

      const button = document.createElement("button");
      button.className = "project-button";

      const constructionTime = project.constructionMonths || 1;
      const timeStr = formatConstructionTime(constructionTime);
      button.textContent = `${project.label} (${formatCurrency(adjustedCost)}, ${timeStr})`;

      // Add infrastructure bonus badge for capture projects
      if (CCS_CAPTURE_PROJECTS.includes(projectType) && infraBonus.bonus > 1) {
        const bonusBadge = document.createElement("span");
        bonusBadge.className = "project-effectiveness bonus has-tooltip";
        bonusBadge.textContent = `+${Math.round((infraBonus.bonus - 1) * 100)}% infra bonus`;
        bonusBadge.setAttribute("data-tooltip", "Infrastructure bonus from transport and storage projects in this region");
        button.appendChild(bonusBadge);
      }

      button.disabled = state.gameOver || state.funds < adjustedCost;
      button.addEventListener("click", () => buildProjectWithEffectiveness(regionId, projectType, effectiveness));

      const effectParts = [];
      if (adjustedReduction > 0) {
        effectParts.push(formatCO2ReductionDisplay(adjustedReduction, 2, "Gt CO2/yr"));
      }
      if (project.income > 0) {
        effectParts.push(`+${formatCurrency(project.income)} / month`);
      }

      const effectText = effectParts.length ? effectParts.join(", ") : "Infrastructure only";

      const details = document.createElement("p");
      details.textContent = `${project.description} ${effectText}.`;

      card.append(button, details);
      projectButtonsEl.appendChild(card);
    } else {
      // Render locked project
      const lockedCard = renderLockedCCSProject(projectType, project);
      projectButtonsEl.appendChild(lockedCard);
    }
  });
}

function renderProjectButtons() {
  projectButtonsEl.innerHTML = "";

  if (!selectedRegionId) {
    return;
  }

  // Check alliance status - show message if not allied
  const allianceData = state.alliance?.[selectedRegionId];
  if (!allianceData || allianceData.status !== ALLIANCE_STATUS.ALLIED) {
    const message = document.createElement("div");
    message.className = "alliance-required-message";
    message.style.cssText = "padding: 20px; text-align: center; color: var(--text-secondary);";
    message.innerHTML = `
      <p style="margin-bottom: 8px;">This region must join the Climate Alliance before you can build projects here.</p>
      ${allianceData?.status === ALLIANCE_STATUS.HOSTILE
        ? `<p style="color: var(--danger-color);">They are currently hostile. Wait for the cooldown period.</p>`
        : `<p>Use the "Negotiate Alliance" button above to recruit them.</p>`
      }
    `;
    projectButtonsEl.appendChild(message);
    return;
  }

  // Category tabs
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "project-category-tabs";

  const categories = [
    { id: 'climate', label: 'Climate' },
    { id: 'power', label: 'Power' },
    { id: 'ccs', label: 'CCS' },
    { id: 'economic', label: 'Economic' }
  ];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `category-tab ${selectedProjectCategory === cat.id ? 'active' : ''}`;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => setProjectCategory(cat.id));
    tabsContainer.appendChild(btn);
  });

  projectButtonsEl.appendChild(tabsContainer);

  // Get climate data for effectiveness calculations
  const climateData = getClimateDataForRegion(selectedRegionId);
  const difficulty = getDifficulty();

  // If CCS category selected, render CCS section and return
  if (selectedProjectCategory === 'ccs') {
    renderCCSProjectsSection(selectedRegionId, climateData, difficulty);
    return;
  }

  // Filter projects by category and unlock status
  const projectEntries = Object.entries(PROJECT_TYPES).filter(([type, project]) => {
    // First check if project is unlocked (via technology research)
    if (!isProjectUnlocked(type)) {
      return false;
    }

    // Exclude CCS projects from other tabs (they have their own tab)
    if (CCS_PROJECTS.includes(type)) {
      return false;
    }

    // Then filter by category
    if (selectedProjectCategory === "economic") {
      return project.category === "economic";
    } else if (selectedProjectCategory === "power") {
      return project.category === "power";
    } else {
      // Climate projects: not economic and not power
      return project.category !== "economic" && project.category !== "power";
    }
  });

  projectEntries.forEach(([type, project]) => {
    const card = document.createElement("div");
    card.className = "project-card";

    // Add electrification category styling
    if (project.category === "electrification" || project.electrification) {
      card.classList.add("electrification");
    }

    // Calculate effectiveness-adjusted values
    const effectiveness = getProjectEffectiveness(type, selectedRegionId, climateData);
    // Apply difficulty multiplier on top of regional effectiveness
    const adjustedCost = Math.round(effectiveness.cost * difficulty.costMultiplier * 10) / 10;
    const adjustedReduction = effectiveness.co2Reduction;

    const button = document.createElement("button");
    button.className = "project-button";

    // Show adjusted cost with proper currency format
    const constructionTime = project.constructionMonths || 1;
    const timeStr = formatConstructionTime(constructionTime);
    let buttonText = `${project.label} (${formatCurrency(adjustedCost)}, ${timeStr})`;
    button.textContent = buttonText;

    // Add effectiveness indicator if different from base
    if (effectiveness.effectMultiplier !== 1 && effectiveness.effectMultiplier > 0) {
      const effectBadge = document.createElement("span");
      const mult = effectiveness.effectMultiplier;
      effectBadge.className = `project-effectiveness ${mult > 1 ? "bonus" : "penalty"} has-tooltip`;
      effectBadge.textContent = mult > 1 ? `+${(mult * 100 - 100).toFixed(0)}% effective` : `-${(100 - mult * 100).toFixed(0)}% effective`;

      // Add tooltip explaining the effectiveness modifier
      let tooltipText = effectiveness.reason;
      if (!tooltipText) {
        // Generate explanation based on project type and regional conditions
        if (mult > 1) {
          tooltipText = `Favorable regional conditions for ${project.label.toLowerCase()} projects`;
        } else {
          tooltipText = `Less effective due to latitude, climate, or local resources`;
        }
      }
      effectBadge.setAttribute("data-tooltip", tooltipText);
      effectBadge.title = tooltipText;
      button.appendChild(effectBadge);
    }

    // Add electrification badge
    if (project.category === "electrification" || project.electrification) {
      const elecBadge = document.createElement("span");
      elecBadge.className = "project-electrification-badge";
      elecBadge.textContent = "⚡ Electrification";
      button.appendChild(elecBadge);
    }

    button.disabled = state.gameOver || state.funds < adjustedCost;
    button.addEventListener("click", () => buildProjectWithEffectiveness(selectedRegionId, type, effectiveness));

    const effectParts = [];
    if (adjustedReduction > 0) {
      effectParts.push(formatCO2ReductionDisplay(adjustedReduction, 1, "CO2 / month"));
    } else if (adjustedReduction < 0) {
      effectParts.push(formatCO2ReductionDisplay(adjustedReduction, 1, "CO2 / month"));
    }
    if (project.income > 0) {
      effectParts.push(`+${formatCurrency(project.income)} / month`);
    }
    // Show happiness bonus for economic projects
    if (project.happiness) {
      effectParts.push(`+${project.happiness} happiness`);
    }
    // Show GDP boost for economic projects
    if (project.gdpBoost) {
      effectParts.push(`+${(project.gdpBoost * 100).toFixed(0)}% GDP`);
    }
    // Show power stats for power projects
    if (project.capacityGW) {
      // Show GW capacity and annual TWh production
      const twhProduced = calculateProjectTWh(type, effectiveness.effectMultiplier || 1);
      if (twhProduced > 0) {
        effectParts.push(`${project.capacityGW} GW (~${twhProduced} TWh/yr)`);
      } else {
        effectParts.push(`${project.capacityGW} GW`);
      }

      // Show grid impact preview if a region is selected
      if (selectedRegionId) {
        const impact = calculateGridImpactPreview(selectedRegionId, type, effectiveness.effectMultiplier || 1);
        if (impact && impact.currentRatio > 0 && impact.ratioChange !== 0) {
          const ratioSign = impact.ratioChange > 0 ? "+" : "";
          effectParts.push(`Grid supply: ${impact.currentRatio}%→${impact.projectedRatio}%`);
        }
      }
    }
    if (project.storageGWh) {
      effectParts.push(`${project.storageGWh} GWh storage`);
    }
    if (project.stabilityContribution) {
      const stabSign = project.stabilityContribution > 0 ? "+" : "";
      effectParts.push(`${stabSign}${project.stabilityContribution} stability`);
    }
    // Show electrification effects
    if (project.electrification) {
      const elec = project.electrification;
      effectParts.push(`⚡ +${Math.round(elec.powerDemandIncrease * 100)}% power demand`);
    }
    // Show sector reduction effects
    if (project.sectorReduction) {
      Object.entries(project.sectorReduction).forEach(([sector, subsectors]) => {
        Object.entries(subsectors).forEach(([subsector, reduction]) => {
          effectParts.push(`↓${Math.round(reduction * 100)}% ${sector}`);
        });
      });
    }
    const effectText = effectParts.length ? effectParts.join(", ") : "No immediate monthly effect";

    const details = document.createElement("p");
    details.textContent = `${project.description} ${effectText}.`;

    // Add reason if available
    if (effectiveness.reason) {
      const reasonEl = document.createElement("span");
      reasonEl.className = "effectiveness-note";
      reasonEl.textContent = ` (${effectiveness.reason})`;
      details.appendChild(reasonEl);
    }

    card.append(button, details);
    projectButtonsEl.appendChild(card);
  });
}

// Set the project category and re-render
function setProjectCategory(category) {
  selectedProjectCategory = category;
  renderProjectButtons();
}

function getProjectEffectiveness(projectType, regionId, climateData) {
  const project = PROJECT_TYPES[projectType];
  if (!project) {
    return { cost: 0, co2Reduction: 0, costMultiplier: 1, effectMultiplier: 1, reason: null };
  }

  // If we have climate data, try to calculate effectiveness
  if (window.CLIMATE_DATA && climateData) {
    const normalized = regionId.toLowerCase().replace(/[\s-]/g, "_");

    // Map project types to potential keys
    const potentialKeyMap = {
      forest: "forest",
      solar: "solar",
      research: null,
    };

    const potentialKey = potentialKeyMap[projectType];

    // Check for country-specific project modifiers
    const countryData = window.CLIMATE_DATA.COUNTRY_DATA?.[normalized];
    if (countryData?.projects?.[projectType]) {
      const mod = countryData.projects[projectType];
      return {
        cost: Math.round(project.cost * mod.costMultiplier),
        co2Reduction: +(project.co2Reduction * mod.effectMultiplier).toFixed(1),
        costMultiplier: mod.costMultiplier,
        effectMultiplier: mod.effectMultiplier,
        reason: mod.reason,
      };
    }

    // Use potential score if available
    if (potentialKey && climateData.potential?.[potentialKey]) {
      let potential = climateData.potential[potentialKey];
      if (typeof potential === "object") {
        potential = potential.score;
      }

      const costMult = 2 - potential;
      const effectMult = potential;

      return {
        cost: Math.round(project.cost * costMult),
        co2Reduction: +(project.co2Reduction * effectMult).toFixed(1),
        costMultiplier: +costMult.toFixed(2),
        effectMultiplier: +effectMult.toFixed(2),
        reason: null,
      };
    }
  }

  // Default: no modification
  return {
    cost: project.cost,
    co2Reduction: project.co2Reduction,
    costMultiplier: 1,
    effectMultiplier: 1,
    reason: null,
  };
}

function buildProjectWithEffectiveness(regionId, projectType, effectiveness) {
  const region = state.regions[regionId];
  const project = PROJECT_TYPES[projectType];
  if (!region || !project || state.gameOver) {
    return;
  }

  // ALLIANCE SYSTEM: Check if region is allied before allowing project building
  const allianceData = state.alliance?.[regionId];
  if (!allianceData || allianceData.status !== ALLIANCE_STATUS.ALLIED) {
    const regionName = getRegionName(regionId);
    if (allianceData?.status === ALLIANCE_STATUS.HOSTILE) {
      pushMessage(`Cannot build in ${regionName} - they are hostile. Wait for cooldown to negotiate.`, "bad");
    } else {
      pushMessage(`Cannot build in ${regionName} - they must join the Climate Alliance first.`, "bad");
    }
    return;
  }

  // Apply difficulty multiplier on top of regional effectiveness cost
  const difficulty = getDifficulty();
  const cost = Math.round(effectiveness.cost * difficulty.costMultiplier * 10) / 10;

  if (state.funds < cost) {
    pushMessage(`Not enough funds for that project. Need ${formatCurrency(cost)}.`, "bad");
    return;
  }

  state.funds -= cost;
  // Track total spending for achievements
  if (!state.totalSpent) state.totalSpent = 0;
  state.totalSpent += cost;

  // Track spending in this region for happiness calculation
  if (allianceData) {
    allianceData.spentInRegion += cost;

    // Track project types for demand compliance
    if (project.category === "economic") {
      allianceData.economicProjectCount++;
    }
    if (project.income > 0) {
      allianceData.jobProjectCount++;
    }
    if (projectType === "nuclear") {
      allianceData.hasNuclear = true;
    }

    // Building projects increases happiness slightly
    // Nuclear is controversial and has neutral happiness effect
    let happinessBonus = 0;
    if (projectType === "nuclear") {
      happinessBonus = 0; // Nuclear is controversial - neutral effect
    } else if (project.category === "economic") {
      happinessBonus = 8;
    } else {
      happinessBonus = 5;
    }
    allianceData.happiness = Math.min(100, allianceData.happiness + happinessBonus);
  }

  // Check if project has construction time > 1 month
  const constructionMonths = project.constructionMonths || 1;
  if (constructionMonths > 1) {
    // Use construction queue for projects with build time
    if (!state.underConstruction) {
      state.underConstruction = [];
    }
    state.underConstruction.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      regionId,
      type: projectType,
      effectMultiplier: effectiveness.effectMultiplier,
      cost,
      monthsTotal: constructionMonths,
      monthsRemaining: constructionMonths,
      startDate: { year: state.year, month: state.month },
      buildMode: "add",
    });

    const timeStr = formatConstructionTime(constructionMonths);
    const bonusText = effectiveness.effectMultiplier > 1
      ? ` (${((effectiveness.effectMultiplier - 1) * 100).toFixed(0)}% bonus!)`
      : effectiveness.effectMultiplier < 1
        ? ` (${((1 - effectiveness.effectMultiplier) * 100).toFixed(0)}% penalty)`
        : "";
    pushMessage(`Construction started: ${project.label} in ${getRegionName(regionId)}. ${timeStr} to completion.${bonusText}`, "good");
  } else {
    // Instant build for projects with no/minimal construction time
    region.projects.push({
      type: projectType,
      effectMultiplier: effectiveness.effectMultiplier,
    });

    const bonusText = effectiveness.effectMultiplier > 1
      ? ` (${((effectiveness.effectMultiplier - 1) * 100).toFixed(0)}% bonus!)`
      : effectiveness.effectMultiplier < 1
        ? ` (${((1 - effectiveness.effectMultiplier) * 100).toFixed(0)}% penalty)`
        : "";
    pushMessage(`${project.label} built in ${getRegionName(regionId)}${bonusText}`, "good");
  }
  updateUI();
}

function renderRegionProjects() {
  regionProjectsEl.innerHTML = "";

  if (!selectedRegionId) {
    return;
  }

  const region = state.regions[selectedRegionId];

  // Construction is now rendered in construction-panel at the bottom via renderConstructionPanel()

  const subtitle = document.createElement("div");
  subtitle.className = "panel-subtitle";
  subtitle.textContent = "Active Projects";
  regionProjectsEl.appendChild(subtitle);

  if (!region.projects.length) {
    const empty = document.createElement("div");
    empty.textContent = "No projects yet.";
    empty.className = "region-temp";
    regionProjectsEl.appendChild(empty);
    return;
  }

  // Handle both old format (string) and new format ({ type, effectMultiplier })
  const projectStats = region.projects.reduce((acc, proj) => {
    const projectType = typeof proj === "string" ? proj : proj.type;
    const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
    if (!acc[projectType]) {
      acc[projectType] = { count: 0, totalEffect: 0 };
    }
    acc[projectType].count += 1;
    acc[projectType].totalEffect += effectMult;
    return acc;
  }, {});

  const list = document.createElement("ul");
  list.className = "project-list";
  Object.entries(projectStats).forEach(([type, stats]) => {
    const project = PROJECT_TYPES[type];
    if (!project) return;
    const item = document.createElement("li");
    const avgEffect = stats.totalEffect / stats.count;
    const effectText = avgEffect !== 1 ? ` (${(avgEffect * 100).toFixed(0)}% eff.)` : "";
    item.textContent = `${project.label} x${stats.count}${effectText}`;
    list.appendChild(item);
  });

  regionProjectsEl.appendChild(list);
}

function updateMapColors() {
  if (!svgDoc || !svgRegions.size) {
    console.warn('[Map] updateMapColors skipped: SVG not ready, svgRegions size:', svgRegions.size);
    return;
  }

  // During setup mode, color ALL regions uniformly (don't need state.regions)
  if (isSetupMode) {
    svgRegions.forEach((regionElements, regionId) => {
      const color = regionId === selectedRegionId ? "#4ecdc4" : "#4a6fa5";
      const tooltipText = getRegionName(regionId);
      regionElements.forEach((regionEl) => {
        regionEl.style.fill = color;
        updateRegionTitle(regionEl, regionId, tooltipText);
      });
    });
    return;
  }

  // Normal game mode - need state.regions
  if (!state?.regions) {
    console.warn('[Map] updateMapColors skipped: state.regions not available');
    return;
  }

  svgRegions.forEach((regionElements, regionId) => {
    const region = state.regions[regionId];
    let color;
    let tooltipText;

    if (!region) {
      // Region not in state - use neutral dark color
      console.warn('[Map] Region not in state:', regionId);
      color = "#1a1a2e";
      tooltipText = getRegionName(regionId);
    } else {
      color = getColorForMode(regionId, region);
      tooltipText = getTooltipForMode(regionId, region);
    }

    regionElements.forEach((regionEl) => {
      regionEl.style.fill = color;
      updateRegionTitle(regionEl, regionId, tooltipText);
    });
  });
}

function getColorForMode(regionId, region) {
  // During setup mode, use uniform neutral color for all regions
  if (isSetupMode) {
    // Highlight selected region, neutral for others
    if (regionId === selectedRegionId) {
      return "#4ecdc4"; // Accent color for selected
    }
    return "#4a6fa5"; // Uniform blue for all regions
  }

  switch (currentMapMode) {
    case "alliance":
      return getColorForAlliance(regionId);
    case "alliance_happiness":
      return getColorForAllianceHappiness(regionId);
    case "temperature":
      return getColorForTemp(region.temp);
    case "emissions":
      return getColorForEmissions(regionId);
    case "renewables":
      return getColorForRenewables(regionId);
    case "economy":
      return getColorForEconomy(regionId);
    case "power":
      return getColorForPower(regionId);
    case "stability":
      return getColorForStability(regionId);
    default:
      return getColorForAlliance(regionId);
  }
}

function getTooltipForMode(regionId, region) {
  const name = getRegionName(regionId);
  const climateData = getClimateDataForRegion(regionId);

  switch (currentMapMode) {
    case "alliance": {
      const allianceData = state.alliance?.[regionId];
      if (allianceData?.status === ALLIANCE_STATUS.ALLIED) {
        return `${name}: Allied (${Math.round(allianceData.happiness || 50)}% happiness)`;
      }
      const statusText = allianceData?.status === ALLIANCE_STATUS.HOSTILE ? "Hostile" :
                        allianceData?.status === ALLIANCE_STATUS.NEGOTIATING ? "Negotiating" : "Neutral";
      return `${name}: ${statusText}`;
    }
    case "alliance_happiness": {
      const allianceData = state.alliance?.[regionId];
      if (allianceData?.status === ALLIANCE_STATUS.ALLIED) {
        const happiness = allianceData.happiness || 50;
        const status = happiness >= 80 ? "Very Happy" :
                      happiness >= 60 ? "Happy" :
                      happiness >= 40 ? "Neutral" : "Unhappy";
        return `${name}: ${Math.round(happiness)}% (${status})`;
      }
      return `${name}: Not in alliance`;
    }
    case "temperature":
      return `${name}: ${region.temp.toFixed(2)}°C`;
    case "emissions":
      if (climateData?.emissions?.total) {
        return `${name}: ${climateData.emissions.total.toFixed(2)} Gt CO2/yr`;
      }
      return `${name}: No data`;
    case "renewables":
      if (climateData?.potential) {
        const avgPotential = getAverageRenewablePotential(climateData.potential);
        return `${name}: ${(avgPotential * 100).toFixed(0)}% renewable potential`;
      }
      return `${name}: No data`;
    case "economy":
      if (climateData?.gdp) {
        return `${name}: $${climateData.gdp.toFixed(1)}T GDP`;
      }
      return `${name}: No data`;
    case "power": {
      const power = state.regions?.[regionId]?.power;
      if (power) {
        const ratio = power.demand > 0 ? ((power.supply / power.demand) * 100).toFixed(0) : 0;
        return `${name}: ${power.supply.toFixed(0)} / ${power.demand.toFixed(0)} GW (${ratio}%)`;
      }
      return `${name}: No data`;
    }
    case "stability": {
      const power = state.regions?.[regionId]?.power;
      if (power) {
        const status = power.stability >= 90 ? "Excellent" :
                       power.stability >= 70 ? "Good" :
                       power.stability >= 50 ? "Warning" : "Critical";
        return `${name}: ${power.stability.toFixed(0)}% stability (${status})`;
      }
      return `${name}: No data`;
    }
    default: {
      // Default to alliance tooltip
      const allianceData = state.alliance?.[regionId];
      if (allianceData?.status === ALLIANCE_STATUS.ALLIED) {
        return `${name}: Allied (${Math.round(allianceData.happiness || 50)}% happiness)`;
      }
      const statusText = allianceData?.status === ALLIANCE_STATUS.HOSTILE ? "Hostile" :
                        allianceData?.status === ALLIANCE_STATUS.NEGOTIATING ? "Negotiating" : "Neutral";
      return `${name}: ${statusText}`;
    }
  }
}

function interpolateColor(value, colors) {
  // value is 0-1, interpolate across 5 color stops
  const clampedValue = Math.max(0, Math.min(1, value));
  const { veryLow, low, medium, high, veryHigh } = colors;

  if (clampedValue <= 0.25) {
    return blendColors(veryLow, low, clampedValue / 0.25);
  } else if (clampedValue <= 0.5) {
    return blendColors(low, medium, (clampedValue - 0.25) / 0.25);
  } else if (clampedValue <= 0.75) {
    return blendColors(medium, high, (clampedValue - 0.5) / 0.25);
  } else {
    return blendColors(high, veryHigh, (clampedValue - 0.75) / 0.25);
  }
}

function blendColors(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getColorForEmissions(regionId) {
  const climateData = getClimateDataForRegion(regionId);
  if (!climateData?.emissions?.total) {
    return "#666";
  }
  // Scale: 0 = low (0 Gt), 1 = high (12+ Gt)
  const maxEmissions = 12;
  const normalized = Math.min(climateData.emissions.total / maxEmissions, 1);
  return interpolateColor(normalized, MAP_MODE_COLORS.emissions);
}

function getColorForRenewables(regionId) {
  const climateData = getClimateDataForRegion(regionId);
  if (!climateData?.potential) {
    return "#666";
  }
  const avgPotential = getAverageRenewablePotential(climateData.potential);
  return interpolateColor(avgPotential, MAP_MODE_COLORS.renewables);
}

function getAverageRenewablePotential(potential) {
  const keys = ["solar", "wind", "forest"];
  let sum = 0;
  let count = 0;
  keys.forEach((key) => {
    let val = potential[key];
    if (val !== undefined) {
      if (typeof val === "object") val = val.score;
      sum += val;
      count++;
    }
  });
  return count > 0 ? sum / count : 0.5;
}

function getColorForEconomy(regionId) {
  const climateData = getClimateDataForRegion(regionId);
  if (!climateData?.gdp) {
    return "#666";
  }
  // Logarithmic scale for better differentiation across orders of magnitude
  // GDP ranges from ~0.01T (small) to ~25T (US)
  // log10(0.01) = -2, log10(25) = 1.4, so range is roughly -2 to 1.5
  const minLog = -2;  // ~$10 billion
  const maxLog = 1.5; // ~$30 trillion
  const gdpLog = Math.log10(Math.max(climateData.gdp, 0.01));
  const normalized = Math.max(0, Math.min(1, (gdpLog - minLog) / (maxLog - minLog)));
  return interpolateColor(normalized, MAP_MODE_COLORS.economy);
}

function getColorForPower(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) {
    return "#666";
  }
  const { demand, supply } = region.power;
  if (demand <= 0) return "#666";
  // Supply/demand ratio: 0.5 = severe shortage, 1.0 = balanced, 1.5 = large surplus
  const ratio = supply / demand;
  const normalized = Math.max(0, Math.min(1, (ratio - 0.5) / 1.0));
  return interpolateColor(normalized, MAP_MODE_COLORS.power);
}

function getColorForStability(regionId) {
  const region = state.regions?.[regionId];
  if (!region?.power) {
    return "#666";
  }
  const stability = region.power.stability || 50;
  // Stability 0-100: 0 = critical, 100 = excellent
  const normalized = stability / 100;
  return interpolateColor(normalized, MAP_MODE_COLORS.stability);
}

function getColorForAlliance(regionId) {
  const allianceData = state.alliance?.[regionId];
  if (allianceData?.status === ALLIANCE_STATUS.ALLIED) {
    return MAP_MODE_COLORS.alliance.allied;
  }
  return MAP_MODE_COLORS.alliance.notAllied;
}

function getColorForAllianceHappiness(regionId) {
  const allianceData = state.alliance?.[regionId];
  if (!allianceData || allianceData.status !== ALLIANCE_STATUS.ALLIED) {
    return MAP_MODE_COLORS.allianceHappiness.notAllied;
  }
  // Happiness ranges from 30 (very unhappy) to 90 (very happy)
  const happiness = allianceData.happiness || 50;
  const normalized = Math.max(0, Math.min(1, (happiness - 30) / 60));
  return interpolateColor(normalized, MAP_MODE_COLORS.allianceHappiness);
}

function updateRegionTitle(regionEl, regionId, tooltipText) {
  let titleEl = regionEl.querySelector("title");
  if (!titleEl) {
    titleEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "title");
    regionEl.appendChild(titleEl);
  }
  titleEl.textContent = tooltipText;
}

function updateMapSelection() {
  if (!svgDoc || !svgRegions.size) {
    return;
  }

  svgRegions.forEach((regionElements, regionId) => {
    regionElements.forEach((regionEl) => {
      if (regionId === selectedRegionId) {
        regionEl.classList.add("selected");
      } else {
        regionEl.classList.remove("selected");
      }
    });
  });
}

function getColorForTemp(temp) {
  // Use temperature-specific colors
  if (currentMapMode === "temperature" || currentMapMode === "default") {
    const minTemp = 0.8;
    const maxTemp = 2.5;
    const normalized = (temp - minTemp) / (maxTemp - minTemp);
    return interpolateColor(normalized, MAP_MODE_COLORS.temperature);
  }

  // Fallback to original thresholds
  if (temp <= 1.0) {
    return mapColors.good;
  }
  if (temp <= 1.5) {
    return mapColors.mild;
  }
  if (temp <= 2.2) {
    return mapColors.warm;
  }
  return mapColors.hot;
}

function updateMapLegend() {
  if (!mapLegendEl) return;

  mapLegendEl.innerHTML = "";

  const legendConfig = {
    default: { title: "Alliance", type: "binary", items: [
      { color: MAP_MODE_COLORS.alliance.allied, label: "Allied" },
      { color: MAP_MODE_COLORS.alliance.notAllied, label: "Not Allied" }
    ]},
    alliance: { title: "Alliance", type: "binary", items: [
      { color: MAP_MODE_COLORS.alliance.allied, label: "Allied" },
      { color: MAP_MODE_COLORS.alliance.notAllied, label: "Not Allied" }
    ]},
    alliance_happiness: { title: "Alliance Happiness", low: "Unhappy (30%)", high: "Happy (90%)", colors: MAP_MODE_COLORS.allianceHappiness },
    temperature: { title: "Temperature", low: "Cooler", high: "Hotter", colors: MAP_MODE_COLORS.temperature },
    emissions: { title: "Emissions", low: "Low", high: "High", colors: MAP_MODE_COLORS.emissions },
    renewables: { title: "Renewable Potential", low: "Low", high: "High", colors: MAP_MODE_COLORS.renewables },
    economy: { title: "GDP", low: "Lower", high: "Higher", colors: MAP_MODE_COLORS.economy },
    power: { title: "Power Supply/Demand", low: "Shortage", high: "Surplus", colors: MAP_MODE_COLORS.power },
    stability: { title: "Grid Stability", low: "Critical", high: "Excellent", colors: MAP_MODE_COLORS.stability },
  };

  const config = legendConfig[currentMapMode] || legendConfig.default;

  const title = document.createElement("div");
  title.className = "legend-title";
  title.textContent = config.title;
  mapLegendEl.appendChild(title);

  // Binary legend (like alliance status)
  if (config.type === "binary") {
    const binaryLegend = document.createElement("div");
    binaryLegend.className = "legend-binary";
    binaryLegend.style.display = "flex";
    binaryLegend.style.gap = "12px";
    binaryLegend.style.marginTop = "6px";

    config.items.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.style.display = "flex";
      itemEl.style.alignItems = "center";
      itemEl.style.gap = "8px";

      const colorBox = document.createElement("div");
      colorBox.style.width = "20px";
      colorBox.style.height = "20px";
      colorBox.style.backgroundColor = item.color;
      colorBox.style.borderRadius = "4px";
      colorBox.style.border = "1px solid rgba(255,255,255,0.2)";

      const labelEl = document.createElement("span");
      labelEl.textContent = item.label;
      labelEl.style.fontSize = "13px";
      labelEl.style.fontWeight = "500";

      itemEl.append(colorBox, labelEl);
      binaryLegend.appendChild(itemEl);
    });

    mapLegendEl.appendChild(binaryLegend);
  } else {
    // Gradient legend
    const gradient = document.createElement("div");
    gradient.className = "legend-gradient";
    gradient.style.background = `linear-gradient(to right, ${config.colors.veryLow}, ${config.colors.low}, ${config.colors.medium}, ${config.colors.high}, ${config.colors.veryHigh})`;
    mapLegendEl.appendChild(gradient);

    const labels = document.createElement("div");
    labels.className = "legend-labels";

    const lowLabel = document.createElement("span");
    lowLabel.textContent = config.low;

    const highLabel = document.createElement("span");
    highLabel.textContent = config.high;

    labels.append(lowLabel, highLabel);
    mapLegendEl.appendChild(labels);
  }
}

function updateEndgameStreaks() {
  const minWinYear = 2050;
  if (state.temperature <= GAME_CONFIG.winTemp && state.year >= minWinYear) {
    state.winStreakMonths = (state.winStreakMonths || 0) + 1;
  } else {
    state.winStreakMonths = 0;
  }

  if (state.temperature >= GAME_CONFIG.loseTemp) {
    state.loseStreakMonths = (state.loseStreakMonths || 0) + 1;
  } else {
    state.loseStreakMonths = 0;
  }
}

function checkWinLose() {
  if (state.winStreakMonths >= 12) {
    state.gameOver = true;
    state.won = true;
    pushMessage(`Victory! Temperature stabilized below ${GAME_CONFIG.winTemp}°C through 2050!`, "good");
  } else if (state.loseStreakMonths >= 3 || state.year > GAME_CONFIG.loseYear) {
    state.gameOver = true;
    state.won = false;
    pushMessage("Climate catastrophe reached. Try a new strategy.", "bad");
  }

  if (state.gameOver) {
    clearSavedGame();
    pushMessage("Restart the game to try again.");
  }
}

function updateControls() {
  if (nextMonthButton) {
    nextMonthButton.disabled = state.gameOver;
  }
  if (advanceYearButton) {
    advanceYearButton.disabled = state.gameOver;
  }
  if (restartButton) {
    restartButton.textContent = "Restart Game";
  }
}

function pushMessage(message, tone = "neutral") {
  // Determine icon based on tone
  const icons = {
    good: "✅",
    bad: "⚠️",
    neutral: "📋",
  };
  const icon = icons[tone] || icons.neutral;

  const item = document.createElement("div");
  item.className = `news-item ${tone}`.trim();

  const iconSpan = document.createElement("span");
  iconSpan.className = "news-icon";
  iconSpan.textContent = icon;

  const textSpan = document.createElement("span");
  textSpan.className = "news-text";
  textSpan.textContent = message;

  item.append(iconSpan, textSpan);
  newsLogEl.prepend(item);

  // Keep more messages (5 visible, scrollable for history)
  while (newsLogEl.children.length > 20) {
    newsLogEl.removeChild(newsLogEl.lastChild);
  }
}

function clearNews() {
  newsLogEl.innerHTML = "";
}

// Delegated click handler for SVG regions
function handleSvgClick(event) {
  mapDebug('[Map] handleSvgClick called, target:', event.target.tagName, event.target.id);
  let target = event.target;

  // If clicked on a group element, use its data-region attribute directly
  if (target.tagName === 'g' && target.classList.contains('region-group')) {
    const regionId = target.getAttribute('data-region');
    mapDebug('[Map] Clicked on region-group, regionId:', regionId);
    if (regionId && svgRegions.has(regionId)) {
      selectRegion(regionId);
      return;
    }
  }

  // Walk up to find a path if we clicked on something inside a group
  while (target && target.tagName !== 'path' && target !== event.currentTarget) {
    target = target.parentElement;
  }

  if (!target || target.tagName !== 'path') return;

  // Get region ID from data attribute or find which region contains this element
  const config = GRANULARITY_CONFIG[currentGranularity] || GRANULARITY_CONFIG.continents;
  const grouping = config.grouping || currentGranularity;
  const regionId = getRegionIdForGranularity(target, grouping);
  mapDebug('[Map] handleSvgClick regionId:', regionId, 'svgRegions.has:', svgRegions.has(regionId));

  if (regionId && svgRegions.has(regionId)) {
    selectRegion(regionId);
  }
}

// Delegated keydown handler for SVG regions (accessibility)
function handleSvgKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  let target = event.target;

  // Handle keydown on group elements
  if (target.tagName === 'g' && target.classList.contains('region-group')) {
    const regionId = target.getAttribute('data-region');
    if (regionId && svgRegions.has(regionId)) {
      event.preventDefault();
      selectRegion(regionId);
      return;
    }
  }

  // Walk up to find a path
  while (target && target.tagName !== 'path' && target !== event.currentTarget) {
    target = target.parentElement;
  }

  if (!target || target.tagName !== 'path') return;

  event.preventDefault();
  const config = GRANULARITY_CONFIG[currentGranularity] || GRANULARITY_CONFIG.continents;
  const grouping = config.grouping || currentGranularity;
  const regionId = getRegionIdForGranularity(target, grouping);

  if (regionId && svgRegions.has(regionId)) {
    selectRegion(regionId);
  }
}

function wireMap() {
  if (!mapObject) {
    return;
  }

  const initializeMap = () => {
    const nextDoc = mapObject.contentDocument;
    if (!nextDoc || nextDoc === svgDoc) {
      return;
    }
    svgDoc = nextDoc;
    ensureSvgStyles();
    loadSvgGeoData();
    const config = GRANULARITY_CONFIG[currentGranularity] || GRANULARITY_CONFIG.continents;
    const grouping = config.grouping || currentGranularity;
    const regionElements = svgDoc.querySelectorAll(config.selector);
    const baseLabels = GRANULARITY_LABELS[grouping];
    const nextRegionNames = baseLabels ? { ...baseLabels } : {};
    const nextRegionIds = [];
    const seenIds = new Set();
    svgRegions = new Map();

    regionElements.forEach((regionEl) => {
      const groupedRegionId = getRegionIdForGranularity(regionEl, grouping);
      if (!groupedRegionId) {
        return;
      }
      const isNewGroup = !seenIds.has(groupedRegionId);
      if (isNewGroup) {
        seenIds.add(groupedRegionId);
        nextRegionIds.push(groupedRegionId);
      }
      regionEl.classList.add("region");
      const label = getRegionLabelForGranularity(groupedRegionId, regionEl, grouping);
      if (label && !nextRegionNames[groupedRegionId]) {
        nextRegionNames[groupedRegionId] = label;
      }
      if (!svgRegions.has(groupedRegionId)) {
        svgRegions.set(groupedRegionId, []);
      }
      svgRegions.get(groupedRegionId).push(regionEl);
      regionEl.setAttribute("role", "button");
      regionEl.setAttribute("tabindex", "0");
      regionEl.setAttribute("aria-label", `${nextRegionNames[groupedRegionId] || groupedRegionId} region`);
      // Note: Click/keydown handlers are now delegated to SVG root (see below)

      // For non-country granularities, add group hover effect
      // Hovering any country in a region highlights ALL countries in that region
      if (currentGranularity !== "countries") {
        regionEl.addEventListener("mouseenter", () => {
          const paths = svgRegions.get(groupedRegionId) || [];
          paths.forEach((p) => p.classList.add("region-hover"));
        });
        regionEl.addEventListener("mouseleave", () => {
          const paths = svgRegions.get(groupedRegionId) || [];
          paths.forEach((p) => p.classList.remove("region-hover"));
        });
      }
    });

    regionNames = nextRegionNames;
    availableRegionIds = nextRegionIds;

    // Apply grouping and outline filter for higher granularity levels
    applyRegionGrouping();

    // Attach delegated event listeners to SVG root (single listener for all regions)
    // This prevents listener leaks when SVG reloads
    svgClickHandler = handleSvgClick;
    svgDoc.documentElement.addEventListener('click', svgClickHandler);
    svgDoc.documentElement.addEventListener('keydown', handleSvgKeydown);
    mapDebug('[Map] Delegated event listeners attached to SVG');

    // Verify isSetupMode matches actual game state (Phase 3 guard)
    // Only correct if there's evidence of actual gameplay (history has entries)
    if (state?.history?.length > 0 && isSetupMode) {
      console.warn('[Map] Correcting isSetupMode: game has history, must be in progress');
      isSetupMode = false;
    }

    if (pendingInit) {
      pendingInit = false;
      initGame();
      // Fall through to ensure colors are updated after SVG loads
    }

    // Always update colors after SVG loads (handles race condition)
    if (pendingColorUpdate) {
      pendingColorUpdate = false;
    }
    updateMapColors();
    updateMapSelection();
  };

  mapObject.addEventListener("load", initializeMap);
  initializeMap();
}

function setMapSource(source, force = false) {
  if (!mapObject || !source) {
    return;
  }
  const current = mapObject.getAttribute("data");
  // Strip query params for comparison (they're used for cache busting)
  const currentBase = current ? current.split("?")[0] : "";
  if (!force && currentBase === source) {
    return;
  }
  // Clean up delegated event listeners before clearing SVG reference
  if (svgDoc && svgClickHandler) {
    svgDoc.documentElement.removeEventListener('click', svgClickHandler);
    svgDoc.documentElement.removeEventListener('keydown', handleSvgKeydown);
    mapDebug('[Map] Cleaned up SVG event listeners');
  }
  svgDoc = null;
  svgRegions = new Map();
  svgClickHandler = null;
  pendingColorUpdate = true; // Ensure colors update after new SVG loads
  if (force && currentBase === source) {
    // Use query parameter instead of hash to force actual reload
    const cacheBuster = `?g=${Date.now()}`;
    mapObject.setAttribute("data", `${source}${cacheBuster}`);
    return;
  }
  mapObject.setAttribute("data", source);
}

function setGranularity(value, resetGame = false) {
  if (!GRANULARITY_CONFIG[value]) {
    return;
  }
  const previousGranularity = currentGranularity;
  currentGranularity = value;
  const mapSource = GRANULARITY_CONFIG[value].map;
  const currentSource = mapObject?.getAttribute("data");
  // Strip query params for comparison (they're used for cache busting)
  const currentSourceBase = currentSource ? currentSource.split("?")[0] : "";
  const sameSource = mapObject && currentSourceBase === mapSource;
  if (mapObject && (!sameSource || previousGranularity !== value)) {
    pendingInit = resetGame;
    setMapSource(mapSource, sameSource);
    return;
  }
  if (resetGame) {
    initGame();
  }
}

function wireMapModeSelector() {
  if (!mapModeSelector) {
    return;
  }
  currentMapMode = mapModeSelector.value || "default";
  mapModeSelector.addEventListener("change", (event) => {
    currentMapMode = event.target.value;
    updateMapColors();
    updateMapLegend();
  });
}

function setStatsInfoVisible(visible) {
  if (!statsInfoPanel) {
    return;
  }
  statsInfoPanel.classList.toggle("is-hidden", !visible);
}

function toggleStatsInfo() {
  if (!statsInfoPanel) {
    return;
  }
  const isHidden = statsInfoPanel.classList.contains("is-hidden");
  setStatsInfoVisible(isHidden);
}

function wireStatsInfo() {
  if (statsInfoToggle) {
    statsInfoToggle.addEventListener("click", toggleStatsInfo);
  }
  if (statsStrip) {
    statsStrip.addEventListener("click", toggleStatsInfo);
    statsStrip.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleStatsInfo();
      }
    });
  }
  document.addEventListener("click", (event) => {
    if (!statsInfoPanel || statsInfoPanel.classList.contains("is-hidden")) {
      return;
    }
    const target = event.target;
    if (statsInfoPanel.contains(target) || statsInfoToggle?.contains(target) || statsStrip?.contains(target)) {
      return;
    }
    setStatsInfoVisible(false);
  });
}

function wireControls() {
  if (nextMonthButton) {
    nextMonthButton.addEventListener("click", nextMonth);
  }
  if (advanceYearButton) {
    advanceYearButton.addEventListener("click", advanceOneYear);
  }
  if (howToPlayButton) {
    howToPlayButton.addEventListener("click", () => {
      window.startTutorial();
    });
  }
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      // Only prompt during an active run; game-over restart and setup reset need no guard.
      if (!isSetupMode && !state.gameOver) {
        if (!window.confirm("Restart the game? Your current progress will be lost.")) return;
      }
      initGame();
    });
  }
}

// Load difficulty from localStorage (set by launch screen)
function loadDifficulty() {
  const saved = localStorage.getItem('gameDifficulty');
  if (saved && DIFFICULTY_MODES[saved]) {
    currentDifficulty = saved;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initGranularityLabels();
  loadMapColors();
  wireControls();
  wireMap();
  wireMapModeSelector();
  wireStatsInfo();
  initGraphTabs();
  wireSetupConfirmButton();
  wireSetupGranularityButtons();
  initSidebarTabs();

  loadDifficulty();

  // Try to load saved game, otherwise start fresh
  if (loadGame()) {
    restoreGameUI();
  } else {
    initGame();
  }
});

// Restore UI after loading a saved game
function restoreGameUI() {
  // Sync UI controls with loaded state
  const mapModeSelect = document.getElementById("map-mode");
  if (mapModeSelect) mapModeSelect.value = currentMapMode;

  // Sync granularity buttons with loaded state
  const granularityButtons = document.querySelectorAll(".granularity-btn");
  granularityButtons.forEach(btn => {
    const isActive = btn.dataset.granularity === currentGranularity;
    btn.classList.toggle("active", isActive);
  });

  // Show game panel, header controls, and sidebar tabs, hide setup panel
  const setupPanel = document.getElementById("setup-panel");
  const gamePanel = document.getElementById("game-panel");
  const headerControls = document.getElementById("header-controls");
  if (setupPanel) setupPanel.style.display = "none";
  if (gamePanel) gamePanel.style.display = "block";
  if (headerControls) headerControls.style.display = "flex";
  showSidebarTabs();
  document.body.classList.remove("setup-mode");

  // Reinitialize region data for current granularity
  setGranularity(currentGranularity);

  // Update all UI elements (updateUI calls all render functions internally)
  updateUI();
  updateMapLegend();
  updateAllianceMapVisuals();

  pushMessage("Game restored from previous session.");
}

// Wire the setup confirm button
function wireSetupConfirmButton() {
  const confirmBtn = document.getElementById("confirm-setup-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmSetupAndStartGame);
  }
}

// Wire the setup granularity buttons
function wireSetupGranularityButtons() {
  const buttons = document.querySelectorAll(".granularity-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const granularity = btn.dataset.granularity;
      if (!granularity) return;

      // Update active button state
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Change granularity (this will update the map)
      setGranularity(granularity);

      // Clear selected region since regions change with granularity
      selectedRegionId = null;
      if (isSetupMode) {
        updateSetupUI();
        // Force map colors update for setup mode
        updateMapColors();
      }
    });
  });
}

// ============ SIDEBAR TABS ============

// Helper function to programmatically switch sidebar tabs
function switchToTab(tabName) {
  const tabs = document.querySelectorAll('.sidebar-tab');
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.click(); // Trigger the existing click handler
    }
  });
}

function initSidebarTabs() {
  const tabs = document.querySelectorAll('.sidebar-tab');
  const worldContent = document.getElementById('world-tab-content');
  const regionContent = document.getElementById('region-tab-content');
  const mapStage = document.querySelector('.map-stage');
  const techPanel = document.getElementById('tech-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;

      // Handle main content area (map vs tech panel)
      if (tabName === 'tech') {
        // Hide map, show tech panel
        if (mapStage) mapStage.style.display = 'none';
        if (techPanel) {
          techPanel.style.display = 'block';
          renderTechTree();
          // Redraw tech tree connections after panel is visible
          setTimeout(() => drawTreeConnections(), 50);
        }
      } else {
        // Show map, hide tech panel
        if (mapStage) mapStage.style.display = 'block';
        if (techPanel) techPanel.style.display = 'none';
      }

      // Handle sidebar content (world vs region)
      if (worldContent) worldContent.classList.remove('active');
      if (regionContent) regionContent.classList.remove('active');
      if (worldContent) worldContent.style.display = 'none';
      if (regionContent) regionContent.style.display = 'none';

      if (tabName === 'world' && worldContent) {
        worldContent.classList.add('active');
        worldContent.style.display = 'block';
      } else if (tabName === 'region' && regionContent) {
        regionContent.classList.add('active');
        regionContent.style.display = 'block';
      } else if (tabName === 'tech') {
        // When tech tab is active, show world content in sidebar
        if (worldContent) {
          worldContent.classList.add('active');
          worldContent.style.display = 'block';
        }
      }
    });
  });
}

function showSidebarTabs() {
  const sidebarTabs = document.getElementById('sidebar-tabs');
  if (sidebarTabs) sidebarTabs.style.display = 'flex';
}

// Render Global Status panel with initial/default values for setup mode
function renderGlobalStatsCardSetup() {
  const container = document.getElementById('global-stats-card');
  if (!container) return;

  const yearsLeft = 2100 - GAME_CONFIG.startYear;
  const defaultTaxRate = NEGOTIABLE_TERMS.carbonTaxRate.default;
  const defaultGrowthRate = NEGOTIABLE_TERMS.carbonTaxGrowth.default;

  // Build HTML with safe template values from GAME_CONFIG constants
  const html = `
    <h3>Global Status</h3>
    <div class="global-stats-grid">
      <div class="stat-item">
        <span class="label">Temperature</span>
        <span class="value">+${GAME_CONFIG.startingTemp.toFixed(2)}°C</span>
      </div>
      <div class="stat-item">
        <span class="label">CO2</span>
        <span class="value">${GAME_CONFIG.startingCo2.toFixed(1)} ppm</span>
      </div>
      <div class="stat-item">
        <span class="label">Net CO2/mo</span>
        <span class="value stat-good">+0.00</span>
      </div>
      <div class="stat-item">
        <span class="label">Feedback</span>
        <span class="value stat-good">+0.00</span>
      </div>
      <div class="stat-item">
        <span class="label">Budget</span>
        <span class="value">${formatCurrency(GAME_CONFIG.startingFunds)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Income/mo</span>
        <span class="value">+${formatCurrency(0)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Avg Tax Rate</span>
        <span class="value">$${defaultTaxRate.toFixed(0)}/ton</span>
      </div>
      <div class="stat-item">
        <span class="label">Avg Tax Growth</span>
        <span class="value">+${defaultGrowthRate.toFixed(0)}%/yr</span>
      </div>
      <div class="stat-item">
        <span class="label">Projects</span>
        <span class="value">0</span>
      </div>
      <div class="stat-item">
        <span class="label">Research</span>
        <span class="value">0 RP</span>
      </div>
      <div class="stat-item">
        <span class="label">Tipping Points</span>
        <span class="value stat-good">0/4</span>
      </div>
      <div class="stat-item">
        <span class="label">Disasters</span>
        <span class="value stat-good">0</span>
      </div>
      <div class="stat-item">
        <span class="label">Date</span>
        <span class="value">${MONTHS[GAME_CONFIG.startMonth - 1]} ${GAME_CONFIG.startYear}</span>
      </div>
      <div class="stat-item">
        <span class="label">Years Left</span>
        <span class="value">${yearsLeft}</span>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function renderGlobalStatsCard() {
  const container = document.getElementById('global-stats-card');
  if (!container) return;

  const netRate = calculateNetCO2Rate();
  const feedback = getTotalClimateFeedback();
  const projectedIncome = calculateProjectedIncome();
  const totalProjects = countTotalProjects();
  const constructionCount = getTotalUnderConstruction();
  const regionalRP = countResearchCenters() * RESEARCH_POINTS_PER_CENTER;
  const globalRP = getResearchCenterRPPerMonth();
  const rpPerMonth = regionalRP + globalRP;
  const tippingCount = state.tippingPointsTriggered?.length || 0;
  const yearsLeft = 2100 - state.year;
  const disasterCount = countActiveDisasters();
  const campaignCount = state.activeCampaigns?.length || 0;

  // Calculate average carbon tax rate and growth across all allied regions
  let totalTaxRate = 0;
  let totalGrowthRate = 0;
  let allyCount = 0;
  Object.entries(state.alliance || {}).forEach(([regionId, alliance]) => {
    if (alliance.status === ALLIANCE_STATUS.ALLIED && alliance.carbonTax) {
      totalTaxRate += alliance.carbonTax.ratePerTon || NEGOTIABLE_TERMS.carbonTaxRate.default;
      totalGrowthRate += alliance.carbonTax.yearlyGrowthRate || NEGOTIABLE_TERMS.carbonTaxGrowth.default;
      allyCount++;
    }
  });
  const avgTaxRate = allyCount > 0 ? totalTaxRate / allyCount : NEGOTIABLE_TERMS.carbonTaxRate.default;
  const avgGrowthRate = allyCount > 0 ? totalGrowthRate / allyCount : NEGOTIABLE_TERMS.carbonTaxGrowth.default;

  // Color classes
  const netCo2Class = netRate < -0.05 ? 'stat-good' : netRate > 0.05 ? 'stat-bad' : 'stat-warning';
  const feedbackClass = feedback === 0 ? 'stat-good' : feedback < 0.2 ? 'stat-warning' : 'stat-bad';
  const tippingClass = tippingCount === 0 ? 'stat-good' : tippingCount < 3 ? 'stat-warning' : 'stat-bad';
  const yearsClass = yearsLeft > 50 ? '' : yearsLeft > 25 ? 'stat-warning' : 'stat-bad';
  const disasterClass = disasterCount === 0 ? 'stat-good' : disasterCount < 3 ? 'stat-warning' : 'stat-bad';

  container.innerHTML = `
    <h3>Global Status</h3>
    <div class="global-stats-grid">
      <div class="stat-item">
        <span class="label">Temperature</span>
        <span class="value">${state.temperature >= 0 ? '+' : ''}${state.temperature.toFixed(2)}°C</span>
      </div>
      <div class="stat-item">
        <span class="label">CO2</span>
        <span class="value">${state.co2.toFixed(1)} ppm</span>
      </div>
      <div class="stat-item">
        <span class="label">Net CO2/mo</span>
        <span class="value ${netCo2Class}">${netRate >= 0 ? '+' : ''}${netRate.toFixed(2)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Feedback</span>
        <span class="value ${feedbackClass}">+${feedback.toFixed(2)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Budget</span>
        <span class="value">${formatCurrency(state.funds)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Income/mo</span>
        <span class="value">+${formatCurrency(projectedIncome)}</span>
      </div>
      <div class="stat-item">
        <span class="label">Avg Tax Rate</span>
        <span class="value">$${avgTaxRate.toFixed(0)}/ton</span>
      </div>
      <div class="stat-item">
        <span class="label">Avg Tax Growth</span>
        <span class="value">+${avgGrowthRate.toFixed(0)}%/yr</span>
      </div>
      <div class="stat-item">
        <span class="label">Projects</span>
        <span class="value">${totalProjects}${constructionCount > 0 ? ` <span class="stat-warning">(+${constructionCount})</span>` : ''}</span>
      </div>
      <div class="stat-item">
        <span class="label">Research</span>
        <span class="value">${state.researchPoints || 0} RP</span>
      </div>
      <div class="stat-item">
        <span class="label">Tipping Points</span>
        <span class="value ${tippingClass}">${tippingCount}/4</span>
      </div>
      <div class="stat-item">
        <span class="label">Disasters</span>
        <span class="value ${disasterClass}">${disasterCount}</span>
      </div>
      <div class="stat-item">
        <span class="label">Date</span>
        <span class="value">${MONTHS[state.month - 1]} ${state.year}</span>
      </div>
      <div class="stat-item">
        <span class="label">Years Left</span>
        <span class="value ${yearsClass}">${yearsLeft}</span>
      </div>
    </div>
  `;
}

function renderAllianceOverview() {
  const container = document.getElementById('alliance-overview');
  if (!container) return;

  const alliedCount = getAlliedRegionsCount();
  const totalRegions = Object.keys(state.regions || {}).length;

  // Calculate combined stats for allied regions
  let totalGDP = 0;
  let totalEmissionsReduction = 0;
  let totalPopulation = 0;

  Object.entries(state.alliance || {}).forEach(([regionId, alliance]) => {
    if (alliance.status === ALLIANCE_STATUS.ALLIED) {
      const climateData = getClimateDataForRegion(regionId);
      if (climateData) {
        totalGDP += climateData.gdp || 0;
        totalPopulation += climateData.population || 0;
      }
      // Calculate emissions reduction from projects in this region
      const regionProjects = state.regions[regionId]?.projects || [];
      regionProjects.forEach(p => {
        const projectType = typeof p === "string" ? p : p.type;
        const effectMult = typeof p === "object" ? (p.effectMultiplier || 1) : 1;
        const projectDef = PROJECT_TYPES[projectType];

        if (projectDef) {
          totalEmissionsReduction += (projectDef.co2Reduction || 0) * effectMult;
        }
      });
    }
  });

  // Build happiness bars for each allied region
  let happinessBarsHtml = '';
  const alliedRegions = Object.entries(state.alliance || {})
    .filter(([regionId, alliance]) => alliance.status === ALLIANCE_STATUS.ALLIED)
    .sort((a, b) => a[1].happiness - b[1].happiness); // Sort by happiness (lowest first)

  if (alliedRegions.length > 0) {
    happinessBarsHtml = `
      <div class="alliance-happiness-section">
        <div class="alliance-happiness-header">Member Happiness</div>
        <div class="alliance-happiness-list">
          ${alliedRegions.map(([regionId, alliance]) => {
            const regionName = getRegionName(regionId);
            const happiness = Math.round(alliance.happiness || 50);
            // Calculate color: red (0%) -> yellow (50%) -> green (100%)
            const red = Math.round(255 * Math.max(0, Math.min(1, 2 - happiness / 50)));
            const green = Math.round(255 * Math.max(0, Math.min(1, happiness / 50)));
            const barColor = `rgb(${red}, ${green}, 50)`;
            return `
              <div class="alliance-happiness-row" onclick="showHappinessFactorsPopup('${regionId}')" title="Click for details">
                <span class="alliance-happiness-name">${regionName}</span>
                <div class="alliance-happiness-bar-container">
                  <div class="alliance-happiness-bar" style="width: ${happiness}%; background: ${barColor};"></div>
                </div>
                <span class="alliance-happiness-value">${happiness}%</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <h3>Climate Alliance</h3>
    <div class="alliance-stats">
      <div class="stat-item">
        <span class="label">Members</span>
        <span class="value">${alliedCount} / ${totalRegions}</span>
      </div>
      <div class="stat-item">
        <span class="label">Combined GDP</span>
        <span class="value">$${totalGDP.toFixed(1)}T</span>
      </div>
      <div class="stat-item">
        <span class="label">Population</span>
        <span class="value">${(totalPopulation / 1000).toFixed(2)}B</span>
      </div>
      <div class="stat-item">
        <span class="label">CO2 Reduction</span>
        <span class="value">${totalEmissionsReduction > 0 ? '-' : ''}${totalEmissionsReduction.toFixed(2)}/mo</span>
      </div>
    </div>
    ${happinessBarsHtml}
  `;
}

// ═══════════════════════════════════════════════════════════════
// EXPOSE FUNCTIONS TO GLOBAL SCOPE FOR ONCLICK HANDLERS
// ═══════════════════════════════════════════════════════════════
// Since game.js is loaded as an ES Module, functions are not available
// in the global scope by default. Expose functions used in onclick handlers.
if (typeof window !== "undefined") {
  window.startNegotiation = startNegotiation;
  window.cancelNegotiation = cancelNegotiation;
  window.submitNegotiationOffer = submitNegotiationOffer;
  window.toggleDemand = toggleDemand;
  window.acceptSpontaneousRequest = acceptSpontaneousRequest;
  window.rejectSpontaneousRequest = rejectSpontaneousRequest;
  window.closeFactorsPopup = closeFactorsPopup;
  window.showHappinessFactorsPopup = showHappinessFactorsPopup;
  window.showCarbonTaxPopup = showCarbonTaxPopup;
  window.showInterestFactorsPopup = showInterestFactorsPopup;
  window.cancelBuildModeDialog = cancelBuildModeDialog;
  window.confirmBuildModeDialog = confirmBuildModeDialog;
  window.setProjectCategory = setProjectCategory;
  // Slider update functions for negotiation terms
  window.updateTermValue = updateTermValue;
  window.updateCarbonTaxRate = updateCarbonTaxRate;
  window.updateCarbonTaxGrowth = updateCarbonTaxGrowth;
  // Header popup functions
  window.showIncomeBreakdownPopup = showIncomeBreakdownPopup;
  window.closeIncomeBreakdownPopup = closeIncomeBreakdownPopup;
  window.openCarbonBalancePopup = openCarbonBalancePopup;
  window.closeCarbonBalancePopup = closeCarbonBalancePopup;
  window.openStatDetail = openStatDetail;
  window.closeStatDetailPopup = closeStatDetailPopup;
  window.switchCarbonTab = switchCarbonTab;
}
