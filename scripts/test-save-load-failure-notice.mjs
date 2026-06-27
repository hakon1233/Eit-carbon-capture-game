import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// CAR-144: A malformed/incompatible saved game used to fail only through
// console.warn, then startup silently fell back to a fresh game. Players need a
// visible notice when a saved payload existed but could not be restored.

const source = fs.readFileSync(new URL("../game.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../game.html", import.meta.url), "utf8");

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

function createContext(savedValue) {
  const context = {
    SAVE_KEY: "carbonCaptureGameSave",
    currentGranularity: "continents",
    currentMapMode: "alliance",
    currentDifficulty: "normal",
    isSetupMode: true,
    selectedRegionId: null,
    state: {},
    localStorage: {
      getItem(key) {
        assert.equal(key, "carbonCaptureGameSave");
        return savedValue;
      },
    },
    console: {
      warnings: [],
      warn(...args) {
        context.console.warnings.push(args);
      },
    },
    noticeCount: 0,
    showSaveLoadFailureNotice() {
      context.noticeCount += 1;
    },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(extractFunction("loadGame"), context);
  return context;
}

const noSaveContext = createContext(null);
assert.equal(noSaveContext.loadGame(), false, "missing save should still start fresh");
assert.equal(noSaveContext.noticeCount, 0, "missing save should not show a failure notice");

const malformedSaveContext = createContext("{ definitely not valid json");
assert.equal(malformedSaveContext.loadGame(), false, "malformed save should fall back to a fresh game");
assert.equal(malformedSaveContext.console.warnings.length, 1, "malformed save should still be logged for debugging");
assert.equal(malformedSaveContext.noticeCount, 1, "malformed save should show a friendly player notice");

assert.match(html, /id="save-load-notice"/, "game page should include the saved-game notice container");
assert.match(html, /role="alert"/, "saved-game notice should be announced as an alert");

const noticeElement = { hidden: true };
const dismissButton = { onclick: null };
const domContext = {
  document: {
    getElementById(id) {
      if (id === "save-load-notice") return noticeElement;
      if (id === "save-load-notice-dismiss") return dismissButton;
      return null;
    },
  },
};
vm.createContext(domContext);
vm.runInContext(extractFunction("showSaveLoadFailureNotice"), domContext);
domContext.showSaveLoadFailureNotice();
assert.equal(noticeElement.hidden, false, "notice helper should reveal the alert");
assert.equal(typeof dismissButton.onclick, "function", "notice helper should wire dismissal");
dismissButton.onclick();
assert.equal(noticeElement.hidden, true, "dismissal should hide the notice");

console.log("PASS: failed saved-game load surfaces a player notice");
