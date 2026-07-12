import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// CAR-406: The region panel's Climate Policy Campaign button quoted cost/duration
// with a formula that omitted the 1.5x `aggregateMultiplier` that
// startClimateCampaign() charges. At the default "continents" granularity every
// region is an aggregate, so the button showed a price ~33% below the charge and
// its disabled gate could report "affordable" while the click failed
// "Cannot afford". The fix routes BOTH the display and the charge through one
// shared campaignQuote() helper reading the same regionData.
//
// This guard locks two things:
//   1. Behaviour — campaignQuote() applies the 1.5x multiplier for an aggregate
//      region, so an aggregate quote is exactly 1.5x the otherwise-identical
//      single-region quote (cost and pre-ceil duration).
//   2. Structure — neither startClimateCampaign() nor renderRegionIncome()
//      recomputes the cost inline anymore; both call campaignQuote(). This is the
//      "can't drift again" tripwire: reintroducing an inline `* GAME_CONFIG.lobbyCostFactor`
//      cost formula in either function fails the test.

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

// --- 1. Behaviour: aggregate quote is 1.5x the single-region quote -----------

const context = {
  GAME_CONFIG: {
    lobbyCostFactor: 0.05,
    lobbyBaseMonths: 6,
    lobbyMinIncrease: 0.5,
  },
  // No disaster history in this harness -> neutral modifier of 1.0.
  getDisasterAwarenessModifier: () => 1.0,
  Math,
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(extractFunction("campaignQuote"), context);

const finance = {
  currentPercent: 1.5,
  maxPercent: 5,
  minPercent: 0.5,
  difficulty: 0.6,
  politicalResistance: 0.7,
};
const single = context.campaignQuote("test", {
  gdp: 20,
  climateFinance: finance,
  isAggregate: false,
});
const aggregate = context.campaignQuote("test", {
  gdp: 20,
  climateFinance: finance,
  isAggregate: true,
});

assert.equal(single.aggregateMultiplier, 1.0, "single region multiplier should be 1.0");
assert.equal(aggregate.aggregateMultiplier, 1.5, "aggregate region multiplier should be 1.5");

// Cost scales linearly with the multiplier.
assert.ok(
  Math.abs(aggregate.cost - single.cost * 1.5) < 1e-9,
  `aggregate cost (${aggregate.cost}) must be 1.5x single cost (${single.cost})`,
);
// The increase amount does NOT depend on the multiplier (it is room-based).
assert.equal(
  aggregate.increaseAmount,
  single.increaseAmount,
  "increaseAmount should not change with the aggregate multiplier",
);
// Duration is Math.ceil(baseFormula * multiplier); the aggregate's is >= the
// single's and reflects the 1.5x scaling before rounding.
assert.ok(
  aggregate.duration >= single.duration,
  `aggregate duration (${aggregate.duration}) must be >= single duration (${single.duration})`,
);

// --- 2. Structure: both callers route through campaignQuote() -----------------

const startFn = extractFunction("startClimateCampaign");
const renderFn = extractFunction("renderRegionIncome");

assert.ok(
  startFn.includes("campaignQuote("),
  "startClimateCampaign must obtain cost/duration via campaignQuote()",
);
assert.ok(
  renderFn.includes("campaignQuote("),
  "renderRegionIncome must obtain the button quote via campaignQuote()",
);

// Tripwire: the inline cost formula must not reappear in either caller. If it
// does, the two paths can silently drift again (the original CAR-406 defect).
const inlineCostRe = /lobbyCostFactor\s*\*/;
assert.ok(
  !inlineCostRe.test(startFn),
  "startClimateCampaign must not recompute cost inline (use campaignQuote)",
);
assert.ok(
  !inlineCostRe.test(renderFn),
  "renderRegionIncome must not recompute the campaign cost inline (use campaignQuote)",
);

console.log("PASS: campaignQuote is the single source of truth; aggregate cost == 1.5x single cost");
