const GAME_CONFIG = {
  // Currency settings (real-world billions USD)
  startingFunds: 100,           // $100 billion starting budget
  currencyUnit: "B",            // Billions
  currencySymbol: "$",          // USD

  // Climate settings
  startingCo2: 420,
  startingTemp: 1.2,
  startYear: 2025,
  startMonth: 1,
  co2Increase: 0.5,             // ppm per month base increase
  baselineCo2: 280,             // Pre-industrial CO2 level
  tempFactor: 0.008,            // °C per ppm above baseline

  // Win/lose conditions
  winTemp: 1.0,
  loseTemp: 3.0,
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

// Climate Tipping Points - irreversible climate thresholds
const TIPPING_POINTS = [
  {
    id: "arctic_ice",
    name: "Arctic Sea Ice Decline",
    threshold: 1.5,
    co2Modifier: 0.05,       // +0.05 ppm/month additional warming
    description: "Arctic sea ice is rapidly disappearing, reducing Earth's reflectivity and accelerating warming.",
    reversible: false,
    effects: {
      warming: 0.05,         // Additional monthly CO2 equivalent
    },
  },
  {
    id: "permafrost",
    name: "Permafrost Methane Release",
    threshold: 2.0,
    co2Modifier: 0.1,        // +0.1 ppm/month from methane
    description: "Thawing permafrost is releasing ancient methane stores, creating a dangerous feedback loop.",
    reversible: false,
    effects: {
      warming: 0.1,
    },
  },
  {
    id: "amazon_dieback",
    name: "Amazon Rainforest Dieback",
    threshold: 2.5,
    co2Modifier: 0.08,       // +0.08 ppm/month
    description: "The Amazon rainforest is transitioning to savanna, releasing stored carbon and reducing global oxygen production.",
    reversible: false,
    effects: {
      warming: 0.08,
      forestEffectiveness: 0.5, // Forest projects 50% less effective
    },
  },
  {
    id: "ocean_circulation",
    name: "Ocean Circulation Weakening",
    threshold: 2.8,
    co2Modifier: 0.12,       // +0.12 ppm/month
    description: "Atlantic ocean circulation is slowing dramatically, disrupting global weather patterns and reducing ocean CO2 absorption.",
    reversible: false,
    effects: {
      warming: 0.12,
      oceanAbsorption: 0.7,  // Ocean absorbs 30% less CO2
    },
  },
];

// Feedback loops - temperature-dependent effects
const FEEDBACK_LOOPS = {
  // Ice-albedo feedback: less ice = more heat absorption
  iceAlbedo: {
    startTemp: 1.5,
    maxTemp: 3.0,
    maxEffect: 0.03,  // Up to +0.03 ppm/month at max
    description: "Melting ice reduces Earth's reflectivity",
  },
  // Ocean saturation: warmer oceans absorb less CO2
  oceanSaturation: {
    startCO2: 450,
    maxCO2: 550,
    maxEffect: 0.05,  // Up to +0.05 ppm/month at max
    description: "Warmer oceans absorb less carbon dioxide",
  },
  // Vegetation stress: extreme temps harm plants
  vegetationStress: {
    startTemp: 2.0,
    maxTemp: 3.0,
    maxEffect: 0.02,  // Up to +0.02 ppm/month at max
    description: "Heat stress reduces vegetation's carbon absorption",
  },
};

// Technology Tree - Research unlocks improved project versions
const TECHNOLOGIES = [
  {
    id: "improved_solar",
    name: "Advanced Photovoltaics",
    description: "Next-generation solar cells with 20% improved efficiency",
    cost: 100,               // Research points required
    tier: 1,
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
    effects: {
      projectBonus: { nuclear: { costReduction: 0.75, income: 1.2 } },
    },
    icon: "⚛️",
  },
  {
    id: "direct_air_capture",
    name: "Direct Air Capture",
    description: "Revolutionary carbon capture technology doubles CO2 removal efficiency",
    cost: 1000,
    tier: 4,
    effects: {
      projectBonus: { carbonCapture: { co2Reduction: 2.0 } },
    },
    icon: "🌀",
  },
  {
    id: "green_hydrogen",
    name: "Green Hydrogen",
    description: "Hydrogen production enables new clean energy storage, boosting all renewable income by 15%",
    cost: 750,
    tier: 3,
    effects: {
      projectBonus: {
        solar: { income: 1.15 },
        wind: { income: 1.15 },
        offshoreWind: { income: 1.15 },
      },
    },
    icon: "💧",
  },
];

// Research points generated per Research Center per month
const RESEARCH_POINTS_PER_CENTER = 5;

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
];

// ═══════════════════════════════════════════════════════════════
// NATURAL DISASTER SYSTEM FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Default vulnerability values based on region for countries without explicit data
const DEFAULT_VULNERABILITY_BY_REGION = {
  europe: {
    heatWave: 0.4, hurricane: 0.0, flooding: 0.5, drought: 0.3, wildfire: 0.3, extremeCold: 0.3, resilience: 0.7,
  },
  asia: {
    heatWave: 0.6, hurricane: 0.3, flooding: 0.6, drought: 0.4, wildfire: 0.2, extremeCold: 0.2, resilience: 0.5,
  },
  north_america: {
    heatWave: 0.5, hurricane: 0.4, flooding: 0.5, drought: 0.4, wildfire: 0.5, extremeCold: 0.4, resilience: 0.7,
  },
  south_america: {
    heatWave: 0.5, hurricane: 0.2, flooding: 0.6, drought: 0.5, wildfire: 0.4, extremeCold: 0.0, resilience: 0.4,
  },
  africa: {
    heatWave: 0.7, hurricane: 0.1, flooding: 0.5, drought: 0.7, wildfire: 0.3, extremeCold: 0.0, resilience: 0.3,
  },
  oceania: {
    heatWave: 0.7, hurricane: 0.3, flooding: 0.4, drought: 0.7, wildfire: 0.8, extremeCold: 0.0, resilience: 0.6,
  },
  middle_east: {
    heatWave: 0.9, hurricane: 0.0, flooding: 0.3, drought: 0.8, wildfire: 0.1, extremeCold: 0.0, resilience: 0.5,
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

  // Base probability × vulnerability × temperature scaling
  return disaster.baseProbability * vulnerability * tempMultiplier;
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
      // Threshold below starting temp (1.2°C) but above win condition (1.0°C)
      return state.temperature < 1.1;
    },
  },
  {
    id: "speed_run",
    name: "Speed Run",
    description: "Win the game before 2050",
    icon: "⏱️",
    condition: (state) => {
      return state.won && state.year < 2050;
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
    dismissBtn.removeEventListener("click", handleDismiss);
  };
  dismissBtn.addEventListener("click", handleDismiss);

  // Also allow clicking overlay to dismiss
  const overlay = container.querySelector(".popup-overlay");
  const handleOverlayClick = () => {
    hideEventPopup();
    overlay.removeEventListener("click", handleOverlayClick);
  };
  overlay.addEventListener("click", handleOverlayClick);

  // Allow Escape key to dismiss
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      hideEventPopup();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

/**
 * Hide the current popup and show next if queued
 */
function hideEventPopup() {
  const container = document.getElementById("event-popup-container");
  container.classList.add("hidden");

  // Small delay before showing next popup
  setTimeout(() => {
    displayNextPopup();
  }, 200);
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
    co2Multiplier: 0.6,         // 0.3 ppm/month
    startingFunds: 150,         // $150B starting
    costMultiplier: 0.7,        // -30% project costs
    eventsEnabled: false,
  },
  easy: {
    name: "Easy",
    description: "A gentler introduction to climate management",
    co2Multiplier: 0.8,         // 0.4 ppm/month
    startingFunds: 120,         // $120B starting
    costMultiplier: 0.85,       // -15% project costs
    eventsEnabled: true,
    eventSeverity: 0.5,         // Mild events
  },
  normal: {
    name: "Normal",
    description: "The real climate challenge",
    co2Multiplier: 1.0,         // 0.5 ppm/month
    startingFunds: 100,         // $100B starting
    costMultiplier: 1.0,        // Normal costs
    eventsEnabled: true,
    eventSeverity: 1.0,         // Normal events
  },
  hard: {
    name: "Hard",
    description: "Political resistance and harsh economics",
    co2Multiplier: 1.2,         // 0.6 ppm/month
    startingFunds: 80,          // $80B starting
    costMultiplier: 1.15,       // +15% project costs
    eventsEnabled: true,
    eventSeverity: 1.5,         // Harsh events
  },
  extreme: {
    name: "Extreme",
    description: "Can you save the planet against all odds?",
    co2Multiplier: 1.4,         // 0.7 ppm/month
    startingFunds: 60,          // $60B starting
    costMultiplier: 1.3,        // +30% project costs
    eventsEnabled: true,
    eventSeverity: 2.0,         // Extreme events
  },
};

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
  forest: {
    label: "Reforestation Program",
    cost: 5,                    // $5 billion - large-scale reforestation
    co2Reduction: 2,
    income: 0,
    description: "Plant trees across the region to absorb carbon.",
  },
  solar: {
    label: "Utility Solar Farm",
    cost: 10,                   // $10 billion - 5GW solar installation
    co2Reduction: 1,
    income: 2,
    description: "Large-scale solar power generation.",
  },
  wind: {
    label: "Wind Farm",
    cost: 12,                   // $12 billion - 4GW wind installation
    co2Reduction: 1,
    income: 2,
    description: "Onshore wind power generation.",
  },
  research: {
    label: "Research Center",
    cost: 15,                   // $15 billion - major climate research
    co2Reduction: 0,
    income: 3,
    description: "Climate technology innovation hub.",
  },
  offshoreWind: {
    label: "Offshore Wind",
    cost: 30,                   // $30 billion - 3GW offshore wind
    co2Reduction: 2,
    income: 3,
    description: "Large-scale offshore wind power.",
  },
  carbonCapture: {
    label: "Carbon Capture",
    cost: 35,                   // $35 billion - industrial CCS
    co2Reduction: 4,
    income: 0,
    description: "Industrial-scale carbon capture and storage.",
  },
  nuclear: {
    label: "Nuclear Plant",
    cost: 50,                   // $50 billion - modern nuclear facility
    co2Reduction: 3,
    income: 4,
    description: "Zero-carbon baseload power generation.",
  },
};

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
let svgGeoBounds = null;
let svgSize = null;
let regionGeoCache = new Map();
let mapColors = {};
let currentGranularity = "continents";
let currentMapMode = "default";
let availableRegionIds = [];
let regionNames = { ...DEFAULT_REGION_NAMES };
let pendingInit = false;
let currentDifficulty = "normal";

// Get current difficulty settings
function getDifficulty() {
  return DIFFICULTY_MODES[currentDifficulty] || DIFFICULTY_MODES.normal;
}

// Get adjusted project cost based on difficulty
function getAdjustedCost(baseCost) {
  const difficulty = getDifficulty();
  return Math.round(baseCost * difficulty.costMultiplier * 10) / 10;
}

// Get CO2 increase rate based on difficulty
function getCo2IncreaseRate() {
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
    pushMessage(`⚠️ TIPPING POINT CROSSED: ${tp.name} at +${tp.threshold}°C! ${tp.description}`, "bad");

    // Collect for popup
    tippingPointPopupEvents.push({
      icon: "⚠️",
      title: "TIPPING POINT CROSSED",
      description: tp.name,
      summary: `${tp.name} (+${tp.threshold}°C)`,
      details: `<strong>Threshold:</strong> +${tp.threshold}°C<br><br>${tp.description}<br><br><em>This effect is irreversible.</em>`,
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

// Generate research points based on number of research centers
function generateResearchPoints() {
  const centers = countResearchCenters();
  const points = centers * RESEARCH_POINTS_PER_CENTER;
  if (points > 0 && state.researchPoints !== undefined) {
    state.researchPoints += points;
  }
  return points;
}

// Check if a technology can be unlocked
function canUnlockTechnology(techId) {
  const tech = TECHNOLOGIES.find((t) => t.id === techId);
  if (!tech) return false;

  // Already unlocked?
  if (state.unlockedTechs && state.unlockedTechs.includes(techId)) {
    return false;
  }

  // Have enough research points?
  return (state.researchPoints || 0) >= tech.cost;
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
const restartButton = document.getElementById("restart-button");
const selectedRegionEl = document.getElementById("selected-region");
const projectButtonsEl = document.getElementById("project-buttons");
const regionProjectsEl = document.getElementById("region-projects");
const newsLogEl = document.getElementById("news-log");
const mapObject = document.getElementById("map-object");
const mapSelector = document.getElementById("map-style");
const statsInfoToggle = document.getElementById("stats-info-toggle");
const statsInfoPanel = document.getElementById("stats-info");
const statsStrip = document.getElementById("stats-strip");
const emissionsBreakdownEl = document.getElementById("emissions-breakdown");
const effectivenessPanelEl = document.getElementById("effectiveness-panel");
const regionFactEl = document.getElementById("region-fact");
const mapModeSelector = document.getElementById("map-mode");
const mapLegendEl = document.getElementById("map-legend");
const regionIncomeEl = document.getElementById("region-income");

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
  return (co2 - GAME_CONFIG.baselineCo2) * GAME_CONFIG.tempFactor;
}

/**
 * Calculate projected monthly income based on current state
 * Used to display income in stats bar - mirrors nextMonth() calculation
 */
function calculateProjectedIncome() {
  let totalIncome = 0;

  // Calculate income from each country's climate finance and projects
  Object.entries(state.regions).forEach(([regionId, region]) => {
    const countryData = CLIMATE_DATA[regionId];
    const aggregateData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];

    // Climate finance income (GDP × climate%)
    if (countryData && countryData.climateFinance) {
      // Country-level: use direct country data
      const gdpTrillions = countryData.gdp || 1;
      const climatePercent = countryData.climateFinance.currentPercent;
      let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000;
      // Apply disaster reduction
      monthlyClimateIncome *= getDisasterIncomeMultiplier(regionId);
      totalIncome += monthlyClimateIncome;
    } else if (aggregateData && aggregateData.countries) {
      // Continent-level: aggregate climate finance from constituent countries
      aggregateData.countries.forEach(countryKey => {
        const countryInfo = CLIMATE_DATA.COUNTRY_DATA?.[countryKey];
        if (countryInfo && countryInfo.climateFinance) {
          const gdpTrillions = countryInfo.gdp || 1;
          const climatePercent = countryInfo.climateFinance.currentPercent;
          let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000;
          monthlyClimateIncome *= getDisasterIncomeMultiplier(countryKey);
          totalIncome += monthlyClimateIncome;
        }
      });
    }

    // Project income
    const disasterMult = getDisasterIncomeMultiplier(regionId);
    region.projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (!project) return;

      const incomeBonus = getTechIncomeBonus(projectType) * getEventBonusForProject(projectType, "income");
      totalIncome += project.income * effectMult * incomeBonus * disasterMult;
    });
  });

  // Fallback minimum income
  if (totalIncome === 0) {
    totalIncome = GAME_CONFIG.baseIncome;
  }

  // Apply global event multiplier (recession, boom, etc.)
  totalIncome *= getEventIncomeMultiplier();

  return totalIncome;
}

/**
 * Calculate net CO2 change rate per month
 * Combines base increase, project reductions, and feedback effects
 */
function calculateNetCO2Rate() {
  if (!state?.regions) {
    return 0;
  }
  let rate = getCo2IncreaseRate();

  // Subtract project CO2 reductions
  Object.values(state.regions).forEach(region => {
    region.projects.forEach(proj => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (project && project.co2Reduction) {
        rate -= project.co2Reduction * effectMult; // co2Reduction is positive, so subtract
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

function initGame() {
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

    regions[regionId] = {
      temp: GAME_CONFIG.startingTemp + offset,
      projects: [],
      baseIncome,
      sectorIncome: sectorIncome ? { ...sectorIncome } : null,
      incomeModifiers: {}, // Track income changes from projects
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
    activeCampaigns: [], // Active Climate Policy Campaigns
    difficulty: currentDifficulty,
    // New tracking for advanced features
    researchPoints: 0,
    unlockedTechs: [],
    achievements: [],
    history: [], // Monthly snapshots for graphs
    tippingPointsTriggered: [],
    activeEvents: [],
    totalSpent: 0, // Track total project spending for achievements
    campaignHistory: [], // Track unique campaign countries for achievements
    // Natural disaster system
    activeDisasters: [],   // Currently active disasters
    disasterHistory: {},   // Track disaster history per region for awareness
  };

  selectedRegionId = null;

  clearNews();
  const difficultyName = difficulty.name;
  pushMessage(`Global initiative launched on ${difficultyName} difficulty. Choose a region to invest in.`);
  updateUI();
  updateMapLegend();
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

  // Use difficulty-adjusted CO2 increase rate
  const co2Rate = getCo2IncreaseRate();

  // Add climate feedback effects (tipping points + feedback loops)
  const feedbackEffect = getTotalClimateFeedback();
  const totalCO2Increase = co2Rate + feedbackEffect;
  state.co2 += totalCO2Increase;

  let totalReduction = 0;
  let totalIncome = 0;

  // Get forest effectiveness modifier (reduced by Amazon dieback tipping point)
  const forestMod = getForestEffectivenessModifier();

  // Calculate income from each country's climate finance (GDP × climate%)
  Object.entries(state.regions).forEach(([regionId, region]) => {
    const countryData = CLIMATE_DATA[regionId];
    const aggregateData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];

    // Climate finance income (GDP × climate%)
    if (countryData && countryData.climateFinance) {
      // Country-level: use direct country data
      // Monthly income = (GDP in trillions × climate% / 100) / 12
      // Result is in billions per month
      const gdpTrillions = countryData.gdp || 1;
      const climatePercent = countryData.climateFinance.currentPercent;
      let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000; // Convert to billions
      // Apply disaster income reduction if region has active disaster
      monthlyClimateIncome *= getDisasterIncomeMultiplier(regionId);
      totalIncome += monthlyClimateIncome;
    } else if (aggregateData && aggregateData.countries) {
      // Continent-level: aggregate climate finance from constituent countries
      aggregateData.countries.forEach(countryKey => {
        const countryInfo = CLIMATE_DATA.COUNTRY_DATA?.[countryKey];
        if (countryInfo && countryInfo.climateFinance) {
          const gdpTrillions = countryInfo.gdp || 1;
          const climatePercent = countryInfo.climateFinance.currentPercent;
          let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000;
          monthlyClimateIncome *= getDisasterIncomeMultiplier(countryKey);
          totalIncome += monthlyClimateIncome;
        }
      });
    }

    // Add income from projects
    // Get disaster multiplier for this region (affects both income and project effectiveness)
    const disasterMult = getDisasterIncomeMultiplier(regionId);

    region.projects.forEach((proj) => {
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (!project) {
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

      totalReduction += reduction;
      // Apply disaster reduction to project income (disrupted operations)
      totalIncome += project.income * effectMult * incomeBonus * disasterMult;
    });
  });

  // Fallback minimum income
  if (totalIncome === 0) {
    totalIncome = GAME_CONFIG.baseIncome;
  }

  // Apply event income multiplier
  totalIncome *= getEventIncomeMultiplier();

  // Process active Climate Policy Campaigns
  processCampaigns();

  state.co2 = Math.max(GAME_CONFIG.baselineCo2, state.co2 - totalReduction);
  state.funds += totalIncome;
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
  const disasterPopupEvents = [];
  newDisasters.forEach((disaster) => {
    state.activeDisasters.push(disaster);
    updateDisasterAwareness(disaster.regionId, disaster.incomeReduction);
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

  checkWinLose();
  updateUI();

  // Auto-save after each month (unless game is over)
  if (!state.gameOver) {
    autoSave();
  }
}

// Format currency as "$X.X B"
function formatCurrency(amount) {
  if (amount >= 1000) {
    return `${GAME_CONFIG.currencySymbol}${(amount / 1000).toFixed(1)} T`;
  }
  return `${GAME_CONFIG.currencySymbol}${amount.toFixed(1)} ${GAME_CONFIG.currencyUnit}`;
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
  const increaseAmount =
    GAME_CONFIG.lobbyMinIncrease +
    (GAME_CONFIG.lobbyMaxIncrease - GAME_CONFIG.lobbyMinIncrease) * (1 - finance.difficulty);

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
    `${campaignType} started in ${regionData.name}! Cost: ${formatCurrency(cost)}. Duration: ${duration} months. Expected increase: +${increaseAmount.toFixed(2)}% GDP.`,
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
  if (!state?.regions || !state.regions[regionId]) {
    return;
  }
  selectedRegionId = regionId;
  updateUI();
}

function buildProject(regionId, projectType) {
  const region = state.regions[regionId];
  const project = PROJECT_TYPES[projectType];
  if (!region || !project || state.gameOver) {
    return;
  }

  // Apply difficulty-based cost multiplier
  const adjustedCost = getAdjustedCost(project.cost);

  if (state.funds < adjustedCost) {
    pushMessage(`Not enough funds for that project. Need ${formatCurrency(adjustedCost)}.`, "bad");
    return;
  }

  state.funds -= adjustedCost;
  // Track total spending for achievements
  if (!state.totalSpent) state.totalSpent = 0;
  state.totalSpent += adjustedCost;

  region.projects.push(projectType);
  pushMessage(`${project.label} built in ${getRegionName(regionId)}.`, "good");
  updateUI();
}

function updateUI() {
  creditsEl.textContent = formatCurrency(state.funds);
  temperatureEl.textContent = `${state.temperature >= 0 ? "+" : ""}${state.temperature.toFixed(2)}°C`;
  co2El.textContent = `${state.co2.toFixed(1)} ppm`;
  dateEl.textContent = `${MONTHS[state.month - 1]} ${state.year}`;

  // Calculate and display projected income with color coding
  const projectedIncome = calculateProjectedIncome();
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

  // Net CO2 Rate with color coding
  const netRate = calculateNetCO2Rate();
  netCo2El.textContent = `${netRate >= 0 ? '+' : ''}${netRate.toFixed(2)}`;
  netCo2El.className = 'value ' + (netRate < 0 ? 'stat-good' : netRate > 0.3 ? 'stat-bad' : 'stat-warning');

  // Feedback Effect with color coding
  const feedback = getTotalClimateFeedback();
  feedbackStatEl.textContent = `+${feedback.toFixed(2)}`;
  feedbackStatEl.className = 'value ' + (feedback === 0 ? 'stat-good' : feedback < 0.2 ? 'stat-warning' : 'stat-bad');

  // Total Projects
  totalProjectsEl.textContent = countTotalProjects();

  // Research Points with generation rate
  const rpPerMonth = countResearchCenters() * 5;
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

  // Years Left with color coding
  const yearsLeft = 2100 - state.year;
  yearsLeftEl.textContent = `${yearsLeft} yrs`;
  yearsLeftEl.className = 'value ' + (yearsLeft > 50 ? '' : yearsLeft > 25 ? 'stat-warning' : 'stat-bad');

  updateSelectedRegionPanel();
  renderProjectButtons();
  renderRegionProjects();
  renderTippingPointsPanel();
  renderTechTreePanel();
  renderActiveEventsPanel();
  renderActiveDisastersPanel();
  renderAchievementsPanel();
  renderHistoryGraph();
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

// Render the technology tree panel
function renderTechTreePanel() {
  const listEl = document.getElementById("tech-tree-list");
  const rpDisplay = document.getElementById("research-points-display");

  if (!listEl) return;

  // Update research points display
  if (rpDisplay) {
    rpDisplay.textContent = `${state.researchPoints || 0} RP`;
  }

  // Sort technologies by tier
  const sortedTechs = [...TECHNOLOGIES].sort((a, b) => a.tier - b.tier);

  let html = "";
  sortedTechs.forEach((tech) => {
    const isUnlocked = state.unlockedTechs && state.unlockedTechs.includes(tech.id);
    const canUnlock = canUnlockTechnology(tech.id);
    const currentRP = state.researchPoints || 0;

    let itemClass = "locked";
    if (isUnlocked) {
      itemClass = "unlocked";
    } else if (canUnlock) {
      itemClass = "available";
    }

    html += `
      <div class="tech-item ${itemClass}">
        <span class="tech-icon">${tech.icon}</span>
        <div class="tech-info">
          <div class="tech-name">${tech.name}</div>
          <div class="tech-description">${tech.description}</div>
          <div class="tech-cost">
            <span class="tech-tier">Tier ${tech.tier}</span>
            ${!isUnlocked ? ` • ${tech.cost} RP (${currentRP}/${tech.cost})` : ""}
          </div>
        </div>
        <div class="tech-action">
          ${isUnlocked ? `
            <span class="tech-status unlocked">Unlocked</span>
          ` : `
            <button
              class="tech-unlock-btn"
              data-tech-id="${tech.id}"
              ${!canUnlock ? "disabled" : ""}
            >
              ${canUnlock ? "Unlock" : "Locked"}
            </button>
          `}
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;

  // Wire up unlock buttons
  listEl.querySelectorAll(".tech-unlock-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const techId = e.target.dataset.techId;
      if (techId) {
        unlockTechnology(techId);
      }
    });
  });
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
      <div class="graph-stat-value" style="color:${trendColor}">${trend} ${change >= 0 ? "+" : ""}${formatValue(change)}</div>
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

function updateSelectedRegionPanel() {
  if (!selectedRegionId) {
    selectedRegionEl.textContent = "Select a region to take action.";
    clearClimateDataPanels();
    if (regionIncomeEl) regionIncomeEl.innerHTML = "";
    return;
  }

  const region = state.regions[selectedRegionId];
  selectedRegionEl.innerHTML = "";

  const title = document.createElement("div");
  title.className = "region-title";
  title.textContent = getRegionName(selectedRegionId);

  const temp = document.createElement("div");
  temp.className = "region-temp";
  temp.textContent = `Local temperature: ${region.temp.toFixed(2)}°C`;

  selectedRegionEl.append(title, temp);

  // Get climate data and render additional panels
  const climateData = getClimateDataForRegion(selectedRegionId);
  if (climateData) {
    renderRegionIncome(region, climateData);
    renderEmissionsBreakdown(climateData);
    renderEffectivenessPanel(climateData);
    renderRegionFact(climateData);
    appendPerCapitaInfo(selectedRegionEl, climateData);
  } else {
    clearClimateDataPanels();
    if (regionIncomeEl) regionIncomeEl.innerHTML = "";
  }
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
      const increaseAmount = GAME_CONFIG.lobbyMinIncrease + (GAME_CONFIG.lobbyMaxIncrease - GAME_CONFIG.lobbyMinIncrease) * (1 - finance.difficulty);
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
        <span>Duration: ${duration} months</span>
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

function renderEmissionsBreakdown(climateData) {
  if (!emissionsBreakdownEl || !climateData.emissions?.sources) {
    if (emissionsBreakdownEl) emissionsBreakdownEl.innerHTML = "";
    return;
  }

  const sectors = window.CLIMATE_DATA?.EMISSION_SECTORS || {};
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

    const row = document.createElement("div");
    row.className = "emission-row";

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

function renderProjectButtons() {
  projectButtonsEl.innerHTML = "";

  if (!selectedRegionId) {
    return;
  }

  // Get climate data for effectiveness calculations
  const climateData = getClimateDataForRegion(selectedRegionId);

  const difficulty = getDifficulty();

  Object.entries(PROJECT_TYPES).forEach(([type, project]) => {
    const card = document.createElement("div");
    card.className = "project-card";

    // Calculate effectiveness-adjusted values
    const effectiveness = getProjectEffectiveness(type, selectedRegionId, climateData);
    // Apply difficulty multiplier on top of regional effectiveness
    const adjustedCost = Math.round(effectiveness.cost * difficulty.costMultiplier * 10) / 10;
    const adjustedReduction = effectiveness.co2Reduction;

    const button = document.createElement("button");
    button.className = "project-button";

    // Show adjusted cost with proper currency format
    let buttonText = `${project.label} (${formatCurrency(adjustedCost)})`;
    button.textContent = buttonText;

    // Add effectiveness indicator if different from base
    if (effectiveness.effectMultiplier !== 1 && effectiveness.effectMultiplier > 0) {
      const effectBadge = document.createElement("span");
      const mult = effectiveness.effectMultiplier;
      effectBadge.className = `project-effectiveness ${mult > 1 ? "bonus" : "penalty"}`;
      effectBadge.textContent = mult > 1 ? `${(mult * 100 - 100).toFixed(0)}% bonus` : `${(100 - mult * 100).toFixed(0)}% penalty`;
      button.appendChild(effectBadge);
    }

    button.disabled = state.gameOver || state.funds < adjustedCost;
    button.addEventListener("click", () => buildProjectWithEffectiveness(selectedRegionId, type, effectiveness));

    const effectParts = [];
    if (adjustedReduction > 0) {
      effectParts.push(`-${adjustedReduction.toFixed(1)} CO2 / month`);
    }
    if (project.income > 0) {
      effectParts.push(`+${formatCurrency(project.income)} / month`);
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

  // Store project with its effectiveness multiplier for CO2 calculations
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
  updateUI();
}

function renderRegionProjects() {
  regionProjectsEl.innerHTML = "";

  if (!selectedRegionId) {
    return;
  }

  const region = state.regions[selectedRegionId];

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
  if (!svgDoc || !svgRegions.size || !state?.regions) {
    return;
  }

  svgRegions.forEach((regionElements, regionId) => {
    const region = state.regions[regionId];
    if (!region) {
      return;
    }

    const color = getColorForMode(regionId, region);
    const tooltipText = getTooltipForMode(regionId, region);

    regionElements.forEach((regionEl) => {
      regionEl.style.fill = color;
      updateRegionTitle(regionEl, regionId, tooltipText);
    });
  });
}

function getColorForMode(regionId, region) {
  switch (currentMapMode) {
    case "temperature":
      return getColorForTemp(region.temp);
    case "emissions":
      return getColorForEmissions(regionId);
    case "renewables":
      return getColorForRenewables(regionId);
    case "economy":
      return getColorForEconomy(regionId);
    default:
      return getColorForTemp(region.temp);
  }
}

function getTooltipForMode(regionId, region) {
  const name = getRegionName(regionId);
  const climateData = getClimateDataForRegion(regionId);

  switch (currentMapMode) {
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
    default:
      return `${name}: ${region.temp.toFixed(2)}°C`;
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
    default: { title: "Temperature", low: "Cooler", high: "Hotter", colors: MAP_MODE_COLORS.temperature },
    temperature: { title: "Temperature", low: "Cooler", high: "Hotter", colors: MAP_MODE_COLORS.temperature },
    emissions: { title: "Emissions", low: "Low", high: "High", colors: MAP_MODE_COLORS.emissions },
    renewables: { title: "Renewable Potential", low: "Low", high: "High", colors: MAP_MODE_COLORS.renewables },
    economy: { title: "GDP", low: "Lower", high: "Higher", colors: MAP_MODE_COLORS.economy },
  };

  const config = legendConfig[currentMapMode] || legendConfig.default;

  const title = document.createElement("div");
  title.className = "legend-title";
  title.textContent = config.title;
  mapLegendEl.appendChild(title);

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

function checkWinLose() {
  if (state.temperature <= GAME_CONFIG.winTemp) {
    state.gameOver = true;
    state.won = true;
    pushMessage("Victory! Temperature is back under control.", "good");
  } else if (state.temperature >= GAME_CONFIG.loseTemp || state.year >= GAME_CONFIG.loseYear) {
    state.gameOver = true;
    state.won = false;
    pushMessage("Climate catastrophe reached. Try a new strategy.", "bad");
  }

  if (state.gameOver) {
    pushMessage("Restart the game to try again.");
  }
}

function updateControls() {
  if (nextMonthButton) {
    nextMonthButton.disabled = state.gameOver;
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
      regionEl.addEventListener("click", () => selectRegion(groupedRegionId));
      regionEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectRegion(groupedRegionId);
        }
      });

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

    if (pendingInit) {
      pendingInit = false;
      initGame();
      return;
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
  svgDoc = null;
  svgRegions = new Map();
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
  // Sync dropdown with internal state
  if (mapSelector && mapSelector.value !== value) {
    mapSelector.value = value;
  }
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

function wireMapSelector() {
  if (!mapSelector) {
    return;
  }
  const initialGranularity = mapSelector.value || "continents";
  setGranularity(initialGranularity);
  mapSelector.addEventListener("change", (event) => {
    const newValue = event.target.value;
    const hasProgress = state && (
      state.budget !== GAME_CONFIG.startingBudget ||
      state.month !== 1 ||
      state.year !== 2025 ||
      Object.values(state.regions || {}).some(r => r.projects?.length > 0)
    );

    if (hasProgress) {
      const confirmed = confirm(
        "⚠️ Changing map granularity will reset your game progress.\n\n" +
        "All projects, budget changes, and time progression will be lost.\n\n" +
        "Are you sure you want to continue?"
      );
      if (!confirmed) {
        // Revert the dropdown to current value
        event.target.value = currentGranularity;
        return;
      }
    }
    setGranularity(newValue, true);
  });
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
  if (restartButton) {
    restartButton.addEventListener("click", initGame);
  }
}

// Load difficulty from localStorage (set by launch screen)
function loadDifficulty() {
  const saved = localStorage.getItem('gameDifficulty');
  if (saved && DIFFICULTY_MODES[saved]) {
    currentDifficulty = saved;
  }
}

// ==================== SAVE/LOAD SYSTEM ====================

const SAVE_KEY_AUTOSAVE = 'carbonCapture_autosave';
const SAVE_KEY_SLOTS = 'carbonCapture_saves';

// Serialize game state for saving
function serializeGameState() {
  return {
    version: 1,
    timestamp: Date.now(),
    difficulty: currentDifficulty,
    granularity: currentGranularity,
    mapMode: currentMapMode,
    state: {
      ...state,
      // Clone regions deeply
      regions: JSON.parse(JSON.stringify(state.regions)),
    },
    selectedRegionId,
  };
}

// Deserialize and restore game state
function deserializeGameState(saveData) {
  if (!saveData || saveData.version !== 1) {
    console.error('Invalid save data');
    return false;
  }

  // Restore difficulty
  if (saveData.difficulty && DIFFICULTY_MODES[saveData.difficulty]) {
    currentDifficulty = saveData.difficulty;
  }

  // Restore state
  state = {
    ...saveData.state,
    regions: JSON.parse(JSON.stringify(saveData.state.regions)),
  };

  // Ensure new state properties exist (for backwards compatibility with old saves)
  if (!state.researchPoints) state.researchPoints = 0;
  if (!state.unlockedTechs) state.unlockedTechs = [];
  if (!state.achievements) state.achievements = [];
  if (!state.history) state.history = [];
  if (!state.tippingPointsTriggered) state.tippingPointsTriggered = [];
  if (!state.activeEvents) state.activeEvents = [];
  if (!state.activeCampaigns) state.activeCampaigns = [];
  if (!state.totalSpent) state.totalSpent = 0;
  if (!state.campaignHistory) state.campaignHistory = [];
  if (!state.activeDisasters) state.activeDisasters = [];
  if (!state.disasterHistory) state.disasterHistory = {};

  // Restore selection
  selectedRegionId = saveData.selectedRegionId;

  // Restore granularity and map mode
  if (saveData.granularity) {
    currentGranularity = saveData.granularity;
    const selector = document.getElementById('map-style');
    if (selector) selector.value = currentGranularity;
  }

  if (saveData.mapMode) {
    currentMapMode = saveData.mapMode;
    const modeSelector = document.getElementById('map-mode');
    if (modeSelector) modeSelector.value = currentMapMode;
  }

  return true;
}

// Auto-save game state
function autoSave() {
  try {
    const saveData = serializeGameState();
    localStorage.setItem(SAVE_KEY_AUTOSAVE, JSON.stringify(saveData));
  } catch (e) {
    console.error('Auto-save failed:', e);
  }
}

// Save to a specific slot (0-2)
function saveToSlot(slotIndex) {
  try {
    const saves = JSON.parse(localStorage.getItem(SAVE_KEY_SLOTS) || '[]');
    const saveData = serializeGameState();
    saveData.slotName = `Save ${slotIndex + 1}`;
    saves[slotIndex] = saveData;
    localStorage.setItem(SAVE_KEY_SLOTS, JSON.stringify(saves));
    pushMessage(`Game saved to slot ${slotIndex + 1}.`, 'good');
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    pushMessage('Failed to save game.', 'bad');
    return false;
  }
}

// Load from a specific slot
function loadFromSlot(slotIndex) {
  try {
    const saves = JSON.parse(localStorage.getItem(SAVE_KEY_SLOTS) || '[]');
    const saveData = saves[slotIndex];
    if (!saveData) {
      pushMessage('No save found in that slot.', 'bad');
      return false;
    }
    if (deserializeGameState(saveData)) {
      clearNews();
      pushMessage(`Game loaded from slot ${slotIndex + 1}.`, 'good');
      updateUI();
      updateMapColors();
      updateMapLegend();
      return true;
    }
    return false;
  } catch (e) {
    console.error('Load failed:', e);
    pushMessage('Failed to load game.', 'bad');
    return false;
  }
}

// Load auto-save
function loadAutoSave() {
  try {
    const saveData = JSON.parse(localStorage.getItem(SAVE_KEY_AUTOSAVE));
    if (!saveData) return false;
    if (deserializeGameState(saveData)) {
      clearNews();
      pushMessage('Auto-save loaded.', 'good');
      updateUI();
      updateMapColors();
      updateMapLegend();
      return true;
    }
    return false;
  } catch (e) {
    console.error('Auto-save load failed:', e);
    return false;
  }
}

// Check if auto-save exists
function hasAutoSave() {
  return localStorage.getItem(SAVE_KEY_AUTOSAVE) !== null;
}

// Get save slot info
function getSaveSlots() {
  try {
    const saves = JSON.parse(localStorage.getItem(SAVE_KEY_SLOTS) || '[]');
    return saves.map((save, index) => {
      if (!save) return null;
      const date = new Date(save.timestamp);
      return {
        index,
        name: save.slotName || `Save ${index + 1}`,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        year: save.state?.year || 2025,
        month: save.state?.month || 1,
        difficulty: save.difficulty || 'normal',
      };
    });
  } catch (e) {
    return [null, null, null];
  }
}

// Export save as downloadable JSON
function exportSave() {
  const saveData = serializeGameState();
  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carbon-capture-save-${state.year}-${MONTHS[state.month - 1]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  pushMessage('Save exported to file.', 'good');
}

// Import save from file
function importSave(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const saveData = JSON.parse(e.target.result);
      if (deserializeGameState(saveData)) {
        clearNews();
        pushMessage('Save imported successfully.', 'good');
        updateUI();
        updateMapColors();
        updateMapLegend();
      } else {
        pushMessage('Invalid save file.', 'bad');
      }
    } catch (err) {
      pushMessage('Failed to import save file.', 'bad');
    }
  };
  reader.readAsText(file);
}

// ==================== REGION SEARCH ====================

function wireRegionSearch() {
  const searchInput = document.getElementById('region-search-input');
  const resultsContainer = document.getElementById('region-search-results');

  if (!searchInput || !resultsContainer) return;

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) {
        resultsContainer.classList.remove('active');
        resultsContainer.innerHTML = '';
        return;
      }

      const matches = searchRegions(query);
      renderSearchResults(matches, resultsContainer);
    }, 150);
  });

  searchInput.addEventListener('focus', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query.length >= 2) {
      const matches = searchRegions(query);
      renderSearchResults(matches, resultsContainer);
    }
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.region-search')) {
      resultsContainer.classList.remove('active');
    }
  });
}

function searchRegions(query) {
  const matches = [];

  // Search available region IDs
  availableRegionIds.forEach(regionId => {
    const name = getRegionName(regionId);
    if (name.toLowerCase().includes(query)) {
      matches.push({
        id: regionId,
        name: name,
        type: currentGranularity === 'countries' ? 'Country' :
              currentGranularity === 'major_regions' ? 'Region' : 'Continent',
      });
    }
  });

  // Sort by best match (starts with query first, then alphabetical)
  matches.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(query);
    const bStarts = b.name.toLowerCase().startsWith(query);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, 10); // Limit to 10 results
}

function renderSearchResults(matches, container) {
  if (matches.length === 0) {
    container.classList.remove('active');
    container.innerHTML = '';
    return;
  }

  container.innerHTML = matches.map(match => `
    <div class="search-result-item" data-region-id="${match.id}">
      ${match.name}
      <span class="region-type">${match.type}</span>
    </div>
  `).join('');

  container.classList.add('active');

  // Wire up click handlers
  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const regionId = item.dataset.regionId;
      selectRegion(regionId);
      container.classList.remove('active');
      document.getElementById('region-search-input').value = '';

      // Highlight region on map briefly
      highlightRegionOnMap(regionId);
    });
  });
}

function highlightRegionOnMap(regionId) {
  if (!svgDoc) return;

  // Find all paths for this region
  const paths = svgDoc.querySelectorAll(`path[id="${regionId}"], g[id="${regionId}"] path`);

  paths.forEach(path => {
    // Add highlight effect
    path.style.filter = 'brightness(1.5) drop-shadow(0 0 8px var(--color-accent))';

    // Remove after animation
    setTimeout(() => {
      path.style.filter = '';
    }, 1000);
  });
}

// Wire save/load button event handlers
function wireSaveLoad() {
  // Save slot buttons
  document.querySelectorAll('.save-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = parseInt(btn.dataset.slot);
      saveToSlot(slot);
    });
  });

  // Load slot buttons
  document.querySelectorAll('.load-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = parseInt(btn.dataset.slot);
      loadFromSlot(slot);
    });
  });

  // Export button
  const exportBtn = document.getElementById('export-save-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportSave);
  }

  // Import input
  const importInput = document.getElementById('import-save-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importSave(e.target.files[0]);
        e.target.value = ''; // Reset to allow re-importing same file
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initGranularityLabels();
  loadMapColors();
  wireControls();
  wireMap();
  wireMapSelector();
  wireMapModeSelector();
  wireStatsInfo();
  wireSaveLoad();
  wireRegionSearch();
  initGraphTabs();

  // Check if we should load auto-save (from "Continue Game" button)
  const shouldLoadAutoSave = localStorage.getItem('loadAutoSave') === 'true';
  localStorage.removeItem('loadAutoSave'); // Clear the flag

  if (shouldLoadAutoSave && hasAutoSave()) {
    loadAutoSave();
  } else {
    loadDifficulty();
    initGame();
  }
});
