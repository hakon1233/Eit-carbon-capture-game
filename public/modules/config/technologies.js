/**
 * Technologies, research system, and research centers configuration
 * Contains tech tree definitions, research fields, and center types
 */

export const TECHNOLOGIES = [
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
export const RESEARCH_POINTS_PER_CENTER = 5;

// Research Center Scaling - no max level, uses formulas
export const RESEARCH_CENTER_BASE = {
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

// Research Fields - switching between fields has cost and cooldown
export const RESEARCH_FIELDS = {
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

export const RESEARCH_CENTERS = {
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
