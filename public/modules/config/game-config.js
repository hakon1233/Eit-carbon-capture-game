/**
 * Core game configuration constants
 * Contains base settings, currency, climate parameters, and growth system
 */

export const GAME_CONFIG = {
  // Currency settings (real-world billions USD)
  startingFunds: 25,            // $25 billion starting budget (reduced for balance)
  currencyUnit: "B",            // Billions
  currencySymbol: "$",          // USD

  // Climate settings
  startingCo2: 423,             // Current CO2 level (2025)
  startingTemp: 1.09,           // Starting temperature: 423 * 0.0105 - 3.37 = 1.09°C
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
};

// Regional Project Caps - Max number of each project type per region
// This prevents unrealistic concentration of projects and adds strategic planning
export const REGIONAL_PROJECT_CAPS = {
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
export const GROWTH_CONFIG = {
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

// Base annual growth rates per sector (before development modifiers)
export const SECTOR_GROWTH_RATES = {
  industry: 0.025,      // 2.5%/year base
  transport: 0.03,      // 3%/year base
  buildings: 0.02,      // 2%/year base
  agriculture: 0.015,   // 1.5%/year base
};

// Growth rate multipliers by development level
export const DEVELOPMENT_GROWTH_MODIFIERS = {
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
export const EFFICIENCY_IMPROVEMENT = {
  developed: 0.015,     // 1.5%/year efficiency gain
  emerging: 0.02,       // 2%/year (catching up with better tech)
  developing: 0.025,    // 2.5%/year (leapfrogging old tech)
  oilEconomy: 0.01,     // 1%/year (slower transition)
};

// Natural carbon sink configuration (GCB 2025)
export const NATURAL_SINK_CONFIG = {
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
export const EMBODIED_CARBON = {
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
export const EMISSIONS_TO_PPM_FACTOR = 0.1277247;
