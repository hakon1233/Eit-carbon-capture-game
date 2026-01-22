/**
 * Config module barrel export
 * Re-exports all configuration constants for easy importing
 */

// Core game configuration
export {
  GAME_CONFIG,
  REGIONAL_PROJECT_CAPS,
  GROWTH_CONFIG,
  SECTOR_GROWTH_RATES,
  DEVELOPMENT_GROWTH_MODIFIERS,
  EFFICIENCY_IMPROVEMENT,
  NATURAL_SINK_CONFIG,
  EMBODIED_CARBON,
  EMISSIONS_TO_PPM_FACTOR,
} from './game-config.js';

// Climate system (tipping points, feedback loops)
export {
  TIPPING_POINTS,
  FEEDBACK_LOOPS,
} from './climate-system.js';

// Alliance and diplomacy
export {
  DEMAND_TYPES,
  ALLIANCE_STATUS,
  HAPPINESS_THRESHOLDS,
  HOSTILE_COOLDOWN_MONTHS,
  NEGOTIATION_COOLDOWN_MONTHS,
  INTEREST_THRESHOLDS,
  NEGOTIABLE_TERMS,
} from './alliance-config.js';

// Power grid system
export {
  POWER_CONFIG,
  POWER_CATEGORY,
  CAPACITY_FACTORS,
} from './power-config.js';

// Technologies and research
export {
  TECHNOLOGIES,
  RESEARCH_POINTS_PER_CENTER,
  RESEARCH_CENTER_BASE,
  RESEARCH_FIELDS,
  RESEARCH_CENTERS,
} from './technologies.js';

// Events, disasters, achievements
export {
  EVENTS,
  NATURAL_DISASTERS,
  DEFAULT_VULNERABILITY_BY_REGION,
  ACHIEVEMENTS,
} from './events.js';

// Project definitions
export {
  PROJECT_TYPES,
  MONTHS,
} from './projects.js';

// Difficulty and setup
export {
  DIFFICULTY_MODES,
  DEFAULT_REGION_NAMES,
  DEFAULT_REGION_OFFSETS,
  GRANULARITY_CONFIG,
  GRANULARITY_LABELS,
  initGranularityLabels,
  GEO_DEFAULTS,
  GEO_THRESHOLDS,
} from './difficulty.js';

// Map visualization colors
export {
  MAP_MODE_COLORS,
} from './map-colors.js';
