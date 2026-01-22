/**
 * Data module barrel export
 * Re-exports all data from the modularized climate-data system
 */

// Geographic data and mappings
export { ISO_TO_KEY, MAJOR_REGIONS, CONTINENTS } from "./geography.js";

// Country-level data
export { COUNTRY_DATA } from "./countries.js";

// Regional aggregates for continent-level gameplay
export { REGION_AGGREGATES } from "./region-aggregates.js";

// Project types and sector policies
export {
  ADVANCED_PROJECT_TYPES,
  SECTOR_POLICIES,
} from "./project-data.js";

// Emission sector definitions
export { EMISSION_SECTORS } from "./emission-sectors.js";

// Data access functions
export {
  getClimateData,
  aggregateRegionData,
  calculateProjectEffectiveness,
  getRandomFact,
  getCountryByIso,
  createDefaultCountryData,
  aggregateCountriesToRegion,
  getMajorRegionData,
  getContinentData,
  getDataForGranularity,
  getRegionIdsForGranularity,
  getParentRegion,
} from "./data-functions.js";
