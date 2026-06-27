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
  state: {
    funds: 0,
    regionalResearchCenters: {},
  },
  RESEARCH_CENTER_BASE: { buildCost: 22.5 },
  CLIMATE_DATA: { REGION_AGGREGATES: {} },
  getAvailableRegionsForResearch: () => [],
  document: {
    container: {
      innerHTML: "",
      querySelectorAll: () => [],
    },
    getElementById(id) {
      assert.equal(id, "research-center-options");
      return this.container;
    },
  },
};

vm.createContext(context);
vm.runInContext(
  `${extractFunction("renderRegionalCentersUI")}; renderRegionalCentersUI();`,
  context,
);

assert.match(
  context.document.container.innerHTML,
  /form alliances with regions/i,
  "empty state should explain that alliances are required",
);
assert.doesNotMatch(
  context.document.container.innerHTML,
  /Diplomacy tab/i,
  "empty state must not point to a non-existent Diplomacy tab",
);
assert.match(
  context.document.container.innerHTML,
  /click a region on the map/i,
  "empty state should point players to the actual alliance workflow",
);

console.log("PASS: research-center empty state points to the current alliance workflow");
