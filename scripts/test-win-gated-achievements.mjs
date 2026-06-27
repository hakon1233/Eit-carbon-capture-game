// Regression for CAR-253: win-gated achievements must unlock on victory.
//
// advanceOneMonth() calls checkAchievements() BEFORE checkWinLose() sets
// state.won. Once the game ends, the month loop halts, so achievements whose
// condition needs state.won (speed_run, against_all_odds) would never unlock.
// The fix re-checks achievements inside checkWinLose() once gameOver is set.
//
// Run: node scripts/test-win-gated-achievements.mjs

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

// Structural guarantee: checkWinLose must re-check achievements after deciding
// the outcome, otherwise win-gated achievements can never fire.
const checkWinLose = extractFunction("checkWinLose");
assert(
  checkWinLose.includes("checkAchievements()"),
  "checkWinLose must call checkAchievements() once the game ends (CAR-253)",
);

// Functional check: with a win-gated achievement, calling checkAchievements()
// while won=false leaves it locked; checkWinLose() should both win and unlock it.
const context = {
  GAME_CONFIG: { winTemp: 1.0, loseTemp: 2.0, loseYear: 2100 },
  messages: [],
  pushMessage(message, tone = "neutral") {
    context.messages.push({ message, tone });
  },
  clearSavedGame() {},
  showEndgameResultsModal() {},
  showAchievementNotification() {},
  ACHIEVEMENTS: [
    {
      id: "speed_run",
      name: "Speed Run",
      icon: "x",
      description: "",
      condition: (state) => state.won && state.year === 2050,
    },
    {
      id: "against_all_odds",
      name: "Against All Odds",
      icon: "x",
      description: "",
      condition: (state) => state.won && state.difficulty === "extreme",
    },
  ],
};
vm.createContext(context);
vm.runInContext(
  `${extractFunction("checkAchievements")}\n${checkWinLose}`,
  context,
);

context.state = {
  temperature: 0.9,
  year: 2050,
  difficulty: "extreme",
  gameOver: false,
  won: false,
  winStreakMonths: 12,
  loseStreakMonths: 0,
  achievements: [],
};

// Mirrors advanceOneMonth ordering: achievements checked before the outcome.
context.checkAchievements();
assert(
  context.state.achievements.length === 0,
  "win-gated achievements must stay locked while state.won is false",
);

context.checkWinLose();
assert(context.state.won, "checkWinLose should record the win");
assert(
  context.state.achievements.includes("speed_run"),
  "speed_run should unlock after the win is finalized",
);
assert(
  context.state.achievements.includes("against_all_odds"),
  "against_all_odds should unlock after the win is finalized",
);

console.log("CAR-253 regression PASSED: win-gated achievements unlock on victory.");
