// Regression for CAR-88: endgame temperature checks must require sustained
// monthly streaks, not a single transient tick below/above the thresholds.
//
// Run: node scripts/test-sustained-win-loss.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "game.js"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = src.indexOf(marker);
  if (start === -1) {
    throw new Error(`missing function ${name}`);
  }

  const bodyStart = src.indexOf("{", start);
  let depth = 0;
  for (let i = bodyStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") depth--;
    if (depth === 0) {
      return src.slice(start, i + 1);
    }
  }

  throw new Error(`unterminated function ${name}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const nextMonth = extractFunction("nextMonth");
assert(
  nextMonth.includes("updateEndgameStreaks();") &&
    nextMonth.indexOf("updateEndgameStreaks();") < nextMonth.indexOf("checkWinLose();"),
  "nextMonth must update sustained win/loss streaks before checkWinLose",
);

const context = {
  GAME_CONFIG: {
    winTemp: 1.0,
    loseTemp: 2.0,
    loseYear: 2100,
  },
  messages: [],
  pushMessage(message, tone = "neutral") {
    context.messages.push({ message, tone });
  },
  clearSavedGame() {},
};
vm.createContext(context);
vm.runInContext(
  `${extractFunction("updateEndgameStreaks")}\n${extractFunction("checkWinLose")}`,
  context,
);

function resetState(overrides = {}) {
  context.messages.length = 0;
  context.state = {
    temperature: 1.2,
    year: 2050,
    gameOver: false,
    won: false,
    winStreakMonths: 0,
    loseStreakMonths: 0,
    ...overrides,
  };
}

function runEndgameMonth(temperature, year = 2050) {
  context.state.temperature = temperature;
  context.state.year = year;
  context.updateEndgameStreaks();
  context.checkWinLose();
}

resetState();
for (let i = 0; i < 11; i++) {
  runEndgameMonth(1.0);
  assert(!context.state.gameOver, `win fired before 12 sustained months at month ${i + 1}`);
}
assert(context.state.winStreakMonths === 11, "win streak should count 11 qualifying months");
runEndgameMonth(1.0);
assert(context.state.gameOver && context.state.won, "win should fire on the 12th sustained month");

resetState();
for (let i = 0; i < 6; i++) {
  runEndgameMonth(1.0);
}
runEndgameMonth(1.01);
assert(context.state.winStreakMonths === 0, "win streak should reset when temperature rises above winTemp");
for (let i = 0; i < 11; i++) {
  runEndgameMonth(1.0);
}
assert(!context.state.gameOver, "win should not fire after reset until a fresh 12-month streak completes");

resetState();
runEndgameMonth(2.0);
assert(!context.state.gameOver, "loss should not fire on first hot month");
runEndgameMonth(2.0);
assert(!context.state.gameOver, "loss should not fire on second hot month");
runEndgameMonth(1.99);
assert(context.state.loseStreakMonths === 0, "loss streak should reset below loseTemp");
runEndgameMonth(2.0);
runEndgameMonth(2.0);
assert(!context.state.gameOver, "loss should still wait for a fresh third hot month after reset");
runEndgameMonth(2.0);
assert(context.state.gameOver && !context.state.won, "loss should fire on the third sustained hot month");

console.log("CAR-88 regression PASSED: win/loss require sustained monthly streaks.");
