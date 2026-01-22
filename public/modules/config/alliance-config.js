/**
 * Alliance and diplomatic system configuration
 * Contains demand types, statuses, thresholds, and negotiation terms
 */

// Demand types that regions can make when negotiating to join alliance
export const DEMAND_TYPES = {
  carbonTaxLimit: {
    id: "carbonTaxLimit",
    text: "Limit carbon tax to ${value}/ton",
    generateValue: () => 20 + Math.floor(Math.random() * 30), // $20-50/ton
    check: (region, value) => (region.carbonTax?.ratePerTon || 0) <= value,
    difficulty: "easy",
  },
  localSpending: {
    id: "localSpending",
    text: "Spend at least {value}% of our funds in our region",
    generateValue: () => 30 + Math.floor(Math.random() * 30), // 30-60%
    check: (region, value) => (region.spendRatio || 0) >= value / 100,
    difficulty: "medium",
  },
  economicProjects: {
    id: "economicProjects",
    text: "Build at least {value} economic project(s)",
    generateValue: () => 1 + Math.floor(Math.random() * 2), // 1-2
    check: (region, value) => (region.economicProjectCount || 0) >= value,
    difficulty: "medium",
  },
  noNuclear: {
    id: "noNuclear",
    text: "No nuclear projects in our territory",
    generateValue: () => true,
    check: (region) => !region.hasNuclear,
    difficulty: "hard",
  },
  jobPriority: {
    id: "jobPriority",
    text: "Build at least {value} job-creating project(s)",
    generateValue: () => 1,
    check: (region, value) => (region.jobProjectCount || 0) >= value,
    difficulty: "easy",
  },
};

// Alliance status constants
export const ALLIANCE_STATUS = {
  ALLIED: "allied",
  NEUTRAL: "neutral",
  NEGOTIATING: "negotiating",
  HOSTILE: "hostile",
};

// Happiness thresholds
export const HAPPINESS_THRESHOLDS = {
  HAPPY: 80,      // May increase contribution
  CONTENT: 60,    // Stable
  CONCERNED: 40,  // Warning, may make demands
  UNHAPPY: 20,    // Reduces contribution, threatens to leave
  CRITICAL: 0,    // May leave alliance
};

// Hostile cooldown in months
export const HOSTILE_COOLDOWN_MONTHS = 6;

// Negotiation cooldown (after asking, before can ask again)
export const NEGOTIATION_COOLDOWN_MONTHS = 3;

// Interest thresholds for non-allied regions
export const INTEREST_THRESHOLDS = {
  VERY_HIGH: 80,    // May spontaneously request to join
  HIGH: 60,         // Receptive to negotiation
  MODERATE: 40,     // Neutral stance
  LOW: 20,          // Resistant to joining
  HOSTILE: 0,       // Very resistant
};

// Terms that can be set when negotiating with regions
export const NEGOTIABLE_TERMS = {
  climateDedicationMin: {
    label: "Minimum Climate Dedication",
    description: "Minimum % of GDP dedicated to climate action",
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    unit: "%",
    impactPerStep: -5,
  },
  climateDedicationMax: {
    label: "Maximum Climate Dedication",
    description: "Maximum % of GDP dedicated to climate action",
    min: 5,
    max: 20,
    step: 1,
    default: 10,
    unit: "%",
    impactPerStep: -3,
  },
  powerStabilityGoal: {
    label: "Power Stability Goal",
    description: "Alliance commitment to improve grid stability",
    min: 50,
    max: 95,
    step: 5,
    default: 70,
    unit: "%",
    impactPerStep: 3, // Higher = more attractive (we're promising to help more)
    higherIsBetter: true,
  },
  powerSupplyGoal: {
    label: "Power Supply Goal",
    description: "Alliance commitment to improve power supply",
    min: 90,
    max: 120,
    step: 5,
    default: 100,
    unit: "%",
    impactPerStep: 3, // Higher = more attractive (we're promising to help more)
    higherIsBetter: true,
  },
  goalDeadlineYears: {
    label: "Goal Deadline",
    description: "Years to achieve power goals (shorter = more attractive)",
    min: 5,
    max: 25,
    step: 5,
    default: 15,
    unit: " years",
    impactPerStep: 2, // Shorter deadline = more attractive
    shorterIsBetter: true,
  },
  carbonTaxRate: {
    label: "Carbon Tax Rate",
    description: "Tax rate per ton of CO2 emissions",
    min: 10,
    max: 100,
    step: 5,
    default: 25,
    unit: "$/ton",
    impactPerStep: -2, // Higher tax = harder to negotiate
  },
  carbonTaxGrowth: {
    label: "Carbon Tax Growth",
    description: "Yearly increase in carbon tax rate",
    min: 0,
    max: 10,
    step: 1,
    default: 5,
    unit: "%/year",
    impactPerStep: -1, // Higher growth = harder to negotiate
  },
};
