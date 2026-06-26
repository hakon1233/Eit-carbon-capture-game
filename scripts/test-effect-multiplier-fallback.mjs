import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// BUG-CAR-207: Hot-path CO2/income/stats loops read `proj.effectMultiplier`
// without a fallback, unlike their guarded siblings (which use `?? 1` / `|| 1`).
// A project persisted as an object without an effectMultiplier (the BUG-CAR-89
// comment explicitly documents effectMultiplier as *optional*, and game state is
// JSON-serialized to localStorage) makes `effectMult` undefined, so
// `co2Reduction * effectMult` becomes NaN and poisons state.co2 irrecoverably.

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

const context = {
  // forest is a non-power carbon-removal project with a positive co2Reduction,
  // so it passes the filter inside calculateNetCO2Rate.
  PROJECT_TYPES: {
    forest: { co2Reduction: 0.02, category: "climate" },
  },
  // Stub collaborators so we isolate the effectMultiplier handling.
  getCo2IncreaseRate: () => 1,
  getTotalClimateFeedback: () => 0,
  state: {
    regions: {
      europe: {
        // Object form WITHOUT effectMultiplier — the legacy/malformed shape.
        projects: [{ type: "forest" }],
      },
    },
  },
};
context.globalThis = context;
vm.createContext(context);

vm.runInContext(extractFunction("getStackingMultiplier"), context);
vm.runInContext(extractFunction("calculateNetCO2Rate"), context);

const rate = context.calculateNetCO2Rate();

assert.ok(
  Number.isFinite(rate),
  `calculateNetCO2Rate must stay finite for a project object without effectMultiplier, got ${rate}`,
);
// With co2Increase=1 and one forest project (0.02 reduction, multiplier defaults to 1, stack=1),
// the net rate should be 1 - 0.02 = 0.98.
assert.equal(Math.round(rate * 1000) / 1000, 0.98, `expected 0.98, got ${rate}`);

console.log("PASS: effectMultiplier fallback keeps net CO2 rate finite");
