import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// BUG-CAR-397: saves created before the diplomatic alliance system do not have
// state.alliance. loadGame() must migrate that shape before nextMonth() reaches
// the January carbon-tax growth loop, which calls Object.entries(state.alliance).

const source = fs.readFileSync(new URL("../game.js", import.meta.url), "utf8");

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

const legacySave = {
  state: {
    funds: 100,
    co2: 420,
    temperature: 1.2,
    year: 2025,
    month: 12,
    gameOver: false,
    regions: {
      europe: {
        name: "Europe",
        projects: [],
        sectorEmissions: {},
      },
    },
    homeRegion: "europe",
  },
  selectedRegionId: "europe",
  currentGranularity: "continents",
  currentMapMode: "temperature",
  currentDifficulty: "normal",
};

const context = {
  SAVE_KEY: "carbonCaptureGameSave",
  ALLIANCE_STATUS: { ALLIED: "allied", NEUTRAL: "neutral" },
  CLIMATE_DATA: { REGION_AGGREGATES: {} },
  NEGOTIABLE_TERMS: {
    carbonTaxRate: { default: 25 },
    carbonTaxGrowth: { default: 2 },
  },
  console: { warn() {}, log() {} },
  currentDifficulty: "normal",
  currentGranularity: "continents",
  currentMapMode: "alliance",
  isSetupMode: true,
  localStorage: {
    getItem(key) {
      return key === "carbonCaptureGameSave" ? JSON.stringify(legacySave) : null;
    },
  },
  mapDebug() {},
  getClimateDataForRegion() {
    return null;
  },
  initializeSectorEmissions() {
    return {};
  },
  getRegionOffset() {
    return 0;
  },
  state: {},
};
context.globalThis = context;
vm.createContext(context);

vm.runInContext(extractFunction("initializeAllianceState"), context);
vm.runInContext(extractFunction("loadGame"), context);

assert.equal(context.loadGame(), true, "legacy save should load");
assert.ok(context.state.alliance, "loadGame should migrate missing alliance state");
assert.equal(
  context.state.alliance.europe?.status,
  "allied",
  "legacy home region should remain allied after migration",
);

assert.doesNotThrow(
  () => Object.entries(context.state.alliance),
  "January carbon-tax growth loop must be safe after loading a legacy save",
);

console.log("PASS: legacy saves without alliance state migrate before monthly loop");
