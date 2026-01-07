/**
 * Climate Data for Carbon Capture Game
 * High school level educational data
 *
 * Data sources:
 * - Our World in Data (emissions)
 * - IEA (energy mix)
 * - Global Carbon Project
 * - IPCC AR6 (potentials)
 *
 * Note: Values are simplified/rounded for educational purposes
 * Data primarily from 2022-2023 reports
 */

const EMISSION_SECTORS = {
  electricity: {
    label: "Power Generation",
    icon: "\u26A1",
    color: "#f4d370",
  },
  transport: {
    label: "Transportation",
    icon: "\uD83D\uDE97",
    color: "#5ed68a",
  },
  industry: {
    label: "Industry",
    icon: "\uD83C\uDFED",
    color: "#f2a45b",
  },
  buildings: {
    label: "Buildings",
    icon: "\uD83C\uDFE2",
    color: "#7eb8da",
  },
  agriculture: {
    label: "Agriculture",
    icon: "\uD83C\uDF3E",
    color: "#b8d4a8",
  },
};

const COUNTRY_DATA = {
  // ═══════════════════════════════════════════════════════════════
  // ASIA - Top Emitters
  // ═══════════════════════════════════════════════════════════════

  china: {
    name: "China",
    region: "asia",
    population: 1412,
    gdp: 17.9,
    emissions: {
      total: 11.4,
      perCapita: 8.0,
      trend: 0.9,
      sources: {
        electricity: 0.44,
        industry: 0.28,
        transport: 0.10,
        buildings: 0.10,
        agriculture: 0.08,
      },
    },
    energy: {
      renewableShare: 0.31,
      coalShare: 0.56,
      gasShare: 0.08,
      nuclearShare: 0.05,
    },
    potential: {
      solar: { score: 0.85, capacity: 5000 },
      wind: { score: 0.80, capacity: 3500 },
      forest: { score: 0.55, area: 80 },
      carbonCapture: { score: 0.75, sites: 60 },
      geothermal: { score: 0.30 },
    },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.25, reason: "World leader in solar manufacturing" },
      wind: { costMultiplier: 0.80, effectMultiplier: 1.15, reason: "Massive wind capacity in Inner Mongolia" },
      forest: { costMultiplier: 1.10, effectMultiplier: 0.85, reason: "Limited available land for reforestation" },
    },
    policies: {
      carbonPrice: 8,
      netZeroTarget: 2060,
      parisCommitment: -65,
    },
    facts: [
      "Largest CO2 emitter, producing ~30% of global emissions",
      "Also world's largest investor in renewable energy",
      "Three Gorges Dam is the world's largest hydroelectric plant",
      "Has planted over 70 billion trees since 1978",
    ],
  },

  india: {
    name: "India",
    region: "asia",
    population: 1417,
    gdp: 3.4,
    emissions: {
      total: 2.7,
      perCapita: 1.9,
      trend: 4.8,
      sources: {
        electricity: 0.40,
        industry: 0.22,
        transport: 0.14,
        buildings: 0.12,
        agriculture: 0.12,
      },
    },
    energy: {
      renewableShare: 0.22,
      coalShare: 0.55,
      gasShare: 0.06,
      nuclearShare: 0.03,
    },
    potential: {
      solar: { score: 0.95, capacity: 7500 },
      wind: { score: 0.70, capacity: 900 },
      forest: { score: 0.65, area: 45 },
      carbonCapture: { score: 0.50, sites: 25 },
      geothermal: { score: 0.25 },
    },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Exceptional solar irradiance, low labor costs" },
      wind: { costMultiplier: 0.95, effectMultiplier: 1.05, reason: "Good coastal wind resources" },
      forest: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Fast-growing tropical forests" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2070,
      parisCommitment: -45,
    },
    facts: [
      "Third largest emitter but very low per capita emissions",
      "Home to the International Solar Alliance",
      "Aims for 500 GW renewable capacity by 2030",
      "Largest democracy tackling energy poverty and climate",
    ],
  },

  japan: {
    name: "Japan",
    region: "asia",
    population: 125,
    gdp: 4.2,
    emissions: {
      total: 1.1,
      perCapita: 8.5,
      trend: -2.1,
      sources: {
        electricity: 0.42,
        industry: 0.25,
        transport: 0.18,
        buildings: 0.12,
        agriculture: 0.03,
      },
    },
    energy: {
      renewableShare: 0.22,
      coalShare: 0.31,
      gasShare: 0.37,
      nuclearShare: 0.07,
    },
    potential: {
      solar: { score: 0.60, capacity: 400 },
      wind: { score: 0.75, capacity: 600 },
      forest: { score: 0.40, area: 15 },
      carbonCapture: { score: 0.85, sites: 35 },
      geothermal: { score: 0.80 },
    },
    projects: {
      solar: { costMultiplier: 1.20, effectMultiplier: 0.90, reason: "Limited land, high installation costs" },
      wind: { costMultiplier: 0.90, effectMultiplier: 1.15, reason: "Excellent offshore wind potential" },
      carbonCapture: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Advanced technology leadership" },
      geothermal: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Volcanic geology, proven expertise" },
    },
    policies: {
      carbonPrice: 3,
      netZeroTarget: 2050,
      parisCommitment: -46,
    },
    facts: [
      "Pioneer in hydrogen technology and fuel cells",
      "Third largest economy, high-tech industrial base",
      "Post-Fukushima shift away from nuclear power",
      "Leader in energy efficiency technology",
    ],
  },

  south_korea: {
    name: "South Korea",
    region: "asia",
    population: 52,
    gdp: 1.7,
    emissions: {
      total: 0.62,
      perCapita: 11.9,
      trend: -0.5,
      sources: {
        electricity: 0.38,
        industry: 0.32,
        transport: 0.15,
        buildings: 0.12,
        agriculture: 0.03,
      },
    },
    energy: {
      renewableShare: 0.09,
      coalShare: 0.34,
      gasShare: 0.29,
      nuclearShare: 0.27,
    },
    potential: {
      solar: { score: 0.55, capacity: 100 },
      wind: { score: 0.70, capacity: 150 },
      forest: { score: 0.35, area: 8 },
      carbonCapture: { score: 0.70, sites: 20 },
      geothermal: { score: 0.20 },
    },
    projects: {
      nuclear: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Strong nuclear industry expertise" },
      wind: { costMultiplier: 0.95, effectMultiplier: 1.10, reason: "Offshore wind development focus" },
    },
    policies: {
      carbonPrice: 18,
      netZeroTarget: 2050,
      parisCommitment: -40,
    },
    facts: [
      "High per capita emissions due to heavy industry",
      "World's largest shipbuilding industry",
      "Strong push for green hydrogen economy",
      "Operates Asia's first emissions trading system",
    ],
  },

  indonesia: {
    name: "Indonesia",
    region: "asia",
    population: 276,
    gdp: 1.3,
    emissions: {
      total: 0.69,
      perCapita: 2.5,
      trend: 2.8,
      sources: {
        electricity: 0.35,
        industry: 0.20,
        transport: 0.15,
        buildings: 0.08,
        agriculture: 0.22,
      },
    },
    energy: {
      renewableShare: 0.14,
      coalShare: 0.62,
      gasShare: 0.18,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.90, capacity: 3000 },
      wind: { score: 0.45, capacity: 200 },
      forest: { score: 0.85, area: 90 },
      carbonCapture: { score: 0.40, sites: 15 },
      geothermal: { score: 0.95 },
    },
    projects: {
      forest: { costMultiplier: 0.65, effectMultiplier: 1.45, reason: "Vast tropical rainforest restoration potential" },
      geothermal: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "World's largest geothermal reserves" },
      solar: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Excellent equatorial solar resources" },
    },
    policies: {
      carbonPrice: 2,
      netZeroTarget: 2060,
      parisCommitment: -32,
    },
    facts: [
      "World's third largest tropical rainforest",
      "Highest geothermal potential globally",
      "Major palm oil producer - deforestation concerns",
      "17,000+ islands create unique energy challenges",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTH AMERICA
  // ═══════════════════════════════════════════════════════════════

  usa: {
    name: "United States",
    region: "north_america",
    population: 331,
    gdp: 25.5,
    emissions: {
      total: 5.01,
      perCapita: 15.1,
      trend: -0.8,
      sources: {
        electricity: 0.25,
        transport: 0.28,
        industry: 0.23,
        buildings: 0.13,
        agriculture: 0.11,
      },
    },
    energy: {
      renewableShare: 0.22,
      coalShare: 0.20,
      gasShare: 0.38,
      nuclearShare: 0.19,
    },
    potential: {
      solar: { score: 0.85, capacity: 3200 },
      wind: { score: 0.90, capacity: 2800 },
      forest: { score: 0.65, area: 120 },
      carbonCapture: { score: 0.80, sites: 45 },
      geothermal: { score: 0.40 },
    },
    projects: {
      solar: { costMultiplier: 0.90, effectMultiplier: 1.15, reason: "Excellent solar resources in Southwest" },
      wind: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Great Plains wind corridor" },
      carbonCapture: { costMultiplier: 0.85, effectMultiplier: 1.15, reason: "Advanced technology and geological storage" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -50,
    },
    facts: [
      "Second largest emitter globally after China",
      "Inflation Reduction Act (2022) is largest climate investment in US history",
      "Texas produces more wind energy than any other state",
      "Per capita emissions among highest in the world",
    ],
  },

  canada: {
    name: "Canada",
    region: "north_america",
    population: 39,
    gdp: 2.1,
    emissions: {
      total: 0.67,
      perCapita: 17.3,
      trend: -1.2,
      sources: {
        electricity: 0.11,
        transport: 0.25,
        industry: 0.38,
        buildings: 0.13,
        agriculture: 0.13,
      },
    },
    energy: {
      renewableShare: 0.68,
      coalShare: 0.05,
      gasShare: 0.15,
      nuclearShare: 0.14,
    },
    potential: {
      solar: { score: 0.45, capacity: 400 },
      wind: { score: 0.85, capacity: 800 },
      forest: { score: 0.90, area: 300 },
      carbonCapture: { score: 0.85, sites: 40 },
      geothermal: { score: 0.30 },
    },
    projects: {
      forest: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "Vast boreal forest, low land costs" },
      wind: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Strong prairie winds" },
      carbonCapture: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Pioneer in CCS technology, oil sands expertise" },
    },
    policies: {
      carbonPrice: 50,
      netZeroTarget: 2050,
      parisCommitment: -40,
    },
    facts: [
      "Already 68% renewable electricity (mostly hydro)",
      "High per capita emissions due to oil sands and cold climate",
      "World's second largest boreal forest",
      "Federal carbon price is rising annually",
    ],
  },

  mexico: {
    name: "Mexico",
    region: "north_america",
    population: 130,
    gdp: 1.3,
    emissions: {
      total: 0.47,
      perCapita: 3.6,
      trend: 0.5,
      sources: {
        electricity: 0.30,
        transport: 0.25,
        industry: 0.22,
        buildings: 0.10,
        agriculture: 0.13,
      },
    },
    energy: {
      renewableShare: 0.16,
      coalShare: 0.05,
      gasShare: 0.60,
      nuclearShare: 0.04,
    },
    potential: {
      solar: { score: 0.90, capacity: 1500 },
      wind: { score: 0.75, capacity: 400 },
      forest: { score: 0.60, area: 35 },
      carbonCapture: { score: 0.55, sites: 15 },
      geothermal: { score: 0.65 },
    },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Outstanding solar irradiance, low costs" },
      geothermal: { costMultiplier: 0.85, effectMultiplier: 1.15, reason: "Pacific Ring of Fire location" },
    },
    policies: {
      carbonPrice: 4,
      netZeroTarget: 2050,
      parisCommitment: -22,
    },
    facts: [
      "One of the sunniest countries in the world",
      "Major oil producer transitioning energy mix",
      "Diverse ecosystems from deserts to rainforests",
      "Growing renewable energy sector despite policy uncertainty",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH AMERICA
  // ═══════════════════════════════════════════════════════════════

  brazil: {
    name: "Brazil",
    region: "south_america",
    population: 215,
    gdp: 1.9,
    emissions: {
      total: 0.49,
      perCapita: 2.3,
      trend: 1.5,
      sources: {
        electricity: 0.08,
        transport: 0.32,
        industry: 0.18,
        buildings: 0.07,
        agriculture: 0.35,
      },
    },
    energy: {
      renewableShare: 0.84,
      coalShare: 0.03,
      gasShare: 0.08,
      nuclearShare: 0.02,
    },
    potential: {
      solar: { score: 0.85, capacity: 2500 },
      wind: { score: 0.80, capacity: 800 },
      forest: { score: 0.95, area: 500 },
      carbonCapture: { score: 0.40, sites: 10 },
      geothermal: { score: 0.15 },
    },
    projects: {
      forest: { costMultiplier: 0.60, effectMultiplier: 1.50, reason: "Amazon rainforest - world's largest carbon sink" },
      sustainableAg: { costMultiplier: 0.80, effectMultiplier: 1.30, reason: "Large agricultural sector to transform" },
      solar: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Abundant sunshine across vast territory" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -43,
    },
    facts: [
      "84% renewable electricity - mostly hydropower",
      "Amazon rainforest produces 20% of world's oxygen",
      "Largest ethanol biofuel program globally",
      "Deforestation is biggest emissions driver",
    ],
  },

  argentina: {
    name: "Argentina",
    region: "south_america",
    population: 46,
    gdp: 0.63,
    emissions: {
      total: 0.19,
      perCapita: 4.1,
      trend: -0.3,
      sources: {
        electricity: 0.25,
        transport: 0.22,
        industry: 0.18,
        buildings: 0.10,
        agriculture: 0.25,
      },
    },
    energy: {
      renewableShare: 0.32,
      coalShare: 0.02,
      gasShare: 0.55,
      nuclearShare: 0.05,
    },
    potential: {
      solar: { score: 0.75, capacity: 400 },
      wind: { score: 0.95, capacity: 1200 },
      forest: { score: 0.50, area: 25 },
      carbonCapture: { score: 0.45, sites: 8 },
      geothermal: { score: 0.35 },
    },
    projects: {
      wind: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Patagonian winds among strongest on Earth" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -27,
    },
    facts: [
      "Patagonia has world-class wind resources",
      "Large shale gas reserves (Vaca Muerta)",
      "Major agricultural exporter",
      "Growing lithium production for batteries",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════════

  germany: {
    name: "Germany",
    region: "europe",
    population: 84,
    gdp: 4.1,
    emissions: {
      total: 0.67,
      perCapita: 8.0,
      trend: -5.4,
      sources: {
        electricity: 0.32,
        industry: 0.24,
        transport: 0.20,
        buildings: 0.16,
        agriculture: 0.08,
      },
    },
    energy: {
      renewableShare: 0.46,
      coalShare: 0.27,
      gasShare: 0.13,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.50, capacity: 200 },
      wind: { score: 0.85, capacity: 400 },
      forest: { score: 0.45, area: 12 },
      carbonCapture: { score: 0.65, sites: 20 },
      geothermal: { score: 0.25 },
    },
    projects: {
      wind: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "North Sea offshore wind leadership" },
      evInfra: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Strong auto industry transitioning to EVs" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2045,
      parisCommitment: -65,
    },
    facts: [
      "Energiewende - most ambitious energy transition globally",
      "Phased out nuclear power in 2023",
      "Europe's largest economy and industrial base",
      "46% renewable electricity despite limited sun",
    ],
  },

  uk: {
    name: "United Kingdom",
    region: "europe",
    population: 67,
    gdp: 3.1,
    emissions: {
      total: 0.34,
      perCapita: 5.1,
      trend: -3.8,
      sources: {
        electricity: 0.21,
        transport: 0.27,
        industry: 0.17,
        buildings: 0.23,
        agriculture: 0.12,
      },
    },
    energy: {
      renewableShare: 0.42,
      coalShare: 0.02,
      gasShare: 0.38,
      nuclearShare: 0.15,
    },
    potential: {
      solar: { score: 0.40, capacity: 80 },
      wind: { score: 0.95, capacity: 300 },
      forest: { score: 0.50, area: 8 },
      carbonCapture: { score: 0.80, sites: 25 },
      geothermal: { score: 0.15 },
    },
    projects: {
      wind: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "World leader in offshore wind" },
      carbonCapture: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "North Sea storage potential" },
    },
    policies: {
      carbonPrice: 85,
      netZeroTarget: 2050,
      parisCommitment: -68,
    },
    facts: [
      "First major economy to legislate net zero",
      "Coal-free days are now common",
      "World's largest offshore wind capacity",
      "Hosted COP26 climate summit in Glasgow",
    ],
  },

  france: {
    name: "France",
    region: "europe",
    population: 68,
    gdp: 2.8,
    emissions: {
      total: 0.30,
      perCapita: 4.5,
      trend: -2.5,
      sources: {
        electricity: 0.10,
        transport: 0.31,
        industry: 0.19,
        buildings: 0.20,
        agriculture: 0.20,
      },
    },
    energy: {
      renewableShare: 0.27,
      coalShare: 0.01,
      gasShare: 0.07,
      nuclearShare: 0.63,
    },
    potential: {
      solar: { score: 0.60, capacity: 150 },
      wind: { score: 0.75, capacity: 200 },
      forest: { score: 0.55, area: 15 },
      carbonCapture: { score: 0.50, sites: 12 },
      geothermal: { score: 0.30 },
    },
    projects: {
      nuclear: { costMultiplier: 0.70, effectMultiplier: 1.35, reason: "Decades of nuclear expertise" },
      solar: { costMultiplier: 0.95, effectMultiplier: 1.05, reason: "Good southern resources" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "Lowest carbon electricity in Europe due to nuclear",
      "Paris Agreement was signed here in 2015",
      "Transport is largest emissions source",
      "Pioneering nuclear renaissance in EU",
    ],
  },

  italy: {
    name: "Italy",
    region: "europe",
    population: 59,
    gdp: 2.0,
    emissions: {
      total: 0.33,
      perCapita: 5.5,
      trend: -3.0,
      sources: {
        electricity: 0.24,
        transport: 0.26,
        industry: 0.22,
        buildings: 0.19,
        agriculture: 0.09,
      },
    },
    energy: {
      renewableShare: 0.40,
      coalShare: 0.04,
      gasShare: 0.48,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.80, capacity: 200 },
      wind: { score: 0.60, capacity: 100 },
      forest: { score: 0.45, area: 10 },
      carbonCapture: { score: 0.45, sites: 8 },
      geothermal: { score: 0.55 },
    },
    projects: {
      solar: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Excellent Mediterranean sun" },
      geothermal: { costMultiplier: 0.90, effectMultiplier: 1.10, reason: "Tuscany geothermal heritage" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "First country to use geothermal electricity (1904)",
      "No nuclear power since 1990 referendum",
      "Dependent on imported natural gas",
      "Growing solar installation rate",
    ],
  },

  poland: {
    name: "Poland",
    region: "europe",
    population: 38,
    gdp: 0.69,
    emissions: {
      total: 0.31,
      perCapita: 8.2,
      trend: -1.0,
      sources: {
        electricity: 0.45,
        industry: 0.22,
        transport: 0.18,
        buildings: 0.10,
        agriculture: 0.05,
      },
    },
    energy: {
      renewableShare: 0.21,
      coalShare: 0.70,
      gasShare: 0.08,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.45, capacity: 80 },
      wind: { score: 0.70, capacity: 150 },
      forest: { score: 0.50, area: 10 },
      carbonCapture: { score: 0.60, sites: 15 },
      geothermal: { score: 0.25 },
    },
    projects: {
      wind: { costMultiplier: 0.90, effectMultiplier: 1.10, reason: "Baltic Sea offshore potential" },
      nuclear: { costMultiplier: 0.95, effectMultiplier: 1.10, reason: "Planning first nuclear plants" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "70% of electricity still from coal",
      "Largest coal producer in EU",
      "Rapidly expanding solar rooftop capacity",
      "Plans to build first nuclear plant by 2030s",
    ],
  },

  russia: {
    name: "Russia",
    region: "europe",
    population: 144,
    gdp: 1.8,
    emissions: {
      total: 1.76,
      perCapita: 12.2,
      trend: 0.2,
      sources: {
        electricity: 0.35,
        industry: 0.28,
        transport: 0.15,
        buildings: 0.15,
        agriculture: 0.07,
      },
    },
    energy: {
      renewableShare: 0.21,
      coalShare: 0.16,
      gasShare: 0.46,
      nuclearShare: 0.20,
    },
    potential: {
      solar: { score: 0.30, capacity: 300 },
      wind: { score: 0.75, capacity: 800 },
      forest: { score: 0.95, area: 800 },
      carbonCapture: { score: 0.70, sites: 50 },
      geothermal: { score: 0.35 },
    },
    projects: {
      forest: { costMultiplier: 0.60, effectMultiplier: 1.40, reason: "World's largest forest area" },
      nuclear: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Major nuclear technology exporter" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2060,
      parisCommitment: -30,
    },
    facts: [
      "Fourth largest emitter globally",
      "World's largest natural gas exporter",
      "Siberian forests are massive carbon sink",
      "Nuclear power provides 20% of electricity",
    ],
  },

  spain: {
    name: "Spain",
    region: "europe",
    population: 47,
    gdp: 1.4,
    emissions: {
      total: 0.25,
      perCapita: 5.3,
      trend: -4.2,
      sources: {
        electricity: 0.22,
        transport: 0.28,
        industry: 0.22,
        buildings: 0.18,
        agriculture: 0.10,
      },
    },
    energy: {
      renewableShare: 0.50,
      coalShare: 0.02,
      gasShare: 0.21,
      nuclearShare: 0.21,
    },
    potential: {
      solar: { score: 0.90, capacity: 300 },
      wind: { score: 0.80, capacity: 200 },
      forest: { score: 0.50, area: 12 },
      carbonCapture: { score: 0.45, sites: 10 },
      geothermal: { score: 0.25 },
    },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "Best solar irradiance in Europe" },
      wind: { costMultiplier: 0.85, effectMultiplier: 1.15, reason: "Strong wind resources" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "50% renewable electricity achieved",
      "Best solar resources in Europe",
      "Leading concentrating solar power technology",
      "Rapidly phasing out coal",
    ],
  },

  netherlands: {
    name: "Netherlands",
    region: "europe",
    population: 18,
    gdp: 0.99,
    emissions: {
      total: 0.15,
      perCapita: 8.5,
      trend: -4.8,
      sources: {
        electricity: 0.28,
        industry: 0.30,
        transport: 0.18,
        buildings: 0.18,
        agriculture: 0.06,
      },
    },
    energy: {
      renewableShare: 0.33,
      coalShare: 0.08,
      gasShare: 0.45,
      nuclearShare: 0.03,
    },
    potential: {
      solar: { score: 0.45, capacity: 40 },
      wind: { score: 0.90, capacity: 80 },
      forest: { score: 0.25, area: 2 },
      carbonCapture: { score: 0.80, sites: 15 },
      geothermal: { score: 0.40 },
    },
    projects: {
      wind: { costMultiplier: 0.80, effectMultiplier: 1.30, reason: "World-class North Sea offshore wind" },
      carbonCapture: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Depleted gas fields for storage" },
    },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "1/3 of country below sea level - climate vulnerable",
      "Major oil refining and petrochemical hub",
      "Leading offshore wind developer",
      "Ambitious green hydrogen plans",
    ],
  },

  sweden: {
    name: "Sweden",
    region: "europe",
    population: 10,
    gdp: 0.59,
    emissions: {
      total: 0.04,
      perCapita: 3.8,
      trend: -6.0,
      sources: {
        electricity: 0.05,
        transport: 0.32,
        industry: 0.35,
        buildings: 0.15,
        agriculture: 0.13,
      },
    },
    energy: {
      renewableShare: 0.69,
      coalShare: 0.01,
      gasShare: 0.01,
      nuclearShare: 0.29,
    },
    potential: {
      solar: { score: 0.35, capacity: 25 },
      wind: { score: 0.80, capacity: 100 },
      forest: { score: 0.75, area: 28 },
      carbonCapture: { score: 0.55, sites: 8 },
      geothermal: { score: 0.15 },
    },
    projects: {
      forest: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Large managed forest sector" },
      wind: { costMultiplier: 0.85, effectMultiplier: 1.15, reason: "Good onshore and offshore resources" },
    },
    policies: {
      carbonPrice: 120,
      netZeroTarget: 2045,
      parisCommitment: -55,
    },
    facts: [
      "World's highest carbon tax ($120/tonne)",
      "69% renewable + 29% nuclear = 98% clean electricity",
      "Pioneering green steel production",
      "Carbon neutral target by 2045",
    ],
  },

  norway: {
    name: "Norway",
    region: "europe",
    population: 5,
    gdp: 0.48,
    emissions: {
      total: 0.05,
      perCapita: 9.5,
      trend: -2.5,
      sources: {
        electricity: 0.02,
        transport: 0.35,
        industry: 0.40,
        buildings: 0.10,
        agriculture: 0.13,
      },
    },
    energy: {
      renewableShare: 0.98,
      coalShare: 0.00,
      gasShare: 0.01,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.25, capacity: 10 },
      wind: { score: 0.90, capacity: 80 },
      forest: { score: 0.60, area: 12 },
      carbonCapture: { score: 0.90, sites: 20 },
      geothermal: { score: 0.20 },
    },
    projects: {
      wind: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Strong coastal winds" },
      carbonCapture: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "World leader in CCS, North Sea storage" },
      evInfra: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Highest EV adoption globally" },
    },
    policies: {
      carbonPrice: 90,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "98% renewable electricity from hydropower",
      "World's highest EV market share (80%+ of new sales)",
      "Major oil/gas producer investing in transition",
      "Pioneer in carbon capture and storage",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MIDDLE EAST
  // ═══════════════════════════════════════════════════════════════

  saudi_arabia: {
    name: "Saudi Arabia",
    region: "asia",
    population: 36,
    gdp: 1.1,
    emissions: {
      total: 0.59,
      perCapita: 16.4,
      trend: 1.5,
      sources: {
        electricity: 0.42,
        transport: 0.22,
        industry: 0.25,
        buildings: 0.08,
        agriculture: 0.03,
      },
    },
    energy: {
      renewableShare: 0.01,
      coalShare: 0.00,
      gasShare: 0.39,
      nuclearShare: 0.00,
      oilShare: 0.60,
    },
    potential: {
      solar: { score: 0.98, capacity: 2000 },
      wind: { score: 0.55, capacity: 200 },
      forest: { score: 0.15, area: 2 },
      carbonCapture: { score: 0.80, sites: 25 },
      geothermal: { score: 0.30 },
    },
    projects: {
      solar: { costMultiplier: 0.65, effectMultiplier: 1.50, reason: "World's best solar irradiance, NEOM project" },
      carbonCapture: { costMultiplier: 0.85, effectMultiplier: 1.20, reason: "Oil industry expertise, depleted reservoirs" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2060,
      parisCommitment: -30,
    },
    facts: [
      "World's largest oil exporter",
      "Vision 2030 includes massive renewable buildout",
      "NEOM - futuristic green city project",
      "Highest solar irradiance on Earth",
    ],
  },

  iran: {
    name: "Iran",
    region: "asia",
    population: 87,
    gdp: 0.39,
    emissions: {
      total: 0.75,
      perCapita: 8.6,
      trend: 1.2,
      sources: {
        electricity: 0.38,
        transport: 0.22,
        industry: 0.25,
        buildings: 0.10,
        agriculture: 0.05,
      },
    },
    energy: {
      renewableShare: 0.06,
      coalShare: 0.01,
      gasShare: 0.82,
      nuclearShare: 0.02,
    },
    potential: {
      solar: { score: 0.90, capacity: 800 },
      wind: { score: 0.60, capacity: 200 },
      forest: { score: 0.30, area: 10 },
      carbonCapture: { score: 0.65, sites: 20 },
      geothermal: { score: 0.45 },
    },
    projects: {
      solar: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Excellent solar resources" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 0,
      parisCommitment: -4,
    },
    facts: [
      "World's second largest natural gas reserves",
      "Heavily subsidized domestic fuel prices",
      "Large potential for solar in central deserts",
      "Growing nuclear energy program",
    ],
  },

  uae: {
    name: "United Arab Emirates",
    region: "asia",
    population: 10,
    gdp: 0.50,
    emissions: {
      total: 0.19,
      perCapita: 19.3,
      trend: 0.8,
      sources: {
        electricity: 0.40,
        transport: 0.20,
        industry: 0.28,
        buildings: 0.10,
        agriculture: 0.02,
      },
    },
    energy: {
      renewableShare: 0.07,
      coalShare: 0.00,
      gasShare: 0.93,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.95, capacity: 150 },
      wind: { score: 0.40, capacity: 30 },
      forest: { score: 0.10, area: 1 },
      carbonCapture: { score: 0.85, sites: 15 },
      geothermal: { score: 0.15 },
    },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Massive solar parks, low record prices" },
      carbonCapture: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Oil industry driving CCS innovation" },
      nuclear: { costMultiplier: 0.90, effectMultiplier: 1.15, reason: "Barakah plant operational" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -31,
    },
    facts: [
      "Hosted COP28 in 2023",
      "Among highest per capita emissions globally",
      "Home to world's largest single-site solar park",
      "First Arab nation to commit to net zero",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // AFRICA
  // ═══════════════════════════════════════════════════════════════

  south_africa: {
    name: "South Africa",
    region: "africa",
    population: 60,
    gdp: 0.40,
    emissions: {
      total: 0.44,
      perCapita: 7.3,
      trend: -1.5,
      sources: {
        electricity: 0.48,
        transport: 0.15,
        industry: 0.22,
        buildings: 0.08,
        agriculture: 0.07,
      },
    },
    energy: {
      renewableShare: 0.12,
      coalShare: 0.80,
      gasShare: 0.03,
      nuclearShare: 0.05,
    },
    potential: {
      solar: { score: 0.90, capacity: 500 },
      wind: { score: 0.75, capacity: 200 },
      forest: { score: 0.40, area: 15 },
      carbonCapture: { score: 0.55, sites: 12 },
      geothermal: { score: 0.20 },
    },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Excellent sun, growing investment" },
      wind: { costMultiplier: 0.85, effectMultiplier: 1.15, reason: "Good coastal winds" },
    },
    policies: {
      carbonPrice: 9,
      netZeroTarget: 2050,
      parisCommitment: -42,
    },
    facts: [
      "80% of electricity from coal - highest in major economy",
      "Just Energy Transition Partnership for coal phaseout",
      "Excellent renewable resources underutilized",
      "Critical minerals for battery supply chains",
    ],
  },

  egypt: {
    name: "Egypt",
    region: "africa",
    population: 104,
    gdp: 0.38,
    emissions: {
      total: 0.25,
      perCapita: 2.4,
      trend: 2.0,
      sources: {
        electricity: 0.38,
        transport: 0.22,
        industry: 0.20,
        buildings: 0.12,
        agriculture: 0.08,
      },
    },
    energy: {
      renewableShare: 0.12,
      coalShare: 0.00,
      gasShare: 0.82,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.95, capacity: 600 },
      wind: { score: 0.80, capacity: 150 },
      forest: { score: 0.20, area: 3 },
      carbonCapture: { score: 0.45, sites: 8 },
      geothermal: { score: 0.25 },
    },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Saharan sun, Benban solar park" },
      wind: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Gulf of Suez wind corridor" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 0,
      parisCommitment: -33,
    },
    facts: [
      "Hosted COP27 in Sharm El-Sheikh",
      "Benban is Africa's largest solar park",
      "Gulf of Suez has excellent wind speeds",
      "Suez Canal - global shipping bottleneck",
    ],
  },

  nigeria: {
    name: "Nigeria",
    region: "africa",
    population: 218,
    gdp: 0.44,
    emissions: {
      total: 0.14,
      perCapita: 0.6,
      trend: 3.5,
      sources: {
        electricity: 0.25,
        transport: 0.18,
        industry: 0.15,
        buildings: 0.12,
        agriculture: 0.30,
      },
    },
    energy: {
      renewableShare: 0.19,
      coalShare: 0.00,
      gasShare: 0.81,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.90, capacity: 800 },
      wind: { score: 0.45, capacity: 100 },
      forest: { score: 0.70, area: 40 },
      carbonCapture: { score: 0.50, sites: 10 },
      geothermal: { score: 0.15 },
    },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Abundant sunshine across country" },
      forest: { costMultiplier: 0.70, effectMultiplier: 1.25, reason: "Tropical reforestation potential" },
    },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2060,
      parisCommitment: -47,
    },
    facts: [
      "Africa's largest economy and population",
      "Very low per capita emissions",
      "Gas flaring major issue in oil industry",
      "Massive solar potential largely untapped",
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // OCEANIA
  // ═══════════════════════════════════════════════════════════════

  australia: {
    name: "Australia",
    region: "oceania",
    population: 26,
    gdp: 1.7,
    emissions: {
      total: 0.40,
      perCapita: 15.4,
      trend: -2.0,
      sources: {
        electricity: 0.32,
        transport: 0.20,
        industry: 0.20,
        buildings: 0.12,
        agriculture: 0.16,
      },
    },
    energy: {
      renewableShare: 0.35,
      coalShare: 0.43,
      gasShare: 0.20,
      nuclearShare: 0.00,
    },
    potential: {
      solar: { score: 0.95, capacity: 2500 },
      wind: { score: 0.85, capacity: 600 },
      forest: { score: 0.50, area: 40 },
      carbonCapture: { score: 0.75, sites: 30 },
      geothermal: { score: 0.55 },
    },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.45, reason: "World's best solar irradiance, vast land" },
      wind: { costMultiplier: 0.80, effectMultiplier: 1.25, reason: "Strong southern coast winds" },
      greenHydrogen: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "Emerging renewable hydrogen exporter" },
    },
    policies: {
      carbonPrice: 30,
      netZeroTarget: 2050,
      parisCommitment: -43,
    },
    facts: [
      "Among highest per capita emitters globally",
      "Rooftop solar leader - 30% of homes have panels",
      "World's largest coal exporter",
      "Positioning as green hydrogen superpower",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTINENT/REGION AGGREGATIONS
// ═══════════════════════════════════════════════════════════════

const REGION_AGGREGATES = {
  north_america: {
    name: "North America",
    countries: ["usa", "canada", "mexico"],
    gdp: 28.9, // trillion USD (sum of USA + Canada + Mexico)
    baseIncome: 15, // credits per month
    sectorIncome: {
      electricity: 3,
      transport: 4,
      industry: 5,
      buildings: 2,
      agriculture: 1,
    },
    avgPotential: {
      solar: 0.75,
      wind: 0.85,
      forest: 0.70,
      carbonCapture: 0.75,
    },
  },
  south_america: {
    name: "South America",
    countries: ["brazil", "argentina"],
    gdp: 2.5, // trillion USD
    baseIncome: 4,
    sectorIncome: {
      electricity: 0.5,
      transport: 1,
      industry: 0.5,
      buildings: 0.5,
      agriculture: 1.5,
    },
    avgPotential: {
      solar: 0.80,
      wind: 0.80,
      forest: 0.90,
      carbonCapture: 0.45,
    },
  },
  europe: {
    name: "Europe",
    countries: ["germany", "uk", "france", "italy", "poland", "russia", "spain", "netherlands", "sweden", "norway"],
    gdp: 17.9, // trillion USD
    baseIncome: 12,
    sectorIncome: {
      electricity: 2,
      transport: 3,
      industry: 4,
      buildings: 2,
      agriculture: 1,
    },
    avgPotential: {
      solar: 0.50,
      wind: 0.80,
      forest: 0.55,
      carbonCapture: 0.65,
    },
  },
  africa: {
    name: "Africa",
    countries: ["south_africa", "egypt", "nigeria"],
    gdp: 1.2, // trillion USD (subset)
    baseIncome: 2,
    sectorIncome: {
      electricity: 0.3,
      transport: 0.3,
      industry: 0.4,
      buildings: 0.2,
      agriculture: 0.8,
    },
    avgPotential: {
      solar: 0.92,
      wind: 0.65,
      forest: 0.45,
      carbonCapture: 0.50,
    },
  },
  asia: {
    name: "Asia",
    countries: ["china", "india", "japan", "south_korea", "indonesia", "saudi_arabia", "iran", "uae"],
    gdp: 31.6, // trillion USD
    baseIncome: 18,
    sectorIncome: {
      electricity: 4,
      transport: 3,
      industry: 7,
      buildings: 2,
      agriculture: 2,
    },
    avgPotential: {
      solar: 0.85,
      wind: 0.65,
      forest: 0.55,
      carbonCapture: 0.70,
    },
  },
  oceania: {
    name: "Oceania",
    countries: ["australia"],
    gdp: 1.7, // trillion USD
    baseIncome: 3,
    sectorIncome: {
      electricity: 0.6,
      transport: 0.5,
      industry: 0.8,
      buildings: 0.4,
      agriculture: 0.7,
    },
    avgPotential: {
      solar: 0.95,
      wind: 0.85,
      forest: 0.50,
      carbonCapture: 0.75,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ADVANCED PROJECT TYPES
// ═══════════════════════════════════════════════════════════════

const ADVANCED_PROJECT_TYPES = {
  // Basic (always available)
  reforestation: {
    label: "Reforestation",
    baseCost: 50,
    baseCo2Reduction: 2,
    income: 0,
    potentialKey: "forest",
    description: "Plant trees to absorb carbon from the atmosphere.",
    tier: "basic",
  },
  solarUtility: {
    label: "Solar Farm",
    baseCost: 100,
    baseCo2Reduction: 1.5,
    income: 2,
    potentialKey: "solar",
    description: "Large-scale solar panels generate clean electricity.",
    tier: "basic",
  },
  windOnshore: {
    label: "Wind Farm",
    baseCost: 120,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: "wind",
    description: "Onshore wind turbines harness wind energy.",
    tier: "basic",
  },
  research: {
    label: "Research Lab",
    baseCost: 150,
    baseCo2Reduction: 0,
    income: 5,
    potentialKey: null,
    description: "Funds innovation and unlocks advanced technologies.",
    tier: "basic",
  },

  // Intermediate (require some basic projects)
  windOffshore: {
    label: "Offshore Wind",
    baseCost: 250,
    baseCo2Reduction: 4,
    income: 2,
    potentialKey: "wind",
    requires: { windOnshore: 3 },
    description: "Offshore wind farms produce more consistent power.",
    tier: "intermediate",
  },
  evInfrastructure: {
    label: "EV Infrastructure",
    baseCost: 200,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    targetSector: "transport",
    requires: { solarUtility: 2 },
    description: "Charging networks enable electric vehicle adoption.",
    tier: "intermediate",
  },
  sustainableAgriculture: {
    label: "Sustainable Farming",
    baseCost: 150,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    targetSector: "agriculture",
    requires: { reforestation: 2 },
    description: "Reduces methane and improves soil carbon storage.",
    tier: "intermediate",
  },
  nuclearPlant: {
    label: "Nuclear Plant",
    baseCost: 500,
    baseCo2Reduction: 8,
    income: 4,
    potentialKey: null,
    buildTime: 24,
    requires: { research: 3 },
    description: "Zero-emission baseload power, takes 2 years to build.",
    tier: "intermediate",
  },

  // Advanced (require research + conditions)
  carbonCapture: {
    label: "Carbon Capture",
    baseCost: 350,
    baseCo2Reduction: 5,
    income: 0,
    potentialKey: "carbonCapture",
    requires: { research: 4 },
    description: "Captures CO2 from industrial sources and stores it underground.",
    tier: "advanced",
  },
  directAirCapture: {
    label: "Direct Air Capture",
    baseCost: 450,
    baseCo2Reduction: 6,
    income: 0,
    potentialKey: "carbonCapture",
    requires: { research: 6, carbonCapture: 2 },
    description: "Removes CO2 directly from the atmosphere.",
    tier: "advanced",
  },
  greenHydrogen: {
    label: "Green Hydrogen",
    baseCost: 400,
    baseCo2Reduction: 3,
    income: 5,
    potentialKey: null,
    requires: { solarUtility: 5, windOnshore: 5 },
    description: "Clean fuel for heavy industry and long-haul transport.",
    tier: "advanced",
  },
  smartGrid: {
    label: "Smart Grid",
    baseCost: 300,
    baseCo2Reduction: 2,
    income: 3,
    potentialKey: null,
    requires: { research: 4, solarUtility: 3, windOnshore: 3 },
    description: "AI-optimized grid improves renewable integration.",
    tier: "advanced",
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get climate data for a region or country ID
 */
function getClimateData(regionId) {
  const normalized = regionId.toLowerCase().replace(/[\s-]/g, "_");

  // Check if it's a country
  if (COUNTRY_DATA[normalized]) {
    return COUNTRY_DATA[normalized];
  }

  // Check if it's a region aggregate
  if (REGION_AGGREGATES[normalized]) {
    return aggregateRegionData(normalized);
  }

  return null;
}

/**
 * Aggregate data for a region from its countries
 */
function aggregateRegionData(regionId) {
  const region = REGION_AGGREGATES[regionId];
  if (!region) return null;

  const countries = region.countries.map((id) => COUNTRY_DATA[id]).filter(Boolean);
  if (countries.length === 0) return null;

  const totalEmissions = countries.reduce((sum, c) => sum + c.emissions.total, 0);
  const totalPopulation = countries.reduce((sum, c) => sum + c.population, 0);

  // Weighted average for sources
  const sources = {};
  const sourceKeys = Object.keys(countries[0].emissions.sources);
  sourceKeys.forEach((key) => {
    const weightedSum = countries.reduce((sum, c) => sum + c.emissions.sources[key] * c.emissions.total, 0);
    sources[key] = weightedSum / totalEmissions;
  });

  return {
    name: region.name,
    region: regionId,
    population: totalPopulation,
    gdp: region.gdp || 0,
    baseIncome: region.baseIncome || 5,
    sectorIncome: region.sectorIncome || null,
    emissions: {
      total: totalEmissions,
      perCapita: totalEmissions / (totalPopulation / 1000),
      sources,
    },
    potential: region.avgPotential,
    facts: countries.flatMap((c) => c.facts || []).slice(0, 4),
  };
}

/**
 * Calculate adjusted project cost and effect for a region
 */
function calculateProjectEffectiveness(projectType, regionId) {
  const project = ADVANCED_PROJECT_TYPES[projectType];
  if (!project) return null;

  const data = getClimateData(regionId);
  if (!data) {
    return {
      cost: project.baseCost,
      co2Reduction: project.baseCo2Reduction,
      costMultiplier: 1,
      effectMultiplier: 1,
      reason: null,
    };
  }

  // Check for country-specific project modifiers
  const countryData = COUNTRY_DATA[regionId.toLowerCase().replace(/[\s-]/g, "_")];
  if (countryData?.projects?.[projectType]) {
    const mod = countryData.projects[projectType];
    return {
      cost: Math.round(project.baseCost * mod.costMultiplier),
      co2Reduction: +(project.baseCo2Reduction * mod.effectMultiplier).toFixed(1),
      costMultiplier: mod.costMultiplier,
      effectMultiplier: mod.effectMultiplier,
      reason: mod.reason,
    };
  }

  // Use potential score if available
  if (project.potentialKey && data.potential?.[project.potentialKey]) {
    const potential =
      typeof data.potential[project.potentialKey] === "object"
        ? data.potential[project.potentialKey].score
        : data.potential[project.potentialKey];

    const costMult = 2 - potential; // Higher potential = lower cost
    const effectMult = potential; // Higher potential = higher effect

    return {
      cost: Math.round(project.baseCost * costMult),
      co2Reduction: +(project.baseCo2Reduction * effectMult).toFixed(1),
      costMultiplier: +costMult.toFixed(2),
      effectMultiplier: +effectMult.toFixed(2),
      reason: null,
    };
  }

  return {
    cost: project.baseCost,
    co2Reduction: project.baseCo2Reduction,
    costMultiplier: 1,
    effectMultiplier: 1,
    reason: null,
  };
}

/**
 * Get random fact for a region
 */
function getRandomFact(regionId) {
  const data = getClimateData(regionId);
  if (!data?.facts?.length) return null;
  return data.facts[Math.floor(Math.random() * data.facts.length)];
}

// Export for use in game.js
if (typeof window !== "undefined") {
  window.CLIMATE_DATA = {
    COUNTRY_DATA,
    REGION_AGGREGATES,
    EMISSION_SECTORS,
    ADVANCED_PROJECT_TYPES,
    getClimateData,
    calculateProjectEffectiveness,
    getRandomFact,
  };
}
