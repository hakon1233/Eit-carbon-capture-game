import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

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
  PROJECT_TYPES: {
    forest: { co2Reduction: 0.02, category: "climate" },
    carbonCapture: { co2Reduction: 0.04, category: "climate", subcategory: "ccs_capture" },
    directAirCapture: { co2Reduction: 0.04, category: "climate", subcategory: "ccs_capture" },
    co2Pipeline: { co2Reduction: 0, category: "climate", subcategory: "ccs_transport" },
  },
  ADVANCED_PROJECT_TYPES: {
    reforestation: { baseCo2Reduction: 2, potentialKey: "forest" },
  },
  state: {
    regions: {
      europe: {
        projects: [
          "forest",
          { type: "forest", effectMultiplier: 1.5 },
          { type: "reforestation", effectMultiplier: 1.5 },
          "carbonCapture",
          { type: "directAirCapture", effectMultiplier: 0.5 },
          "co2Pipeline",
        ],
      },
    },
  },
  getForestEffectivenessModifier: () => 1,
};

vm.createContext(context);
vm.runInContext(
  `${extractFunction("calculatePlayerForestRemoval")};\n${extractFunction("calculatePlayerCCSRemoval")};`,
  context,
);

assert.ok(
  Math.abs(context.calculatePlayerForestRemoval() - 0.053) < 1e-12,
  "forest removals should resolve string and object entries from their project definitions",
);
assert.ok(
  Math.abs(context.calculatePlayerCCSRemoval() - 0.075) < 1e-12,
  "CCS removals should resolve type and multiplier while applying the existing transport bonus",
);

console.log("player carbon-removal regression passed");
