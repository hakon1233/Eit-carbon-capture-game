/**
 * Events, disasters, and achievements configuration
 * Contains random events, natural disasters, achievement definitions
 */

// Random Events System
export const EVENTS = [
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
export const NATURAL_DISASTERS = [
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

// Default vulnerability values based on region for countries without explicit data
export const DEFAULT_VULNERABILITY_BY_REGION = {
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

// Achievement System
// Note: TECHNOLOGIES import is needed for tech_leader achievement - this will be resolved via the index
export const ACHIEVEMENTS = [
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
    // Note: This condition requires TECHNOLOGIES.length - will be set at runtime
    condition: (state, techCount) => {
      return state.unlockedTechs && state.unlockedTechs.length >= techCount;
    },
  },
  {
    id: "carbon_neutral",
    name: "Carbon Neutral",
    description: "Achieve net-zero emissions (CO2 reduction equals or exceeds natural increase)",
    icon: "🌍",
    condition: (state, _, getCo2IncreaseRate) => {
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
    condition: (state, _, __, getTotalSpentRP) => {
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
