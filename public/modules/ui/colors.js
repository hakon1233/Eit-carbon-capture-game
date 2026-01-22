/**
 * UI Color Utilities
 * Pure functions for color interpolation and manipulation
 */

/**
 * Blend two hex colors together
 * @param {string} color1 - First hex color (e.g., "#ff0000")
 * @param {string} color2 - Second hex color
 * @param {number} t - Blend factor (0 = color1, 1 = color2)
 * @returns {string} Blended hex color
 */
export function blendColors(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Interpolate color across 5 color stops
 * @param {number} value - Value between 0 and 1
 * @param {Object} colors - Color stops {veryLow, low, medium, high, veryHigh}
 * @returns {string} Interpolated hex color
 */
export function interpolateColor(value, colors) {
  const clampedValue = Math.max(0, Math.min(1, value));
  const { veryLow, low, medium, high, veryHigh } = colors;

  if (clampedValue <= 0.25) {
    return blendColors(veryLow, low, clampedValue / 0.25);
  } else if (clampedValue <= 0.5) {
    return blendColors(low, medium, (clampedValue - 0.25) / 0.25);
  } else if (clampedValue <= 0.75) {
    return blendColors(medium, high, (clampedValue - 0.5) / 0.25);
  } else {
    return blendColors(high, veryHigh, (clampedValue - 0.75) / 0.25);
  }
}

/**
 * Get color for emissions value
 * @param {number} emissions - Emissions in Gt CO2
 * @param {Object} colorConfig - MAP_MODE_COLORS.emissions config
 * @returns {string} Hex color
 */
export function getEmissionsColor(emissions, colorConfig) {
  if (emissions === undefined || emissions === null) {
    return "#666";
  }
  const maxEmissions = 12;
  const normalized = Math.min(emissions / maxEmissions, 1);
  return interpolateColor(normalized, colorConfig);
}

/**
 * Get color for renewable potential
 * @param {number} avgPotential - Average renewable potential (0-1)
 * @param {Object} colorConfig - MAP_MODE_COLORS.renewables config
 * @returns {string} Hex color
 */
export function getRenewablesColor(avgPotential, colorConfig) {
  if (avgPotential === undefined) {
    return "#666";
  }
  return interpolateColor(avgPotential, colorConfig);
}

/**
 * Calculate average renewable potential from potential object
 * @param {Object} potential - Potential object with solar, wind, forest scores
 * @returns {number} Average potential (0-1)
 */
export function getAverageRenewablePotential(potential) {
  if (!potential) return 0.5;

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

/**
 * Get color for GDP value (logarithmic scale)
 * @param {number} gdp - GDP in trillions
 * @param {Object} colorConfig - MAP_MODE_COLORS.economy config
 * @returns {string} Hex color
 */
export function getEconomyColor(gdp, colorConfig) {
  if (!gdp || gdp <= 0) {
    return "#666";
  }
  const minLog = -2; // ~$10 billion
  const maxLog = 1.5; // ~$30 trillion
  const gdpLog = Math.log10(Math.max(gdp, 0.01));
  const normalized = Math.max(0, Math.min(1, (gdpLog - minLog) / (maxLog - minLog)));
  return interpolateColor(normalized, colorConfig);
}

/**
 * Get color for power supply/demand ratio
 * @param {number} supply - Power supply in TWh
 * @param {number} demand - Power demand in TWh
 * @param {Object} colorConfig - MAP_MODE_COLORS.power config
 * @returns {string} Hex color
 */
export function getPowerColor(supply, demand, colorConfig) {
  if (!demand || demand <= 0) return "#666";
  const ratio = supply / demand;
  const normalized = Math.max(0, Math.min(1, (ratio - 0.5) / 1.0));
  return interpolateColor(normalized, colorConfig);
}

/**
 * Get color for grid stability
 * @param {number} stability - Stability value (0-100)
 * @param {Object} colorConfig - MAP_MODE_COLORS.stability config
 * @returns {string} Hex color
 */
export function getStabilityColor(stability, colorConfig) {
  if (stability === undefined) return "#666";
  const normalized = stability / 100;
  return interpolateColor(normalized, colorConfig);
}

/**
 * Get color for temperature
 * @param {number} temp - Temperature anomaly in C
 * @param {Object} colorConfig - MAP_MODE_COLORS.temperature config
 * @returns {string} Hex color
 */
export function getTemperatureColor(temp, colorConfig) {
  const minTemp = 0.8;
  const maxTemp = 2.5;
  const normalized = (temp - minTemp) / (maxTemp - minTemp);
  return interpolateColor(normalized, colorConfig);
}

/**
 * Get color for alliance happiness
 * @param {number} happiness - Happiness value (typically 30-90)
 * @param {Object} colorConfig - MAP_MODE_COLORS.allianceHappiness config
 * @returns {string} Hex color
 */
export function getAllianceHappinessColor(happiness, colorConfig) {
  if (happiness === undefined) return colorConfig.notAllied || "#666";
  const normalized = Math.max(0, Math.min(1, (happiness - 30) / 60));
  return interpolateColor(normalized, colorConfig);
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string
 * @returns {Object} {r, g, b} values (0-255)
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color
 */
export function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Get contrasting text color (black or white) for a background
 * @param {string} hexColor - Background hex color
 * @returns {string} "#000000" or "#ffffff"
 */
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
