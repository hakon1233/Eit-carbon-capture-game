// Regression for CAR-22: the seeded starting temperature must agree with
// calculateTemperature(startingCo2) so the headline metric does not dip on the
// first month tick while CO2 rises.
//
// Root cause was a hardcoded GAME_CONFIG.startingTemp (1.09) that disagreed with
// the live formula calculateTemperature(co2) = co2*tempFactor + tempOffset, which
// at startingCo2=423 yields 423*0.0105 - 3.37 = 1.0715. T0 showed the 1.09 seed,
// then the first tick recomputed via the formula and "corrected" downward to 1.07.
//
// This test parses the GAME_CONFIG numeric constants out of the served root
// game.js and asserts: startingTemp === startingCo2 * tempFactor + tempOffset.
// Run: node scripts/test-temp-seed-consistency.mjs   (exit 0 = pass, 1 = fail)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOLERANCE = 1e-6;

function num(src, key) {
  const m = src.match(new RegExp(`${key}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (!m) throw new Error(`could not find GAME_CONFIG.${key}`);
  return parseFloat(m[1]);
}

const targets = ["game.js"];
let failed = false;

for (const rel of targets) {
  const src = readFileSync(join(root, rel), "utf8");
  const startingCo2 = num(src, "startingCo2");
  const startingTemp = num(src, "startingTemp");
  const tempFactor = num(src, "tempFactor");
  const tempOffset = num(src, "tempOffset");

  const formula = startingCo2 * tempFactor + tempOffset;
  const diff = Math.abs(startingTemp - formula);
  const ok = diff < TOLERANCE;

  console.log(
    `${rel}: startingTemp=${startingTemp}  formula(${startingCo2})=${formula.toFixed(6)}  diff=${diff.toExponential(2)}  ${ok ? "PASS" : "FAIL"}`,
  );
  if (!ok) {
    failed = true;
    console.error(
      `  FAIL: startingTemp (${startingTemp}) disagrees with calculateTemperature(${startingCo2}) = ${formula.toFixed(6)}. ` +
        `This causes a first-tick discontinuity (CAR-22).`,
    );
  }
}

if (failed) {
  console.error("\nCAR-22 regression FAILED");
  process.exit(1);
}
console.log("\nCAR-22 regression PASSED: seed matches formula, no first-tick dip.");
process.exit(0);
