import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// BUG-407 (CAR-407): calculateEmbodiedCarbon() used `construction.capacityGW`,
// but neither startConstruction() nor executeEffectivenessBuild() ever store a
// `capacityGW` (or `storageGWh`) on the queued construction record. So every
// project's embodied carbon collapsed to `EMBODIED_CARBON[type] * 1`, ignoring
// the real per-type capacity. The fix reads capacity from the project
// definition (PROJECT_TYPES), matching how completeConstruction() adds physical
// capacity, and uses storageGWh for storage-category projects since
// EMBODIED_CARBON.batteryStorage is expressed per-GWh.

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

function computeEmbodied(construction) {
  const context = {
    EMBODIED_CARBON: { nuclear: 0.002, batteryStorage: 0.05 },
    PROJECT_TYPES: {
      nuclear: { capacityGW: 1.2 },
      batteryStorage: { powerCategory: "storage", capacityGW: 0.2, storageGWh: 0.8 },
    },
    state: { underConstruction: [construction] },
  };
  vm.createContext(context);
  vm.runInContext(extractFunction("calculateEmbodiedCarbon"), context);
  return context.calculateEmbodiedCarbon();
}

// A per-GW project (nuclear, 1.2 GW/plant) with a production-shaped record that
// has NO capacityGW field. Must use PROJECT_TYPES capacity, not the `|| 1`
// fallback: 0.002 * 1.2 / 12 * 12 = 0.0024 Gt/yr, not 0.002.
{
  const value = computeEmbodied({ type: "nuclear", monthsTotal: 12, monthsRemaining: 12 });
  assert.ok(
    Math.abs(value - 0.0024) < 1e-9,
    `nuclear embodied carbon should scale by the 1.2 GW plant capacity (expected 0.0024, got ${value})`,
  );
}

// A storage project (battery, 0.8 GWh/build). EMBODIED_CARBON.batteryStorage is
// per-GWh, so capacity must come from storageGWh, not capacityGW:
// 0.05 * 0.8 / 9 * 12 = 0.0533... Gt/yr.
{
  const value = computeEmbodied({ type: "batteryStorage", monthsTotal: 9, monthsRemaining: 9 });
  const expected = (0.05 * 0.8) / 9 * 12;
  assert.ok(
    Math.abs(value - expected) < 1e-9,
    `battery embodied carbon should scale by the 0.8 GWh storage capacity (expected ${expected}, got ${value})`,
  );
}

// The capacity source is the project definition, so an explicit (legacy)
// construction.capacityGW must NOT override it — a stale save carrying a wrong
// value should still produce the definition-based amount.
{
  const value = computeEmbodied({ type: "nuclear", capacityGW: 99, monthsTotal: 12, monthsRemaining: 12 });
  assert.ok(
    Math.abs(value - 0.0024) < 1e-9,
    `embodied carbon must derive capacity from PROJECT_TYPES, ignoring stale construction.capacityGW (expected 0.0024, got ${value})`,
  );
}

console.log("PASS: embodied carbon derives per-type capacity from PROJECT_TYPES (BUG-407)");
