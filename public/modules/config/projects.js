/**
 * Project types configuration
 * Contains all buildable project definitions for climate, power, economic, and electrification categories
 */

export function formatCO2ReductionValue(value, decimals) {
  const rounded = Number(value.toFixed(decimals));
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  return normalized.toFixed(decimals);
}

export function formatCO2ReductionDisplay(value, decimals, unit) {
  const formattedMagnitude = formatCO2ReductionValue(Math.abs(value), decimals);
  const roundedMagnitude = Number(formattedMagnitude);
  const sign = roundedMagnitude === 0 ? "" : value > 0 ? "-" : "+";
  return `${sign}${formattedMagnitude} ${unit}`;
}

export const PROJECT_TYPES = {
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
    label: "Research Center",
    cost: 15,                   // $15B (based on Sintef Horizon ~$28.7M, scaled for ~523 centers)
    co2Reduction: 0,            // No direct CO2 reduction (confirmed by sources)
    income: 3,
    category: "climate",
    constructionMonths: 30,     // 2.5 years (Sintef Horizon construction timeline)
    description: "Climate technology innovation hub.",
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

// Month names for date display
export const MONTHS = [
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
