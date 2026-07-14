import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// CAR-409: three display sites computed the global research-centers RP/month via
// `getResearchCenterRPPerMonth()` called with NO argument. That function reads
// `level`; `undefined < 1` is false, so it fell through to
// `Math.floor(5 * undefined * ...)` = NaN. Result: the research detail popup
// showed "+NaN per month" and the main HUD's `rpPerMonth > 0` guard (NaN > 0 is
// false) silently dropped the RP/month rate entirely. Fix: a dedicated
// `getGlobalCentersRPPerMonth()` that sums each global center's precomputed
// `rpPerMonth` (0 when the list is empty/undefined — the current state).

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

function globalRP(globalResearchCenters) {
  const context = { state: { globalResearchCenters } };
  vm.createContext(context);
  vm.runInContext(extractFunction("getGlobalCentersRPPerMonth"), context);
  return context.getGlobalCentersRPPerMonth();
}

// No global centers (the live state today) → 0, and crucially FINITE (not NaN).
{
  const empty = globalRP([]);
  assert.ok(Number.isFinite(empty), `empty global centers must yield a finite RP/month, got ${empty}`);
  assert.equal(empty, 0, "no global centers → 0 RP/month");
}

// Missing state field must also be a finite 0, not NaN.
{
  const missing = globalRP(undefined);
  assert.ok(Number.isFinite(missing), `undefined global centers must yield finite RP/month, got ${missing}`);
  assert.equal(missing, 0, "undefined global centers → 0 RP/month");
}

// If the (currently unbuilt) feature ever populates centers, sum their rpPerMonth.
{
  const sum = globalRP([{ name: "A", rpPerMonth: 5 }, { name: "B", rpPerMonth: 10 }, { name: "C" }]);
  assert.equal(sum, 15, "sums each center's rpPerMonth, treating a missing value as 0");
}

// Guard against reintroducing the NaN bug: no site may call the per-level
// getResearchCenterRPPerMonth() without an argument.
assert.ok(
  !source.includes("getResearchCenterRPPerMonth()"),
  "getResearchCenterRPPerMonth() must never be called with no argument (returns NaN)",
);

console.log("PASS: global research-center RP/month is finite (CAR-409)");
