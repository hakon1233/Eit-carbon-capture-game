/**
 * Map visualization color configuration
 * Contains color palettes for different map display modes
 */

export const MAP_MODE_COLORS = {
  temperature: {
    veryLow: "#1a5fb4",   // Deep blue (cold)
    low: "#62a0ea",       // Light blue
    medium: "#f5c211",    // Bright yellow
    high: "#ff7800",      // Orange
    veryHigh: "#c01c28",  // Deep red (hot)
  },
  emissions: {
    veryLow: "#26a269",   // Dark green (clean)
    low: "#8ff0a4",       // Light green
    medium: "#f9f06b",    // Bright yellow
    high: "#ff7800",      // Orange
    veryHigh: "#a51d2d",  // Dark red (polluted)
  },
  renewables: {
    veryLow: "#63452c",   // Dark brown (poor)
    low: "#b5835a",       // Light brown
    medium: "#99c1f1",    // Light blue
    high: "#57e389",      // Bright green
    veryHigh: "#1a8c3d",  // Dark green (excellent)
  },
  economy: {
    veryLow: "#daf5e6",   // Very light green (small)
    low: "#8ff0a4",       // Light green
    medium: "#62a0ea",    // Blue
    high: "#1c71d8",      // Dark blue
    veryHigh: "#0d2444",  // Very dark blue (large)
  },
  power: {
    veryLow: "#c01c28",   // Dark red (severe shortage)
    low: "#ff7800",       // Orange (shortage)
    medium: "#f5c211",    // Yellow (near balance)
    high: "#57e389",      // Bright green (surplus)
    veryHigh: "#26a269",  // Dark green (large surplus)
  },
  stability: {
    veryLow: "#c01c28",   // Dark red (critical)
    low: "#ff7800",       // Orange (warning)
    medium: "#f5c211",    // Yellow (ok)
    high: "#62a0ea",      // Blue (good)
    veryHigh: "#26a269",  // Green (excellent)
  },
  alliance: {
    notAllied: "#1a1a2e", // Dark/black for non-alliance
    allied: "#26a269",    // Green for alliance members
  },
  allianceHappiness: {
    veryLow: "#c01c28",   // Dark red (very unhappy ~30%)
    low: "#ff7800",       // Orange (unhappy)
    medium: "#f5c211",    // Yellow (neutral)
    high: "#57e389",      // Light green (happy)
    veryHigh: "#26a269",  // Dark green (very happy ~90%)
    notAllied: "#1a1a2e", // Dark/black for non-alliance
  },
};
