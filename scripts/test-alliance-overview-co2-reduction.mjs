import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../game.js", import.meta.url), "utf8");

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);

  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(start, i + 1);
    }
  }

  throw new Error(`Could not extract ${name}`);
}

const context = {
  ALLIANCE_STATUS: { ALLIED: "allied" },
  MONTHS: [],
  PROJECT_TYPES: {
    forest: { co2Reduction: 0.02 },
    carbonCapture: { co2Reduction: 0.001 },
  },
  state: {
    regions: {
      europe: {
        projects: [
          "forest",
          { type: "carbonCapture", complete: true },
        ],
      },
    },
    alliance: {
      europe: { status: "allied", happiness: 72 },
    },
  },
  document: {
    getElementById(id) {
      assert.equal(id, "alliance-overview");
      return this.container;
    },
    container: { innerHTML: "" },
  },
  getAlliedRegionsCount: () => 1,
  getClimateDataForRegion: () => ({ gdp: 4.5, population: 750 }),
  getRegionName: () => "Europe",
};

vm.createContext(context);
vm.runInContext(
  `${extractFunction("renderAllianceOverview")}; renderAllianceOverview();`,
  context,
);

assert.match(context.document.container.innerHTML, /CO2 Reduction/);
assert.match(context.document.container.innerHTML, /-0\.02\/mo/);

console.log("alliance overview CO2 reduction regression passed");
