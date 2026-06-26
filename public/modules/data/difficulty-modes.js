// ═══════════════════════════════════════════════════════════════
// DIFFICULTY MODES — single source of truth (CAR-163)
// ═══════════════════════════════════════════════════════════════
// Shared config consumed by both the launch screen (index.html) and
// the game runtime (game.js). Each mode carries the balance knobs and a
// player-facing `description`. Do not re-hardcode these values elsewhere —
// import from here so the launch screen and the simulation never drift.

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
