# Carbon Capture: Climate Overseer — Full Repo Audit (2026-07-07)

**Auditor:** CTO (Fable/Claude), analysis-only 4-phase sweep for CAR-297.
**Audited at commit:** `2838bd9` (`fix(game): show notice when saved game fails to load`), on `main`.
**Method:** Map → Audit → Prioritize → Deliver. Five parallel read-only reviewers (game.js
architecture, simulation correctness, security/save-load, testing/CI/devex, data/perf/docs);
the CTO re-verified every headline claim against the working tree by direct read. No product
code was modified — the only write is this document.

> **Note on scope.** CAR-297 was first run against the wrong checkout (a stale `scout.git`,
> now archived) and re-opened to target THIS repo. This document and its backlog issues are
> the corrected, game-repo audit. Line numbers are exact as of `2838bd9`.

---

## 1. Repo map

**What it is.** *Carbon Capture: Climate Overseer* — a browser-based, turn-based strategy
game. You play a global climate authority: ally with world regions, build clean power +
carbon-capture (CCS/DAC) + forest projects, and hold warming ≤ +1.0 °C through 2050 without
crossing the +2.0 °C loss line. Pure static front-end, no backend, no accounts, no network
API, no secrets.

**Stack.** Vanilla JS (ES modules) + **Vite 5** build → **GitHub Pages** (`base:
"/Eit-carbon-capture-game/"`). Eight HTML entry points (`vite.config.js`): `index.html`
(difficulty select), `game.html` (the game), and six static reference pages
(`game_mechanics.html`, `game_rules.html`, `Game_Data_Reference.html`, etc.). Playwright for
e2e; husky + commitlint for commit hygiene. A `report` git submodule (external EiT report
repo) is not part of the build.

**Layout & control flow.**
- `game.js` (**16,258 lines**) — the monolith: all config constants, the entire simulation
  engine, and all DOM rendering. Loaded as `<script type="module">` (`game.html:624`). The
  turn engine is `nextMonth()` (`game.js:10708`); `advanceOneYear()` (`:11029`) loops it 12×.
  State lives in one module-global `let state` (`:6585`); saved to `localStorage` key
  `carbonCaptureGameSave` (`saveGame` `:6608`, `loadGame` `:6640`).
- `public/modules/data/*` — the game **data** IS modularized (good): `countries.js` (62
  countries), `geography.js`, `region-aggregates.js`, `project-data.js`, `difficulty-modes.js`,
  `emission-sectors.js`, `index.js`. `game.js` imports these (`game.js:5-27`).
- `style.css` (**9,414 lines**) + `brand/fonts.css` (base64 fonts).
- `tests/e2e/*` (Playwright, 3 specs) + `scripts/test-*.mjs` (15 homegrown node regressions).
- `docs/` — rich history: `SYSTEM_OVERVIEW.md` (accurate), `IMPLEMENTED.md`/`TODO.md` (stale),
  and ~27 dated per-ticket audit reports.

**Maturity.** A mature, actively-developed single-player game (CAR-* ticket history in
commits + docs). Strong points: the simulation core (lines ~277–1900) is **DOM-free** and
internally sound; data is single-sourced into modules; save/load has migrations and a
failure notice; e2e tests assert real behavior; commit hygiene is enforced. Weak points
cluster in three places (see themes): a family of **"reads a never-set field → silently
wrong"** bugs in secondary/UI paths, **no CI test/lint gate**, and a **16k-line untestable
monolith**.

**Conventions to respect when fixing.** Conventional commits (commitlint). Red-before-green
reproducers per bug under `scripts/test-*.mjs` + `.claude/test-runs/`. `mapDebug` (`game.js:66`)
behind `window.DEBUG_MAP`. Data changes go in `public/modules/data/*`, not inlined into
`game.js`. `AGENTS.md`/`CLAUDE.md` hold the working guide.

**Surprising / notable.**
- The three most important defects are all the **same shape**: code reads a property that is
  never assigned, so a player-visible number silently computes to 0 or ~94× wrong. This is
  the CAR-57 class, and it recurs (G1–G4).
- **CI runs only `npm run build`** — no test, lint, or typecheck gates a deploy (`deploy.yml`).
- The shipped **CSS (807 KB) is larger than the JS bundle (355 KB)**, ~630 KB of it
  base64-inlined fonts.
- `game.js` has **340 functions and 0 `export`s**; the DOM-free sim engine can't be imported
  for unit testing.

---

## 2. Audit findings

Severity = concrete impact × likelihood. Each: what / where (`file:line` at `2838bd9`) /
why / fix + rough effort (S ≤ half-day, M ≈ 1–2 days, L ≈ 3+ days). `game.js` unless noted.

### 2.1 Simulation correctness — the "never-set field / unit-mismatch" cluster

**G1 — HIGH — Displayed "Net CO₂ Rate" double-counts removals with a Gt/yr-as-ppm unit
error (≈94× too strong).** `calculateNetCO2Rate` (`:7377`) starts from `getCo2IncreaseRate()`
(`:6752`) — which is already the net carbon-balance rate in ppm/month, removals included —
then subtracts `project.co2Reduction * effectMult * stackMult` per removal project (`:7406`),
where `co2Reduction` is a Gt/yr figure (0.02–0.15). This is the **exact double-application
with wrong units** the team already fixed in the state path — see the comment at `:10904-10906`
("duplicate application with wrong units (raw Gt/yr instead of ppm), causing ~94× over-strong
CO2 removal") — but `calculateNetCO2Rate` (display + logic) never got the fix. It drives the
header net-CO₂ arrow (`:11906`, `:16027`) **and** the alliance signal `isReducingCO2 =
netCO2Rate < 0` (`:8019`). *Consequence:* a few removal projects flip the displayed
trajectory sharply negative (arrow says CO₂ is plummeting) while `state.co2` keeps rising, and
alliance behavior keys off the bogus sign. Every player decision reads this arrow. *Fix:*
return `carbonBalance.ppmChange * multiplier + feedback` (removals already included), deleting
the project loop; or convert `co2Reduction` via `×EMISSIONS_TO_PPM_FACTOR/12` AND drop
removals from the base. Effort **S**.

**G2 — MED — "Carbon Capture Rate" (and capture detail) always shows 0 — reads a never-set
instance field.** The header sum (`:12054`), `getCaptureDetailContent` (`:4816`), and the
projects-by-type summary (`:4689`) read `proj.co2Reduction` off each completed project
*instance*. But instances are only ever pushed as `{type, effectMultiplier}` or a bare string
(`:11430`, `:11435`) — they carry **no** `co2Reduction`, so `proj.co2Reduction || 0` is always
0 and the header renders `0`. (It also only matches `'carbonCapture'`/`'directAirCapture'`,
missing postCombustion/oxyfuel/DAC-variant/hub types.) The simulation itself removes CO₂
correctly — it resolves the *type definition* (`PROJECT_TYPES[type].co2Reduction`, `:745-750`)
— so the mechanic works but is reported as doing nothing. **This is the most likely origin of
the CAR-57 "CCS removal ≈ 0" report.** *Fix:* resolve the type def (mirror `:745-750`),
normalize string instances, expand the CCS type list. Effort **S**.

**G3 — MED — Alliance "carbon-intensity improvement" is permanently 0% — reads a field that
exists nowhere.** `calculateCarbonIntensityImprovement` (`:8597`) reads
`regionData?.co2EmissionsBaseline`, but `co2EmissionsBaseline` is defined in **no** data
module (grep: 1 read site, 0 definitions), so `baselineEmissions` is always 0 and the guard
at `:8603` returns 0. `calculateAllianceAvgIntensityReduction` (`:8620`) averages zeros; both
feed the alliance UI (`:8636`, `:8692`, `:8791`, `:8827`). *Consequence:* a player-visible
alliance stat is frozen at 0%. *Fix:* add `co2EmissionsBaseline` per region in
`region-aggregates.js` (or derive from sector/power baselines). Effort **S/M**.

**G4 — MED — "Carbon Neutral" achievement + month-summary tone compare Gt/yr against
ppm/month.** `totalReduction` (Gt/yr, accumulated `:10842`) is compared to `getCo2IncreaseRate()`
(ppm/month) in the achievement check (`:3611`) and to `totalCO2Increase` for the good/bad
month message (`:10999-11000`). Same unit family as G1: a Gt/yr sum (~0.5) beats a ppm/month
rate (~0.2), so "Carbon Neutral" unlocks after a few CCS builds even while CO₂ rises, and the
per-turn tone can mislead. *Fix:* convert to ppm/month before comparing, or compare against
`carbonBalance` net directly. Effort **S**.

*Verified sound (no defect):* the core carbon balance, `EMISSIONS_TO_PPM_FACTOR=0.1277247`
calibration (~2.7 ppm/yr net, close to real), sign of `state.co2 += …`, month-step indexing,
temperature formula + win/lose constants, and all power-grid divisors (guarded). Feedback
loops are one-directional-by-design (a difficulty choice, not a bug).

### 2.2 Testing & CI — the systemic gap that lets §2.1 ship

**G5 — HIGH — Nothing gates a deploy except the bundle compiling.** `.github/workflows/deploy.yml`
runs only `npm ci` + `npm run build` on every push to `main`, then deploys to Pages. No test,
lint, or typecheck job; the e2e suite and the 15 `scripts/test-*.mjs` regressions are never run
in CI, and there's no manual approval on the `github-pages` environment. *Consequence:* a
logic/sim/balance regression (exactly the G1–G4 class) compiles fine and ships automatically.
*Fix:* add a `test` job (`npm ci`, `playwright install`, `npm run test:e2e`, loop the node
regressions); make `build`/`deploy` `needs: [test]`. Effort **M**.

**G6 — HIGH — The 16k-line simulation core has almost no behavioral coverage.** Core climate
math (carbon balance, global emissions, ocean/land absorption), power grid, and disaster
probability have **0** test references; `getTotalClimateFeedback` is *stubbed to `()=>0`* in
one test; `calculateTemperature` is only checked as a source-constant match; several
`.mjs` "tests" assert on source *text* (substrings/regex over `game.js`), which give false
pass/fail on rename or behavior drift. The good e2e specs assert UI/action behavior but never
that simulation *numbers* are right. Root cause is G9 (not importable). *Fix:* extract the
pure math into importable modules with golden-value unit tests over input ranges; even 10–15
would catch the G1–G4 class. Effort **L** (needs modularization) / **M** (first `vm` suite).

**G7 — MED — No lint / format / typecheck tooling at all.** No eslint/prettier/jsconfig
anywhere; `package.json` has only `dev/build/preview/test:e2e`. On 16k lines of untyped JS,
nothing catches undefined-variable typos, `==` bugs, unused code, or the **never-set-field
class that produced G1–G4** (a typechecker with `checkJs` + JSDoc, or eslint `no-undef`, would
flag reads of properties that are never assigned). *Fix:* add ESLint (`recommended` +
`no-undef`/`no-unused-vars`) + Prettier + optional `jsconfig` `checkJs`; wire into the G5 CI
job. Effort **M** (expect a large first-pass fixup). *This is the highest-leverage preventive.*

**G8 — MED — The regression harness is orphaned and hooks are opt-in.** 15 `scripts/test-*.mjs`
are tracked but have no runner (no `npm test` script), aren't in CI, and aren't in the
`AGENTS.md` verification checklist — they run only ad hoc and rot silently (a session log
records one broken on a past HEAD). husky has only a `commit-msg` hook (no `pre-commit` runs
tests/lint), and husky isn't auto-activated (no `"prepare": "husky"`), so a fresh clone has
*no* hooks until `scripts/setup.sh` is run. *Fix:* add a `test` script that runs the `.mjs`
suite, a `"prepare": "husky"`, and a `pre-commit` (lint + fast regressions); reference in
`AGENTS.md`. Effort **S**. *(Also LOW: no `window.onerror`/`unhandledrejection` handler, so an
uncaught exception mid-game silently bricks the session with no user-facing recovery.)*

### 2.3 Architecture & maintainability

**G9 — HIGH — One 16,258-line module, 340 functions, 0 exports; everything shares a global
`state`.** The only test seam is a hand-maintained `window.__carbonTestBridge` exposing 5
symbols (`:16251`). The DOM-free sim engine (`:277-1900`) *could* be unit-tested but can't be
imported, and every sim function reads the module-global `state` rather than taking it as a
parameter. *Consequence:* high navigation/onboarding cost and the root cause of G6. *Fix:*
split into ES modules with real exports (`sim/emissions|carbon|economy|power|…`, `state/`,
`ui/render|input|map`), passing `state` as an argument. Effort **L**. (A concrete
decomposition sketch is in the architecture reviewer's notes; the sim seams already exist.)

**G10 — MED — `nextMonth` (310 lines, `:10708`) entangles simulation with DOM.** One function
advances the clock, runs several full region passes, mutates funds/co2/temperature, AND fires
DOM popups + `updateUI()` (`:11014`) + `saveGame()` (`:11015`) — so you can't advance a
simulated month without a live DOM. The documented 94× double-count bug (`:10904`) lived here.
It also iterates `state.regions` three times per tick (`:10736/10769/10856`), recomputing the
same per-region derived values. *Fix:* split into `advanceClock → runEconomy → runClimate →
runDisasters → runDiplomacy` returning events; compute per-region context once. Effort **M/L**.

**G11 — MED — Dead code + fragile string-coupled handlers.** ~250–350 lines of verified-dead
code (16 unreferenced functions, incl. superseded granularity resolvers `getRegionalRegionId`
`:7611` / `getSubregionalRegionId` `:7676` and `buildResearchCenter` `:12635`). Rendering uses
`innerHTML` with inline `onclick="fn('${id}')"`, forcing **41** `window.X = fn` shims
(`:16220-16244`); a rename silently breaks the string handler (no lint/compile catch). Two
parallel switches over `currentMapMode` (`getColorForMode` `:14870`, `getTooltipForMode`
`:14902`) plus legend/colors mean 4+ edit sites per map mode. *Fix:* delete dead code; use
`addEventListener` + `data-*` delegation; drive map modes from one registry. Effort **S–M**.

### 2.4 Security & robustness

**G12 — MED — Save load: shape-mismatch saves crash outside the try/catch (no notice); no
real schema validation/versioning.** `loadGame` (`:6640`) wraps only `JSON.parse` + field
backfills; `state = saveData.state` is trusted verbatim, then rendering runs *outside* any
try/catch (`:15795`). So a valid-JSON-but-wrong-shape save (missing `regions`, string where a
number is expected, old schema) passes `loadGame`, returns `true`, then throws during render →
blank/broken game with **no** failure notice and no recovery. The `version` field is written
(`:6618`) but never read; "migrations" are ad-hoc backfills, not version-gated; core numeric
fields get no validation → a future `state`-shape change silently breaks every existing save
(data loss). *Fix:* wrap the `loadGame()+restoreGameUI()` call site, on throw show the notice +
clear/backup + `initGame()`; read `version` and gate migrations; add a minimal `validateState()`.
Effort **S–M**.

**G13 — LOW — Save-derived strings reach `innerHTML` unescaped.** e.g. `:4942` interpolates
`disaster.type` and `getRegionName(disaster.regionId)` (which returns the raw `regionId` for
unknown keys, `:7444`) into `innerHTML`; no `escapeHTML` exists anywhere. A crafted save could
carry `<img onerror=…>`. *Realistically LOW* for a local single-player game — delivery needs a
same-origin `localStorage` write (no import/URL/paste vector), though note all of an owner's
`github.io` repos share one origin. *Fix:* add `escapeHTML()` for save-derived strings, or use
`textContent`. Effort **S**. *(Verified clean: no query-param reads, no service worker, no
committed secrets, no runtime deps, same-origin SVG map with robust fallback.)*

### 2.5 Performance

**G14 — HIGH — Shipped CSS is 807 KB, ~630 KB of it base64-inlined TTF fonts.** `style.css:3`
`@import`s `brand/fonts.css` (676 KB, 6 full base64 TTF faces); Vite inlines it into a single
render-blocking `dist/assets/style-*.css` = **807 KB** — *larger than the 355 KB JS bundle*.
Base64 adds ~33%, un-subsetted TTF is far bigger than woff2, and inlining defeats separate font
caching. The page can't paint until all 807 KB parse. *Fix:* subset to used glyphs + woff2 +
reference as files (drop base64) → realistically <100 KB. Effort **M**.

**G15 — MED — "Advance 1 Year" does up to 12 full re-renders + 12 localStorage writes.**
`advanceOneYear` (`:11029`) loops `nextMonth()` ≤12×; each `nextMonth` ends with a full
`updateUI()` + `saveGame()` (whole-`state` `JSON.stringify`). And `updateUI()` (`:11813`)
unconditionally rebuilds ~16 panels via `innerHTML` on every call regardless of what changed
(clobbering focus/scroll). *Fix:* run the 12 steps then a single `updateUI()`+`saveGame()`;
gate panel renders on dirty flags. Effort **S–M**.

**G16 — LOW — Asset clutter.** 5 world-map SVGs at repo root (`world-map.svg` and
`world-map-option-med.svg` are byte-identical), ~347 KB, apparently superseded by
`assets/maps/`; ~390 KB of large static reference HTML shipped as separate Vite entries. *Fix:*
confirm references, delete duplicates, consider generating reference pages from data. Effort **S**.

### 2.6 Data consistency

**G17 — MED — Region aggregates are double-sourced and drifted.** `REGION_AGGREGATES.north_america.gdp
= 28.9` (`region-aggregates.js:16`) but member countries sum to 34.6 (USA 30.5 alone > the
continent total; `countries.js:339,403,467`); at default "continents" granularity
`getContinentData` sums country GDPs (34.6) yet `calculateCarbonIntensityImprovement` reads the
curated 28.9 — same continent, two GDPs by code path. `REGION_AGGREGATES` and
`MAJOR_REGIONS` (`geography.js:590`) both define `north_america`/`south_america`/`oceania`
with divergent `power.currentMixTWh`. *Fix:* derive aggregates from members (single source).
Effort **M**. *(Verified good: sector subsectors sum exactly to baselines; climate seeds
consistent with the temp formula; data is otherwise single-sourced into `public/modules/data`.)*

### 2.7 Docs freshness

**G18 — MED — `IMPLEMENTED.md` / `TODO.md` broadly wrong vs code.** IMPLEMENTED.md (reviewed
2026-04-24) states the old temp formula `(CO2−280)×0.008` (code: `ppm×0.0105−3.37`), lose at
"+3.0 °C" (actual +2.0), difficulty budgets $150/120/100/80/60B (actual $50/40/25/20/15B),
3 tipping points at 1.5/2.0/2.5 (actual 4 at 1.4/1.7/2.1/2.4), "96 countries" (actual 62), and
"3 save slots + export/import" features that don't exist (single autosave key). TODO.md lists
shipped systems (events, tech tree, history graphs, all advanced project types) as pending.
*Fix:* rewrite from `GAME_CONFIG`/`difficulty-modes.js`. Effort **M**.

**G19 — LOW — Doc navigability + stale pointers.** 27 unindexed per-ticket audit docs in
`docs/` root (`docs/README.md` lists only 4); `docs/decisions/` has only a template though
`SYSTEM_OVERVIEW.md`/`docs/README.md` reference "the ADRs"; `game.js:77-78` header comment
points at deleted `public/modules/config`/`systems` dirs; `data.md:74` still shows the old
0.008 temp factor. *Fix:* move `*-CAR-*.md` into `docs/audits/` with an index; add real ADRs
or drop the reference; fix the stale comment/factor. Effort **S–M**. *(SYSTEM_OVERVIEW.md and
README.md are accurate — verified.)*

---

## 3. Prioritize (impact × effort)

**Do first — cheap correctness wins that fix visible, decision-driving bugs (all S):**
1. **G1** — fix `calculateNetCO2Rate` double-count/units (the net-CO₂ arrow players steer by).
2. **G2** — capture-rate UI reads never-set field → shows 0 (the CAR-57 symptom).
3. **G4** — Carbon-Neutral achievement / month tone unit mismatch.
4. **G3** — carbon-intensity-improvement never-set field (add data → stat works).

**Do next — the systemic enablers (so §2.1 can't recur silently):**
5. **G5** — add a CI test/lint gate (`build`/`deploy` need `test`). *Highest systemic value.*
6. **G7** — add ESLint + `checkJs`/JSDoc — directly catches the never-set-field/undefined class.
7. **G8** — wire the orphaned `.mjs` suite + `prepare: husky` + `pre-commit`.

**Structural (durable, larger):**
8. **G9** — extract the DOM-free sim into importable modules (unlocks G6 unit tests).
9. **G6** — golden-value unit tests over the sim math. **G10** — decompose `nextMonth`.

**Robustness / perf / hygiene:**
10. **G12** (save-load crash + validation — data-loss risk), **G14** (807 KB CSS/fonts —
    first paint), **G15** (advance-year re-render), then **G11/G13/G16/G17/G18/G19**.

---

## 4. Themes

- **A recurring defect shape:** "read a property that is never assigned → silent 0 / wrong
  units." G1, G2, G3, G4 are all instances; CAR-57 was the first. The durable fix is not just
  the four patches but **G7 (a typechecker/linter) + G6 (unit tests on the sim)** so the class
  is caught mechanically.
- **No safety net on the path to production:** G5 (no CI gate) + G6/G7 (no tests/lint on the
  engine) mean the only thing between a logic regression and players is whether Vite bundles.
- **The monolith (G9) is the root enabler:** because the sound, DOM-free sim engine isn't
  importable, it can't be unit-tested, so correctness regressions are only found by playing.
- **Docs and secondary data paths have drifted** from the (accurate) core — G17, G18, G19.

---

## 5. Backlog issues filed

One backlog issue per actionable finding (G1–G19), parented to CAR-297, each citing this doc +
`file:line`, all `status = backlog` (queued, not started), unassigned with intended owner CEO
(the CTO role lacks `tasks:assign`). No secrets/credentials were found; no fix work was started
by this audit.
