import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// CAR-410: the tech-tree tooltip marks a tech as "In Progress" whenever a center
// is assigned to it (getResearchingCenters counts centers regardless of
// cooldown), but computes the ETA from getResearchRPPerMonth, which SKIPS centers
// on cooldown. When the only assigned center is on cooldown, rpPerMonth is 0 and
// the tooltip did `Math.ceil((cost - progress) / 0)` = Infinity, rendering
// "🔬 In Progress (+0 RP/mo, ~Infinity months)". Same non-finite-in-UI class as
// CAR-409. Fix: researchInProgressLabel() must not emit a non-finite ETA.

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

function label(rpPerMonth, cost, progress) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(extractFunction("researchInProgressLabel"), context);
  return context.researchInProgressLabel(rpPerMonth, cost, progress);
}

// The bug: all assigned centers on cooldown → rpPerMonth 0. The label must never
// contain a non-finite ETA.
{
  const out = label(0, 100, 20);
  assert.ok(
    !/Infinity|NaN/.test(out),
    `cooldown case (rpPerMonth=0) must not render a non-finite ETA, got: ${out}`,
  );
  assert.ok(/[Cc]ooldown/.test(out), `cooldown case should tell the player centers are on cooldown, got: ${out}`);
}

// Progress complete but still flagged researching (cost - progress <= 0) is also
// non-finite-safe (0/0 = NaN would otherwise leak).
{
  const out = label(0, 100, 100);
  assert.ok(!/Infinity|NaN/.test(out), `zero-remaining cooldown case must be finite, got: ${out}`);
}

// Normal case: real rate → correct, finite ETA. ceil((100-20)/10) = 8 months.
{
  const out = label(10, 100, 20);
  assert.ok(!/Infinity|NaN/.test(out), `normal case must be finite, got: ${out}`);
  assert.ok(out.includes("+10 RP/mo"), `normal case should show the rate, got: ${out}`);
  assert.ok(out.includes("~8 months"), `normal case should show ceil((100-20)/10)=8 months, got: ${out}`);
}

console.log("PASS: research tooltip never renders ~Infinity/NaN months when assigned centers are on cooldown (CAR-410)");
