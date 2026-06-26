import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Regression for CAR-235: construction records are persisted with `type` and
// `monthsTotal`. Readers must use those fields consistently, or queued builds
// bypass regional caps and embodied-carbon math changes as construction ages.

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

{
  const context = {
    EMBODIED_CARBON: { solar: 100 },
    state: {
      underConstruction: [
        { type: "solar", capacityGW: 2, monthsTotal: 10, monthsRemaining: 5 },
      ],
    },
  };
  vm.createContext(context);
  vm.runInContext(extractFunction("calculateEmbodiedCarbon"), context);

  assert.equal(
    context.calculateEmbodiedCarbon(),
    240,
    "embodied carbon should be spread across monthsTotal, not remaining months",
  );
}

assert.ok(
  source.includes("c.regionId === regionId && c.type === projectType"),
  "regional cap check should count queued construction records by `type`",
);
assert.ok(
  !source.includes("c.projectType === projectType"),
  "regional cap check must not read the nonexistent construction.projectType field",
);

console.log("PASS: construction readers use persisted construction field names");
