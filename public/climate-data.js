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
    developmentLevel: "developing",
    continent: "africa",
    countries: ["DZ", "EG", "LY", "MA", "SD", "TN", "EH"],
    power: {
      baseDemandGW: 45,        // Real 2024: ~350 TWh / 8760 hrs ≈ 40 GW average
      demandGrowthRate: 0.04,  // 4% annual growth (developing economies)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 14,              // 4% - minimal coal (Morocco)
        gas: 245,              // 70% - Egypt, Algeria gas dominant
        nuclear: 0,            // 0% - no nuclear yet (Egypt building)
        hydro: 35,             // 10% - Egypt Aswan, Morocco
        wind: 28,              // 8% - Morocco world leader
        solar: 21,             // 6% - Morocco Noor, Egypt Benban
        other: 7,              // 2% - oil, diesel
      },
      potentialGW: {
        solar: 2000,           // Sahara Desert excellent
        wind: 400,             // Morocco Atlantic coast
        hydro: 50,             // Nile, limited remaining
        geothermal: 20,        // Limited
        nuclear: 30,           // Egypt Dabaa under construction
      },
    },
  },
  sub_saharan_africa: {
    name: "Sub-Saharan Africa",
    developmentLevel: "developing",
    continent: "africa",
    countries: [
      "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM",
      "CG", "CD", "CI", "DJ", "GQ", "ER", "SZ", "ET", "GA", "GM",
      "GH", "GN", "GW", "KE", "LS", "LR", "MG", "MW", "ML", "MR",
      "MU", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL",
      "SO", "ZA", "SS", "TZ", "TG", "UG", "ZM", "ZW",
    ],
    power: {
      baseDemandGW: 65,        // Real 2024: ~550 TWh / 8760 hrs ≈ 63 GW average
      demandGrowthRate: 0.06,  // 6% annual growth (fastest globally)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 256,             // 47% - South Africa Eskom coal
        gas: 25,               // 5% - Nigeria gas plants
        nuclear: 18,           // 3% - South Africa Koeberg only
        hydro: 145,            // 26% - DRC Inga, Ethiopia GERD
        wind: 17,              // 3% - South Africa, Kenya
        solar: 42,             // 8% - growing across continent
        other: 47,             // 8% - diesel generators widespread
      },
      potentialGW: {
        solar: 1000,           // Best solar resource in world
        wind: 400,             // East Africa highlands, SA coast
        hydro: 350,            // Congo River massive untapped
        geothermal: 80,        // East African Rift
        nuclear: 10,           // Limited infrastructure
      },
    },
  },

  // ASIA
  west_asia: {
    name: "West Asia",
    developmentLevel: "oilEconomy",
    continent: "asia",
    countries: [
      "AM", "AZ", "BH", "CY", "GE", "IQ", "IL", "IR", "JO", "KW", "LB",
      "OM", "PS", "QA", "SA", "SY", "TR", "AE", "YE",
    ],
    power: {
      baseDemandGW: 180,       // Real 2024: ~1,400 TWh / 8760 hrs ≈ 160 GW average
      demandGrowthRate: 0.035, // 3.5% annual growth (oil economies diversifying)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 98,              // 7% - Turkey, Israel coal plants
        gas: 1050,             // 75% - dominant fuel (Saudi, UAE, Iran)
        nuclear: 42,           // 3% - UAE Barakah, Iran Bushehr
        hydro: 112,            // 8% - Turkey major hydro
        wind: 56,              // 4% - Turkey, Saudi Arabia
        solar: 28,             // 2% - UAE, Saudi growing fast
        other: 14,             // 1% - oil-fired plants
      },
      potentialGW: {
        solar: 1500,           // Arabian Desert excellent
        wind: 600,             // Turkey, Red Sea coast
        hydro: 100,            // Turkey mostly developed
        geothermal: 30,        // Turkey has some
        nuclear: 80,           // UAE expanding, Saudi planned
      },
    },
  },
  central_asia: {
    name: "Central Asia",
    developmentLevel: "developing",
    continent: "asia",
    countries: ["KZ", "KG", "TJ", "TM", "UZ"],
    power: {
      baseDemandGW: 35,        // Real 2024: ~270 TWh / 8760 hrs ≈ 31 GW average
      demandGrowthRate: 0.03,  // 3% annual growth
      currentMixTWh: {         // Real 2024 generation by source
        coal: 81,              // 30% - Kazakhstan coal dominant
        gas: 108,              // 40% - Turkmenistan, Uzbekistan gas
        nuclear: 0,            // 0% - Kazakhstan planning nuclear
        hydro: 68,             // 25% - Tajikistan, Kyrgyzstan hydro
        wind: 5,               // 2% - Kazakhstan wind growing
        solar: 5,              // 2% - starting to develop
        other: 3,              // 1% - oil
      },
      potentialGW: {
        solar: 300,            // Good solar in steppes
        wind: 400,             // Kazakhstan excellent wind
        hydro: 150,            // Mountain rivers
        geothermal: 10,        // Limited
        nuclear: 20,           // Kazakhstan considering
      },
    },
  },
  south_asia: {
    name: "South Asia",
    developmentLevel: "developing",
    continent: "asia",
    countries: ["AF", "BD", "BT", "IN", "MV", "NP", "PK", "LK"],
    power: {
      baseDemandGW: 350,       // Real 2024: ~2,500 TWh / 8760 hrs ≈ 285 GW average
      demandGrowthRate: 0.055, // 5.5% annual growth (India driving)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 1625,            // 65% - India 75% coal, Pakistan coal
        gas: 175,              // 7% - Bangladesh, Pakistan gas
        nuclear: 75,           // 3% - India, Pakistan reactors
        hydro: 250,            // 10% - India, Bhutan, Nepal
        wind: 175,             // 7% - India wind leader
        solar: 175,            // 7% - India solar fastest growing
        other: 25,             // 1% - biomass, diesel
      },
      potentialGW: {
        solar: 2000,           // India Rajasthan, Pakistan Sindh
        wind: 800,             // India Tamil Nadu, Gujarat coast
        hydro: 200,            // Himalayas remaining potential
        geothermal: 30,        // Limited
        nuclear: 100,          // India expanding rapidly
      },
    },
  },
  east_asia: {
    name: "East Asia",
    developmentLevel: "emerging",
    continent: "asia",
    countries: ["CN", "JP", "KP", "KR", "MN", "TW", "HK", "MO"],
    power: {
      baseDemandGW: 1600,      // Real 2024: ~12,000 TWh / 8760 hrs ≈ 1,370 GW average
      demandGrowthRate: 0.04,  // 4% annual growth (China driving)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 6000,            // 50% - China 58% coal dominant
        gas: 960,              // 8% - Japan LNG, Korea gas
        nuclear: 720,          // 6% - China, Japan, Korea
        hydro: 1680,           // 14% - China Three Gorges
        wind: 1080,            // 9% - China 40% of global wind
        solar: 1320,           // 11% - China adding 200GW/year
        other: 240,            // 2% - biomass, geothermal
      },
      potentialGW: {
        solar: 3000,           // China Gobi, western provinces
        wind: 2000,            // China coast, Mongolia steppes
        hydro: 300,            // China remaining
        geothermal: 100,       // Japan volcanic
        nuclear: 200,          // China expanding rapidly
      },
    },
  },
  southeast_asia: {
    name: "Southeast Asia",
    developmentLevel: "emerging",
    continent: "asia",
    countries: ["BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "TH", "TL", "VN"],
    power: {
      baseDemandGW: 130,       // Real 2024: ~1,000 TWh / 8760 hrs ≈ 114 GW average
      demandGrowthRate: 0.05,  // 5% annual growth (rapid industrialization)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 450,             // 45% - Indonesia, Vietnam coal heavy
        gas: 280,              // 28% - Thailand, Malaysia gas
        nuclear: 0,            // 0% - none yet (Vietnam cancelled)
        hydro: 150,            // 15% - Vietnam, Laos, Myanmar
        wind: 20,              // 2% - Vietnam wind growing
        solar: 70,             // 7% - Vietnam, Thailand solar
        other: 30,             // 3% - geothermal (Indonesia, Philippines)
      },
      potentialGW: {
        solar: 800,            // Equatorial excellent
        wind: 300,             // Vietnam, Thailand coast
        hydro: 150,            // Mekong River basin
        geothermal: 150,       // Indonesia, Philippines volcanic
        nuclear: 30,           // Political resistance
      },
    },
  },

  // EUROPE
  northern_europe: {
    name: "Northern Europe",
    developmentLevel: "developed",
    continent: "europe",
    countries: ["DK", "EE", "FI", "IS", "IE", "LV", "LT", "NO", "SE", "GB"],
    power: {
      baseDemandGW: 80,        // Real 2024: ~600 TWh / 8760 hrs ≈ 68 GW average
      demandGrowthRate: 0.01,  // 1% annual growth (mature, electrification)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 18,              // 3% - UK phasing out, Poland imports
        gas: 120,              // 20% - UK dominant gas user
        nuclear: 84,           // 14% - UK, Finland, Sweden
        hydro: 180,            // 30% - Norway 98% hydro, Sweden
        wind: 156,             // 26% - Denmark leader, UK offshore
        solar: 30,             // 5% - UK, limited northern sun
        other: 12,             // 2% - biomass (Finland), geothermal (Iceland)
      },
      potentialGW: {
        solar: 100,            // Limited due to latitude
        wind: 400,             // North Sea excellent offshore
        hydro: 50,             // Norway, Sweden mostly developed
        geothermal: 20,        // Iceland excellent
        nuclear: 40,           // UK expanding, Finland new
      },
    },
  },
  western_europe: {
    name: "Western Europe",
    developmentLevel: "developed",
    continent: "europe",
    countries: ["AT", "BE", "FR", "DE", "LI", "LU", "MC", "NL", "CH"],
    power: {
      baseDemandGW: 130,       // Real 2024: ~1,000 TWh / 8760 hrs ≈ 114 GW average
      demandGrowthRate: 0.005, // 0.5% annual growth (mature, efficient)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 80,              // 8% - Germany lignite, phasing out
        gas: 100,              // 10% - Netherlands, Belgium gas
        nuclear: 420,          // 42% - France 70% nuclear dominant
        hydro: 100,            // 10% - Switzerland, Austria Alps
        wind: 200,             // 20% - Germany, Netherlands leaders
        solar: 90,             // 9% - Germany solar leader
        other: 10,             // 1% - biomass
      },
      potentialGW: {
        solar: 150,            // Germany, France rooftop
        wind: 250,             // North Sea, onshore Germany
        hydro: 80,             // Alps mostly developed
        geothermal: 10,        // Limited
        nuclear: 60,           // France maintaining, Germany exited
      },
    },
  },
  southern_europe: {
    name: "Southern Europe",
    developmentLevel: "developed",
    continent: "europe",
    countries: [
      "AL", "AD", "BA", "HR", "GR", "IT", "MT", "ME", "MK", "PT",
      "SM", "RS", "SI", "ES", "VA", "XK",
    ],
    power: {
      baseDemandGW: 90,        // Real 2024: ~700 TWh / 8760 hrs ≈ 80 GW average
      demandGrowthRate: 0.008, // 0.8% annual growth
      currentMixTWh: {         // Real 2024 generation by source
        coal: 42,              // 6% - Greece, Serbia coal
        gas: 210,              // 30% - Italy gas dominant
        nuclear: 0,            // 0% - Italy exited, Spain phasing
        hydro: 105,            // 15% - Spain, Italy, Portugal
        wind: 175,             // 25% - Spain wind leader
        solar: 154,            // 22% - Spain, Italy excellent solar
        other: 14,             // 2% - geothermal (Italy), biomass
      },
      potentialGW: {
        solar: 300,            // Best in Europe (Spain, Italy, Greece)
        wind: 200,             // Spain excellent, offshore
        hydro: 50,             // Limited remaining
        geothermal: 20,        // Italy volcanic
        nuclear: 20,           // Political opposition
      },
    },
  },
  eastern_europe: {
    name: "Eastern Europe",
    developmentLevel: "emerging",
    continent: "europe",
    countries: ["BY", "BG", "CZ", "HU", "MD", "PL", "RO", "RU", "SK", "UA"],
    power: {
      baseDemandGW: 230,       // Real 2024: ~1,700 TWh / 8760 hrs ≈ 194 GW average
      demandGrowthRate: 0.01,  // 1% annual growth (Russia stable)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 300,             // 18% - Poland 70% coal, Russia coal
        gas: 680,              // 40% - Russia gas dominant
        nuclear: 416,          // 24% - Russia, Ukraine, Czech
        hydro: 175,            // 10% - Russia hydro
        wind: 60,              // 4% - Poland, Romania growing
        solar: 35,             // 2% - Poland, Hungary growing
        other: 34,             // 2% - biomass, waste
      },
      potentialGW: {
        solar: 200,            // Southern Poland, Romania
        wind: 300,             // Poland Baltic, Russia
        hydro: 100,            // Russia Siberia remaining
        geothermal: 20,        // Limited
        nuclear: 80,           // Russia expanding, Poland planned
      },
    },
  },

  // AMERICAS
  north_america: {
    name: "North America",
    developmentLevel: "developed",
    continent: "north_america",
    countries: ["CA", "US", "MX", "GL"],
    power: {
      baseDemandGW: 550,       // Real 2024: ~4,800 TWh / 8760 hrs ≈ 548 GW average
      demandGrowthRate: 0.018, // 1.8% annual growth (data centers, EVs)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 768,             // 16% - US declining, Mexico
        gas: 1920,             // 40% - US gas dominant
        nuclear: 864,          // 18% - US 94 reactors
        hydro: 480,            // 10% - Canada hydropower
        wind: 528,             // 11% - US wind corridor
        solar: 288,            // 6% - US Southwest, Mexico
        other: 52,             // 1% - geothermal, biomass
      },
      potentialGW: {
        solar: 3000,           // US Southwest, Mexico
        wind: 2000,            // US Great Plains
        hydro: 200,            // Canada remaining
        geothermal: 50,        // US West, Mexico
        nuclear: 150,          // US SMRs potential
      },
    },
  },
  central_america_caribbean: {
    name: "Central America & Caribbean",
    developmentLevel: "developing",
    continent: "north_america",
    countries: [
      "AI", "AG", "AW", "BS", "BB", "BZ", "BM", "VG", "KY", "CR",
      "CU", "CW", "DM", "DO", "SV", "GD", "GP", "GT", "HT", "HN",
      "JM", "MQ", "NI", "PA", "PR", "KN", "LC", "MF", "VC", "SX",
      "TT", "TC", "VI",
    ],
    power: {
      baseDemandGW: 15,        // Real 2024: ~100 TWh / 8760 hrs ≈ 11 GW average
      demandGrowthRate: 0.03,  // 3% annual growth
      currentMixTWh: {         // Real 2024 generation by source
        coal: 3,               // 3% - minimal coal
        gas: 35,               // 35% - Trinidad gas, Cuba
        nuclear: 0,            // 0% - no nuclear
        hydro: 20,             // 20% - Costa Rica, Guatemala
        wind: 8,               // 8% - Costa Rica, Caribbean islands
        solar: 12,             // 12% - growing across region
        other: 22,             // 22% - oil/diesel islands, geothermal Costa Rica
      },
      potentialGW: {
        solar: 200,            // Excellent Caribbean sun
        wind: 100,             // Trade winds
        hydro: 50,             // Central American rivers
        geothermal: 40,        // Costa Rica, Guatemala volcanic
        nuclear: 0,            // Not practical for small grids
      },
    },
  },
  south_america: {
    name: "South America",
    developmentLevel: "emerging",
    continent: "south_america",
    countries: [
      "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY",
      "PE", "SR", "UY", "VE",
    ],
    power: {
      baseDemandGW: 190,       // Real 2024: ~1,550 TWh / 8760 hrs ≈ 177 GW average
      demandGrowthRate: 0.03,  // 3% annual growth
      currentMixTWh: {         // Real 2024 generation by source
        coal: 78,              // 5% - minimal coal
        gas: 233,              // 15% - Argentina, Colombia gas
        nuclear: 47,           // 3% - Argentina, Brazil
        hydro: 930,            // 60% - Brazil Itaipu dominates
        wind: 155,             // 10% - Brazil, Chile wind
        solar: 93,             // 6% - Chile Atacama, Brazil
        other: 14,             // 1% - biomass (sugarcane)
      },
      potentialGW: {
        solar: 1500,           // Chile Atacama best in world
        wind: 1200,            // Patagonia, Brazil coast
        hydro: 300,            // Amazon basin remaining
        geothermal: 80,        // Andes volcanic
        nuclear: 40,           // Limited interest
      },
    },
  },

  // OCEANIA
  oceania: {
    name: "Oceania",
    developmentLevel: "developed",
    continent: "oceania",
    countries: [
      "AU", "FJ", "PF", "GU", "KI", "MH", "FM", "NR", "NC", "NZ",
      "PW", "PG", "WS", "SB", "TO", "TV", "VU",
    ],
    power: {
      baseDemandGW: 55,        // Real 2024: ~340 TWh / 8760 hrs ≈ 39 GW average
      demandGrowthRate: 0.02,  // 2% annual growth (data centers, EVs)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 122,             // 36% - Australia coal declining
        gas: 68,               // 20% - Australia gas peakers
        nuclear: 0,            // 0% - banned in Australia
        hydro: 51,             // 15% - NZ, Tasmania, Snowy
        wind: 51,              // 15% - Australia, NZ south
        solar: 41,             // 12% - Australia rooftop boom
        other: 7,              // 2% - NZ geothermal, biomass
      },
      potentialGW: {
        solar: 1000,           // Australian outback excellent
        wind: 500,             // Southern coast, offshore
        hydro: 40,             // Snowy 2.0, NZ limited
        geothermal: 20,        // New Zealand
        nuclear: 0,            // Banned in Australia
      },
    },
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
    gdp: 19.23,
    emissions: {
      total: 11.9,
      perCapita: 10.8,
      trend: 0.8,
      sources: {
        electricity: 0.44,
        industry: 0.28,
        transport: 0.10,
        buildings: 0.10,
        agriculture: 0.08,
      },
    },
    energy: {
      renewableShare: 0.35,
      coalShare: 0.58,
      gasShare: 0.04,
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
      "Largest CO2 emitter, producing ~32% of global emissions",
      "Also world's largest investor in renewable energy",
      "Clean energy now over 10% of economy",
      "Has planted over 70 billion trees since 1978",
    ],
    climateFinance: {
      currentPercent: 2.5,
      maxPercent: 5.0,
      minPercent: 0.5,
      difficulty: 0.4,
      politicalResistance: 0.3,
    },
    disasterVulnerability: {
      heatWave: 0.7,      // Severe heat in northern/western regions
      hurricane: 0.4,     // Typhoons hit southern coast
      flooding: 0.8,      // Major river flooding (Yangtze, Yellow)
      drought: 0.5,       // Northern regions drought-prone
      wildfire: 0.3,      // Some forest fire risk
      extremeCold: 0.3,   // Northern regions get cold snaps
      resilience: 0.6,    // Improving infrastructure
    },
  },

  india: {
    name: "India",
    region: "asia",
    population: 1460,
    gdp: 4.19,
    emissions: {
      total: 2.9,
      perCapita: 2.0,
      trend: 3.9,
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
      coalShare: 0.73,
      gasShare: 0.03,
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
      "World's most populous country since 2023",
      "Third largest emitter but very low per capita emissions",
      "Home to the International Solar Alliance",
      "Aims for 500 GW renewable capacity by 2030",
    ],
    climateFinance: {
      currentPercent: 2.0,
      maxPercent: 6.5,
      minPercent: 0.5,
      difficulty: 0.5,
      politicalResistance: 0.4,
    },
    disasterVulnerability: {
      heatWave: 0.9,      // Extreme heat, especially in north
      hurricane: 0.5,     // Cyclones from Bay of Bengal
      flooding: 0.9,      // Monsoon flooding is severe
      drought: 0.6,       // Significant drought risk
      wildfire: 0.2,      // Limited wildfire risk
      extremeCold: 0.1,   // Minimal cold (Himalayan regions only)
      resilience: 0.3,    // Developing infrastructure
    },
  },

  japan: {
    name: "Japan",
    region: "asia",
    population: 125,
    gdp: 4.19,
    emissions: {
      total: 1.0,
      perCapita: 8.5,
      trend: -2.8,
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
      coalShare: 0.30,
      gasShare: 0.35,
      nuclearShare: 0.08,
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
      "Fourth largest economy in Asia",
      "Restarting nuclear power after Fukushima pause",
      "Leader in energy efficiency technology",
    ],
    climateFinance: {
      currentPercent: 1.2,
      maxPercent: 3.5,
      minPercent: 0.3,
      difficulty: 0.5,
      politicalResistance: 0.4,
    },
    disasterVulnerability: {
      heatWave: 0.5,      // Hot summers
      hurricane: 0.7,     // Typhoons are major threat
      flooding: 0.6,      // Monsoon flooding
      drought: 0.2,       // Limited drought
      wildfire: 0.2,      // Some forest fires
      extremeCold: 0.2,   // Cold winters
      resilience: 0.9,    // Excellent infrastructure
    },
  },

  south_korea: {
    name: "South Korea",
    region: "asia",
    population: 52,
    gdp: 1.76,
    emissions: {
      total: 0.59,
      perCapita: 11.6,
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
      renewableShare: 0.10,
      coalShare: 0.32,
      gasShare: 0.28,
      nuclearShare: 0.30,
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
      carbonPrice: 12,
      netZeroTarget: 2050,
      parisCommitment: -40,
    },
    facts: [
      "High per capita emissions due to heavy industry",
      "World's largest shipbuilding industry",
      "Strong push for green hydrogen economy",
      "Operates Asia's first emissions trading system",
    ],
    climateFinance: {
      currentPercent: 1.2,
      maxPercent: 3.0,
      minPercent: 0.3,
      difficulty: 0.4,
      politicalResistance: 0.3,
    },
    disasterVulnerability: {
      heatWave: 0.4,      // Summers can be hot
      hurricane: 0.5,     // Typhoons from Pacific
      flooding: 0.5,      // Monsoon-related
      drought: 0.2,       // Limited
      wildfire: 0.2,      // Some forest fires
      extremeCold: 0.3,   // Cold winters
      resilience: 0.85,   // Good infrastructure
    },
  },

  indonesia: {
    name: "Indonesia",
    region: "asia",
    population: 278,
    gdp: 1.47,
    emissions: {
      total: 0.69,
      perCapita: 2.5,
      trend: 5.0,
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
      carbonPrice: 0,
      netZeroTarget: 2060,
      parisCommitment: -32,
    },
    facts: [
      "World's third largest tropical rainforest",
      "Highest geothermal potential globally",
      "Major palm oil producer - deforestation concerns",
      "17,000+ islands create unique energy challenges",
    ],
    climateFinance: {
      currentPercent: 1.8,
      maxPercent: 5.0,
      minPercent: 0.4,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.6,      // Tropical heat
      hurricane: 0.0,     // Wrong latitude for hurricanes
      flooding: 0.8,      // Severe monsoon flooding
      drought: 0.3,       // Some regions
      wildfire: 0.6,      // Forest fires during dry season
      extremeCold: 0.0,   // Tropical - no cold
      resilience: 0.35,   // Developing infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTH AMERICA
  // ═══════════════════════════════════════════════════════════════

  usa: {
    name: "United States",
    region: "north_america",
    population: 347,
    gdp: 30.51,
    emissions: {
      total: 4.9,
      perCapita: 17.3,
      trend: 0.4,
      sources: {
        electricity: 0.25,
        transport: 0.28,
        industry: 0.23,
        buildings: 0.13,
        agriculture: 0.11,
      },
    },
    energy: {
      renewableShare: 0.23,
      coalShare: 0.16,
      gasShare: 0.40,
      nuclearShare: 0.18,
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
      netZeroTarget: null,
      parisCommitment: -50,
    },
    facts: [
      "Second largest emitter globally after China",
      "World's largest economy at $30+ trillion",
      "Natural gas dominates electricity generation (40%)",
      "Per capita emissions among highest in the world",
    ],
    climateFinance: {
      currentPercent: 0.9,
      maxPercent: 2.5,
      minPercent: 0.3,
      difficulty: 0.8,
      politicalResistance: 0.7,
    },
    disasterVulnerability: {
      heatWave: 0.5,      // Southwest heat, expanding
      hurricane: 0.6,     // Gulf Coast, East Coast
      flooding: 0.5,      // River flooding, coastal
      drought: 0.5,       // Southwest, California
      wildfire: 0.6,      // California, West
      extremeCold: 0.3,   // Northern states, polar vortex
      resilience: 0.7,    // Good but aging infrastructure
    },
  },

  canada: {
    name: "Canada",
    region: "north_america",
    population: 41,
    gdp: 2.24,
    emissions: {
      total: 0.68,
      perCapita: 19.8,
      trend: -1.0,
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -40,
    },
    facts: [
      "Already 68% renewable electricity (mostly hydro)",
      "High per capita emissions due to oil sands and cold climate",
      "Federal carbon price rising to $170/t by 2030",
      "World's second largest boreal forest",
    ],
    climateFinance: {
      currentPercent: 1.2,
      maxPercent: 3.5,
      minPercent: 0.3,
      difficulty: 0.5,
      politicalResistance: 0.45,
    },
    disasterVulnerability: {
      heatWave: 0.2,      // Rare, localized
      hurricane: 0.3,     // Atlantic coast, rare
      flooding: 0.4,      // Spring flooding
      drought: 0.3,       // Prairies
      wildfire: 0.7,      // Boreal forest fires increasing
      extremeCold: 0.6,   // Extreme polar cold
      resilience: 0.75,   // Good infrastructure
    },
  },

  mexico: {
    name: "Mexico",
    region: "north_america",
    population: 130,
    gdp: 1.85,
    emissions: {
      total: 0.48,
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
      carbonPrice: 3,
      netZeroTarget: 2050,
      parisCommitment: -22,
    },
    facts: [
      "One of the sunniest countries in the world",
      "Major oil producer transitioning energy mix",
      "Diverse ecosystems from deserts to rainforests",
      "Growing renewable energy sector despite policy uncertainty",
    ],
    climateFinance: {
      currentPercent: 1.2,
      maxPercent: 3.5,
      minPercent: 0.3,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.6,      // Hot climate, intensifying
      hurricane: 0.7,     // Caribbean, Gulf coast
      flooding: 0.5,      // Coastal and river flooding
      drought: 0.5,       // Northern Mexico
      wildfire: 0.4,      // Some forest fires
      extremeCold: 0.0,   // Never cold
      resilience: 0.45,   // Moderate infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH AMERICA
  // ═══════════════════════════════════════════════════════════════

  brazil: {
    name: "Brazil",
    region: "south_america",
    population: 217,
    gdp: 2.33,
    emissions: {
      total: 0.48,
      perCapita: 2.2,
      trend: 0.2,
      sources: {
        electricity: 0.08,
        transport: 0.32,
        industry: 0.18,
        buildings: 0.07,
        agriculture: 0.35,
      },
    },
    energy: {
      renewableShare: 0.85,
      coalShare: 0.04,
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
      "85% renewable electricity - mostly hydropower",
      "Amazon rainforest produces 20% of world's oxygen",
      "Largest ethanol biofuel program globally",
      "Deforestation is biggest emissions driver",
    ],
    climateFinance: {
      currentPercent: 1.3,
      maxPercent: 4.0,
      minPercent: 0.3,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.5,      // Tropical heat in north
      hurricane: 0.2,     // Coastal Brazil, rare
      flooding: 0.7,      // Amazon and urban flooding
      drought: 0.6,       // Northeast Brazil very dry
      wildfire: 0.8,      // Amazon fires, major issue
      extremeCold: 0.0,   // Tropical - never cold
      resilience: 0.4,    // Developing infrastructure
    },
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
    climateFinance: {
      currentPercent: 1.0,
      maxPercent: 3.5,
      minPercent: 0.3,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.3,      // Pampa region heat
      hurricane: 0.0,     // Wrong location
      flooding: 0.5,      // River flooding
      drought: 0.4,       // Pampa droughts
      wildfire: 0.3,      // Some grassland fires
      extremeCold: 0.2,   // Patagonia cold snaps
      resilience: 0.5,    // Moderate infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════════

  germany: {
    name: "Germany",
    region: "europe",
    population: 84,
    gdp: 4.74,
    emissions: {
      total: 0.6,
      perCapita: 8.2,
      trend: -3.0,
      sources: {
        electricity: 0.32,
        industry: 0.24,
        transport: 0.20,
        buildings: 0.16,
        agriculture: 0.08,
      },
    },
    energy: {
      renewableShare: 0.52,
      coalShare: 0.26,
      gasShare: 0.12,
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
      carbonPrice: 65,
      netZeroTarget: 2045,
      parisCommitment: -65,
    },
    facts: [
      "Energiewende - most ambitious energy transition globally",
      "Phased out nuclear power in 2023",
      "Europe's largest economy at $4.7 trillion",
      "Over 50% renewable electricity despite limited sun",
    ],
    climateFinance: {
      currentPercent: 2.0,
      maxPercent: 5.0,
      minPercent: 0.5,
      difficulty: 0.3,
      politicalResistance: 0.2,
    },
    disasterVulnerability: {
      heatWave: 0.5,      // Summer heat waves increasing
      hurricane: 0.0,     // Never - wrong location
      flooding: 0.6,      // Rhine flooding, major issue
      drought: 0.3,       // Some dry periods
      wildfire: 0.2,      // Rare forest fires
      extremeCold: 0.3,   // Cold winters
      resilience: 0.9,    // Excellent infrastructure
    },
  },

  uk: {
    name: "United Kingdom",
    region: "europe",
    population: 68,
    gdp: 3.49,
    emissions: {
      total: 0.33,
      perCapita: 5.6,
      trend: -4.0,
      sources: {
        electricity: 0.21,
        transport: 0.27,
        industry: 0.17,
        buildings: 0.23,
        agriculture: 0.12,
      },
    },
    energy: {
      renewableShare: 0.45,
      coalShare: 0.01,
      gasShare: 0.35,
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
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -68,
    },
    facts: [
      "First major economy to legislate net zero",
      "Nearly eliminated coal from electricity",
      "World's largest offshore wind capacity",
      "Hosted COP26 climate summit in Glasgow",
    ],
    climateFinance: {
      currentPercent: 1.8,
      maxPercent: 4.0,
      minPercent: 0.4,
      difficulty: 0.35,
      politicalResistance: 0.3,
    },
    disasterVulnerability: {
      heatWave: 0.4,      // Some heat waves
      hurricane: 0.0,     // Never
      flooding: 0.6,      // River and coastal flooding
      drought: 0.2,       // Rare
      wildfire: 0.1,      // Very rare
      extremeCold: 0.2,   // Occasional cold snaps
      resilience: 0.8,    // Good infrastructure
    },
  },

  france: {
    name: "France",
    region: "europe",
    population: 68,
    gdp: 3.05,
    emissions: {
      total: 0.28,
      perCapita: 4.2,
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
      renewableShare: 0.28,
      coalShare: 0.01,
      gasShare: 0.10,
      nuclearShare: 0.65,
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "65% nuclear - lowest carbon electricity in Europe",
      "Paris Agreement was signed here in 2015",
      "Transport is largest emissions source",
      "Building 6 new nuclear reactors",
    ],
    climateFinance: {
      currentPercent: 1.6,
      maxPercent: 4.0,
      minPercent: 0.4,
      difficulty: 0.4,
      politicalResistance: 0.35,
    },
    disasterVulnerability: {
      heatWave: 0.6,      // Mediterranean heat waves
      hurricane: 0.0,     // Never
      flooding: 0.5,      // Seine flooding, coastal
      drought: 0.4,       // Southern France
      wildfire: 0.5,      // Mediterranean forest fires
      extremeCold: 0.2,   // Rare
      resilience: 0.85,   // Very good infrastructure
    },
  },

  italy: {
    name: "Italy",
    region: "europe",
    population: 59,
    gdp: 2.37,
    emissions: {
      total: 0.32,
      perCapita: 5.4,
      trend: -2.0,
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "First country to use geothermal electricity (1904)",
      "No nuclear power since 1990 referendum",
      "Dependent on imported natural gas",
      "8th largest economy in the world",
    ],
    climateFinance: {
      currentPercent: 1.4,
      maxPercent: 3.5,
      minPercent: 0.3,
      difficulty: 0.45,
      politicalResistance: 0.4,
    },
    disasterVulnerability: {
      heatWave: 0.7,      // Mediterranean very hot
      hurricane: 0.0,     // Never
      flooding: 0.5,      // River flooding
      drought: 0.5,       // Southern Italy
      wildfire: 0.6,      // Forest fires in summer
      extremeCold: 0.1,   // Rare
      resilience: 0.7,    // Good infrastructure
    },
  },

  poland: {
    name: "Poland",
    region: "europe",
    population: 38,
    gdp: 0.85,
    emissions: {
      total: 0.29,
      perCapita: 8.0,
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "70% of electricity still from coal",
      "Largest coal producer in EU",
      "Rapidly expanding solar rooftop capacity",
      "Plans to build first nuclear plant by 2030s",
    ],
    climateFinance: {
      currentPercent: 0.9,
      maxPercent: 3.0,
      minPercent: 0.3,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.3,      // Some summer heat
      hurricane: 0.0,     // Never
      flooding: 0.5,      // River flooding
      drought: 0.2,       // Rare
      wildfire: 0.2,      // Some forest fires
      extremeCold: 0.5,   // Cold winters
      resilience: 0.6,    // Moderate infrastructure
    },
  },

  russia: {
    name: "Russia",
    region: "europe",
    population: 144,
    gdp: 2.02,
    emissions: {
      total: 1.76,
      perCapita: 18.0,
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
      renewableShare: 0.22,
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
    climateFinance: {
      currentPercent: 0.3,
      maxPercent: 1.5,
      minPercent: 0.1,
      difficulty: 0.95,
      politicalResistance: 0.9,
    },
    disasterVulnerability: {
      heatWave: 0.3,      // Siberian summers getting hotter
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Spring melt flooding
      drought: 0.3,       // Some regions
      wildfire: 0.6,      // Massive Siberian fires
      extremeCold: 0.7,   // Extreme Siberian cold
      resilience: 0.5,    // Variable infrastructure
    },
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "50% renewable electricity achieved",
      "Best solar resources in Europe",
      "Leading concentrating solar power technology",
      "Rapidly phasing out coal",
    ],
    climateFinance: {
      currentPercent: 1.3,
      maxPercent: 3.5,
      minPercent: 0.4,
      difficulty: 0.4,
      politicalResistance: 0.3,
    },
    disasterVulnerability: {
      heatWave: 0.8,      // Extreme Mediterranean heat
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Some river flooding
      drought: 0.7,       // Major drought risk
      wildfire: 0.8,      // Severe forest fires
      extremeCold: 0.0,   // Never
      resilience: 0.7,    // Good infrastructure
    },
  },

  netherlands: {
    name: "Netherlands",
    region: "europe",
    population: 18,
    gdp: 1.17,
    emissions: {
      total: 0.14,
      perCapita: 8.1,
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
      carbonPrice: 65,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "1/3 of country below sea level - climate vulnerable",
      "Major oil refining and petrochemical hub",
      "Leading offshore wind developer",
      "Ambitious green hydrogen plans",
    ],
    climateFinance: {
      currentPercent: 1.4,
      maxPercent: 3.5,
      minPercent: 0.4,
      difficulty: 0.3,
      politicalResistance: 0.25,
    },
    disasterVulnerability: {
      heatWave: 0.3,      // Mild summers
      hurricane: 0.0,     // Never
      flooding: 0.9,      // 1/3 below sea level - extreme flood risk
      drought: 0.1,       // Wet climate
      wildfire: 0.0,      // Never
      extremeCold: 0.2,   // Some winter cold
      resilience: 0.9,    // World-class water management
    },
  },

  sweden: {
    name: "Sweden",
    region: "europe",
    population: 10.5,
    gdp: 0.60,
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
      renewableShare: 0.72,
      coalShare: 0.01,
      gasShare: 0.01,
      nuclearShare: 0.30,
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
      carbonPrice: 126,
      netZeroTarget: 2045,
      parisCommitment: -55,
    },
    facts: [
      "World's highest carbon tax ($126/tonne)",
      "72% renewable + 30% nuclear = clean electricity",
      "Pioneering green steel production",
      "Carbon neutral target by 2045",
    ],
    climateFinance: {
      currentPercent: 2.5,
      maxPercent: 5.5,
      minPercent: 0.8,
      difficulty: 0.2,
      politicalResistance: 0.15,
    },
    disasterVulnerability: {
      heatWave: 0.2,      // Cool climate
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Some spring flooding
      drought: 0.1,       // Wet climate
      wildfire: 0.4,      // Northern forest fires increasing
      extremeCold: 0.5,   // Arctic winters
      resilience: 0.9,    // Excellent infrastructure
    },
  },

  norway: {
    name: "Norway",
    region: "europe",
    population: 5.5,
    gdp: 0.50,
    emissions: {
      total: 0.04,
      perCapita: 7.5,
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
      carbonPrice: 91,
      netZeroTarget: 2050,
      parisCommitment: -55,
    },
    facts: [
      "98% renewable electricity from hydropower",
      "World's highest EV market share (80%+ of new sales)",
      "Major oil/gas producer investing in transition",
      "Pioneer in carbon capture and storage",
    ],
    climateFinance: {
      currentPercent: 2.8,
      maxPercent: 6.0,
      minPercent: 0.8,
      difficulty: 0.2,
      politicalResistance: 0.15,
    },
    disasterVulnerability: {
      heatWave: 0.1,      // Very cool climate
      hurricane: 0.0,     // Never
      flooding: 0.5,      // Coastal and spring floods
      drought: 0.1,       // Wet climate
      wildfire: 0.3,      // Northern forest fires
      extremeCold: 0.6,   // Arctic winters
      resilience: 0.9,    // Excellent infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MIDDLE EAST
  // ═══════════════════════════════════════════════════════════════

  saudi_arabia: {
    name: "Saudi Arabia",
    region: "asia",
    population: 37,
    gdp: 1.11,
    emissions: {
      total: 0.66,
      perCapita: 22.8,
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
      "Highest per capita emitter (22.8 tonnes)",
    ],
    climateFinance: {
      currentPercent: 0.4,
      maxPercent: 2.0,
      minPercent: 0.1,
      difficulty: 0.9,
      politicalResistance: 0.85,
    },
    disasterVulnerability: {
      heatWave: 1.0,      // Most extreme heat on Earth
      hurricane: 0.0,     // Never (Red Sea doesn't generate cyclones)
      flooding: 0.3,      // Flash floods in rare rain events
      drought: 0.9,       // Extreme desert drought
      wildfire: 0.0,      // No vegetation to burn
      extremeCold: 0.0,   // Never
      resilience: 0.7,    // Good modern infrastructure
    },
  },

  iran: {
    name: "Iran",
    region: "asia",
    population: 89,
    gdp: 0.40,
    emissions: {
      total: 0.75,
      perCapita: 8.4,
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
      netZeroTarget: null,
      parisCommitment: -4,
    },
    facts: [
      "World's second largest natural gas reserves",
      "Heavily subsidized domestic fuel prices",
      "No net zero target announced",
      "Growing nuclear energy program",
    ],
    climateFinance: {
      currentPercent: 0.3,
      maxPercent: 1.5,
      minPercent: 0.1,
      difficulty: 0.9,
      politicalResistance: 0.85,
    },
    disasterVulnerability: {
      heatWave: 0.9,      // Extreme Middle East heat
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Flash floods in mountains
      drought: 0.8,       // Severe drought
      wildfire: 0.2,      // Some forest fire risk
      extremeCold: 0.2,   // Mountain regions can get cold
      resilience: 0.4,    // Limited infrastructure
    },
  },

  uae: {
    name: "United Arab Emirates",
    region: "asia",
    population: 10,
    gdp: 0.53,
    emissions: {
      total: 0.20,
      perCapita: 20.0,
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
    climateFinance: {
      currentPercent: 0.8,
      maxPercent: 2.5,
      minPercent: 0.2,
      difficulty: 0.7,
      politicalResistance: 0.6,
    },
    disasterVulnerability: {
      heatWave: 1.0,      // Extreme desert heat
      hurricane: 0.0,     // Never
      flooding: 0.3,      // Flash floods
      drought: 0.9,       // Extreme desert drought
      wildfire: 0.0,      // No vegetation
      extremeCold: 0.0,   // Never
      resilience: 0.8,    // Good modern infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // AFRICA
  // ═══════════════════════════════════════════════════════════════

  south_africa: {
    name: "South Africa",
    region: "africa",
    population: 62,
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
    climateFinance: {
      currentPercent: 1.0,
      maxPercent: 4.0,
      minPercent: 0.3,
      difficulty: 0.6,
      politicalResistance: 0.5,
    },
    disasterVulnerability: {
      heatWave: 0.6,      // Hot summers
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Some river flooding
      drought: 0.7,       // Significant drought risk
      wildfire: 0.5,      // Bush fires
      extremeCold: 0.0,   // Never
      resilience: 0.4,    // Developing infrastructure
    },
  },

  egypt: {
    name: "Egypt",
    region: "africa",
    population: 111,
    gdp: 0.40,
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
      netZeroTarget: 2050,
      parisCommitment: -33,
    },
    facts: [
      "Hosted COP27 in Sharm El-Sheikh",
      "Benban is Africa's largest solar park",
      "Gulf of Suez has excellent wind speeds",
      "Suez Canal - global shipping bottleneck",
      "Net zero target 2050",
    ],
    climateFinance: {
      currentPercent: 0.8,
      maxPercent: 4.0,
      minPercent: 0.2,
      difficulty: 0.7,
      politicalResistance: 0.6,
    },
    disasterVulnerability: {
      heatWave: 0.8,      // Extreme desert heat
      hurricane: 0.0,     // Never
      flooding: 0.4,      // Nile delta flooding
      drought: 0.8,       // Severe desert drought
      wildfire: 0.1,      // Minimal vegetation
      extremeCold: 0.0,   // Never
      resilience: 0.4,    // Developing infrastructure
    },
  },

  nigeria: {
    name: "Nigeria",
    region: "africa",
    population: 230,
    gdp: 0.48,
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
    climateFinance: {
      currentPercent: 0.5,
      maxPercent: 4.0,
      minPercent: 0.2,
      difficulty: 0.7,
      politicalResistance: 0.6,
    },
    disasterVulnerability: {
      heatWave: 0.7,      // Hot tropical/Sahel climate
      hurricane: 0.1,     // Rare Atlantic influence
      flooding: 0.6,      // Niger River flooding
      drought: 0.6,       // Sahel drought
      wildfire: 0.3,      // Some bush fires
      extremeCold: 0.0,   // Never
      resilience: 0.2,    // Limited infrastructure
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // OCEANIA
  // ═══════════════════════════════════════════════════════════════

  australia: {
    name: "Australia",
    region: "oceania",
    population: 27,
    gdp: 1.77,
    emissions: {
      total: 0.39,
      perCapita: 22.3,
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
      coalShare: 0.47,
      gasShare: 0.17,
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
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -43,
    },
    facts: [
      "Second highest per capita emitter (22.3 tonnes)",
      "Rooftop solar leader - 30% of homes have panels",
      "World's largest coal exporter",
      "Positioning as green hydrogen superpower",
    ],
    climateFinance: {
      currentPercent: 0.8,
      maxPercent: 3.0,
      minPercent: 0.3,
      difficulty: 0.7,
      politicalResistance: 0.6,
    },
    disasterVulnerability: {
      heatWave: 0.9,      // Extreme outback heat
      hurricane: 0.4,     // Tropical cyclones in north
      flooding: 0.5,      // Flash floods in outback
      drought: 0.9,       // Severe drought (major crisis)
      wildfire: 1.0,      // World's worst bushfires
      extremeCold: 0.0,   // Never
      resilience: 0.7,    // Good infrastructure but vast land
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL EUROPEAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  turkey: {
    name: "Turkey",
    region: "europe",
    population: 86,
    gdp: 1.35,
    emissions: {
      total: 0.42,
      perCapita: 5.0,
      trend: 1.5,
      sources: { electricity: 0.33, transport: 0.22, industry: 0.28, buildings: 0.12, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.42, coalShare: 0.32, gasShare: 0.23, nuclearShare: 0.00 },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.45 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.65 } },
    policies: { carbonPrice: 0, netZeroTarget: 2053, parisCommitment: -21 },
    facts: ["High geothermal potential", "Major renewable energy growth", "Bridge between Europe and Asia"],
    climateFinance: { currentPercent: 1.0, maxPercent: 3.0, minPercent: 0.3, difficulty: 0.6, politicalResistance: 0.5 },
    disasterVulnerability: {
      heatWave: 0.7,      // Hot Mediterranean/Anatolian summers
      hurricane: 0.0,     // Never
      flooding: 0.5,      // River and flash floods
      drought: 0.5,       // Central Anatolia drought risk
      wildfire: 0.6,      // Mediterranean forest fires
      extremeCold: 0.3,   // Eastern mountain winters
      resilience: 0.5,    // Moderate infrastructure
    },
  },

  switzerland: {
    name: "Switzerland",
    region: "europe",
    population: 9,
    gdp: 0.92,
    emissions: {
      total: 0.03,
      perCapita: 4.0,
      trend: -2.5,
      sources: { electricity: 0.05, transport: 0.35, industry: 0.25, buildings: 0.30, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.75, coalShare: 0.00, gasShare: 0.10, nuclearShare: 0.35 },
    potential: { solar: { score: 0.45 }, wind: { score: 0.40 }, forest: { score: 0.50 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.30 } },
    policies: { carbonPrice: 131, netZeroTarget: 2050, parisCommitment: -50 },
    facts: ["75% renewable electricity from hydro", "World's highest carbon price ($131/t)", "High per capita wealth"],
    climateFinance: { currentPercent: 1.5, maxPercent: 3.5, minPercent: 0.5, difficulty: 0.3, politicalResistance: 0.2 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Major offshore wind expansion", "Nuclear phase-out debates", "EU headquarters in Brussels"],
    climateFinance: { currentPercent: 1.3, maxPercent: 3.5, minPercent: 0.4, difficulty: 0.35, politicalResistance: 0.25 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2040, parisCommitment: -55 },
    facts: ["78% renewable electricity (mostly hydro)", "Alpine forests as carbon sinks", "No nuclear power by law"],
    climateFinance: { currentPercent: 1.4, maxPercent: 3.5, minPercent: 0.5, difficulty: 0.3, politicalResistance: 0.25 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["75% renewable electricity", "Coal-free since 2021", "Excellent solar and wind resources"],
    climateFinance: { currentPercent: 1.2, maxPercent: 3.5, minPercent: 0.4, difficulty: 0.45, politicalResistance: 0.4 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Excellent Mediterranean solar", "Rapid lignite phase-out", "Island energy challenges"],
    climateFinance: { currentPercent: 0.9, maxPercent: 3.0, minPercent: 0.3, difficulty: 0.5, politicalResistance: 0.45 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Heavy coal dependence", "Nuclear expansion planned", "EU industrial center"],
    climateFinance: { currentPercent: 0.8, maxPercent: 3.0, minPercent: 0.3, difficulty: 0.5, politicalResistance: 0.45 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Good mix of hydro and nuclear", "Black Sea offshore wind potential", "Large forest coverage"],
    climateFinance: { currentPercent: 0.9, maxPercent: 3.5, minPercent: 0.3, difficulty: 0.5, politicalResistance: 0.4 },
  },

  finland: {
    name: "Finland",
    region: "europe",
    population: 5.5,
    gdp: 0.30,
    emissions: {
      total: 0.04,
      perCapita: 7.0,
      trend: -5.5,
      sources: { electricity: 0.15, transport: 0.28, industry: 0.30, buildings: 0.20, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.50, coalShare: 0.08, gasShare: 0.05, nuclearShare: 0.34 },
    potential: { solar: { score: 0.30 }, wind: { score: 0.75 }, forest: { score: 0.85 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.15 } },
    policies: { carbonPrice: 100, netZeroTarget: 2035, parisCommitment: -55 },
    facts: ["World's earliest net zero target (2035)", "Vast boreal forests", "Nuclear + renewables mix"],
    climateFinance: { currentPercent: 2.3, maxPercent: 5.5, minPercent: 0.7, difficulty: 0.25, politicalResistance: 0.2 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Among best wind resources globally", "High agriculture emissions", "Data center energy demand"],
    climateFinance: { currentPercent: 1.2, maxPercent: 3.0, minPercent: 0.4, difficulty: 0.4, politicalResistance: 0.35 },
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["Nuclear provides 45% of electricity", "Good solar potential", "Geothermal resources"],
    climateFinance: { currentPercent: 0.8, maxPercent: 2.5, minPercent: 0.3, difficulty: 0.6, politicalResistance: 0.5 },
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
    climateFinance: { currentPercent: 0.6, maxPercent: 3.0, minPercent: 0.2, difficulty: 0.7, politicalResistance: 0.6 },
  },

  denmark: {
    name: "Denmark",
    region: "europe",
    population: 6,
    gdp: 0.42,
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
    policies: { carbonPrice: 65, netZeroTarget: 2050, parisCommitment: -55 },
    facts: ["80% wind & solar electricity", "World leader in offshore wind", "Carbon neutral target 2050"],
    climateFinance: { currentPercent: 2.2, maxPercent: 5.0, minPercent: 0.7, difficulty: 0.2, politicalResistance: 0.15 },
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL ASIAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  pakistan: {
    name: "Pakistan",
    region: "asia",
    population: 240,
    gdp: 0.34,
    emissions: {
      total: 0.22,
      perCapita: 0.9,
      trend: 3.5,
      sources: { electricity: 0.32, transport: 0.25, industry: 0.22, buildings: 0.08, agriculture: 0.13 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.10, gasShare: 0.35, nuclearShare: 0.08 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -50,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.65 }, forest: { score: 0.40 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.25 } },
    facts: ["Low per capita emissions", "High solar potential", "Major hydro capacity", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.5, maxPercent: 5.0, minPercent: 0.4, difficulty: 0.6, politicalResistance: 0.5 },
  },

  bangladesh: {
    name: "Bangladesh",
    region: "asia",
    population: 173,
    gdp: 0.46,
    emissions: {
      total: 0.10,
      perCapita: 0.6,
      trend: 6.0,
      sources: { electricity: 0.35, transport: 0.20, industry: 0.25, buildings: 0.10, agriculture: 0.10 },
    },
    energy: { renewableShare: 0.05, coalShare: 0.02, gasShare: 0.90, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -22,
    },
    potential: { solar: { score: 0.80 }, wind: { score: 0.45 }, forest: { score: 0.30 }, carbonCapture: { score: 0.25 }, geothermal: { score: 0.15 } },
    facts: ["Most climate-vulnerable major nation", "World's largest solar home system program", "Very low per capita emissions", "Net zero target 2050"],
    climateFinance: { currentPercent: 2.0, maxPercent: 6.0, minPercent: 0.5, difficulty: 0.6, politicalResistance: 0.5 },
  },

  vietnam: {
    name: "Vietnam",
    region: "asia",
    population: 100,
    gdp: 0.47,
    emissions: {
      total: 0.33,
      perCapita: 3.3,
      trend: 5.5,
      sources: { electricity: 0.38, transport: 0.15, industry: 0.30, buildings: 0.08, agriculture: 0.09 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.50, gasShare: 0.08, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -27,
    },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.55 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.20 } },
    projects: {
      solar: { costMultiplier: 0.75, effectMultiplier: 1.25, reason: "Fastest growing solar market in Asia" },
    },
    facts: ["Fastest growing solar market in SE Asia", "Net zero target 2050", "Major manufacturing hub"],
    climateFinance: { currentPercent: 1.5, maxPercent: 4.0, minPercent: 0.4, difficulty: 0.5, politicalResistance: 0.4 },
  },

  thailand: {
    name: "Thailand",
    region: "asia",
    population: 72,
    gdp: 0.53,
    emissions: {
      total: 0.28,
      perCapita: 3.9,
      trend: 1.5,
      sources: { electricity: 0.35, transport: 0.28, industry: 0.25, buildings: 0.07, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.15, coalShare: 0.18, gasShare: 0.60, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -30,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.45 }, forest: { score: 0.50 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.20 } },
    facts: ["Major EV manufacturing hub", "Good solar resources", "Tourism economy", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.2, maxPercent: 4.0, minPercent: 0.4, difficulty: 0.5, politicalResistance: 0.45 },
  },

  philippines: {
    name: "Philippines",
    region: "asia",
    population: 117,
    gdp: 0.44,
    emissions: {
      total: 0.16,
      perCapita: 1.4,
      trend: 4.0,
      sources: { electricity: 0.40, transport: 0.22, industry: 0.18, buildings: 0.12, agriculture: 0.08 },
    },
    energy: { renewableShare: 0.22, coalShare: 0.55, gasShare: 0.18, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -75,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.65 }, forest: { score: 0.45 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.85 } },
    projects: {
      geothermal: { costMultiplier: 0.75, effectMultiplier: 1.35, reason: "Second largest geothermal producer globally" },
    },
    facts: ["World's second largest geothermal producer", "Archipelago challenges", "High climate vulnerability", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.4, maxPercent: 5.0, minPercent: 0.4, difficulty: 0.55, politicalResistance: 0.5 },
  },

  malaysia: {
    name: "Malaysia",
    region: "asia",
    population: 34,
    gdp: 0.43,
    emissions: {
      total: 0.26,
      perCapita: 7.7,
      trend: 2.0,
      sources: { electricity: 0.35, transport: 0.30, industry: 0.25, buildings: 0.05, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.20, coalShare: 0.38, gasShare: 0.40, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -45,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.40 }, forest: { score: 0.70 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.20 } },
    facts: ["Major palm oil producer", "Rainforest conservation needed", "Growing solar sector", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.3, maxPercent: 4.0, minPercent: 0.4, difficulty: 0.55, politicalResistance: 0.45 },
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
    policies: {
      carbonPrice: 25,
      netZeroTarget: 2050,
      parisCommitment: -36,
    },
    potential: { solar: { score: 0.80 }, wind: { score: 0.20 }, forest: { score: 0.10 }, carbonCapture: { score: 0.60 }, geothermal: { score: 0.10 } },
    facts: ["City-state limited land", "Regional green finance hub", "Importing solar from neighbors", "Carbon tax $25/tonne"],
    climateFinance: { currentPercent: 1.5, maxPercent: 3.5, minPercent: 0.5, difficulty: 0.35, politicalResistance: 0.3 },
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
    policies: {
      carbonPrice: 10,
      netZeroTarget: 2050,
      parisCommitment: -50,
    },
    potential: { solar: { score: 0.70 }, wind: { score: 0.80 }, forest: { score: 0.35 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.40 } },
    facts: ["Major semiconductor manufacturing", "Offshore wind expansion", "Nuclear phase-out planned", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.2, maxPercent: 3.0, minPercent: 0.4, difficulty: 0.45, politicalResistance: 0.4 },
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL MIDDLE EAST COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  iraq: {
    name: "Iraq",
    region: "asia",
    population: 44,
    gdp: 0.27,
    emissions: {
      total: 0.22,
      perCapita: 5.0,
      trend: 2.5,
      sources: { electricity: 0.35, transport: 0.25, industry: 0.30, buildings: 0.05, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.02, coalShare: 0.00, gasShare: 0.30, nuclearShare: 0.00, oilShare: 0.68 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: null,
      parisCommitment: -15,
    },
    potential: { solar: { score: 0.95 }, wind: { score: 0.55 }, forest: { score: 0.15 }, carbonCapture: { score: 0.65 }, geothermal: { score: 0.25 } },
    facts: ["Major oil producer", "Excellent solar potential untapped", "Gas flaring issues", "No net zero target"],
    climateFinance: { currentPercent: 0.3, maxPercent: 2.0, minPercent: 0.1, difficulty: 0.85, politicalResistance: 0.8 },
  },

  kuwait: {
    name: "Kuwait",
    region: "asia",
    population: 4.5,
    gdp: 0.18,
    emissions: {
      total: 0.10,
      perCapita: 23.0,
      trend: 0.5,
      sources: { electricity: 0.55, transport: 0.20, industry: 0.18, buildings: 0.05, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.01, coalShare: 0.00, gasShare: 0.25, nuclearShare: 0.00, oilShare: 0.74 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2060,
      parisCommitment: -15,
    },
    potential: { solar: { score: 0.98 }, wind: { score: 0.50 }, forest: { score: 0.05 }, carbonCapture: { score: 0.70 }, geothermal: { score: 0.15 } },
    facts: ["Among highest per capita emissions", "Oil-dependent economy", "Extreme solar potential", "Net zero target 2060"],
    climateFinance: { currentPercent: 0.4, maxPercent: 2.0, minPercent: 0.1, difficulty: 0.85, politicalResistance: 0.8 },
  },

  qatar: {
    name: "Qatar",
    region: "asia",
    population: 3,
    gdp: 0.24,
    emissions: {
      total: 0.11,
      perCapita: 35.6,
      trend: 1.0,
      sources: { electricity: 0.35, transport: 0.15, industry: 0.40, buildings: 0.08, agriculture: 0.02 },
    },
    energy: { renewableShare: 0.01, coalShare: 0.00, gasShare: 0.99, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -25,
    },
    potential: { solar: { score: 0.95 }, wind: { score: 0.45 }, forest: { score: 0.05 }, carbonCapture: { score: 0.80 }, geothermal: { score: 0.15 } },
    facts: ["Highest per capita emissions globally", "World's largest LNG exporter", "FIFA 2022 host", "Net zero target 2050"],
    climateFinance: { currentPercent: 0.5, maxPercent: 2.5, minPercent: 0.1, difficulty: 0.8, politicalResistance: 0.75 },
  },

  israel: {
    name: "Israel",
    region: "asia",
    population: 9.5,
    gdp: 0.54,
    emissions: {
      total: 0.07,
      perCapita: 7.5,
      trend: -2.0,
      sources: { electricity: 0.40, transport: 0.28, industry: 0.15, buildings: 0.12, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.10, coalShare: 0.20, gasShare: 0.65, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -27,
    },
    potential: { solar: { score: 0.90 }, wind: { score: 0.50 }, forest: { score: 0.30 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.30 } },
    facts: ["Pioneer in solar thermal tech", "Rapid natural gas shift", "Water desalination leader", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.2, maxPercent: 3.0, minPercent: 0.4, difficulty: 0.5, politicalResistance: 0.4 },
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL AFRICAN COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  morocco: {
    name: "Morocco",
    region: "africa",
    population: 38,
    gdp: 0.15,
    emissions: {
      total: 0.07,
      perCapita: 1.9,
      trend: 2.5,
      sources: { electricity: 0.38, transport: 0.25, industry: 0.20, buildings: 0.10, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.20, coalShare: 0.52, gasShare: 0.10, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -46,
    },
    potential: { solar: { score: 0.95 }, wind: { score: 0.80 }, forest: { score: 0.35 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.25 } },
    projects: {
      solar: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Home to Noor Ouarzazate, world's largest concentrated solar plant" },
    },
    facts: ["Noor - world's largest concentrated solar plant", "52% renewable target by 2030", "Green hydrogen ambitions"],
    climateFinance: { currentPercent: 1.5, maxPercent: 5.0, minPercent: 0.4, difficulty: 0.5, politicalResistance: 0.4 },
  },

  algeria: {
    name: "Algeria",
    region: "africa",
    population: 46,
    gdp: 0.20,
    emissions: {
      total: 0.18,
      perCapita: 4.0,
      trend: 1.5,
      sources: { electricity: 0.40, transport: 0.28, industry: 0.20, buildings: 0.07, agriculture: 0.05 },
    },
    energy: { renewableShare: 0.02, coalShare: 0.00, gasShare: 0.98, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: null,
      parisCommitment: -22,
    },
    potential: { solar: { score: 0.98 }, wind: { score: 0.65 }, forest: { score: 0.15 }, carbonCapture: { score: 0.55 }, geothermal: { score: 0.30 } },
    facts: ["Sahara - world's best solar potential", "Major gas exporter", "Vast untapped renewable resources", "No net zero target"],
    climateFinance: { currentPercent: 0.5, maxPercent: 3.0, minPercent: 0.2, difficulty: 0.75, politicalResistance: 0.65 },
  },

  kenya: {
    name: "Kenya",
    region: "africa",
    population: 55,
    gdp: 0.12,
    emissions: {
      total: 0.02,
      perCapita: 0.4,
      trend: 4.0,
      sources: { electricity: 0.15, transport: 0.30, industry: 0.15, buildings: 0.10, agriculture: 0.30 },
    },
    energy: { renewableShare: 0.90, coalShare: 0.00, gasShare: 0.00, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -32,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.75 }, forest: { score: 0.55 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.85 } },
    projects: {
      geothermal: { costMultiplier: 0.70, effectMultiplier: 1.40, reason: "Rift Valley geothermal powerhouse" },
    },
    facts: ["90% renewable electricity", "Rift Valley geothermal leader", "Mobile money pioneer", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.8, maxPercent: 6.0, minPercent: 0.5, difficulty: 0.5, politicalResistance: 0.4 },
  },

  ethiopia: {
    name: "Ethiopia",
    region: "africa",
    population: 126,
    gdp: 0.16,
    emissions: {
      total: 0.02,
      perCapita: 0.2,
      trend: 5.0,
      sources: { electricity: 0.05, transport: 0.20, industry: 0.10, buildings: 0.10, agriculture: 0.55 },
    },
    energy: { renewableShare: 0.95, coalShare: 0.00, gasShare: 0.00, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -68,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.70 }, forest: { score: 0.60 }, carbonCapture: { score: 0.25 }, geothermal: { score: 0.70 } },
    facts: ["Nearly 100% renewable electricity", "Grand Ethiopian Renaissance Dam", "Very low per capita emissions", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.5, maxPercent: 6.0, minPercent: 0.4, difficulty: 0.6, politicalResistance: 0.5 },
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL AMERICAS COUNTRIES
  // ═══════════════════════════════════════════════════════════════

  chile: {
    name: "Chile",
    region: "south_america",
    population: 19.5,
    gdp: 0.34,
    emissions: {
      total: 0.09,
      perCapita: 4.5,
      trend: -3.0,
      sources: { electricity: 0.30, transport: 0.28, industry: 0.25, buildings: 0.10, agriculture: 0.07 },
    },
    energy: { renewableShare: 0.55, coalShare: 0.20, gasShare: 0.15, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 5,
      netZeroTarget: 2050,
      parisCommitment: -45,
    },
    potential: { solar: { score: 0.98 }, wind: { score: 0.85 }, forest: { score: 0.50 }, carbonCapture: { score: 0.50 }, geothermal: { score: 0.65 } },
    projects: {
      solar: { costMultiplier: 0.65, effectMultiplier: 1.50, reason: "Atacama Desert - world's best solar irradiance" },
    },
    facts: ["Atacama - world's best solar radiation", "Green hydrogen ambitions", "Copper mining major emitter", "Carbon tax $5/tonne"],
    climateFinance: { currentPercent: 1.4, maxPercent: 4.0, minPercent: 0.4, difficulty: 0.45, politicalResistance: 0.35 },
  },

  colombia: {
    name: "Colombia",
    region: "south_america",
    population: 52,
    gdp: 0.36,
    emissions: {
      total: 0.10,
      perCapita: 1.9,
      trend: 1.0,
      sources: { electricity: 0.10, transport: 0.35, industry: 0.20, buildings: 0.10, agriculture: 0.25 },
    },
    energy: { renewableShare: 0.75, coalShare: 0.08, gasShare: 0.15, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 5,
      netZeroTarget: 2050,
      parisCommitment: -51,
    },
    potential: { solar: { score: 0.80 }, wind: { score: 0.70 }, forest: { score: 0.85 }, carbonCapture: { score: 0.40 }, geothermal: { score: 0.35 } },
    facts: ["75% renewable electricity (hydro)", "Amazon rainforest portion", "Coal export phase-out", "Carbon tax $5/tonne"],
    climateFinance: { currentPercent: 1.3, maxPercent: 4.0, minPercent: 0.4, difficulty: 0.5, politicalResistance: 0.45 },
  },

  peru: {
    name: "Peru",
    region: "south_america",
    population: 34,
    gdp: 0.27,
    emissions: {
      total: 0.06,
      perCapita: 1.8,
      trend: 2.0,
      sources: { electricity: 0.15, transport: 0.30, industry: 0.25, buildings: 0.08, agriculture: 0.22 },
    },
    energy: { renewableShare: 0.60, coalShare: 0.02, gasShare: 0.35, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -40,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.70 }, forest: { score: 0.80 }, carbonCapture: { score: 0.35 }, geothermal: { score: 0.50 } },
    facts: ["Amazon rainforest protection", "High Andes solar potential", "Mining sector challenges", "Net zero target 2050"],
    climateFinance: { currentPercent: 1.2, maxPercent: 5.0, minPercent: 0.4, difficulty: 0.6, politicalResistance: 0.5 },
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
    policies: {
      carbonPrice: 0,
      netZeroTarget: null,
      parisCommitment: -20,
    },
    potential: { solar: { score: 0.85 }, wind: { score: 0.60 }, forest: { score: 0.70 }, carbonCapture: { score: 0.55 }, geothermal: { score: 0.20 } },
    facts: ["Large hydropower from Guri Dam", "Major oil reserves", "Economic crisis affecting energy", "No net zero target"],
    climateFinance: { currentPercent: 0.4, maxPercent: 3.0, minPercent: 0.1, difficulty: 0.85, politicalResistance: 0.8 },
  },

  // ═══════════════════════════════════════════════════════════════
  // OCEANIA - ADDITIONAL
  // ═══════════════════════════════════════════════════════════════

  new_zealand: {
    name: "New Zealand",
    region: "oceania",
    population: 5.2,
    gdp: 0.26,
    emissions: {
      total: 0.04,
      perCapita: 7.0,
      trend: -3.0,
      sources: { electricity: 0.05, transport: 0.25, industry: 0.15, buildings: 0.10, agriculture: 0.45 },
    },
    energy: { renewableShare: 0.85, coalShare: 0.02, gasShare: 0.12, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 45,
      netZeroTarget: 2050,
      parisCommitment: -50,
    },
    potential: { solar: { score: 0.55 }, wind: { score: 0.85 }, forest: { score: 0.70 }, carbonCapture: { score: 0.45 }, geothermal: { score: 0.80 } },
    projects: {
      geothermal: { costMultiplier: 0.75, effectMultiplier: 1.30, reason: "Geothermal pioneer since 1950s" },
    },
    facts: ["85% renewable electricity", "High agricultural emissions", "Geothermal pioneer", "ETS carbon price ~$45"],
    climateFinance: { currentPercent: 1.4, maxPercent: 3.5, minPercent: 0.5, difficulty: 0.35, politicalResistance: 0.3 },
  },

  papua_new_guinea: {
    name: "Papua New Guinea",
    region: "oceania",
    population: 10.5,
    gdp: 0.03,
    emissions: {
      total: 0.01,
      perCapita: 0.8,
      trend: 3.0,
      sources: { electricity: 0.20, transport: 0.25, industry: 0.20, buildings: 0.05, agriculture: 0.30 },
    },
    energy: { renewableShare: 0.35, coalShare: 0.00, gasShare: 0.60, nuclearShare: 0.00 },
    policies: {
      carbonPrice: 0,
      netZeroTarget: 2050,
      parisCommitment: -50,
    },
    potential: { solar: { score: 0.80 }, wind: { score: 0.45 }, forest: { score: 0.95 }, carbonCapture: { score: 0.30 }, geothermal: { score: 0.60 } },
    facts: ["Third largest rainforest", "LNG exporter", "High forest carbon potential", "Net zero target 2050"],
    climateFinance: { currentPercent: 0.8, maxPercent: 5.0, minPercent: 0.2, difficulty: 0.65, politicalResistance: 0.55 },
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTINENT/REGION AGGREGATIONS
// ═══════════════════════════════════════════════════════════════

const REGION_AGGREGATES = {
  north_america: {
    name: "North America",
    developmentLevel: "developed",
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
    diplomatic: {
      joinDifficulty: 4,
      baseDemands: ["carbonTaxLimit", "economicProjects"],
      personality: "demanding",
      description: "Wealthy and influential, but demands economic benefits",
    },
    power: {
      baseDemandGW: 550,       // Real 2024: ~4,800 TWh / 8760 hrs ≈ 548 GW average
      demandGrowthRate: 0.018, // IEA projection: 1.8% annual (data centers, EVs)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 770,             // 16% - declining from coal plants
        gas: 1920,             // 40% - dominant source in USA
        nuclear: 865,          // 18% - USA has 94 operating reactors
        hydro: 480,            // 10% - Canada dominates
        wind: 530,             // 11% - growing fast
        solar: 290,            // 6% - fastest growing
        other: 45,             // 1% - biomass, geothermal
      },
      potentialGW: {
        solar: 3000,           // Excellent in SW USA, Mexico (NREL estimates)
        wind: 2000,            // Central USA, offshore Atlantic
        hydro: 200,            // Mostly developed (Canada)
        geothermal: 50,        // California, Mexico
        nuclear: 150,          // Expansion possible with SMRs
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 1.5,         // Gt CO2/year - mature industrial base
        subsectors: {
          cement: 0.12,        // 8% - mostly imports now
          steel: 0.25,         // 17% - declining domestic production
          chemicals: 0.45,     // 30% - petrochemicals, plastics
          other: 0.68,         // 45% - manufacturing, processing
        },
      },
      transport: {
        baseline: 2.2,         // Gt CO2/year - car-dependent culture
        subsectors: {
          road: 1.65,          // 75% - SUVs, trucks dominant
          aviation: 0.35,      // 16% - high domestic flight usage
          shipping: 0.15,      // 7% - ports, freight
          rail: 0.05,          // 2% - minimal rail usage
        },
      },
      buildings: {
        baseline: 0.8,         // Gt CO2/year - heating/cooling
        subsectors: {
          residential: 0.50,   // 63% - large homes, heating
          commercial: 0.30,    // 37% - offices, retail
        },
      },
      agriculture: {
        baseline: 1.0,         // Gt CO2/year - intensive farming
        subsectors: {
          livestock: 0.50,     // 50% - beef cattle, dairy
          crops: 0.35,         // 35% - corn, soybeans, fertilizers
          landUse: 0.15,       // 15% - minimal deforestation
        },
      },
    },
  },
  south_america: {
    name: "South America",
    developmentLevel: "emerging",
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
    diplomatic: {
      joinDifficulty: 5,
      baseDemands: ["localSpending", "jobPriority"],
      personality: "cooperative",
      description: "Values environmental protection, needs local investment",
    },
    power: {
      baseDemandGW: 190,       // Real 2024: ~1,550 TWh / 8760 hrs ≈ 177 GW average
      demandGrowthRate: 0.03,  // IEA projection: 3% annual (growing economies)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 78,              // 5% - minimal, mostly Brazil
        gas: 232,              // 15% - Argentina thermal plants
        nuclear: 47,           // 3% - Argentina, Brazil
        hydro: 930,            // 60% - Brazil dominates (Itaipu, etc.)
        wind: 155,             // 10% - growing fast in Brazil
        solar: 93,             // 6% - Chile Atacama, Brazil
        other: 15,             // 1% - biomass (sugarcane)
      },
      potentialGW: {
        solar: 1500,           // Chile Atacama (best in world), Brazil
        wind: 1200,            // Patagonia, Brazil coast
        hydro: 300,            // Amazon basin remaining potential
        geothermal: 80,        // Andes volcanic regions
        nuclear: 40,           // Limited political interest
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 0.45,        // Gt CO2/year - growing industrial sector
        subsectors: {
          cement: 0.08,        // 18% - construction boom
          steel: 0.12,         // 27% - Brazil steel industry
          chemicals: 0.10,     // 22% - petrochemicals
          other: 0.15,         // 33% - mining, food processing
        },
      },
      transport: {
        baseline: 0.55,        // Gt CO2/year - growing car ownership
        subsectors: {
          road: 0.40,          // 73% - cars, trucks, buses
          aviation: 0.08,      // 15% - domestic flights
          shipping: 0.05,      // 9% - Amazon river, ports
          rail: 0.02,          // 3% - limited rail
        },
      },
      buildings: {
        baseline: 0.20,        // Gt CO2/year - mild climate helps
        subsectors: {
          residential: 0.12,   // 60% - mostly cooling needs
          commercial: 0.08,    // 40% - urban centers
        },
      },
      agriculture: {
        baseline: 0.80,        // Gt CO2/year - significant land use
        subsectors: {
          livestock: 0.35,     // 44% - cattle ranching (Amazon)
          crops: 0.15,         // 19% - soybeans, sugar cane
          landUse: 0.30,       // 37% - deforestation pressure
        },
      },
    },
  },
  europe: {
    name: "Europe",
    developmentLevel: "developed",
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
    diplomatic: {
      joinDifficulty: 3,
      baseDemands: ["carbonTaxLimit"],
      personality: "cooperative",
      description: "Climate leader, eager to join but wants fair policies",
    },
    power: {
      baseDemandGW: 450,       // Real 2024: ~4,000 TWh / 8760 hrs ≈ 457 GW average
      demandGrowthRate: 0.008, // IEA projection: 0.8% (efficiency gains, stable pop)
      currentMixTWh: {         // Real 2024 generation by source (EU + UK + Russia)
        coal: 440,             // 11% - phasing out in EU, stable in Poland
        gas: 640,              // 16% - declining post-Russia crisis
        nuclear: 920,          // 23% - France dominates (70% nuclear)
        hydro: 560,            // 14% - Norway, Sweden, Alps
        wind: 640,             // 16% - North Sea, Germany, Spain
        solar: 320,            // 8% - Germany, Spain, Italy
        other: 480,            // 12% - biomass, geothermal, waste
      },
      potentialGW: {
        solar: 500,            // Southern Europe (Spain, Italy, Greece)
        wind: 800,             // North Sea offshore, Baltic
        hydro: 250,            // Mostly developed
        geothermal: 40,        // Iceland, Italy
        nuclear: 120,          // Political constraints in Germany
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 1.20,        // Gt CO2/year - diverse industrial base
        subsectors: {
          cement: 0.15,        // 13% - Germany, Italy production
          steel: 0.22,         // 18% - Germany, Poland, UK
          chemicals: 0.35,     // 29% - Germany BASF, petrochemicals
          other: 0.48,         // 40% - manufacturing, processing
        },
      },
      transport: {
        baseline: 1.10,        // Gt CO2/year - good public transit
        subsectors: {
          road: 0.75,          // 68% - cars, freight trucks
          aviation: 0.20,      // 18% - intra-Europe flights
          shipping: 0.10,      // 9% - Mediterranean, North Sea
          rail: 0.05,          // 5% - extensive rail network
        },
      },
      buildings: {
        baseline: 0.70,        // Gt CO2/year - heating dominant
        subsectors: {
          residential: 0.45,   // 64% - heating old buildings
          commercial: 0.25,    // 36% - offices, retail
        },
      },
      agriculture: {
        baseline: 0.50,        // Gt CO2/year - efficient farming
        subsectors: {
          livestock: 0.25,     // 50% - dairy, beef
          crops: 0.18,         // 36% - wheat, vegetables
          landUse: 0.07,       // 14% - stable land use
        },
      },
    },
  },
  africa: {
    name: "Africa",
    developmentLevel: "developing",
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
    diplomatic: {
      joinDifficulty: 6,
      baseDemands: ["localSpending", "economicProjects", "jobPriority"],
      personality: "demanding",
      description: "Needs development investment, skeptical of climate costs",
    },
    power: {
      baseDemandGW: 110,       // Real 2024: ~900 TWh / 8760 hrs ≈ 103 GW average
      demandGrowthRate: 0.055, // IEA projection: 5.5% (fastest growing)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 270,             // 30% - South Africa coal dominant
        gas: 270,              // 30% - Egypt, Nigeria gas plants
        nuclear: 18,           // 2% - South Africa Koeberg only
        hydro: 180,            // 20% - DRC, Ethiopia, Egypt
        wind: 45,              // 5% - Morocco, Egypt, South Africa
        solar: 63,             // 7% - growing fast across continent
        other: 54,             // 6% - diesel generators, biomass
      },
      potentialGW: {
        solar: 3000,           // Sahara Desert (best solar in world)
        wind: 800,             // North Africa coast, highlands
        hydro: 400,            // Congo River, Nile, Niger
        geothermal: 100,       // East African Rift Valley
        nuclear: 30,           // Very limited infrastructure
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 0.35,        // Gt CO2/year - early industrialization
        subsectors: {
          cement: 0.10,        // 29% - rapid construction
          steel: 0.08,         // 23% - growing demand
          chemicals: 0.05,     // 14% - fertilizers
          other: 0.12,         // 34% - mining, light industry
        },
      },
      transport: {
        baseline: 0.40,        // Gt CO2/year - growing motorization
        subsectors: {
          road: 0.30,          // 75% - cars, minibuses, trucks
          aviation: 0.05,      // 13% - limited aviation
          shipping: 0.04,      // 10% - ports
          rail: 0.01,          // 2% - limited rail
        },
      },
      buildings: {
        baseline: 0.18,        // Gt CO2/year - mostly cooking/heating
        subsectors: {
          residential: 0.13,   // 72% - biomass cooking, kerosene
          commercial: 0.05,    // 28% - urban centers
        },
      },
      agriculture: {
        baseline: 0.55,        // Gt CO2/year - land use significant
        subsectors: {
          livestock: 0.20,     // 36% - cattle, goats
          crops: 0.12,         // 22% - subsistence farming
          landUse: 0.23,       // 42% - deforestation, expansion
        },
      },
    },
  },
  asia: {
    name: "Asia",
    developmentLevel: "emerging",
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
    diplomatic: {
      joinDifficulty: 7,
      baseDemands: ["carbonTaxLimit", "noNuclear", "economicProjects"],
      personality: "isolationist",
      description: "Complex politics, prioritizes sovereignty and industry",
    },
    power: {
      baseDemandGW: 2100,      // Real 2024: ~16,500 TWh / 8760 hrs ≈ 1,884 GW average
      demandGrowthRate: 0.045, // IEA projection: 4.5% (China+India growth)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 8250,            // 50% - China 58%, India 75% coal
        gas: 2475,             // 15% - Middle East, Japan LNG
        nuclear: 825,          // 5% - China expanding, Japan restarting
        hydro: 2145,           // 13% - China Three Gorges, Mekong
        wind: 1155,            // 7% - China 40% of global wind
        solar: 1320,           // 8% - China adding 200GW/year
        other: 330,            // 2% - biomass, geothermal
      },
      potentialGW: {
        solar: 5000,           // China, India, Middle East deserts
        wind: 3000,            // China coast, India, offshore Japan
        hydro: 600,            // Some remaining in SE Asia
        geothermal: 150,       // Indonesia, Japan, Philippines
        nuclear: 300,          // China expanding rapidly (50+ reactors)
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 10.5,        // Gt CO2/year - world's factory
        subsectors: {
          cement: 2.80,        // 27% - China 55% of global cement
          steel: 3.50,         // 33% - China 50% of global steel
          chemicals: 2.10,     // 20% - petrochemicals, fertilizers
          other: 2.10,         // 20% - manufacturing, processing
        },
      },
      transport: {
        baseline: 4.20,        // Gt CO2/year - rapid motorization
        subsectors: {
          road: 3.00,          // 71% - cars, trucks growing fast
          aviation: 0.55,      // 13% - China domestic, Middle East hubs
          shipping: 0.50,      // 12% - global shipping dominance
          rail: 0.15,          // 4% - China high-speed rail
        },
      },
      buildings: {
        baseline: 2.20,        // Gt CO2/year - heating in north, cooling in south
        subsectors: {
          residential: 1.40,   // 64% - urbanization, heating
          commercial: 0.80,    // 36% - massive urban development
        },
      },
      agriculture: {
        baseline: 2.30,        // Gt CO2/year - rice paddies, livestock
        subsectors: {
          livestock: 1.00,     // 43% - pigs, cattle, poultry
          crops: 0.90,         // 39% - rice (methane), fertilizers
          landUse: 0.40,       // 18% - SE Asia deforestation
        },
      },
    },
  },
  oceania: {
    name: "Oceania",
    developmentLevel: "developed",
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
    diplomatic: {
      joinDifficulty: 4,
      baseDemands: ["localSpending"],
      personality: "cooperative",
      description: "Climate-aware, wants to ensure local benefits",
    },
    power: {
      baseDemandGW: 55,        // Real 2024: ~300 TWh / 8760 hrs ≈ 34 GW average
      demandGrowthRate: 0.02,  // IEA projection: 2% (data centers, EVs)
      currentMixTWh: {         // Real 2024 generation by source
        coal: 120,             // 40% - declining fast, closing plants
        gas: 60,               // 20% - peaker plants
        nuclear: 0,            // 0% - banned in Australia
        hydro: 21,             // 7% - Tasmania, Snowy scheme
        wind: 45,              // 15% - growing south coast
        solar: 48,             // 16% - rooftop solar boom
        other: 6,              // 2% - biomass, diesel
      },
      potentialGW: {
        solar: 1000,           // Excellent across Australian outback
        wind: 500,             // Southern coast, offshore
        hydro: 40,             // Mostly developed (Snowy 2.0)
        geothermal: 20,        // New Zealand, limited Australia
        nuclear: 0,            // Currently banned in Australia
      },
    },
    // Sector emissions in Gt CO2/year (non-power sectors, IEA 2023 data)
    sectorEmissions: {
      industry: {
        baseline: 0.18,        // Gt CO2/year - mining, processing
        subsectors: {
          cement: 0.02,        // 11% - local production
          steel: 0.04,         // 22% - iron ore processing
          chemicals: 0.05,     // 28% - LNG processing
          other: 0.07,         // 39% - aluminum, mining
        },
      },
      transport: {
        baseline: 0.12,        // Gt CO2/year - long distances
        subsectors: {
          road: 0.08,          // 67% - cars, road trains
          aviation: 0.025,     // 21% - necessary for distances
          shipping: 0.01,      // 8% - exports
          rail: 0.005,         // 4% - mining railways
        },
      },
      buildings: {
        baseline: 0.06,        // Gt CO2/year - mild climate
        subsectors: {
          residential: 0.04,   // 67% - cooling needs
          commercial: 0.02,    // 33% - urban centers
        },
      },
      agriculture: {
        baseline: 0.10,        // Gt CO2/year - extensive grazing
        subsectors: {
          livestock: 0.06,     // 60% - beef, sheep
          crops: 0.025,        // 25% - wheat, grains
          landUse: 0.015,      // 15% - land clearing
        },
      },
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

  // ═══════════════════════════════════════════════════════════════
  // SECTOR REDUCTION PROJECTS
  // These projects reduce emissions in specific non-power sectors
  // ═══════════════════════════════════════════════════════════════

  // INDUSTRY SECTOR
  greenSteel: {
    label: "Green Steel Plant",
    baseCost: 350,
    baseCo2Reduction: 4,
    income: 2,
    potentialKey: null,
    buildTime: 36,
    requires: { research: 5, greenHydrogen: 1 },
    description: "Hydrogen-based steelmaking eliminates coal from steel production.",
    tier: "advanced",
    category: "industry",
    sectorReduction: { industry: { steel: 0.15 } },  // 15% reduction in steel emissions
  },
  lowCarbonCement: {
    label: "Low-Carbon Cement",
    baseCost: 250,
    baseCo2Reduction: 3,
    income: 1,
    potentialKey: null,
    buildTime: 24,
    requires: { research: 4, carbonCapture: 1 },
    description: "Novel cement chemistry and carbon capture reduce emissions by 60%.",
    tier: "advanced",
    category: "industry",
    sectorReduction: { industry: { cement: 0.12 } },  // 12% reduction in cement emissions
  },
  industrialEfficiency: {
    label: "Industrial Efficiency",
    baseCost: 180,
    baseCo2Reduction: 2,
    income: 2,
    potentialKey: null,
    buildTime: 12,
    requires: { research: 3 },
    description: "Electrification and waste heat recovery in manufacturing.",
    tier: "intermediate",
    category: "industry",
    sectorReduction: { industry: { other: 0.08, chemicals: 0.05 } },
  },

  // TRANSPORT SECTOR
  publicTransit: {
    label: "Metro/Rail Expansion",
    baseCost: 450,
    baseCo2Reduction: 3,
    income: 2,
    potentialKey: null,
    buildTime: 48,
    requires: { research: 3 },
    description: "Electric mass transit reduces car dependency and emissions.",
    tier: "intermediate",
    category: "transport",
    sectorReduction: { transport: { road: 0.08 } },
    happiness: 10,
  },
  sustainableAviation: {
    label: "Sustainable Aviation Fuel",
    baseCost: 280,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    buildTime: 24,
    requires: { research: 5, greenHydrogen: 1 },
    description: "Bio-based and synthetic fuels for cleaner air travel.",
    tier: "advanced",
    category: "transport",
    sectorReduction: { transport: { aviation: 0.15 } },
  },
  electricFreight: {
    label: "Electric Freight",
    baseCost: 320,
    baseCo2Reduction: 3,
    income: 1,
    potentialKey: null,
    buildTime: 30,
    requires: { evInfrastructure: 2, greenHydrogen: 1 },
    description: "Electric and hydrogen trucks for goods transport.",
    tier: "advanced",
    category: "transport",
    sectorReduction: { transport: { road: 0.10 } },
  },
  greenShipping: {
    label: "Green Shipping Hub",
    baseCost: 380,
    baseCo2Reduction: 2,
    income: 2,
    potentialKey: null,
    buildTime: 36,
    requires: { research: 5, greenHydrogen: 1 },
    description: "Ammonia and hydrogen-powered shipping infrastructure.",
    tier: "advanced",
    category: "transport",
    sectorReduction: { transport: { shipping: 0.12 } },
  },

  // BUILDINGS SECTOR
  buildingRetrofit: {
    label: "Building Retrofit Program",
    baseCost: 200,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    buildTime: 18,
    requires: { research: 2 },
    description: "Insulation and efficient heating/cooling for existing buildings.",
    tier: "intermediate",
    category: "buildings",
    sectorReduction: { buildings: { residential: 0.10, commercial: 0.08 } },
    happiness: 5,
  },
  heatPumps: {
    label: "Heat Pump Rollout",
    baseCost: 150,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    buildTime: 12,
    requires: { research: 2, solarUtility: 2 },
    description: "Replace gas heating with efficient electric heat pumps.",
    tier: "intermediate",
    category: "buildings",
    sectorReduction: { buildings: { residential: 0.12 } },
  },
  greenBuildings: {
    label: "Green Building Standards",
    baseCost: 220,
    baseCo2Reduction: 2,
    income: 1,
    potentialKey: null,
    buildTime: 18,
    requires: { research: 3 },
    description: "Net-zero design standards for new commercial buildings.",
    tier: "intermediate",
    category: "buildings",
    sectorReduction: { buildings: { commercial: 0.15 } },
  },

  // AGRICULTURE SECTOR
  methaneCapture: {
    label: "Livestock Methane Capture",
    baseCost: 120,
    baseCo2Reduction: 2,
    income: 0,
    potentialKey: null,
    buildTime: 9,
    requires: { research: 2 },
    description: "Biodigesters convert livestock methane into clean energy.",
    tier: "intermediate",
    category: "agriculture",
    sectorReduction: { agriculture: { livestock: 0.15 } },
  },
  precisionAgriculture: {
    label: "Precision Agriculture",
    baseCost: 140,
    baseCo2Reduction: 1,
    income: 1,
    potentialKey: null,
    buildTime: 12,
    requires: { research: 3 },
    description: "AI-driven farming reduces fertilizer and emissions.",
    tier: "intermediate",
    category: "agriculture",
    sectorReduction: { agriculture: { crops: 0.12 } },
  },
  agroforestry: {
    label: "Agroforestry Program",
    baseCost: 160,
    baseCo2Reduction: 3,
    income: 0,
    potentialKey: "forest",
    buildTime: 24,
    requires: { reforestation: 3, sustainableAgriculture: 1 },
    description: "Integrates trees with crops, sequestering carbon while farming.",
    tier: "advanced",
    category: "agriculture",
    sectorReduction: { agriculture: { landUse: 0.20, crops: 0.05 } },
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTOR POLICIES (Global effects when enacted)
// ═══════════════════════════════════════════════════════════════

const SECTOR_POLICIES = {
  // INDUSTRY POLICIES
  industryEmissionsStandards: {
    id: "industryEmissionsStandards",
    label: "Industrial Emissions Standards",
    description: "Mandate emissions limits for all industrial facilities.",
    cost: 150,
    duration: 6,           // Months to implement
    sectorEffects: {
      industry: { growthMultiplier: 0.5 }  // Halve industry emission growth
    },
    happiness: -5,         // Some economic pushback
    requirements: { research: 3 },
    category: "industry",
  },
  carbonPricing: {
    id: "carbonPricing",
    label: "Carbon Pricing System",
    description: "Economy-wide carbon tax incentivizes emission reductions.",
    cost: 200,
    duration: 12,
    sectorEffects: {
      industry: { reductionBonus: 0.05 },
      transport: { reductionBonus: 0.03 },
      buildings: { reductionBonus: 0.02 },
    },
    incomeBonus: 0.05,     // 5% income boost from carbon revenues
    happiness: -8,
    requirements: {},
    category: "economy",
  },

  // TRANSPORT POLICIES
  vehicleEmissionStandards: {
    id: "vehicleEmissionStandards",
    label: "Vehicle Emission Standards",
    description: "Strict fuel efficiency and emission standards for new vehicles.",
    cost: 100,
    duration: 12,
    sectorEffects: {
      transport: { reductionBonus: 0.08 }
    },
    happiness: -3,
    requirements: {},
    category: "transport",
  },
  evMandate: {
    id: "evMandate",
    label: "Electric Vehicle Mandate",
    description: "Phase out new fossil fuel vehicle sales by 2035.",
    cost: 180,
    duration: 24,
    sectorEffects: {
      transport: { reductionBonus: 0.15, growthMultiplier: 0.3 }
    },
    happiness: -10,
    requirements: { evInfrastructure: 3 },
    category: "transport",
  },

  // BUILDINGS POLICIES
  buildingCodes: {
    id: "buildingCodes",
    label: "Green Building Codes",
    description: "Require energy efficiency standards for all new construction.",
    cost: 80,
    duration: 6,
    sectorEffects: {
      buildings: { growthMultiplier: 0 }  // Stop building emission growth
    },
    happiness: -2,
    requirements: { research: 2 },
    category: "buildings",
  },
  heatingElectrification: {
    id: "heatingElectrification",
    label: "Heating Electrification Act",
    description: "Subsidize heat pump adoption and ban new gas heating.",
    cost: 150,
    duration: 18,
    sectorEffects: {
      buildings: { reductionBonus: 0.12 }
    },
    happiness: -5,
    requirements: { heatPumps: 2 },
    category: "buildings",
  },

  // AGRICULTURE POLICIES
  sustainableFarmingSubsidies: {
    id: "sustainableFarmingSubsidies",
    label: "Sustainable Farming Subsidies",
    description: "Redirect agricultural subsidies to low-carbon practices.",
    cost: 120,
    duration: 12,
    sectorEffects: {
      agriculture: { reductionBonus: 0.08, growthMultiplier: 0.5 }
    },
    happiness: 3,          // Farmers like subsidies
    requirements: { sustainableAgriculture: 1 },
    category: "agriculture",
  },
  deforestationBan: {
    id: "deforestationBan",
    label: "Deforestation Ban",
    description: "Strict enforcement against illegal land clearing.",
    cost: 100,
    duration: 6,
    sectorEffects: {
      agriculture: { landUseReduction: 0.25 }
    },
    happiness: -3,
    requirements: { reforestation: 3 },
    category: "agriculture",
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
    // Pass through critical data for carbon balance calculation
    sectorEmissions: region.sectorEmissions || null,
    power: region.power || null,
    developmentLevel: region.developmentLevel || null,
    // Diplomatic data for negotiations
    diplomatic: region.diplomatic || null,
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

  // Emissions-weighted average for trend (higher emitters have more impact)
  let weightedTrend = 0;
  if (totalEmissions > 0) {
    countries.forEach((c) => {
      if (c.emissions?.trend !== undefined && c.emissions?.total) {
        weightedTrend += c.emissions.trend * (c.emissions.total / totalEmissions);
      }
    });
  }
  const avgTrend = Math.round(weightedTrend * 100) / 100;

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

  // Context-specific weighting for renewable potentials
  const potential = {};
  const potentialKeys = ["solar", "wind", "forest", "carbonCapture", "geothermal"];

  potentialKeys.forEach((key) => {
    let weightedSum = 0;
    let totalWeight = 0;
    let count = 0;

    countries.forEach((c) => {
      const p = c.potential?.[key];
      const score = typeof p === "object" ? p.score : p;
      if (typeof score === "number") {
        // Choose weighting based on potential type
        if (key === "solar" || key === "wind") {
          // Population-weighted (proxy for land area)
          const weight = c.population || 1;
          weightedSum += score * weight;
          totalWeight += weight;
        } else if (key === "carbonCapture") {
          // GDP-weighted (requires infrastructure investment)
          const weight = c.gdp || 1;
          weightedSum += score * weight;
          totalWeight += weight;
        } else {
          // Simple average for forest/geothermal (location-specific)
          weightedSum += score;
          count++;
        }
      }
    });

    if (key === "forest" || key === "geothermal") {
      potential[key] = { score: count > 0 ? Math.round((weightedSum / count) * 100) / 100 : 0.5 };
    } else {
      potential[key] = { score: totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0.5 };
    }
  });

  // Sum base income
  const baseIncome = countries.reduce((sum, c) => {
    // Calculate income from GDP if not specified
    const income = c.baseIncome || Math.max(1, Math.round(c.gdp * 0.5));
    return sum + income;
  }, 0);

  // Aggregate climate finance (GDP-weighted averages)
  let totalCurrentPercent = 0;
  let totalMaxPercent = 0;
  let totalMinPercent = 0;
  let totalDifficulty = 0;
  let totalPoliticalResistance = 0;
  let climateFinanceGdp = 0;

  countries.forEach((c) => {
    if (c.climateFinance && c.gdp) {
      climateFinanceGdp += c.gdp;
      totalCurrentPercent += (c.climateFinance.currentPercent || 0) * c.gdp;
      totalMaxPercent += (c.climateFinance.maxPercent || 5) * c.gdp;
      totalMinPercent += (c.climateFinance.minPercent || 0.5) * c.gdp;
      totalDifficulty += (c.climateFinance.difficulty || 0.5) * c.gdp;
      totalPoliticalResistance += (c.climateFinance.politicalResistance || 0.5) * c.gdp;
    }
  });

  const climateFinance = climateFinanceGdp > 0
    ? {
        currentPercent: Math.round((totalCurrentPercent / climateFinanceGdp) * 100) / 100,
        maxPercent: Math.round((totalMaxPercent / climateFinanceGdp) * 100) / 100,
        minPercent: Math.round((totalMinPercent / climateFinanceGdp) * 100) / 100,
        difficulty: Math.round((totalDifficulty / climateFinanceGdp) * 100) / 100,
        politicalResistance: Math.round((totalPoliticalResistance / climateFinanceGdp) * 100) / 100,
      }
    : {
        currentPercent: 1.5,
        maxPercent: 5,
        minPercent: 0.5,
        difficulty: 0.5,
        politicalResistance: 0.5,
      };

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
      trend: avgTrend,
      sources,
    },
    potential,
    climateFinance,
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

  const data = aggregateCountriesToRegion(
    region.countries,
    region.name,
    majorRegionId
  );

  // Override with curated major region-level values from MAJOR_REGIONS
  if (data && region) {
    // Power grid data for power emissions calculation
    data.power = region.power || data.power;
    // Development level for growth/efficiency rates
    data.developmentLevel = region.developmentLevel || data.developmentLevel;

    // Calculate sectorEmissions by distributing parent continent's emissions
    // based on this major region's share of the continent's power demand
    const continentId = region.continent;
    const continentAgg = REGION_AGGREGATES[continentId];
    if (continentAgg?.sectorEmissions) {
      // Get all major regions in this continent
      const continent = CONTINENTS[continentId];
      if (continent) {
        // Calculate total power demand for continent
        let totalContinentDemand = 0;
        continent.majorRegions.forEach(mrId => {
          const mr = MAJOR_REGIONS[mrId];
          totalContinentDemand += mr?.power?.baseDemandGW || 0;
        });

        // This region's share of continent (by power demand as proxy for economic activity)
        const regionDemand = region.power?.baseDemandGW || 0;
        const share = totalContinentDemand > 0 ? regionDemand / totalContinentDemand : 0;

        // Distribute continent's sector emissions proportionally
        data.sectorEmissions = {
          industry: {
            baseline: (continentAgg.sectorEmissions.industry?.baseline || 0) * share,
            subsectors: Object.fromEntries(
              Object.entries(continentAgg.sectorEmissions.industry?.subsectors || {})
                .map(([k, v]) => [k, v * share])
            ),
          },
          transport: {
            baseline: (continentAgg.sectorEmissions.transport?.baseline || 0) * share,
            subsectors: Object.fromEntries(
              Object.entries(continentAgg.sectorEmissions.transport?.subsectors || {})
                .map(([k, v]) => [k, v * share])
            ),
          },
          buildings: {
            baseline: (continentAgg.sectorEmissions.buildings?.baseline || 0) * share,
            subsectors: Object.fromEntries(
              Object.entries(continentAgg.sectorEmissions.buildings?.subsectors || {})
                .map(([k, v]) => [k, v * share])
            ),
          },
          agriculture: {
            baseline: (continentAgg.sectorEmissions.agriculture?.baseline || 0) * share,
            subsectors: Object.fromEntries(
              Object.entries(continentAgg.sectorEmissions.agriculture?.subsectors || {})
                .map(([k, v]) => [k, v * share])
            ),
          },
        };
      }
    }
  }

  return data;
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

  const data = aggregateCountriesToRegion(allCountries, continent.name, continentId);

  // Override values from REGION_AGGREGATES
  // The aggregation sums country data, but we want the curated continent-level values
  if (data && REGION_AGGREGATES[continentId]) {
    data.baseIncome = REGION_AGGREGATES[continentId].baseIncome || data.baseIncome;
    data.sectorIncome = REGION_AGGREGATES[continentId].sectorIncome || data.sectorIncome;
    // Critical for carbon balance calculation - sector emissions baselines
    data.sectorEmissions = REGION_AGGREGATES[continentId].sectorEmissions || null;
    // Power grid data for power emissions calculation
    data.power = REGION_AGGREGATES[continentId].power || data.power;
    // Development level for growth/efficiency rates
    data.developmentLevel = REGION_AGGREGATES[continentId].developmentLevel || data.developmentLevel;
    // Diplomatic data for negotiations
    data.diplomatic = REGION_AGGREGATES[continentId].diplomatic || data.diplomatic;
  }

  return data;
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
