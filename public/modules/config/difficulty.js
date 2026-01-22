/**
 * Difficulty modes and game setup configuration
 * Contains difficulty settings, region defaults, and geographic thresholds
 */

export const DIFFICULTY_MODES = {
  tutorial: {
    name: "Tutorial",
    description: "Learn the basics with a forgiving climate",
    co2Multiplier: 0.6,         // 0.24 ppm/month (base 0.4 × 0.6)
    startingFunds: 50,          // $50B starting (reduced for balance)
    costMultiplier: 0.7,        // -30% project costs
    eventsEnabled: false,
  },
  easy: {
    name: "Easy",
    description: "A gentler introduction to climate management",
    co2Multiplier: 0.8,         // 0.32 ppm/month
    startingFunds: 40,          // $40B starting (reduced for balance)
    costMultiplier: 0.85,       // -15% project costs
    eventsEnabled: true,
    eventSeverity: 0.5,         // Mild events
  },
  normal: {
    name: "Normal",
    description: "The real climate challenge",
    co2Multiplier: 1.0,         // 0.4 ppm/month
    startingFunds: 25,          // $25B starting (reduced for balance)
    costMultiplier: 1.0,        // Normal costs
    eventsEnabled: true,
    eventSeverity: 1.0,         // Normal events
  },
  hard: {
    name: "Hard",
    description: "Political resistance and harsh economics",
    co2Multiplier: 1.2,         // 0.48 ppm/month
    startingFunds: 20,          // $20B starting (reduced for balance)
    costMultiplier: 1.15,       // +15% project costs
    eventsEnabled: true,
    eventSeverity: 1.5,         // Harsh events
  },
  extreme: {
    name: "Extreme",
    description: "Can you save the planet against all odds?",
    co2Multiplier: 1.4,         // 0.56 ppm/month
    startingFunds: 15,          // $15B starting (reduced for balance)
    costMultiplier: 1.3,        // +30% project costs
    eventsEnabled: true,
    eventSeverity: 2.0,         // Extreme events
  },
};

export const DEFAULT_REGION_NAMES = {
  north_america: "North America",
  south_america: "South America",
  europe: "Europe",
  africa: "Africa",
  asia: "Asia",
  oceania: "Oceania",
};

export const DEFAULT_REGION_OFFSETS = {
  north_america: -0.15,
  south_america: 0.05,
  europe: -0.2,
  africa: 0.1,
  asia: -0.1,
  oceania: -0.2,
};

export const GRANULARITY_CONFIG = {
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
export let GRANULARITY_LABELS = {
  continents: {},
  major_regions: {},
  countries: {},
};

// Initialize labels from CLIMATE_DATA when available
export function initGranularityLabels() {
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

export const GEO_DEFAULTS = {
  minLon: -169.110266,
  maxLat: 83.600842,
  maxLon: 190.486279,
  minLat: -58.508473,
};

export const GEO_THRESHOLDS = {
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
