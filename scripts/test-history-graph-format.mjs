import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../game.js", import.meta.url), "utf8");
const match = source.match(/function formatHistoryGraphChange[\s\S]*?\n}\n/);

assert.ok(match, "formatHistoryGraphChange helper should exist");

const context = {};
vm.createContext(context);
vm.runInContext(`${match[0]}; globalThis.formatHistoryGraphChange = formatHistoryGraphChange;`, context);

const { formatHistoryGraphChange } = context;

assert.equal(
  formatHistoryGraphChange(0.05, (v) => (v >= 0 ? "+" : "") + v.toFixed(2)),
  "+0.05",
);
assert.equal(
  formatHistoryGraphChange(-0.05, (v) => (v >= 0 ? "+" : "") + v.toFixed(2)),
  "-0.05",
);
assert.equal(
  formatHistoryGraphChange(0, (v) => (v >= 0 ? "+" : "") + v.toFixed(2)),
  "+0.00",
);
assert.equal(
  formatHistoryGraphChange(0.5, (v) => v.toFixed(1)),
  "+0.5",
);
assert.equal(
  formatHistoryGraphChange(-0.5, (v) => v.toFixed(1)),
  "-0.5",
);
assert.equal(
  formatHistoryGraphChange(5, (v) => "$" + v.toFixed(0)),
  "+$5",
);

console.log("history graph formatting regression passed");
