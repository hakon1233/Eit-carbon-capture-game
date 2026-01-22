/**
 * Climate Data - Backward Compatibility Layer
 *
 * This file re-exports all data from the modularized climate-data system
 * for backward compatibility with existing code that uses window.CLIMATE_DATA.
 *
 * The actual data is now organized in public/modules/data/
 */

// Import all data and functions from the modularized system
import {
  // Geographic data and mappings
  ISO_TO_KEY,
  MAJOR_REGIONS,
  CONTINENTS,
  // Country-level data
  COUNTRY_DATA,
  // Regional aggregates for continent-level gameplay
  REGION_AGGREGATES,
  // Project types and sector policies
  ADVANCED_PROJECT_TYPES,
  SECTOR_POLICIES,
  // Emission sector definitions
  EMISSION_SECTORS,
  // Data access functions
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
} from "./modules/data/index.js";

// Export for use in game.js (backward compatibility)
if (typeof window !== "undefined") {
  window.CLIMATE_DATA = {
    // Data constants
    COUNTRY_DATA,
    REGION_AGGREGATES,
    EMISSION_SECTORS,
    ADVANCED_PROJECT_TYPES,
    SECTOR_POLICIES,
    // 3-tier granularity constants
    ISO_TO_KEY,
    MAJOR_REGIONS,
    CONTINENTS,
    // Data access functions
    getClimateData,
    aggregateRegionData,
    calculateProjectEffectiveness,
    getRandomFact,
    // Granularity functions
    getCountryByIso,
    createDefaultCountryData,
    aggregateCountriesToRegion,
    getDataForGranularity,
    getRegionIdsForGranularity,
    getParentRegion,
    getMajorRegionData,
    getContinentData,
  };
}

// Also export as ES modules for direct imports
export {
  // Data constants
  COUNTRY_DATA,
  REGION_AGGREGATES,
  EMISSION_SECTORS,
  ADVANCED_PROJECT_TYPES,
  SECTOR_POLICIES,
  // Geographic mappings
  ISO_TO_KEY,
  MAJOR_REGIONS,
  CONTINENTS,
  // Functions
  getClimateData,
  aggregateRegionData,
  calculateProjectEffectiveness,
  getRandomFact,
  getCountryByIso,
  createDefaultCountryData,
  aggregateCountriesToRegion,
  getDataForGranularity,
  getRegionIdsForGranularity,
  getParentRegion,
  getMajorRegionData,
  getContinentData,
};
