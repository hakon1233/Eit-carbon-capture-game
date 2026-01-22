/**
 * UI Module barrel export
 * Re-exports all UI utility modules
 */

// Color utilities
export {
  blendColors,
  interpolateColor,
  getEmissionsColor,
  getRenewablesColor,
  getAverageRenewablePotential,
  getEconomyColor,
  getPowerColor,
  getStabilityColor,
  getTemperatureColor,
  getAllianceHappinessColor,
  hexToRgb,
  rgbToHex,
  getContrastColor,
} from "./colors.js";

// Render helpers
export {
  createStatCard,
  createProgressBar,
  createDetailItem,
  formatWithSuffix,
  formatEmissions,
  formatTemperature,
  formatCO2ppm,
  formatPower,
  createTooltip,
  formatPercentWithClass,
  createBadge,
  formatTimeRemaining,
  createSectionHeader,
  createExpandableSection,
  createDataTable,
  escapeHtml,
  createComparisonIndicator,
} from "./render-helpers.js";
