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

const elements = {};

function createElement(id) {
  return {
    id,
    className: "",
    textContent: "",
    innerHTML: "",
    focused: false,
    onclick: null,
    listeners: {},
    classList: {
      classes: new Set(["hidden"]),
      add(value) {
        this.classes.add(value);
      },
      remove(value) {
        this.classes.delete(value);
      },
      contains(value) {
        return this.classes.has(value);
      },
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    querySelector(selector) {
      const selectors = {
        ".popup-overlay": "endgame-results-overlay",
        ".popup-close": "endgame-results-close",
        ".endgame-play-again": "endgame-play-again",
        ".endgame-back-menu": "endgame-back-menu",
      };
      return elements[selectors[selector]];
    },
    querySelectorAll() {
      return [elements["endgame-results-close"], elements["endgame-play-again"], elements["endgame-back-menu"]];
    },
    focus() {
      this.focused = true;
    },
  };
}

[
  "endgame-results-popup",
  "endgame-results-dialog",
  "endgame-results-title",
  "endgame-results-outcome",
  "endgame-results-summary",
  "endgame-results-score",
  "endgame-results-overlay",
  "endgame-results-close",
  "endgame-play-again",
  "endgame-back-menu",
].forEach((id) => {
  elements[id] = createElement(id);
});

const context = {
  ALLIANCE_STATUS: { ALLIED: "allied" },
  GAME_CONFIG: {
    winTemp: 1.0,
    loseTemp: 2.0,
    loseYear: 2100,
    currencySymbol: "$",
    currencyUnit: "B",
  },
  document: {
    getElementById(id) {
      return elements[id] || null;
    },
  },
  window: { location: { href: "" } },
  messages: [],
  clearCount: 0,
  initCount: 0,
  activatedDialog: null,
  bannerSyncCount: 0,
  pushMessage(message, tone = "neutral") {
    context.messages.push({ message, tone });
  },
  clearSavedGame() {
    context.clearCount += 1;
  },
  initGame() {
    context.initCount += 1;
  },
  activateDialog(container, dialog, onClose) {
    context.activatedDialog = { container, dialog, onClose };
  },
  deactivateDialog() {},
  syncEndgameBanner() {
    context.bannerSyncCount += 1;
  },
  countTotalProjects() {
    return Object.values(context.state.regions).reduce(
      (total, region) => total + region.projects.length,
      0,
    );
  },
  getAlliedRegionsCount() {
    return Object.values(context.state.alliance).filter((alliance) => alliance.status === "allied").length;
  },
  getRegionIds() {
    return ["europe", "asia", "africa"];
  },
};

vm.createContext(context);
vm.runInContext(
  [
    extractFunction("formatCurrency"),
    extractFunction("calculateEndgameScore"),
    extractFunction("getEndgameRunSummary"),
    extractFunction("showEndgameResultsModal"),
    extractFunction("closeEndgameResultsModal"),
    extractFunction("checkWinLose"),
  ].join("\n"),
  context,
);

context.state = {
  temperature: 0.92,
  co2: 430.4,
  year: 2051,
  month: 4,
  funds: 1280,
  gameOver: false,
  won: false,
  winStreakMonths: 11,
  loseStreakMonths: 0,
  alliance: {
    europe: { status: "allied" },
    asia: { status: "allied" },
    africa: { status: "neutral" },
  },
  regions: {
    europe: { projects: ["solar", "forest"] },
    asia: { projects: [{ type: "carbonCapture" }] },
    africa: { projects: [] },
  },
};

context.checkWinLose();
assert.equal(context.activatedDialog, null, "modal should not open before a terminal streak");

context.state.winStreakMonths = 12;
context.checkWinLose();

assert.equal(context.state.gameOver, true, "win should set gameOver");
assert.equal(context.state.won, true, "win should mark the run as won");
assert.equal(elements["endgame-results-popup"].classList.contains("hidden"), false, "modal should be visible");
assert.equal(context.activatedDialog.dialog, elements["endgame-results-dialog"], "modal should reuse the focus-trap dialog helper");
assert.equal(elements["endgame-results-outcome"].textContent, "Victory", "win outcome should be Victory");
assert.match(elements["endgame-results-summary"].innerHTML, /Final temp anomaly/);
assert.match(elements["endgame-results-summary"].innerHTML, /0\.92/);
assert.match(elements["endgame-results-summary"].innerHTML, /Year reached/);
assert.match(elements["endgame-results-summary"].innerHTML, /Final CO2/);
assert.match(elements["endgame-results-summary"].innerHTML, /Allies/);
assert.match(elements["endgame-results-summary"].innerHTML, /2 \/ 3/);
assert.match(elements["endgame-results-summary"].innerHTML, /Projects built/);
assert.match(elements["endgame-results-summary"].innerHTML, /Ending treasury/);
assert.match(elements["endgame-results-score"].textContent, /Score/);

elements["endgame-play-again"].onclick();
assert.equal(context.initCount, 1, "Play Again should start a fresh game");

context.state = {
  ...context.state,
  gameOver: false,
  won: false,
  winStreakMonths: 0,
  loseStreakMonths: 3,
  temperature: 2.14,
};
context.checkWinLose();
assert.equal(elements["endgame-results-outcome"].textContent, "Climate Catastrophe", "loss outcome should be Climate Catastrophe");

elements["endgame-back-menu"].onclick();
assert.equal(context.window.location.href, "index.html", "Back to Menu should return to index.html");

console.log("endgame results modal regression passed");
