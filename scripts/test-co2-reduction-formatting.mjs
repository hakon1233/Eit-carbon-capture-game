// Regression for CAR-30: tiny negative CO2 reduction values that round to zero
// must never display as signed zero (for example "-0.0 CO2 / month").
// Checks both the served root game.js and the modular project config mirror.
// Run: node scripts/test-co2-reduction-formatting.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function extractFunction(src, rel, functionName, context = {}) {
  const match = new RegExp(`(?:export\\s+)?function\\s+${functionName}\\s*\\(`).exec(src);
  if (!match) {
    throw new Error(`${rel}: missing ${functionName} helper`);
  }

  const functionStart = match.index + match[0].indexOf("function");
  const bodyStart = src.indexOf("{", functionStart);
  if (bodyStart === -1) throw new Error(`${rel}: helper has no body`);

  let depth = 0;
  for (let i = bodyStart; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) {
      const fnSrc = src.slice(functionStart, i + 1);
      return vm.runInNewContext(`(${fnSrc})`, context);
    }
  }

  throw new Error(`${rel}: ${functionName} body did not terminate`);
}

const cases = [
  [-0.04, 1, "0.0"],
  [-0.004, 2, "0.00"],
  [-0, 1, "0.0"],
  [0, 1, "0.0"],
  [0.04, 1, "0.0"],
  [0.05, 1, "0.1"],
  [-0.15, 1, "-0.1"],
  [0.123, 2, "0.12"],
];

const targets = ["game.js", "public/modules/config/projects.js"];
let failed = false;

for (const rel of targets) {
  const src = readFileSync(join(root, rel), "utf8");
  let format;
  let formatDisplay;
  try {
    format = extractFunction(src, rel, "formatCO2ReductionValue");
    formatDisplay = extractFunction(src, rel, "formatCO2ReductionDisplay", {
      formatCO2ReductionValue: format,
    });
  } catch (err) {
    failed = true;
    console.error(`FAIL ${err.message}`);
    continue;
  }

  for (const [value, decimals, expected] of cases) {
    const actual = format(value, decimals);
    if (actual !== expected) {
      failed = true;
      console.error(
        `FAIL [${rel}] formatCO2ReductionValue(${value}, ${decimals}) -> ${actual}, expected ${expected}`,
      );
    }
  }

  const displayCases = [
    [0.04, 1, "CO2 / month", "0.0 CO2 / month"],
    [0.04, 2, "Gt CO2/yr", "-0.04 Gt CO2/yr"],
    [0.15, 1, "CO2 / month", "-0.1 CO2 / month"],
    [-0.04, 1, "CO2 / month", "0.0 CO2 / month"],
    [-0.15, 1, "CO2 / month", "+0.1 CO2 / month"],
  ];

  for (const [value, decimals, unit, expected] of displayCases) {
    const actual = formatDisplay(value, decimals, unit);
    if (actual !== expected) {
      failed = true;
      console.error(
        `FAIL [${rel}] formatCO2ReductionDisplay(${value}, ${decimals}, ${unit}) -> ${actual}, expected ${expected}`,
      );
    }
  }

  if (rel === "game.js" && /adjustedReduction\.toFixed\(/.test(src)) {
    failed = true;
    console.error("FAIL [game.js] project card display still formats adjustedReduction directly");
  }

  if (/`[-+]\\$\\{formatCO2ReductionValue/.test(src)) {
    failed = true;
    console.error(`FAIL [${rel}] display still hardcodes a sign outside formatCO2ReductionValue`);
  }

  if (!failed) {
    console.log(`PASS [${rel}] CO2 reduction formatter normalizes signed zero`);
  }
}

process.exit(failed ? 1 : 0);
