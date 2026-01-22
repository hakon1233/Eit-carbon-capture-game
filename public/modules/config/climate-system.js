/**
 * Climate system configuration
 * Tipping points and feedback loops that affect global climate dynamics
 */

// Tipping Points - irreversible climate thresholds (tuned for harder difficulty)
export const TIPPING_POINTS = [
  {
    id: "arctic_ice",
    name: "Arctic Sea Ice Decline",
    threshold: 1.4,          // Triggers earlier (was 1.5)
    co2Modifier: 0.08,       // +0.08 ppm/month (was 0.05, +60%)
    description: "Arctic sea ice is rapidly disappearing, reducing Earth's reflectivity and accelerating warming.",
    reversible: false,
    effects: {
      warming: 0.08,         // Additional monthly CO2 equivalent
    },
  },
  {
    id: "permafrost",
    name: "Permafrost Methane Release",
    threshold: 1.7,          // Triggers earlier (was 2.0)
    co2Modifier: 0.15,       // +0.15 ppm/month from methane (was 0.1, +50%)
    description: "Thawing permafrost is releasing ancient methane stores, creating a dangerous feedback loop.",
    reversible: false,
    effects: {
      warming: 0.15,
    },
  },
  {
    id: "amazon_dieback",
    name: "Amazon Rainforest Dieback",
    threshold: 2.1,          // Triggers earlier (was 2.5)
    co2Modifier: 0.12,       // +0.12 ppm/month (was 0.08, +50%)
    description: "The Amazon rainforest is transitioning to savanna, releasing stored carbon and reducing global oxygen production.",
    reversible: false,
    effects: {
      warming: 0.12,
      forestEffectiveness: 0.5, // Forest projects 50% less effective
    },
  },
  {
    id: "ocean_circulation",
    name: "Ocean Circulation Weakening",
    threshold: 2.4,          // Triggers earlier (was 2.8)
    co2Modifier: 0.18,       // +0.18 ppm/month (was 0.12, +50%)
    description: "Atlantic ocean circulation is slowing dramatically, disrupting global weather patterns and reducing ocean CO2 absorption.",
    reversible: false,
    effects: {
      warming: 0.18,
      oceanAbsorption: 0.7,  // Ocean absorbs 30% less CO2
    },
  },
];

// Feedback loops - temperature-dependent effects (tuned for harder difficulty)
export const FEEDBACK_LOOPS = {
  // Ice-albedo feedback: less ice = more heat absorption
  iceAlbedo: {
    startTemp: 1.5,
    maxTemp: 3.0,
    maxEffect: 0.05,  // Up to +0.05 ppm/month at max (was 0.03, +67%)
    description: "Melting ice reduces Earth's reflectivity",
  },
  // Ocean saturation: warmer oceans absorb less CO2
  oceanSaturation: {
    startCO2: 450,
    maxCO2: 550,
    maxEffect: 0.08,  // Up to +0.08 ppm/month at max (was 0.05, +60%)
    description: "Warmer oceans absorb less carbon dioxide",
  },
  // Vegetation stress: extreme temps harm plants
  vegetationStress: {
    startTemp: 2.0,
    maxTemp: 3.0,
    maxEffect: 0.04,  // Up to +0.04 ppm/month at max (was 0.02, +100%)
    description: "Heat stress reduces vegetation's carbon absorption",
  },
};
