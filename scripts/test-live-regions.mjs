// Regression for CAR-136: critical game feedback must be exposed through
// ARIA live regions so screen readers announce new briefing entries and
// achievement toasts.
//
// Run: node scripts/test-live-regions.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "game.html"), "utf8");
const js = readFileSync(join(root, "game.js"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const newsLogMatch = html.match(/<div\s+[^>]*id="news-log"[^>]*>/);
assert(newsLogMatch, "news-log element should exist");

const newsLog = newsLogMatch[0];
assert(newsLog.includes('role="log"'), "news-log should use role=\"log\"");
assert(newsLog.includes('aria-live="polite"'), "news-log should announce updates politely");
assert(newsLog.includes('aria-atomic="false"'), "news-log should allow individual entries to be announced");
assert(newsLog.includes('aria-label="Game events"'), "news-log should have a screen-reader label");

const achievementToastStart = js.indexOf('toast.className = "achievement-toast";');
assert(achievementToastStart !== -1, "achievement toast should be created");

const achievementToastSetup = js.slice(achievementToastStart, js.indexOf("toast.innerHTML", achievementToastStart));
assert(
  achievementToastSetup.includes('toast.setAttribute("role", "status");'),
  "achievement toast should use status role",
);
assert(
  achievementToastSetup.includes('toast.setAttribute("aria-live", "assertive");'),
  "achievement toast should announce assertively",
);
assert(
  achievementToastSetup.includes('toast.setAttribute("aria-atomic", "true");'),
  "achievement toast should announce the complete toast content",
);

console.log("CAR-136 regression PASSED: live regions are present.");
