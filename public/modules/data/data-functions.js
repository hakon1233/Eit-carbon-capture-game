/**
 * Climate data helper functions
 * Contains functions for data lookup, aggregation, and project effectiveness
 */

import { COUNTRY_DATA } from './countries.js';
import { ISO_TO_KEY, MAJOR_REGIONS, CONTINENTS } from './geography.js';
import { REGION_AGGREGATES } from './region-aggregates.js';
import { ADVANCED_PROJECT_TYPES } from './project-data.js';

/**
 * Get climate data for a region or country ID
 */
export function getClimateData(regionId) {
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
export function aggregateRegionData(regionId) {
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
export function calculateProjectEffectiveness(projectType, regionId) {
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
export function getRandomFact(regionId) {
  const data = getClimateData(regionId);
  if (!data?.facts?.length) return null;
  return data.facts[Math.floor(Math.random() * data.facts.length)];
}

/**
 * Get country data by ISO code, with fallback to regional defaults
 */
export function getCountryByIso(isoCode) {
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
export function createDefaultCountryData(isoCode, majorRegionId) {
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
export function aggregateCountriesToRegion(countryIsoCodes, regionName, regionId) {
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
export function getMajorRegionData(majorRegionId) {
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
export function getContinentData(continentId) {
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
export function getDataForGranularity(level, id) {
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
export function getRegionIdsForGranularity(level) {
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
export function getParentRegion(isoCode, level) {
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
