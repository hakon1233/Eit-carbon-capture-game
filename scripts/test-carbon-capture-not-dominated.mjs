// Regression for CAR-29: "Basic Carbon Capture" (carbonCapture) must not be a
// strictly-dominated trap relative to its turn-one Climate-tab neighbour
// "Reforestation" (forest), and must sit on a sane curve between forest and the
// researched post-combustion CCS tier (postCombustionCapture).
//
// CAR-28 discovery: carbonCapture was cost $35B / co2Reduction 0.001 / 42mo,
// while forest is $15B / 0.02 / 4mo and postCombustionCapture is $65B / 0.08 /
// 36mo. carbonCapture was worse than forest on ALL three axes (more expensive,
// 20x weaker, ~10x slower) — strictly dominated, a pure feels-bad trap on the
// game's titular mechanic. Likely the global 100x climate nerf was applied
// inconsistently to this one entry.
//
// Invariants asserted in the served root game.js:
//   1. Monotone effect curve:  forest < carbonCapture < postCombustionCapture
//      on co2Reduction.
//   2. Not strictly dominated by forest: carbonCapture must beat forest on at
//      least one axis. Since it costs more and builds slower, that axis is
//      effect (co2Reduction) — already covered by (1), but asserted explicitly.
//   3. Cost-effectiveness (co2Reduction per $B) at least competitive with
//      forest — i.e. >= forest's, so it is not dominated on efficiency either.
//   4. Construction time trimmed below the post-combustion tier and well under
//      the old 42mo (sanity bound: <= 30mo for a "basic" starter).
// Run: node scripts/test-carbon-capture-not-dominated.mjs  (exit 0 = pass, 1 = fail)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Extract a numeric field from a named PROJECT_TYPES entry's block.
function projNum(src, projKey, field) {
  // Anchor on the PROJECT_TYPES definition block: "projKey: {" immediately
  // followed by a "label:" line. This avoids matching inline tech-bonus blocks
  // like `projectBonus: { forest: { co2Reduction: 1.3 } }`.
  const anchor = new RegExp(`${projKey}:\\s*\\{\\s*label:`);
  const m0 = anchor.exec(src);
  if (!m0) throw new Error(`could not find project ${projKey}`);
  const start = m0.index;
  const block = src.slice(start, start + 600);
  const m = block.match(new RegExp(`${field}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (!m) throw new Error(`could not find ${projKey}.${field}`);
  return parseFloat(m[1]);
}

const targets = ["game.js"];
let failed = false;

for (const rel of targets) {
  const src = readFileSync(join(root, rel), "utf8");
  const p = (key) => ({
    cost: projNum(src, key, "cost"),
    co2: projNum(src, key, "co2Reduction"),
    months: projNum(src, key, "constructionMonths"),
  });
  const forest = p("forest");
  const cc = p("carbonCapture");
  const post = p("postCombustionCapture");

  const checks = [
    ["effect curve forest < carbonCapture", cc.co2 > forest.co2],
    ["effect curve carbonCapture < postCombustion", cc.co2 < post.co2],
    [
      "cost-effectiveness >= forest (not dominated on efficiency)",
      cc.co2 / cc.cost >= forest.co2 / forest.cost - 1e-9,
    ],
    ["construction trimmed to <= 30mo", cc.months <= 30],
    ["construction < postCombustion", cc.months < post.months],
  ];

  for (const [name, ok] of checks) {
    if (!ok) {
      failed = true;
      console.error(
        `FAIL [${rel}] ${name}  (forest=${JSON.stringify(forest)} carbonCapture=${JSON.stringify(cc)} post=${JSON.stringify(post)})`,
      );
    }
  }
  if (!checks.some(([, ok]) => !ok)) {
    console.log(
      `PASS [${rel}] carbonCapture cost=$${cc.cost}B co2=${cc.co2} ${cc.months}mo  (eff ${(cc.co2 / cc.cost).toFixed(5)} vs forest ${(forest.co2 / forest.cost).toFixed(5)})`,
    );
  }
}

process.exit(failed ? 1 : 0);
