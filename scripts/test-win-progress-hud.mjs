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

function createClassList() {
  const classes = new Set();
  return {
    add(...values) {
      values.forEach((value) => classes.add(value));
    },
    remove(...values) {
      values.forEach((value) => classes.delete(value));
    },
    contains(value) {
      return classes.has(value);
    },
  };
}

function createElement() {
  return {
    textContent: "",
    title: "",
    classList: createClassList(),
  };
}

const elements = {
  "win-progress-stat": createElement(),
  "win-progress-value": createElement(),
};

const context = {
  GAME_CONFIG: {
    winTemp: 1.0,
    loseTemp: 2.0,
    loseYear: 2100,
  },
  document: {
    getElementById(id) {
      return elements[id] || null;
    },
  },
};

vm.createContext(context);
vm.runInContext(extractFunction("updateWinProgressHud"), context);

context.state = {
  temperature: 1.12,
  year: 2049,
  winStreakMonths: 0,
  loseStreakMonths: 0,
};
context.updateWinProgressHud();
assert.equal(elements["win-progress-value"].textContent, "+1.12 -> +1.00");
assert.equal(elements["win-progress-stat"].title, "Goal: reach +1.0°C by 2050, then hold it for 12 months.");
assert.equal(elements["win-progress-stat"].classList.contains("win-progress-active"), false);

context.state.temperature = 0.96;
context.state.year = 2049;
context.state.winStreakMonths = 0;
context.updateWinProgressHud();
assert.equal(elements["win-progress-value"].textContent, "Ready in 2050");
assert.equal(elements["win-progress-stat"].classList.contains("win-progress-ready"), true);

context.state.year = 2050;
context.state.winStreakMonths = 7;
context.updateWinProgressHud();
assert.equal(elements["win-progress-value"].textContent, "7 / 12 held");
assert.equal(elements["win-progress-stat"].classList.contains("win-progress-active"), true);

context.state.temperature = 1.04;
context.state.winStreakMonths = 0;
context.updateWinProgressHud();
assert.equal(elements["win-progress-value"].textContent, "0 / 12 held");
assert.equal(elements["win-progress-stat"].classList.contains("win-progress-reset"), true);

context.state.temperature = 2.02;
context.state.loseStreakMonths = 2;
context.updateWinProgressHud();
assert.equal(elements["win-progress-value"].textContent, "Danger 2 / 3");
assert.equal(elements["win-progress-stat"].classList.contains("win-progress-danger"), true);

console.log("win progress HUD regression passed");
