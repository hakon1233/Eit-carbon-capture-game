/**
 * Climate Data for Carbon Capture Game
 * High school level educational data
 *
 * Data sources:
 * - Our World in Data (emissions)
 * - IEA (energy mix)
 * - Global Carbon Project
 * - IPCC AR6 (potentials)
 * - World Bank (GDP, population)
 * - Global Solar Atlas (solar potential)
 * - IRENA (renewable capacity)
 *
 * Note: Values are simplified/rounded for educational purposes
 * Data primarily from 2022-2023 reports
 */

// ═══════════════════════════════════════════════════════════════
// ISO 3166-1 ALPHA-2 CODE MAPPING
// Maps SVG country IDs to COUNTRY_DATA keys
// ═══════════════════════════════════════════════════════════════

const ISO_TO_KEY = {
  // Major economies (already in COUNTRY_DATA)
  US: "usa",
  CN: "china",
  IN: "india",
  JP: "japan",
  DE: "germany",
  GB: "uk",
  FR: "france",
  IT: "italy",
  BR: "brazil",
  CA: "canada",
  RU: "russia",
  KR: "south_korea",
  AU: "australia",
  ES: "spain",
  MX: "mexico",
  ID: "indonesia",
  NL: "netherlands",
  SA: "saudi_arabia",
  TR: "turkey",
  CH: "switzerland",
  PL: "poland",
  SE: "sweden",
  BE: "belgium",
  AR: "argentina",
  NO: "norway",
  AT: "austria",
  AE: "uae",
  IL: "israel",
  TH: "thailand",
  IE: "ireland",
  SG: "singapore",
  MY: "malaysia",
  DK: "denmark",
  PH: "philippines",
  ZA: "south_africa",
  EG: "egypt",
  NG: "nigeria",
  IR: "iran",

  // Europe - Additional
  PT: "portugal",
  CZ: "czech_republic",
  RO: "romania",
  NZ: "new_zealand",
  GR: "greece",
  FI: "finland",
  HU: "hungary",
  UA: "ukraine",
  SK: "slovakia",
  BG: "bulgaria",
  HR: "croatia",
  LT: "lithuania",
  SI: "slovenia",
  LV: "latvia",
  EE: "estonia",
  LU: "luxembourg",
  CY: "cyprus",
  MT: "malta",
  IS: "iceland",
  RS: "serbia",
  BA: "bosnia",
  AL: "albania",
  MK: "north_macedonia",
  ME: "montenegro",
  BY: "belarus",
  MD: "moldova",
  AD: "andorra",
  MC: "monaco",
  SM: "san_marino",
  VA: "vatican",
  LI: "liechtenstein",
  XK: "kosovo",

  // Asia - Additional
  PK: "pakistan",
  BD: "bangladesh",
  VN: "vietnam",
  TW: "taiwan",
  HK: "hong_kong",
  MO: "macau",
  KP: "north_korea",
  MM: "myanmar",
  KH: "cambodia",
  LA: "laos",
  NP: "nepal",
  LK: "sri_lanka",
  AF: "afghanistan",
  UZ: "uzbekistan",
  KZ: "kazakhstan",
  TM: "turkmenistan",
  TJ: "tajikistan",
  KG: "kyrgyzstan",
  AZ: "azerbaijan",
  GE: "georgia",
  AM: "armenia",
  MN: "mongolia",
  BN: "brunei",
  TL: "timor_leste",
  BT: "bhutan",
  MV: "maldives",

  // Middle East - Additional
  IQ: "iraq",
  KW: "kuwait",
  QA: "qatar",
  BH: "bahrain",
  OM: "oman",
  JO: "jordan",
  LB: "lebanon",
  SY: "syria",
  YE: "yemen",
  PS: "palestine",

  // Africa - Additional
  MA: "morocco",
  DZ: "algeria",
  TN: "tunisia",
  LY: "libya",
  SD: "sudan",
  SS: "south_sudan",
  ET: "ethiopia",
  KE: "kenya",
  TZ: "tanzania",
  UG: "uganda",
  RW: "rwanda",
  BI: "burundi",
  CD: "dr_congo",
  CG: "congo",
  AO: "angola",
  ZM: "zambia",
  ZW: "zimbabwe",
  BW: "botswana",
  NA: "namibia",
  MZ: "mozambique",
  MW: "malawi",
  MG: "madagascar",
  MU: "mauritius",
  SC: "seychelles",
  KM: "comoros",
  GH: "ghana",
  CI: "ivory_coast",
  SN: "senegal",
  ML: "mali",
  BF: "burkina_faso",
  NE: "niger",
  TD: "chad",
  MR: "mauritania",
  CM: "cameroon",
  GA: "gabon",
  GQ: "equatorial_guinea",
  CF: "central_african_republic",
  BJ: "benin",
  TG: "togo",
  GN: "guinea",
  SL: "sierra_leone",
  LR: "liberia",
  GM: "gambia",
  GW: "guinea_bissau",
  CV: "cape_verde",
  ST: "sao_tome",
  ER: "eritrea",
  DJ: "djibouti",
  SO: "somalia",
  LS: "lesotho",
  SZ: "eswatini",

  // Americas - Additional
  CL: "chile",
  CO: "colombia",
  PE: "peru",
  VE: "venezuela",
  EC: "ecuador",
  BO: "bolivia",
  PY: "paraguay",
  UY: "uruguay",
  GY: "guyana",
  SR: "suriname",
  GF: "french_guiana",
  PA: "panama",
  CR: "costa_rica",
  NI: "nicaragua",
  HN: "honduras",
  SV: "el_salvador",
  GT: "guatemala",
  BZ: "belize",
  CU: "cuba",
  DO: "dominican_republic",
  HT: "haiti",
  JM: "jamaica",
  TT: "trinidad_tobago",
  BB: "barbados",
  BS: "bahamas",
  LC: "saint_lucia",
  GD: "grenada",
  VC: "saint_vincent",
  AG: "antigua_barbuda",
  DM: "dominica",
  KN: "saint_kitts",
  PR: "puerto_rico",
  VI: "us_virgin_islands",
  VG: "british_virgin_islands",
  KY: "cayman_islands",
  TC: "turks_caicos",
  AI: "anguilla",
  MS: "montserrat",
  BM: "bermuda",
  AW: "aruba",
  CW: "curacao",
  SX: "sint_maarten",
  BQ: "caribbean_netherlands",
  MF: "saint_martin",
  BL: "saint_barthelemy",
  GP: "guadeloupe",
  MQ: "martinique",
  FK: "falkland_islands",

  // Oceania - Additional
  NZ: "new_zealand",
  PG: "papua_new_guinea",
  FJ: "fiji",
  SB: "solomon_islands",
  VU: "vanuatu",
  NC: "new_caledonia",
  PF: "french_polynesia",
  WS: "samoa",
  TO: "tonga",
  FM: "micronesia",
  KI: "kiribati",
  MH: "marshall_islands",
  PW: "palau",
  NR: "nauru",
  TV: "tuvalu",
  GU: "guam",
  AS: "american_samoa",
  MP: "northern_mariana",
  CK: "cook_islands",
  NU: "niue",
  TK: "tokelau",
  WF: "wallis_futuna",

  // Territories & Special regions
  GL: "greenland",
  FO: "faroe_islands",
  GI: "gibraltar",
  IM: "isle_of_man",
  JE: "jersey",
  GG: "guernsey",
  AX: "aland_islands",
  SJ: "svalbard",
  PM: "saint_pierre_miquelon",
  RE: "reunion",
  YT: "mayotte",
  SH: "saint_helena",
  IO: "british_indian_ocean",
  TF: "french_southern",
  HM: "heard_mcdonald",
  BV: "bouvet_island",
  GS: "south_georgia",
  AQ: "antarctica",
  CC: "cocos_islands",
  CX: "christmas_island",
  NF: "norfolk_island",
  PN: "pitcairn",
  EH: "western_sahara",
};

// ═══════════════════════════════════════════════════════════════
// MAJOR REGIONS (15 regions based on UN M49 standard)
// Used for intermediate granularity level
// ═══════════════════════════════════════════════════════════════

const MAJOR_REGIONS = {
  // AFRICA
  north_africa: {
    name: "North Africa",
    continent: "africa",
    countries: ["DZ", "EG", "LY", "MA", "SD", "TN", "EH"],
  },
  sub_saharan_africa: {
    name: "Sub-Saharan Africa",
    continent: "africa",
    countries: [
      "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM",
      "CG", "CD", "CI", "DJ", "GQ", "ER", "SZ", "ET", "GA", "GM",
      "GH", "GN", "GW", "KE", "LS", "LR", "MG", "MW", "ML", "MR",
      "MU", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL",
      "SO", "ZA", "SS", "TZ", "TG", "UG", "ZM", "ZW",
    ],
  },

  // ASIA
  west_asia: {
    name: "West Asia",
    continent: "asia",
    countries: [
      "AM", "AZ", "BH", "CY", "GE", "IQ", "IL", "JO", "KW", "LB",
      "OM", "PS", "QA", "SA", "SY", "TR", "AE", "YE",
    ],
  },
  central_asia: {
    name: "Central Asia",
    continent: "asia",
    countries: ["KZ", "KG", "TJ", "TM", "UZ"],
  },
  south_asia: {
    name: "South Asia",
    continent: "asia",
    countries: ["AF", "BD", "BT", "IN", "MV", "NP", "PK", "LK"],
  },
  east_asia: {
    name: "East Asia",
    continent: "asia",
    countries: ["CN", "JP", "KP", "KR", "MN", "TW", "HK", "MO"],
  },
  southeast_asia: {
    name: "Southeast Asia",
    continent: "asia",
    countries: ["BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "TH", "TL", "VN"],
  },

  // EUROPE
  northern_europe: {
    name: "Northern Europe",
    continent: "europe",
    countries: ["DK", "EE", "FI", "IS", "IE", "LV", "LT", "NO", "SE", "GB"],
  },
  western_europe: {
    name: "Western Europe",
    continent: "europe",
    countries: ["AT", "BE", "FR", "DE", "LI", "LU", "MC", "NL", "CH"],
  },
  southern_europe: {
    name: "Southern Europe",
    continent: "europe",
    countries: [
      "AL", "AD", "BA", "HR", "GR", "IT", "MT", "ME", "MK", "PT",
      "SM", "RS", "SI", "ES", "VA", "XK",
    ],
  },
  eastern_europe: {
    name: "Eastern Europe",
    continent: "europe",
    countries: ["BY", "BG", "CZ", "HU", "MD", "PL", "RO", "RU", "SK", "UA"],
  },

  // AMERICAS
  north_america: {
    name: "North America",
    continent: "north_america",
    countries: ["CA", "US", "MX", "GL"],
  },
  central_america_caribbean: {
    name: "Central America & Caribbean",
    continent: "north_america",
    countries: [
      "AI", "AG", "AW", "BS", "BB", "BZ", "BM", "VG", "KY", "CR",
      "CU", "CW", "DM", "DO", "SV", "GD", "GP", "GT", "HT", "HN",
      "JM", "MQ", "NI", "PA", "PR", "KN", "LC", "MF", "VC", "SX",
      "TT", "TC", "VI",
    ],
  },
  south_america: {
    name: "South America",
    continent: "south_america",
    countries: [
      "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY",
      "PE", "SR", "UY", "VE",
    ],
  },

  // OCEANIA
  oceania: {
    name: "Oceania",
    continent: "oceania",
    countries: [
      "AU", "FJ", "PF", "GU", "KI", "MH", "FM", "NR", "NC", "NZ",
      "PW", "PG", "WS", "SB", "TO", "TV", "VU",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTINENTS (6 continents referencing major regions)
// ═══════════════════════════════════════════════════════════════

const CONTINENTS = {
  africa: {
    name: "Africa",
    majorRegions: ["north_africa", "sub_saharan_africa"],
  },
  asia: {
    name: "Asia",
    majorRegions: ["west_asia", "central_asia", "south_asia", "east_asia", "southeast_asia"],
  },
  europe: {
    name: "Europe",
    majorRegions: ["northern_europe", "western_europe", "southern_europe", "eastern_europe"],
  },
  north_america: {
    name: "North America",
    majorRegions: ["north_america", "central_america_caribbean"],
  },
  south_america: {
    name: "South America",
    majorRegions: ["south_america"],
  },
  oceania: {
    name: "Oceania",
    majorRegions: ["oceania"],
  },
};

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

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL EUROPEAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  turkey: {
    name: "Turkey",
    region: "europe",
    population: 85,
    gdp: 0.91,
    emissions: {
      total: 0.42,
      perCapita: 4.9,
      trend: 1.5,
      sources: { electricity: 0.33, transport: 0.22, industry: 0.28, buildings: 0.12, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.42, coalShare: 0.32, gasShare: 0.23, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.45 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.65 } },
    facts: ["High geothermal potential", "Major renewable energy growth", "Bridge between Europe and Asia"],
  },

  switzerland: {
    name: "Switzerland",
    region: "europe",
    population: 9,
    gdp: 0.81,
    emissions: {
      total: 0.04,
      perCapita: 4.0,
      trend: -2.5,
      sources: { electricity: 0.05, transport: 0.35, industry: 0.25, buildings: 0.30, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.75, coalShare: 0.00, gasShare: 0.10, nuclearShare: 0.35 },
    potential: { solar: { score: 0.45 }, wind: { score: 0.40 }, forest: { score: 0.50 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.30 } },
    facts: ["75% renewable electricity from hydro", "Carbon neutral target 2050", "High per capita wealth"],
  },

  belgium: {
    name: "Belgium",
    region: "europe",
    population: 12,
    gdp: 0.58,
    emissions: {
      total: 0.10,
      perCapita: 8.3,
      trend: -3.5,
      sources: { electricity: 0.20, transport: 0.25, industry: 0.30, buildings: 0.20, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.25, coalShare: 0.03, gasShare: 0.30, nuclearShare: 0.40 },
    potential: { solar: { score: 0.40 }, wind: { score: 0.80 }, forest: { score: 0.25 }, carbonCapture: { score: 0.60 }, geothermal: { score: 0.20 } },
    facts: ["Major offshore wind expansion", "Nuclear phase-out debates", "EU headquarters in Brussels"],
  },

  austria: {
    name: "Austria",
    region: "europe",
    population: 9,
    gdp: 0.47,
    emissions: {
      total: 0.07,
      perCapita: 7.8,
      trend: -3.0,
      sources: { electricity: 0.15, transport: 0.30, industry: 0.25, buildings: 0.25, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.78, coalShare: 0.05, gasShare: 0.15, nuclearShare: 0.00 },
    potential: { solar: { score: 0.50 }, wind: { score: 0.55 }, forest: { score: 0.65 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.25 } },
    facts: ["78% renewable electricity (mostly hydro)", "Alpine forests as carbon sinks", "No nuclear power by law"],
  },

  portugal: {
    name: "Portugal",
    region: "europe",
    population: 10,
    gdp: 0.25,
    emissions: {
      total: 0.04,
      perCapita: 4.3,
      trend: -5.0,
      sources: { electricity: 0.22, transport: 0.35, industry: 0.20, buildings: 0.15, agriculture: 0.08 },
    },
    energy: { renewableShare: 0.75, coalShare: 0.00, gasShare: 0.20, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.80 }, forest: { score: 0.55 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.30 } },
    facts: ["75% renewable electricity", "Coal-free since 2021", "Excellent solar and wind resources"],
  },

  greece: {
    name: "Greece",
    region: "europe",
    population: 10,
    gdp: 0.22,
    emissions: {
      total: 0.06,
      perCapita: 5.8,
      trend: -6.0,
      sources: { electricity: 0.35, transport: 0.28, industry: 0.18, buildings: 0.14, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.45, coalShare: 0.12, gasShare: 0.40, nuclearShare: 0.00 },
    potential: { solar: { score: 0.90 }, wind: { score: 0.75 }, forest: { score: 0.35 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.45 } },
    facts: ["Excellent Mediterranean solar", "Rapid lignite phase-out", "Island energy challenges"],
  },

  czech_republic: {
    name: "Czech Republic",
    region: "europe",
    population: 11,
    gdp: 0.29,
    emissions: {
      total: 0.10,
      perCapita: 9.3,
      trend: -2.0,
      sources: { electricity: 0.40, transport: 0.18, industry: 0.25, buildings: 0.12, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.15, coalShare: 0.40, gasShare: 0.18, nuclearShare: 0.37 },
    potential: { solar: { score: 0.45 }, wind: { score: 0.50 }, forest: { score: 0.55 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.25 } },
    facts: ["Heavy coal dependence", "Nuclear expansion planned", "EU industrial center"],
  },

  romania: {
    name: "Romania",
    region: "europe",
    population: 19,
    gdp: 0.30,
    emissions: {
      total: 0.07,
      perCapita: 3.7,
      trend: -1.5,
      sources: { electricity: 0.28, transport: 0.22, industry: 0.25, buildings: 0.18, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.43, coalShare: 0.18, gasShare: 0.22, nuclearShare: 0.18 },
    potential: { solar: { score: 0.65 }, wind: { score: 0.70 }, forest: { score: 0.60 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.30 } },
    facts: ["Good mix of hydro and nuclear", "Black Sea offshore wind potential", "Large forest coverage"],
  },

  finland: {
    name: "Finland",
    region: "europe",
    population: 6,
    gdp: 0.30,
    emissions: {
      total: 0.04,
      perCapita: 7.0,
      trend: -5.5,
      sources: { electricity: 0.15, transport: 0.28, industry: 0.30, buildings: 0.20, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.50, coalShare: 0.08, gasShare: 0.05, nuclearShare: 0.34 },
    potential: { solar: { score: 0.30 }, wind: { score: 0.75 }, forest: { score: 0.85 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.15 } },
    facts: ["Carbon neutral target 2035", "Vast boreal forests", "Nuclear + renewables mix"],
  },

  ireland: {
    name: "Ireland",
    region: "europe",
    population: 5,
    gdp: 0.53,
    emissions: {
      total: 0.04,
      perCapita: 7.5,
      trend: -2.0,
      sources: { electricity: 0.18, transport: 0.35, industry: 0.15, buildings: 0.12, agriculture: 0.20 },
    },
    energy: { renewableShare: 0.40, coalShare: 0.02, gasShare: 0.52, nuclearShare: 0.00 },
    potential: { solar: { score: 0.35 }, wind: { score: 0.95 }, forest: { score: 0.45 }, carbonCapture: { score: 0.55 }, geothermal: { score: 0.15 } },
    facts: ["Among best wind resources globally", "High agriculture emissions", "Data center energy demand"],
  },

  hungary: {
    name: "Hungary",
    region: "europe",
    population: 10,
    gdp: 0.18,
    emissions: {
      total: 0.05,
      perCapita: 5.0,
      trend: -1.0,
      sources: { electricity: 0.25, transport: 0.25, industry: 0.22, buildings: 0.20, agriculture: 0.08 },
    },
    energy: { renewableShare: 0.15, coalShare: 0.08, gasShare: 0.30, nuclearShare: 0.45 },
    potential: { solar: { score: 0.60 }, wind: { score: 0.50 }, forest: { score: 0.40 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.55 } },
    facts: ["Nuclear provides 45% of electricity", "Good solar potential", "Geothermal resources"],
  },

  ukraine: {
    name: "Ukraine",
    region: "europe",
    population: 43,
    gdp: 0.16,
    emissions: {
      total: 0.19,
      perCapita: 4.4,
      trend: -8.0,
      sources: { electricity: 0.30, transport: 0.18, industry: 0.32, buildings: 0.12, agriculture: 0.08 },
    },
    energy: { renewableShare: 0.12, coalShare: 0.30, gasShare: 0.08, nuclearShare: 0.55 },
    potential: { solar: { score: 0.55 }, wind: { score: 0.65 }, forest: { score: 0.50 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.20 } },
    facts: ["Nuclear provides 55% of electricity", "Large agricultural sector", "Energy infrastructure challenges"],
  },

  denmark: {
    name: "Denmark",
    region: "europe",
    population: 6,
    gdp: 0.40,
    emissions: {
      total: 0.03,
      perCapita: 5.0,
      trend: -7.0,
      sources: { electricity: 0.10, transport: 0.35, industry: 0.20, buildings: 0.25, agriculture: 0.10 },
    },
    energy: { renewableShare: 0.80, coalShare: 0.05, gasShare: 0.12, nuclearShare: 0.00 },
    potential: { solar: { score: 0.40 }, wind: { score: 0.95 }, forest: { score: 0.30 }, carbonCapture: { score: 0.70 }, geothermal: { score: 0.15 } },
    projects: {
      wind: { costMultiplier: 0.70, effectMultiplier: 1.45, reason: "Global offshore wind leader" },
    },
    facts: ["70% wind & solar electricity", "World leader in offshore wind", "Carbon neutral target 2050"],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL ASIAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  pakistan: {
    name: "Pakistan",
    region: "asia",
    population: 230,
    gdp: 0.35,
    emissions: {
      total: 0.20,
      perCapita: 0.9,
      trend: 3.5,
      sources: { electricity: 0.32, transport: 0.25, industry: 0.22, buildings: 0.08, agriculture: 0.13 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.10, gasShare: 0.35, nuclearShare: 0.08 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.65 }, forest: { score: 0.40 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.25 } },
    facts: ["Low per capita emissions", "High solar potential", "Major hydro capacity"],
  },

  bangladesh: {
    name: "Bangladesh",
    region: "asia",
    population: 170,
    gdp: 0.42,
    emissions: {
      total: 0.10,
      perCapita: 0.6,
      trend: 6.0,
      sources: { electricity: 0.35, transport: 0.20, industry: 0.25, buildings: 0.10, agriculture: 0.10 },
    },
    energy: { renewableShare: 0.05, coalShare: 0.02, gasShare: 0.90, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.45 }, forest: { score: 0.30 }, carbonCapture: { score: 0.25 }, geothermal: { score: 0.15 } },
    facts: ["Most climate-vulnerable major nation", "World's largest solar home system program", "Very low per capita emissions"],
  },

  vietnam: {
    name: "Vietnam",
    region: "asia",
    population: 98,
    gdp: 0.41,
    emissions: {
      total: 0.33,
      perCapita: 3.4,
      trend: 5.5,
      sources: { electricity: 0.38, transport: 0.15, industry: 0.30, buildings: 0.08, agriculture: 0.09 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.50, gasShare: 0.08, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.55 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.20 } },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.25, reason: "Fastest growing solar market in Asia" },
    },
    facts: ["Fastest growing solar market in SE Asia", "Net zero target 2050", "Major manufacturing hub"],
  },

  thailand: {
    name: "Thailand",
    region: "asia",
    population: 70,
    gdp: 0.50,
    emissions: {
      total: 0.27,
      perCapita: 3.9,
      trend: 1.5,
      sources: { electricity: 0.35, transport: 0.28, industry: 0.25, buildings: 0.07, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.15, coalShare: 0.18, gasShare: 0.60, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.45 }, forest: { score: 0.50 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.20 } },
    facts: ["Major EV manufacturing hub", "Good solar resources", "Tourism economy"],
  },

  philippines: {
    name: "Philippines",
    region: "asia",
    population: 115,
    gdp: 0.40,
    emissions: {
      total: 0.16,
      perCapita: 1.4,
      trend: 4.0,
      sources: { electricity: 0.40, transport: 0.22, industry: 0.18, buildings: 0.12, agriculture: 0.08 },
    },
    energy: { renewableShare: 0.22, coalShare: 0.55, gasShare: 0.18, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.65 }, forest: { score: 0.45 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.85 } },
    projects: {
      geothermal: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "Second largest geothermal producer globally" },
    },
    facts: ["World's second largest geothermal producer", "Archipelago challenges", "High climate vulnerability"],
  },

  malaysia: {
    name: "Malaysia",
    region: "asia",
    population: 34,
    gdp: 0.41,
    emissions: {
      total: 0.26,
      perCapita: 7.7,
      trend: 2.0,
      sources: { electricity: 0.35, transport: 0.30, industry: 0.25, buildings: 0.05, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.20, coalShare: 0.38, gasShare: 0.40, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.40 }, forest: { score: 0.70 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.20 } },
    facts: ["Major palm oil producer", "Rainforest conservation needed", "Growing solar sector"],
  },

  singapore: {
    name: "Singapore",
    region: "asia",
    population: 6,
    gdp: 0.52,
    emissions: {
      total: 0.05,
      perCapita: 8.0,
      trend: -1.0,
      sources: { electricity: 0.40, transport: 0.20, industry: 0.30, buildings: 0.08, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.05, coalShare: 0.00, gasShare: 0.95, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.20 }, forest: { score: 0.10 }, carbonCapture: { score: 0.60 }, geothermal: { score: 0.10 } },
    facts: ["City-state limited land", "Regional green finance hub", "Importing solar from neighbors"],
  },

  taiwan: {
    name: "Taiwan",
    region: "asia",
    population: 24,
    gdp: 0.79,
    emissions: {
      total: 0.27,
      perCapita: 11.3,
      trend: -1.5,
      sources: { electricity: 0.40, transport: 0.15, industry: 0.35, buildings: 0.08, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.10, coalShare: 0.42, gasShare: 0.40, nuclearShare: 0.08 },
    potential: { solar: { score: 0.70 }, wind: { score: 0.80 }, forest: { score: 0.35 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.40 } },
    facts: ["Major semiconductor manufacturing", "Offshore wind expansion", "Nuclear phase-out planned"],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL MIDDLE EAST COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  iraq: {
    name: "Iraq",
    region: "asia",
    population: 43,
    gdp: 0.27,
    emissions: {
      total: 0.22,
      perCapita: 5.1,
      trend: 2.5,
      sources: { electricity: 0.35, transport: 0.25, industry: 0.30, buildings: 0.05, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.02, coalShare: 0.00, gasShare: 0.30, nuclearShare: 0.00, oilShare: 0.68 },
    potential: { solar: { score: 0.95 }, wind: { score: 0.55 }, forest: { score: 0.15 }, carbonCapture: { score: 0.65 }, geothermal: { score: 0.25 } },
    facts: ["Major oil producer", "Excellent solar potential untapped", "Gas flaring issues"],
  },

  kuwait: {
    name: "Kuwait",
    region: "asia",
    population: 4,
    gdp: 0.18,
    emissions: {
      total: 0.10,
      perCapita: 23.0,
      trend: 0.5,
      sources: { electricity: 0.55, transport: 0.20, industry: 0.18, buildings: 0.05, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.01, coalShare: 0.00, gasShare: 0.25, nuclearShare: 0.00, oilShare: 0.74 },
    potential: { solar: { score: 0.98 }, wind: { score: 0.50 }, forest: { score: 0.05 }, carbonCapture: { score: 0.70 }, geothermal: { score: 0.15 } },
    facts: ["Among highest per capita emissions", "Oil-dependent economy", "Extreme solar potential"],
  },

  qatar: {
    name: "Qatar",
    region: "asia",
    population: 3,
    gdp: 0.23,
    emissions: {
      total: 0.11,
      perCapita: 35.6,
      trend: 1.0,
      sources: { electricity: 0.35, transport: 0.15, industry: 0.40, buildings: 0.08, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.01, coalShare: 0.00, gasShare: 0.99, nuclearShare: 0.00 },
    potential: { solar: { score: 0.95 }, wind: { score: 0.45 }, forest: { score: 0.05 }, carbonCapture: { score: 0.80 }, geothermal: { score: 0.15 } },
    facts: ["Highest per capita emissions globally", "World's largest LNG exporter", "FIFA 2022 host"],
  },

  israel: {
    name: "Israel",
    region: "asia",
    population: 9,
    gdp: 0.52,
    emissions: {
      total: 0.07,
      perCapita: 7.5,
      trend: -2.0,
      sources: { electricity: 0.40, transport: 0.28, industry: 0.15, buildings: 0.12, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.10, coalShare: 0.20, gasShare: 0.65, nuclearShare: 0.00 },
    potential: { solar: { score: 0.90 }, wind: { score: 0.50 }, forest: { score: 0.30 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.30 } },
    facts: ["Pioneer in solar thermal tech", "Rapid natural gas shift", "Water desalination leader"],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL AFRICAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  morocco: {
    name: "Morocco",
    region: "africa",
    population: 37,
    gdp: 0.13,
    emissions: {
      total: 0.07,
      perCapita: 1.9,
      trend: 2.5,
      sources: { electricity: 0.38, transport: 0.25, industry: 0.20, buildings: 0.10, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.20, coalShare: 0.52, gasShare: 0.10, nuclearShare: 0.00 },
    potential: { solar: { score: 0.95 }, wind: { score: 0.80 }, forest: { score: 0.35 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.25 } },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Home to Noor Ouarzazate, world's largest concentrated solar plant" },
    },
    facts: ["Noor - world's largest concentrated solar plant", "52% renewable target by 2030", "Green hydrogen ambitions"],
  },

  algeria: {
    name: "Algeria",
    region: "africa",
    population: 45,
    gdp: 0.19,
    emissions: {
      total: 0.18,
      perCapita: 4.0,
      trend: 1.5,
      sources: { electricity: 0.40, transport: 0.28, industry: 0.20, buildings: 0.07, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.02, coalShare: 0.00, gasShare: 0.98, nuclearShare: 0.00 },
    potential: { solar: { score: 0.98 }, wind: { score: 0.65 }, forest: { score: 0.15 }, carbonCapture: { score: 0.55 }, geothermal: { score: 0.30 } },
    facts: ["Sahara - world's best solar potential", "Major gas exporter", "Vast untapped renewable resources"],
  },

  kenya: {
    name: "Kenya",
    region: "africa",
    population: 54,
    gdp: 0.11,
    emissions: {
      total: 0.02,
      perCapita: 0.4,
      trend: 4.0,
      sources: { electricity: 0.15, transport: 0.30, industry: 0.15, buildings: 0.10, agriculture: 0.30 },
    },
    energy: { renewableShare: 0.90, coalShare: 0.00, gasShare: 0.00, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.75 }, forest: { score: 0.55 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.85 } },
    projects: {
      geothermal: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Rift Valley geothermal powerhouse" },
    },
    facts: ["90% renewable electricity", "Rift Valley geothermal leader", "Mobile money pioneer"],
  },

  ethiopia: {
    name: "Ethiopia",
    region: "africa",
    population: 120,
    gdp: 0.13,
    emissions: {
      total: 0.02,
      perCapita: 0.2,
      trend: 5.0,
      sources: { electricity: 0.05, transport: 0.20, industry: 0.10, buildings: 0.10, agriculture: 0.55 },
    },
    energy: { renewableShare: 0.95, coalShare: 0.00, gasShare: 0.00, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.70 }, forest: { score: 0.60 }, carbonCapture: { score: 0.25 }, geothermal: { score: 0.70 } },
    facts: ["Nearly 100% renewable electricity", "Grand Ethiopian Renaissance Dam", "Very low per capita emissions"],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL AMERICAS COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  chile: {
    name: "Chile",
    region: "south_america",
    population: 19,
    gdp: 0.30,
    emissions: {
      total: 0.09,
      perCapita: 4.7,
      trend: -3.0,
      sources: { electricity: 0.30, transport: 0.28, industry: 0.25, buildings: 0.10, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.55, coalShare: 0.20, gasShare: 0.15, nuclearShare: 0.00 },
    potential: { solar: { score: 0.98 }, wind: { score: 0.85 }, forest: { score: 0.50 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.65 } },
    projects: {
      solar: { costMultiplier: 0.65, effectMultiplier: 1.50, reason: "Atacama Desert - world's best solar irradiance" },
    },
    facts: ["Atacama - world's best solar radiation", "Green hydrogen ambitions", "Copper mining major emitter"],
  },

  colombia: {
    name: "Colombia",
    region: "south_america",
    population: 52,
    gdp: 0.34,
    emissions: {
      total: 0.10,
      perCapita: 1.9,
      trend: 1.0,
      sources: { electricity: 0.10, transport: 0.35, industry: 0.20, buildings: 0.10, agriculture: 0.25 },
    },
    energy: { renewableShare: 0.75, coalShare: 0.08, gasShare: 0.15, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.85 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.35 } },
    facts: ["75% renewable electricity (hydro)", "Amazon rainforest portion", "Coal export phase-out"],
  },

  peru: {
    name: "Peru",
    region: "south_america",
    population: 34,
    gdp: 0.24,
    emissions: {
      total: 0.06,
      perCapita: 1.8,
      trend: 2.0,
      sources: { electricity: 0.15, transport: 0.30, industry: 0.25, buildings: 0.08, agriculture: 0.22 },
    },
    energy: { renewableShare: 0.60, coalShare: 0.02, gasShare: 0.35, nuclearShare: 0.00 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.70 }, forest: { score: 0.80 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.50 } },
    facts: ["Amazon rainforest protection", "High Andes solar potential", "Mining sector challenges"],
  },

  venezuela: {
    name: "Venezuela",
    region: "south_america",
    population: 28,
    gdp: 0.10,
    emissions: {
      total: 0.12,
      perCapita: 4.3,
      trend: -5.0,
      sources: { electricity: 0.12, transport: 0.35, industry: 0.30, buildings: 0.08, agriculture: 0.15 },
    },
    energy: { renewableShare: 0.68, coalShare: 0.00, gasShare: 0.08, nuclearShare: 0.00, oilShare: 0.24 },
    potential: { solar: { score: 0.85 }, wind: { score: 0.60 }, forest: { score: 0.70 }, carbonCapture: { score: 0.55 }, geothermal: { score: 0.20 } },
    facts: ["Large hydropower from Guri Dam", "Major oil reserves", "Economic crisis affecting energy"],
  },

  // ═══════════════════════════════════════════════════════════════
  // OCEANIA - ADDITIONAL
  // ═══════════════════════════════════════════════════════════════

  new_zealand: {
    name: "New Zealand",
    region: "oceania",
    population: 5,
    gdp: 0.25,
    emissions: {
      total: 0.04,
      perCapita: 7.0,
      trend: -3.0,
      sources: { electricity: 0.05, transport: 0.25, industry: 0.15, buildings: 0.10, agriculture: 0.45 },
    },
    energy: { renewableShare: 0.85, coalShare: 0.02, gasShare: 0.12, nuclearShare: 0.00 },
    potential: { solar: { score: 0.55 }, wind: { score: 0.85 }, forest: { score: 0.70 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.80 } },
    projects: {
      geothermal: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Geothermal pioneer since 1950s" },
    },
    facts: ["85% renewable electricity", "High agricultural emissions", "Geothermal pioneer"],
  },

  papua_new_guinea: {
    name: "Papua New Guinea",
    region: "oceania",
    population: 10,
    gdp: 0.03,
    emissions: {
      total: 0.01,
      perCapita: 0.8,
      trend: 3.0,
      sources: { electricity: 0.20, transport: 0.25, industry: 0.20, buildings: 0.05, agriculture: 0.30 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.00, gasShare: 0.60, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.45 }, forest: { score: 0.95 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.60 } },
    facts: ["Third largest rainforest", "LNG exporter", "High forest carbon potential"],
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

// ═══════════════════════════════════════════════════════════════
// GRANULARITY AGGREGATION FUNCTIONS
// Support for 3-tier granularity: Continents → Major Regions → Countries
// ═══════════════════════════════════════════════════════════════

/**
 * Get country data by ISO code, with fallback to regional defaults
 */
function getCountryByIso(isoCode) {
  const key = ISO_TO_KEY[isoCode];
  if (key && COUNTRY_DATA[key]) {
    return COUNTRY_DATA[key];
  }
  return null;
}

/**
 * Create default data for a country that lacks complete data
 * Uses regional averages from available countries in same major region
 */
function createDefaultCountryData(isoCode, majorRegionId) {
  const region = MAJOR_REGIONS[majorRegionId];
  if (!region) return null;

  // Find countries in same region with data
  const regionCountries = region.countries
    .map((iso) => getCountryByIso(iso))
    .filter(Boolean);

  if (regionCountries.length === 0) {
    // Absolute fallback: minimal default data
    return {
      name: isoCode,
      iso: isoCode,
      region: region.continent,
      majorRegion: majorRegionId,
      population: 1,
      gdp: 0.01,
      emissions: {
        total: 0.001,
        perCapita: 1.0,
        trend: 0,
        sources: {
          electricity: 0.35,
          transport: 0.25,
          industry: 0.20,
          buildings: 0.12,
          agriculture: 0.08,
        },
      },
      energy: {
        renewableShare: 0.20,
        coalShare: 0.30,
        gasShare: 0.25,
        nuclearShare: 0.05,
      },
      potential: {
        solar: { score: 0.50 },
        wind: { score: 0.50 },
        forest: { score: 0.50 },
        carbonCapture: { score: 0.50 },
        geothermal: { score: 0.30 },
      },
      estimated: true,
    };
  }

  // Use regional average per capita emissions
  const avgPerCapita =
    regionCountries.reduce((sum, c) => sum + c.emissions.perCapita, 0) /
    regionCountries.length;

  // Average emission sources (weighted by total emissions)
  const totalEmissions = regionCountries.reduce(
    (sum, c) => sum + c.emissions.total,
    0
  );
  const avgSources = {};
  ["electricity", "transport", "industry", "buildings", "agriculture"].forEach(
    (key) => {
      avgSources[key] =
        regionCountries.reduce(
          (sum, c) => sum + (c.emissions.sources[key] || 0) * c.emissions.total,
          0
        ) / totalEmissions;
    }
  );

  // Average potentials
  const avgPotential = {};
  ["solar", "wind", "forest", "carbonCapture", "geothermal"].forEach((key) => {
    const scores = regionCountries
      .map((c) => {
        const p = c.potential?.[key];
        return typeof p === "object" ? p.score : p;
      })
      .filter((s) => s !== undefined);
    avgPotential[key] = {
      score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5,
    };
  });

  return {
    name: isoCode,
    iso: isoCode,
    region: region.continent,
    majorRegion: majorRegionId,
    population: 1, // Will be overridden if known
    gdp: 0.01,
    emissions: {
      total: avgPerCapita * 0.001, // Assume 1 million population
      perCapita: avgPerCapita,
      trend: 0,
      sources: avgSources,
    },
    energy: {
      renewableShare: 0.20,
      coalShare: 0.30,
      gasShare: 0.25,
      nuclearShare: 0.05,
    },
    potential: avgPotential,
    estimated: true,
  };
}

/**
 * Aggregate multiple countries into a single region data object
 * @param {string[]} countryIsoCodes - Array of ISO country codes
 * @param {string} regionName - Name for the aggregated region
 * @param {string} regionId - ID for the aggregated region
 */
function aggregateCountriesToRegion(countryIsoCodes, regionName, regionId) {
  const countries = countryIsoCodes
    .map((iso) => {
      const data = getCountryByIso(iso);
      if (data) return data;
      // Find which major region this country belongs to
      for (const [mrId, mr] of Object.entries(MAJOR_REGIONS)) {
        if (mr.countries.includes(iso)) {
          return createDefaultCountryData(iso, mrId);
        }
      }
      return null;
    })
    .filter(Boolean);

  if (countries.length === 0) return null;

  // Sum totals
  const totalPopulation = countries.reduce((sum, c) => sum + (c.population || 0), 0);
  const totalGdp = countries.reduce((sum, c) => sum + (c.gdp || 0), 0);
  const totalEmissions = countries.reduce((sum, c) => sum + c.emissions.total, 0);

  // Weighted average for per-capita emissions
  const avgPerCapita =
    totalPopulation > 0 ? (totalEmissions / totalPopulation) * 1000 : 0;

  // Weighted average for emission sources (by total emissions)
  const sources = {};
  ["electricity", "transport", "industry", "buildings", "agriculture"].forEach(
    (key) => {
      if (totalEmissions > 0) {
        sources[key] =
          countries.reduce(
            (sum, c) =>
              sum + (c.emissions.sources[key] || 0) * c.emissions.total,
            0
          ) / totalEmissions;
      } else {
        sources[key] = 0.2;
      }
    }
  );

  // GDP-weighted average for potential scores
  const potential = {};
  ["solar", "wind", "forest", "carbonCapture", "geothermal"].forEach((key) => {
    if (totalGdp > 0) {
      const weightedSum = countries.reduce((sum, c) => {
        const p = c.potential?.[key];
        const score = typeof p === "object" ? p.score : p || 0.5;
        return sum + score * (c.gdp || 0.01);
      }, 0);
      potential[key] = { score: weightedSum / totalGdp };
    } else {
      potential[key] = { score: 0.5 };
    }
  });

  // Sum base income
  const baseIncome = countries.reduce((sum, c) => {
    // Calculate income from GDP if not specified
    const income = c.baseIncome || Math.max(1, Math.round(c.gdp * 0.5));
    return sum + income;
  }, 0);

  // Collect facts
  const facts = countries
    .flatMap((c) => c.facts || [])
    .filter(Boolean)
    .slice(0, 6);

  return {
    name: regionName,
    region: regionId,
    population: totalPopulation,
    gdp: totalGdp,
    baseIncome: baseIncome,
    emissions: {
      total: totalEmissions,
      perCapita: avgPerCapita,
      sources,
    },
    potential,
    facts,
    aggregated: true,
    countryCount: countries.length,
  };
}

/**
 * Get data for a major region by aggregating its countries
 */
function getMajorRegionData(majorRegionId) {
  const region = MAJOR_REGIONS[majorRegionId];
  if (!region) return null;

  return aggregateCountriesToRegion(
    region.countries,
    region.name,
    majorRegionId
  );
}

/**
 * Get data for a continent by aggregating all its major regions
 */
function getContinentData(continentId) {
  const continent = CONTINENTS[continentId];
  if (!continent) return null;

  // Collect all countries from all major regions in this continent
  const allCountries = continent.majorRegions.flatMap((mrId) => {
    const mr = MAJOR_REGIONS[mrId];
    return mr ? mr.countries : [];
  });

  return aggregateCountriesToRegion(allCountries, continent.name, continentId);
}

/**
 * Get data for any granularity level
 * @param {number} level - 1=continents, 2=major_regions, 3=countries
 * @param {string} id - Region/country ID (ISO code for countries, region key for others)
 */
function getDataForGranularity(level, id) {
  switch (level) {
    case 1: // Continents
      return getContinentData(id);
    case 2: // Major Regions
      return getMajorRegionData(id);
    case 3: // Countries
      const countryData = getCountryByIso(id) || getClimateData(id);
      if (countryData) return countryData;
      // Try to find which major region this country belongs to
      for (const [mrId, mr] of Object.entries(MAJOR_REGIONS)) {
        if (mr.countries.includes(id)) {
          return createDefaultCountryData(id, mrId);
        }
      }
      return null;
    default:
      return null;
  }
}

/**
 * Get all region IDs for a given granularity level
 * @param {number} level - 1=continents, 2=major_regions, 3=countries
 */
function getRegionIdsForGranularity(level) {
  switch (level) {
    case 1:
      return Object.keys(CONTINENTS);
    case 2:
      return Object.keys(MAJOR_REGIONS);
    case 3:
      return Object.keys(ISO_TO_KEY);
    default:
      return [];
  }
}

/**
 * Map a country ISO code to its parent region at a given granularity
 * @param {string} isoCode - Country ISO code
 * @param {number} level - Target granularity level
 */
function getParentRegion(isoCode, level) {
  if (level === 3) return isoCode;

  // Find the major region containing this country
  for (const [mrId, mr] of Object.entries(MAJOR_REGIONS)) {
    if (mr.countries.includes(isoCode)) {
      if (level === 2) return mrId;
      if (level === 1) return mr.continent;
    }
  }
  return null;
}

// Export for use in game.js
if (typeof window !== "undefined") {
  window.CLIMATE_DATA = {
    // Data constants
    COUNTRY_DATA,
    REGION_AGGREGATES,
    EMISSION_SECTORS,
    ADVANCED_PROJECT_TYPES,
    // New 3-tier granularity constants
    ISO_TO_KEY,
    MAJOR_REGIONS,
    CONTINENTS,
    // Original functions
    getClimateData,
    calculateProjectEffectiveness,
    getRandomFact,
    // New granularity functions
    getCountryByIso,
    getDataForGranularity,
    getRegionIdsForGranularity,
    getParentRegion,
    getMajorRegionData,
    getContinentData,
    aggregateCountriesToRegion,
  };
}
