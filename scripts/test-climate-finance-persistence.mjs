import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// CAR-404: climate-finance campaign/negotiation progress must live in `state`,
// not on the imported COUNTRY_DATA module singleton.
//
// Failure A (save/load loss): a completed campaign mutated COUNTRY_DATA in place;
//   saveGame() only serializes `state`, so on reload the ES module re-evaluated
//   back to file defaults and the progress (and its income) silently vanished.
// Failure B (cross-game leak): initGame() never reset COUNTRY_DATA, so a new game
//   inherited the previous run's inflated percentages.
//
// The fix records every change in state.climateFinanceOverrides, re-hydrates the
// singleton on load (applyClimateFinanceOverrides), and resets it to pristine
// defaults on New Game (resetClimateFinanceDefaults). This guards all three.

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

// Pristine per-country baseline (what the module snapshots at load, before any
// game mutates it).
const PRISTINE = {
  usa: { currentPercent: 2, maxPercent: 5 },
  canada: { currentPercent: 3, maxPercent: 6 },
};

function freshCountryData() {
  return {
    usa: {
      name: "USA",
      gdp: 25,
      climateFinance: {
        currentPercent: PRISTINE.usa.currentPercent,
        maxPercent: PRISTINE.usa.maxPercent,
        minPercent: 1,
        difficulty: 0.5,
        politicalResistance: 1,
      },
    },
    canada: {
      name: "Canada",
      gdp: 2,
      climateFinance: {
        currentPercent: PRISTINE.canada.currentPercent,
        maxPercent: PRISTINE.canada.maxPercent,
        minPercent: 1,
        difficulty: 0.5,
        politicalResistance: 1,
      },
    },
  };
}

const context = {
  console: { warn() {}, log() {} },
  pushMessage() {},
  // getCountryByIso returns undefined here so applyClimateFinanceOverrides falls
  // back to COUNTRY_DATA[key] (our keys are COUNTRY_DATA keys, not ISO codes).
  CLIMATE_DATA: {
    getCountryByIso: () => undefined,
    COUNTRY_DATA: freshCountryData(),
  },
  CLIMATE_FINANCE_DEFAULTS: {
    usa: { ...PRISTINE.usa },
    canada: { ...PRISTINE.canada },
  },
  state: {
    activeCampaigns: [],
    climateFinanceOverrides: {},
  },
};
context.globalThis = context;
vm.createContext(context);

vm.runInContext(extractFunction("setClimateFinanceOverride"), context);
vm.runInContext(extractFunction("applyClimateFinanceOverrides"), context);
vm.runInContext(extractFunction("resetClimateFinanceDefaults"), context);
vm.runInContext(extractFunction("processCampaigns"), context);

// ── T1: a completed campaign records progress in state (not just the singleton).
context.state.activeCampaigns = [
  {
    isAggregate: true,
    countries: ["usa", "canada"],
    countryName: "North America",
    monthsRemaining: 1,
    increaseAmount: 1.0,
  },
];
context.processCampaigns();

assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.usa.climateFinance.currentPercent,
  3,
  "campaign should raise USA dedication 2 -> 3 (capped at maxPercent 5)",
);
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.canada.climateFinance.currentPercent,
  4,
  "campaign should raise Canada dedication 3 -> 4",
);
assert.ok(
  context.state.climateFinanceOverrides.usa,
  "campaign progress must be persisted in state.climateFinanceOverrides (the CAR-404 fix)",
);
assert.equal(
  context.state.climateFinanceOverrides.usa.currentPercent,
  3,
  "state override should mirror the new USA dedication",
);
assert.equal(
  context.state.climateFinanceOverrides.canada.currentPercent,
  4,
  "state override should mirror the new Canada dedication",
);

// ── T2 (Failure A): after a page reload the singleton re-evaluates to file
// defaults; loadGame re-hydrates it from the persisted overrides. Simulate the
// reload by resetting COUNTRY_DATA, then re-applying overrides.
const persistedState = JSON.parse(JSON.stringify(context.state)); // round-trip through save/load
context.CLIMATE_DATA.COUNTRY_DATA = freshCountryData(); // module re-evaluated -> defaults
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.usa.climateFinance.currentPercent,
  2,
  "sanity: fresh module defaults USA back to 2",
);
context.state = persistedState;
context.applyClimateFinanceOverrides();

assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.usa.climateFinance.currentPercent,
  3,
  "Failure A: campaign dedication must survive save/load, not reset to default 2",
);
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.canada.climateFinance.currentPercent,
  4,
  "Failure A: Canada dedication must survive save/load",
);

// ── T3 (Failure B): New Game must reset the singleton so a fresh run does not
// inherit the previous run's inflated percentages.
context.resetClimateFinanceDefaults();
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.usa.climateFinance.currentPercent,
  2,
  "Failure B: initGame's reset must restore USA to pristine default 2",
);
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.canada.climateFinance.currentPercent,
  3,
  "Failure B: initGame's reset must restore Canada to pristine default 3",
);

// ── T4: setClimateFinanceOverride also persists a raised maxPercent (the
// negotiation path can raise both current and max dedication).
context.state = { climateFinanceOverrides: {} };
context.setClimateFinanceOverride("usa", context.CLIMATE_DATA.COUNTRY_DATA.usa, {
  currentPercent: 4,
  maxPercent: 8,
});
assert.equal(
  context.CLIMATE_DATA.COUNTRY_DATA.usa.climateFinance.maxPercent,
  8,
  "negotiation should raise USA maxPercent to 8 on the singleton",
);
// Compare fields individually: the override object is created inside the vm
// realm, so deepStrictEqual would reject it on a cross-realm prototype mismatch.
assert.equal(
  context.state.climateFinanceOverrides.usa.currentPercent,
  4,
  "negotiation change (currentPercent) must be persisted in state",
);
assert.equal(
  context.state.climateFinanceOverrides.usa.maxPercent,
  8,
  "negotiation change (maxPercent) must be persisted in state",
);

console.log(
  "PASS: climate-finance progress persists across save/load and resets on New Game (CAR-404)",
);
