import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Regression for CAR-405: REGIONAL_PROJECT_CAPS must be enforced on the REAL
// build path, not just the dead buildProject(). The live buttons call
// buildProjectWithEffectiveness(); both it and buildProject() gate on the shared
// isRegionalCapReached() helper. This guard exercises the helper's counting math
// AND statically asserts the live path still calls it (so the check can't silently
// go inert again — the exact defect this issue was filed for).

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

// --- Build a sandbox with just the dependencies isRegionalCapReached needs ---
function makeContext(region, underConstruction = []) {
  const messages = [];
  const context = {
    REGIONAL_PROJECT_CAPS: { nuclear: 2, forest: 3 }, // subset of real caps
    PROJECT_TYPES: {
      nuclear: { label: "Nuclear Plant" },
      forest: { label: "Reforestation" },
      solar: { label: "Solar Farm" }, // intentionally uncapped in this stub
    },
    state: {
      regions: { r1: region },
      underConstruction,
    },
    getRegionName: () => "Test Region",
    pushMessage: (msg, kind) => messages.push({ msg, kind }),
  };
  context.__messages = messages;
  vm.createContext(context);
  vm.runInContext(extractFunction("isRegionalCapReached"), context);
  return context;
}

// 1. Below cap → allowed (returns false, no message).
{
  const ctx = makeContext({ projects: [{ type: "nuclear" }] }); // 1 of 2
  assert.equal(ctx.isRegionalCapReached("r1", "nuclear"), false, "1 nuclear (< cap 2) should be allowed");
  assert.equal(ctx.__messages.length, 0, "no message when under cap");
}

// 2. The (N+1)th build of a capped type is refused (the core assertion).
{
  const ctx = makeContext({ projects: [{ type: "nuclear" }, { type: "nuclear" }] }); // 2 of 2
  assert.equal(ctx.isRegionalCapReached("r1", "nuclear"), true, "3rd nuclear (cap 2) must be refused");
  assert.equal(ctx.__messages.length, 1, "a 'reached maximum' message is shown on refusal");
  assert.match(ctx.__messages[0].msg, /reached maximum Nuclear Plant capacity \(2\)/);
  assert.equal(ctx.__messages[0].kind, "bad");
}

// 3. Completed projects (region.projects) AND queued builds (underConstruction) both count.
{
  const ctx = makeContext(
    { projects: [{ type: "nuclear" }] },                 // 1 completed
    [{ regionId: "r1", type: "nuclear" }],               // + 1 queued = 2 total
  );
  assert.equal(ctx.isRegionalCapReached("r1", "nuclear"), true, "completed + queued must sum toward the cap");
}

// 4. Mixed storage forms: region.projects holds bare strings AND {type} objects.
{
  const ctx = makeContext({ projects: ["forest", { type: "forest" }, "forest"] }); // 3 of 3
  assert.equal(ctx.isRegionalCapReached("r1", "forest"), true, "cap counts string + object project entries alike");
}

// 5. Uncapped type (not in REGIONAL_PROJECT_CAPS) is never blocked.
{
  const ctx = makeContext({ projects: [{ type: "solar" }, { type: "solar" }, { type: "solar" }, { type: "solar" }] });
  assert.equal(ctx.isRegionalCapReached("r1", "solar"), false, "types with no cap are unlimited");
  assert.equal(ctx.__messages.length, 0, "no message for uncapped types");
}

// --- Static guards: the LIVE path must actually invoke the helper ---
// This is what makes the fix stick. Before CAR-405, buildProjectWithEffectiveness
// had no cap check at all; if a future edit drops it, this fails loudly.
const liveBuild = extractFunction("buildProjectWithEffectiveness");
assert.ok(
  liveBuild.includes("isRegionalCapReached(regionId, projectType)"),
  "buildProjectWithEffectiveness (the live build path) must enforce regional caps",
);
const deadBuild = extractFunction("buildProject");
assert.ok(
  deadBuild.includes("isRegionalCapReached(regionId, projectType)"),
  "buildProject should share the same cap helper (single source of truth)",
);

console.log("PASS: regional project caps are enforced on the live build path (CAR-405)");
