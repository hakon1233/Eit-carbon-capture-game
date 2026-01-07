const GAME_CONFIG = {
  startingCredits: 100,
  startingCo2: 420,
  startingTemp: 1.2,
  startYear: 2025,
  startMonth: 1,
  co2Increase: 0.5,
  baseIncome: 5,
  baselineCo2: 280,
  tempFactor: 0.008,
  winTemp: 1.0,
  loseTemp: 3.0,
  loseYear: 2100,
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
    label: "Plant Forest",
    cost: 50,
    co2Reduction: 2,
    income: 0,
    description: "Plant trees to absorb carbon.",
  },
  solar: {
    label: "Solar Farm",
    cost: 100,
    co2Reduction: 1,
    income: 2,
    description: "Clean energy that generates credits.",
  },
  research: {
    label: "Research Lab",
    cost: 150,
    co2Reduction: 0,
    income: 5,
    description: "Innovation that boosts income.",
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

// Map mode color schemes
const MAP_MODE_COLORS = {
  temperature: {
    low: "#4a9eda",    // Cool blue
    medium: "#f4d370", // Yellow
    high: "#e85d5d",   // Red
  },
  emissions: {
    low: "#5ed68a",    // Green
    medium: "#f4d370", // Yellow
    high: "#e85d5d",   // Red/orange
  },
  renewables: {
    low: "#8b6b61",    // Brown (low potential)
    medium: "#7eb8da", // Light blue
    high: "#2ecc71",   // Bright green (high potential)
  },
  economy: {
    low: "#a8d5ba",    // Light green
    medium: "#7eb8da", // Blue
    high: "#2c3e50",   // Dark blue
  },
};

const creditsEl = document.getElementById("credits");
const temperatureEl = document.getElementById("temperature");
const co2El = document.getElementById("co2");
const dateEl = document.getElementById("date");
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
  switch (continent) {
    case "north_america":
      if (lat < GEO_THRESHOLDS.centralAmericaLat) {
        return "central_america";
      }
      return "north_america";
    case "south_america":
      return "south_america";
    case "europe":
      return lat >= GEO_THRESHOLDS.europeNorthLat ? "europe_north" : "europe_south";
    case "africa":
      return lat >= GEO_THRESHOLDS.africaNorthLat ? "africa_north" : "africa_south";
    case "asia":
      if (lon < GEO_THRESHOLDS.asiaWestLon) {
        return "asia_west";
      }
      if (lat < GEO_THRESHOLDS.asiaSouthLat) {
        return "asia_south";
      }
      if (lon >= GEO_THRESHOLDS.asiaEastLon) {
        return "asia_east";
      }
      return "asia_southeast";
    case "oceania":
      return "oceania";
    default:
      return continent;
  }
}

function getRegionalRegionId(continent, geo) {
  const { lon, lat } = geo;
  switch (continent) {
    case "north_america":
      if (lat >= GEO_THRESHOLDS.northAmericaLat) {
        return "north_america_north";
      }
      if (lat >= GEO_THRESHOLDS.centralAmericaLat) {
        return lon < GEO_THRESHOLDS.northAmericaWestLon ? "north_america_west" : "north_america_east";
      }
      return lon < GEO_THRESHOLDS.caribbeanLon ? "central_america" : "caribbean";
    case "south_america":
      return lat >= GEO_THRESHOLDS.southAmericaSplitLat ? "south_america_north" : "south_america_south";
    case "europe":
      if (lat >= GEO_THRESHOLDS.europeNorthLat) {
        return "europe_north";
      }
      if (lat < GEO_THRESHOLDS.europeSouthLat) {
        return "europe_south";
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
        return "africa_north";
      }
      if (lat < GEO_THRESHOLDS.africaSouthLat) {
        return "africa_south";
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
      if (lon >= GEO_THRESHOLDS.asiaEastLon) {
        return "asia_east";
      }
      return "asia_southeast";
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
  if (svgDoc.getElementById(styleId)) {
    return;
  }
  const styleEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
  styleEl.setAttribute("id", styleId);
  styleEl.textContent = `
    .region {
      fill: #2f4f4f;
      stroke: #d7e3f5;
      stroke-width: 1.5;
      cursor: pointer;
      transition: fill 0.2s ease, transform 0.2s ease, stroke 0.2s ease;
      transform-origin: center;
      outline: none;
    }
    .region:hover {
      filter: brightness(1.12);
      transform: translateY(-2px);
    }
    .region:focus,
    .region:focus-visible {
      outline: none !important;
    }
    .region.selected {
      stroke: #d7e3f5;
      stroke-width: 1.5;
      filter: none;
      transform: none;
    }
  `;
  svgDoc.documentElement.appendChild(styleEl);
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

  state = {
    credits: GAME_CONFIG.startingCredits,
    co2: GAME_CONFIG.startingCo2,
    temperature: GAME_CONFIG.startingTemp,
    year: GAME_CONFIG.startYear,
    month: GAME_CONFIG.startMonth,
    regions,
    gameOver: false,
    won: false,
  };

  selectedRegionId = null;

  clearNews();
  pushMessage("Global initiative launched. Choose a region to invest in.");
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
  }

  state.co2 += GAME_CONFIG.co2Increase;

  let totalReduction = 0;
  let totalIncome = 0;

  // Calculate income from each region (GDP-based)
  Object.entries(state.regions).forEach(([regionId, region]) => {
    // Add regional base income
    totalIncome += region.baseIncome || 0;

    // Add income from projects
    region.projects.forEach((proj) => {
      // Handle both old format (string) and new format ({ type, effectMultiplier })
      const projectType = typeof proj === "string" ? proj : proj.type;
      const effectMult = typeof proj === "object" ? proj.effectMultiplier : 1;
      const project = PROJECT_TYPES[projectType];
      if (!project) {
        return;
      }
      totalReduction += project.co2Reduction * effectMult;
      totalIncome += project.income;
    });
  });

  // Fallback to base income if no regional income
  if (totalIncome === 0) {
    totalIncome = GAME_CONFIG.baseIncome;
  }

  state.co2 = Math.max(GAME_CONFIG.baselineCo2, state.co2 - totalReduction);
  state.credits += totalIncome;
  state.temperature = calculateTemperature(state.co2);
  updateRegionTemps();

  const netChange = totalReduction - GAME_CONFIG.co2Increase;
  const tone = netChange >= 0 ? "good" : "bad";
  pushMessage(`Month advanced. Income: +${totalIncome.toFixed(0)}c. CO2: ${state.co2.toFixed(1)} ppm.`, tone);

  checkWinLose();
  updateUI();
}

function updateRegionTemps() {
  Object.keys(state.regions).forEach((regionId) => {
    state.regions[regionId].temp = state.temperature + regionOffsets[regionId];
  });
}

function selectRegion(regionId) {
  if (!state.regions[regionId]) {
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
  if (state.credits < project.cost) {
    pushMessage("Not enough credits for that project.", "bad");
    return;
  }

  state.credits -= project.cost;
  region.projects.push(projectType);
  pushMessage(`${project.label} built in ${getRegionName(regionId)}.`, "good");
  updateUI();
}

function updateUI() {
  creditsEl.textContent = Math.floor(state.credits).toString();
  temperatureEl.textContent = `${state.temperature >= 0 ? "+" : ""}${state.temperature.toFixed(2)}°C`;
  co2El.textContent = `${state.co2.toFixed(1)} ppm`;
  dateEl.textContent = `${MONTHS[state.month - 1]} ${state.year}`;

  updateSelectedRegionPanel();
  renderProjectButtons();
  renderRegionProjects();
  updateMapColors();
  updateMapSelection();
  updateControls();
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
  titleEl.textContent = "Regional Economy";

  const totalEl = document.createElement("span");
  totalEl.className = "income-total";
  const totalIncome = region.baseIncome || 0;
  totalEl.textContent = `+${totalIncome.toFixed(0)}c/month`;

  header.append(titleEl, totalEl);
  regionIncomeEl.appendChild(header);

  // GDP info
  if (climateData.gdp) {
    const gdpEl = document.createElement("div");
    gdpEl.className = "income-gdp";
    gdpEl.textContent = `GDP: $${climateData.gdp.toFixed(1)} trillion`;
    regionIncomeEl.appendChild(gdpEl);
  }

  // Sector income breakdown
  if (region.sectorIncome) {
    const sectors = window.CLIMATE_DATA?.EMISSION_SECTORS || {};

    Object.entries(region.sectorIncome).forEach(([key, income]) => {
      if (income <= 0) return;

      const sector = sectors[key] || { label: key, icon: "$" };
      const row = document.createElement("div");
      row.className = "income-row";

      const icon = document.createElement("span");
      icon.className = "income-icon";
      icon.textContent = sector.icon;

      const label = document.createElement("span");
      label.className = "income-label";
      label.textContent = sector.label;

      const value = document.createElement("span");
      value.className = "income-value";
      value.textContent = `+${income.toFixed(1)}c`;

      // Show modifier if any
      const modifier = region.incomeModifiers?.[key];
      if (modifier && modifier !== 0) {
        const modEl = document.createElement("span");
        modEl.className = `income-modifier ${modifier > 0 ? "positive" : "negative"}`;
        modEl.textContent = modifier > 0 ? ` (+${modifier.toFixed(1)})` : ` (${modifier.toFixed(1)})`;
        value.appendChild(modEl);
      }

      row.append(icon, label, value);
      regionIncomeEl.appendChild(row);
    });
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

  Object.entries(PROJECT_TYPES).forEach(([type, project]) => {
    const card = document.createElement("div");
    card.className = "project-card";

    // Calculate effectiveness-adjusted values
    const effectiveness = getProjectEffectiveness(type, selectedRegionId, climateData);
    const adjustedCost = effectiveness.cost;
    const adjustedReduction = effectiveness.co2Reduction;

    const button = document.createElement("button");
    button.className = "project-button";

    // Show adjusted cost
    let buttonText = `${project.label} (${adjustedCost}c)`;
    button.textContent = buttonText;

    // Add effectiveness indicator if different from base
    if (effectiveness.effectMultiplier !== 1 && effectiveness.effectMultiplier > 0) {
      const effectBadge = document.createElement("span");
      const mult = effectiveness.effectMultiplier;
      effectBadge.className = `project-effectiveness ${mult > 1 ? "bonus" : "penalty"}`;
      effectBadge.textContent = mult > 1 ? `${(mult * 100 - 100).toFixed(0)}% bonus` : `${(100 - mult * 100).toFixed(0)}% penalty`;
      button.appendChild(effectBadge);
    }

    button.disabled = state.gameOver || state.credits < adjustedCost;
    button.addEventListener("click", () => buildProjectWithEffectiveness(selectedRegionId, type, effectiveness));

    const effectParts = [];
    if (adjustedReduction > 0) {
      effectParts.push(`-${adjustedReduction.toFixed(1)} CO2 / month`);
    }
    if (project.income > 0) {
      effectParts.push(`+${project.income} credits / month`);
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

  const cost = effectiveness.cost;
  if (state.credits < cost) {
    pushMessage("Not enough credits for that project.", "bad");
    return;
  }

  state.credits -= cost;

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
  if (!svgDoc || !svgRegions.size) {
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
  // value is 0-1
  const clampedValue = Math.max(0, Math.min(1, value));

  if (clampedValue < 0.5) {
    const t = clampedValue * 2;
    return blendColors(colors.low, colors.medium, t);
  } else {
    const t = (clampedValue - 0.5) * 2;
    return blendColors(colors.medium, colors.high, t);
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
  // Scale: 0 = low (0T), 1 = high (30T+)
  const maxGdp = 30;
  const normalized = Math.min(climateData.gdp / maxGdp, 1);
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
  gradient.style.background = `linear-gradient(to right, ${config.colors.low}, ${config.colors.medium}, ${config.colors.high})`;
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
  const item = document.createElement("div");
  item.className = `news-item ${tone}`.trim();
  item.textContent = message;
  newsLogEl.prepend(item);

  while (newsLogEl.children.length > 2) {
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
    });

    regionNames = nextRegionNames;
    availableRegionIds = nextRegionIds;

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
  if (!force && current === source) {
    return;
  }
  svgDoc = null;
  svgRegions = new Map();
  if (force && current === source) {
    const cacheBuster = `#g=${Date.now()}`;
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
  const sameSource = mapObject && currentSource === mapSource;
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
    setGranularity(event.target.value, true);
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

document.addEventListener("DOMContentLoaded", () => {
  initGranularityLabels();
  loadMapColors();
  wireControls();
  wireMap();
  wireMapSelector();
  wireMapModeSelector();
  wireStatsInfo();
  initGame();
});
