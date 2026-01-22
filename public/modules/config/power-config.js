/**
 * Power grid system configuration
 * Contains power grid settings, capacity factors, and generation categories
 */

// Power grid configuration
export const POWER_CONFIG = {
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
export const POWER_CATEGORY = {
  VARIABLE: "variable",     // Solar, wind - intermittent
  BASELOAD: "baseload",     // Nuclear, coal, gas, hydro, geothermal - stable
  STORAGE: "storage",       // Batteries, pumped hydro - smooths variability
};

// Capacity factors for TWh calculation (annual hours operated / 8760)
export const CAPACITY_FACTORS = {
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
