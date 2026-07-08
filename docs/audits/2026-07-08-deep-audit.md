# Carbon Capture: Climate Overseer — Deep Audit: Architecture / Performance / Test (2026-07-08)

**Auditor:** CTO (Fable/Claude), analysis-only, for CAR-360.
**Audited at commit:** `5f71c2c` (`docs(audit): full 4-phase repo audit — 2026-07-07 (CAR-297)`), on `main`.
**Method:** Three parallel deep read-only reviewers (architecture & maintainability; performance &
bundle; test coverage & quality), every cited line verified against the working tree. Builds on the
**2026-07-07 baseline** (`docs/audits/2026-07-07-repo-audit.md`, findings G1–G19, filed as
CAR-341…CAR-359): this document does **not** repeat the baseline map or re-file its findings — every
finding here is either NEW or a materially deeper, separately-actionable extension of a G-finding
(marked in the `rel` column). No product code was modified; the only write is this document.

## Repo map (recap — unchanged since baseline)

Browser-based turn-based climate-strategy game: vanilla JS + Vite 5 → GitHub Pages, no backend.
`game.js` (16,258 lines, 341 functions, 0 exports) holds config, the DOM-free simulation engine
(lines ~277–1893), and all UI; game **data** lives in ES modules under `public/modules/data/`;
`style.css` (9,414 lines) + base64-font `brand/fonts.css` ship as one 807 KB CSS file; tests are
3 Playwright e2e specs + 15 orphaned `scripts/test-*.mjs` node regressions; CI gates deploys on
`npm run build` only. Churn since May concentrates in `game.js` (42 commits), and within it the
turn engine `nextMonth` (9 commits) and the diplomacy region (~10 of the top-25 most-churned
functions).

## Top-10 cross-lens priorities

1. **T1 (critical)** — the only test touching `calculateNetCO2Rate` *pins the G1 bug as a golden
   value* (raw Gt/yr subtracted from ppm/mo); the suite actively defends the wrong net-CO₂ arrow.
   Fix this test **before** landing G1/CAR-341.
2. **A2 (high)** — a stale parallel project config (`ADVANCED_PROJECT_TYPES`, pre-nerf values,
   different keyspace) sits in the **live removal path** patched by a magic `/1000` — the
   architectural bug-factory behind the CAR-57/G1 class.
3. **T2 (critical)** — the worst shipped bug in repo history (94× CO₂-removal double-count) has
   **no regression guard**; no test asserts `state.co2` across a real month tick.
4. **P1 (high)** — uncached static-data aggregation is the dominant runtime N+1: ~65–75
   re-aggregations/tick, ≈4–5 ms CPU + ~2k allocs per tick; a one-line memoize kills the class.
5. **P2 (high)** — full 256-path SVG map repaint per tick (+ a second alliance repaint):
   ~1,800 SVG DOM ops per month, ~22,000 per "Advance 1 Year", for colors that rarely change.
6. **A1 (high)** — the diplomacy/alliance region (game.js:7959–10424) is the worst coupling×churn
   hotspot (14 functions both mutate state AND touch DOM); it is the first logic/ui split to make.
7. **T3 (high)** — corrupt-save → render-crash path (G12) is *exercised but never observed* by an
   existing e2e (it seeds a wrong-shape save and asserts only the URL); one pageerror assert away.
8. **A10 (medium)** — ~3,000 lines of pure data interleaved through game.js at 12+ locations:
   the mechanically-free first 20% of the G9 split, and the reason PROJECT_TYPES could fork (A2).
9. **T5 (high)** — difficulty modes (the product's tutorial→extreme promise) have **zero** test
   references across all knobs.
10. **A4 (medium)** — `rules.html` is a stale fork still shipped as a Vite entry that tells players
    a **wrong win condition** and 3× wrong budgets.

Near-misses: T6 (the CAR-17 balance "reproducer" simulates its own hardcoded numbers, not game
code), P4 (637 KB map SVG fetched late with no preload), A6 (dead code fully enumerated: 16 fns,
259 lines, + 2 dead cross-module imports).

---

## Lens A — Architecture & maintainability

Coupling census for the split: of 341 functions, **175 read the global `state`**, 114 touch DOM,
40 do both — and 35 of those 40 live in diplomacy / `updateUI` / region-panel code. The sim core
(277–1893) has 0 DOM touches and only 2 inbound UI calls. Hidden split-tax: ~22 scattered mutable
module-globals (A12), not just `state`.

| id | file:line | sev | impact | fix | rel |
|---|---|---|---|---|---|
| A1 | game.js:7959–10424 | high | Worst coupling×churn hotspot: 48 fns, 37 read `state`, 18 touch DOM, 14 do both; ~10 of top-25 churned fns live here | Split into `diplomacy/logic.js` (pure math → data) + `diplomacy/ui.js` (renderers); dual fns return HTML-model objects | deepens G9 |
| A2 | public/modules/data/project-data.js:6; game.js:704,747 | high | Stale parallel project config (pre-nerf `baseCo2Reduction: 2` vs 0.02; `reforestation` vs `forest` keys) is a live sim fallback patched by magic `/1000` — CAR-57-class bug factory | Delete `ADVANCED_PROJECT_TYPES`/`SECTOR_POLICIES` or make PROJECT_TYPES the single exported source; remove the `/1000` | NEW |
| A3 | game.js:14212 vs 720–743 | med | CCS infrastructure bonus computed twice and already drifted: UI copy ignores legacy string-form projects, so displayed bonus ≠ simulated bonus for old saves | Sim calls `getCCSInfrastructureBonus` (normalize string instances); delete inline copy | NEW |
| A4 | rules.html:27–28,65; vite.config.js:12 | med | Shipped stale fork of game_rules.html: wrong win condition ("≤1.0 °C at any point" vs 12-month streak, game.js:15346) and 3× wrong budgets | Delete rules.html (+ systems.html) from Vite entries or redirect to game_rules.html | deepens G18 |
| A5 | game_mechanics.html:173 vs game.js:6122–6124 | med | 3,163-line shipped reference page hand-duplicates the *old* project table (matches deprecated A2-era values); Game_Data_Reference.html same pattern | Generate reference tables at build time from `public/modules/data` + exported PROJECT_TYPES | deepens G18/G19 |
| A6 | game.js:412,615,1101,1110,2793,7058,7232,7237,7611,7676,8571,8580,9496,12602,12635,13721 | med | Dead code enumerated: 16 functions, 259 lines, zero references; plus 2 imported-but-never-called data-module exports (`calculateProjectEffectiveness`, `getRandomFact` — data-functions.js:77,136) masking a second cross-module logic duplication | Delete the 16 fns + 2 dead imports, or converge on the data-module implementations | deepens G11 |
| A7 | game.js:15950 vs 16023 | med | 14-item global-stats grid fully copy-pasted (72+100 lines); setup variant hardcodes values incl. `0/4` tipping points | One `renderStatsGrid(values)`; setup passes GAME_CONFIG-derived defaults | NEW |
| A8 | game.js:14870,14902,7242,15152; game.html:171 | med | Map mode = **5** parallel edit sites in 2 files (baseline said 4+); miss one → silent default color / no legend / no tooltip | Single `MAP_MODES` registry {label,color,tooltip,legend}; generate the `<option>`s | deepens G11 |
| A9 | index.html:105–112,139 vs game.js:6608,6618,15774 | med | Menu's Continue/overwrite logic duplicates the save key + shape check in an inline script — the G12 versioning fix will silently break the Continue button | Extract shared `save-contract.js` (key names + `hasActiveSave()`) imported by both entries | NEW |
| A10 | game.js:80,1116,1894,2385,2441,2821,2935,3130,3555,5001,6116,7242,14190 | med | ~3,000 lines of pure data (0 fn coupling, 0 DOM) interleaved at 12+ points — inflates monolith ~20%, contradicts repo convention, enabled the A2 fork | Move each block verbatim into `public/modules/data/` with exports — safest first slice of the split | deepens G9 |
| A11 | style.css (1,378 selectors; e.g. 2205/2221 dup `.primary-button`) | low | One stylesheet serves game + 6 reference pages; 143/879 class selectors match no game token; 5 core components defined 3× each (last-wins landmines) | Split `game.css`/`reference.css`; human-reviewed PurgeCSS pass on the 143 candidates | NEW |
| A12 | game.js:6585–6602 (+5273,3811,12577,13069,14187) | med | The split's hidden tax: ~22 mutable module-globals mixing sim state, SVG handles, UI flags; map/UI modules can't extract until these move | Group into `gameState` / `mapView` / `uiPrefs` stores, migrated region-by-region | deepens G9 |

### game.js split plan (concrete, by line range at `5f71c2c`)

| module | game.js lines to move | exports | depends on |
|---|---|---|---|
| data/config.js (fold into public/modules/data) | 30–275, 1116–1428, 1894–2398, 2441–2460, 2821–3268, 3555–3620, 5001–5272, 6009–6583, 7242–7331, 14190–14205 | GAME_CONFIG, PROJECT_TYPES, TECHNOLOGIES, EVENTS, NATURAL_DISASTERS, ACHIEVEMENTS, TUTORIAL_STEPS, MAP_MODE_COLORS, CCS_* | data modules only |
| sim/climate.js | 277–1115, 6752–6905, 7342–7415 | carbon balance, sector emissions, removals, tipping/feedback, calculateTemperature, calculateNetCO2Rate | config, store |
| sim/power.js | 1429–1893 | calculateProjectTWh, calculateGridImpactPreview, grid stability/price | config, store |
| sim/research.js | 2399–2820, 6906–7072 | research centers, processMonthlyResearch, tech bonuses | config, store |
| sim/disasters.js | 3269–3554 | rollForDisasters, processDisasterDurations | config, store (invert 4 `pushMessage` calls → events-out) |
| sim/events.js | 7073–7241 | rollForEvents, processEvents, event modifiers | config, store |
| state/store.js | 6585–6608, 6610–6751, 10425–10575 | state, saveGame/loadGame, initGame, difficulty | config |
| engine/turn.js | 10708–11133, 11395–11497, 15343–15367 | nextMonth/advanceOneYear returning an events list; checkWinLose | sim/*, store |
| diplomacy/logic.js | 7959–8630, 9300–9660, 10051–10198 (calc parts) | interest/happiness/terms/negotiation math | config, store |
| diplomacy/ui.js | 8631–8982, 9055–9299, 9361–9505, 9671–10050, 10199–10424 | popup/negotiation renderers | diplomacy/logic, ui/popups |
| map/geo.js | 7443–7786 | granularity resolvers, geo centers (pure; 0 `state` reads) | config |
| map/render.js | 7787–7958, 14823–15228, 15416–15692 | updateMapColors, mode registry (A8), wireMap | mapView store (A12), sim getters |
| ui/popups.js + ui/tutorial.js | 3823–4999, 5273–6008 | dialog infra, stat popups, tutorial | store, sim getters |
| ui/panels.js | 11813–14822 (minus 14212 dup) | updateUI, region panel, project buttons | all above |
| main.js (entry) | 15368–16258 | none — wiring; replace the window-shim block (16220–16244) with delegated listeners | all |

**Cheapest seams, in order:** (1) config/data blocks (pure moves, zero coupling); (2) sim core
277–1893 (0 DOM, 2 inbound UI calls — unlocks G6 unit tests immediately); (3) events/tech logic
6752–7241; (4) map/geo.js resolvers (0 `state` reads); (5) disasters after inverting 4
`pushMessage` calls. **Hardest:** diplomacy (A1), `nextMonth` (G10), the updateUI panel cluster,
and regrouping the 22 module-globals (A12).

---

## Lens P — Performance & bundle

All runtime cost concentrates in the turn path — a timer sweep (P10) found **no** per-frame loops,
so P1/P2/P5 capture essentially the whole runtime budget. Load cost is dominated by the 807 KB CSS
(G14/CAR-354, requantified in P9) + the 637 KB late-fetched map SVG (P4).

| id | file:line | sev | impact (rough cost) | fix | rel |
|---|---|---|---|---|---|
| P1 | game.js:13649 → data-functions.js:545,510,269 | high | Every region lookup re-aggregates member countries (~68 µs/call measured); ~65–75 calls/tick ≈ 4–5 ms CPU + ~2k allocs per month, ~55–60 ms per Advance-Year — all re-deriving immutable data | Memoize `getDataForGranularity` with a module-scope Map keyed `(level,id)` | NEW |
| P2 | game.js:14823,14863–14866,15100–15122,8428–8443 | high | Full 256-path SVG repaint per updateUI + separate alliance repaint per tick ≈ ~1,800 SVG DOM ops/month, ~22,000 per Advance-Year, + tooltip re-aggregation (P1) | Cache last-written color/tooltip per region, write on change; repaint once per year-advance; merge alliance pass into updateMapColors | deepens G15 |
| P3 | game.js:26-27; dist/modules/ | med | `public/modules/` (152 KB, 8 files) ships **twice**: bundled into game JS AND copied verbatim to dist/modules/ — zero references to the copy | Move `modules/` out of `public/` (e.g. `src/data/`) so Vite bundles without copying | NEW |
| P4 | game.html:185; game.js:15515 | med | 636,635 B raw / 232 KB gz map SVG — largest gameplay asset — fetched only after HTML parse behind the 807 KB blocking CSS; full coordinate precision | `<link rel="preload" as="fetch">` or build-time inline; round path coords (~40–50% smaller) | deepens G16 |
| P5 | game.js:10976-10988,6621,13103-13129 | med | `state.history` unbounded (~300 B/entry → 90 KB at 2050, 270 KB at 2100); full state stringified+written synchronously 12×/Advance-Year (~1–3 ms each, growing); graph re-derives arrays per updateUI | Cap/downsample history (monthly 24, yearly older), round floats, save+render once per year-advance | NEW |
| P6 | game.js:522,10993 | low | emissionsHistory: 29.9 KB JSON for 24 snapshots (17-digit floats) re-serialized monthly; +~6 P1 aggregations per snapshot | Round to 3 decimals (~60% smaller); reuse values from `calculateCarbonBalance` | NEW |
| P7 | vite.config.js:12-13; public/climate-data.js | low | Dead shipped entries: rules.html (44 KB) + systems.html (42 KB) linked from no page; climate-data.js (2.3 KB) referenced by nothing | Delete the two Vite entries + files (see also A4 — rules.html also lies) | deepens G16 |
| P8 | game.js:14361-14403,13410,13240,15569-15576 | low | Per-updateUI listener churn: rebuilt tab/button listeners, `setTimeout`→localStorage read+parse per call, 512 hover closures on map paths | Delegate clicks/hover to static containers; wire collapsibles once | deepens G15/G11 |
| P9 | dist/assets/style-DrbCU9v0.css | high | Requantified G14: base64 TTF defeats gzip — 807 KB compresses to only 347 KB (43% vs ~80% typical); the landing page pays all of it before first paint | As G14 (subset woff2 as files) + split landing CSS from game CSS | deepens G14 (tracked: CAR-354) |
| P10 | game.js timer sweep | low (info) | Negative finding: no RAF/interval loops — only one-shot timeouts; all runtime cost is in the turn path | None — bounds the problem to P1/P2/P5 | NEW |

---

## Lens T — Test coverage & quality

The strongest asset is `game-flows.spec.js` (real click paths, bridge-driven state asserts); the
systemic problem is that **no test anywhere asserts a simulation number across a real tick**, and
one test actively pins a known bug. The `window.__carbonTestBridge` seam (game.js:16251) already
suffices for T2/T5/T9.

| id | file:line | sev | impact | fix (the exact test to add) | rel |
|---|---|---|---|---|---|
| T1 | scripts/test-effect-multiplier-fallback.mjs:59 (:34-35) | crit | The ONLY test touching `calculateNetCO2Rate` asserts the G1 bug as a golden value (0.98 = 1 ppm/mo − 0.02 Gt/yr raw); fixing G1 breaks the suite | Rewrite as `scripts/test-net-co2-rate-units.mjs`: vm-extract real chain, assert one forest project shifts rate by ≈ `−0.02×EMISSIONS_TO_PPM_FACTOR/12` ppm/mo | deepens G1+G6 |
| T2 | game.js:10904-10906 (fix 1720915 shipped with 0 tests) | crit | The 94× removal double-count fix has NO regression guard — a revert passes every test; nothing asserts `state.co2` over a real month | `tests/e2e/sim-integration.spec.js`: bridge-insert 3 forest projects, advance 12 months, assert co2 delta in +2..+4 ppm band and `temp ≈ co2×0.0105−3.37` | deepens G6 |
| T3 | game.js:15795-15796; game-flows.spec.js:131-140 | high | Wrong-shape save crashes render with no notice (G12) — and an existing e2e seeds exactly that save but asserts only the URL, silently exercising the crash unobserved | `tests/e2e/save-load-corrupt.spec.js`: seed `{state:{gameOver:false}}`, assert `pageerror===[]` + notice visible + setup reachable | deepens G12 |
| T4 | game.js:15350,15230-15231; test-endgame-results-modal.mjs:83-89 | high | 2100-timeout loss and no-win-before-2050 gate: zero coverage; GAME_CONFIG drift vs stubbed test values invisible | Extend `test-sustained-win-loss.mjs`: (a) 12× temp=1.0 at 2049 → no win; (b) year 2101 → loss; assert stub equals real GAME_CONFIG | deepens G6 |
| T5 | game.js:6748,6756,10519,10751 | high | Zero test references to any difficulty knob — modes silently collapsing to one ships undetected | `tests/e2e/difficulty.spec.js`: set `gameDifficulty='extreme'`, assert $15B credits and ~1.4× co2-rate delta vs normal via bridge | NEW |
| T6 | artifacts/car17-balance-projection.mjs:28-50 | high | The CAR-17 balance-runaway "reproducer" simulates its own hardcoded numbers — real economy fns can regress to runaway treasury while it passes | `scripts/test-economy-invariants.mjs`: vm-extract real upkeep/income pipeline, assert net income band + 36-month funds < $900B | deepens G8 |
| T7 | game.js:12054 (:4689,:4816) | med | CAR-57 symptom (capture-rate header stuck at 0) untested — the G2 fix has nothing to pin; class can recur | `scripts/test-capture-rate-display.mjs`: vm-extract header updater with completed CCS instances, assert non-zero total + full type-list coverage | deepens G2 |
| T8 | game.js:3611,10999-11000 | med | "Carbon Neutral" achievement compares Gt/yr vs ppm/mo (G4) — zero coverage | `scripts/test-carbon-neutral-units.mjs`: history `{totalReduction:0.5}` + rising real ppm → assert NOT unlocked | deepens G4 |
| T9 | game.html:203; game.js:11028 | med | `advanceOneYear`, tipping points (1.4/1.7/2.1/2.4 °C), disasters: zero coverage on the most-used fast-forward button | `tests/e2e/advance-year.spec.js`: click `#advance-year`, assert ≤12-month advance + `pageerror===[]`; bridge-set temp=1.5 → `tippingPointsTriggered` grows | deepens G6 |
| T10 | scripts/test-live-regions.mjs:21-45 (+6 more files) | med | Seven tests assert source TEXT (regex) — false-fail on rename (the A10/G9 data move breaks two), false-pass on behavior drift | Convert the two behavior-bearing ones to vm-runs of the real fns; keep constant-consistency regexes pointed at data modules post-split | deepens G6 |
| T11 | game-flows.spec.js:76,42-46; map-error-fallback.spec.js:23-24,44; modal-accessibility.spec.js:185-187 | low | Flake vectors before CI-gating (G5): `waitForTimeout` popup races, SVG-order-dependent `regions[0]`, ~8 s wall-clock waits, global `Math.random` pin; duplicated helpers across specs | `waitFor` on popup class state; stable region id; bridge `disableRandomEvents` hook; extract `tests/e2e/helpers.js` | deepens G5/G8 |
| T12 | commits 429fb09, 273c8cd (a11y fixes, 0 tests) | low | Shipped a11y fixes (aria-hidden logo, slider focus rings) unguarded — one-line regressions a refactor would undo | Two asserts in `modal-accessibility.spec.js`: logo `aria-hidden="true"`; focused slider outline ≠ `none` | NEW |

---

## Cross-lens themes

1. **The test suite currently defends the bugs.** T1 pins G1's wrong units as a golden value; T3's
   neighbor spec exercises the G12 crash without observing it; T6's reproducer simulates itself.
   Landing the baseline's correctness fixes (CAR-341 etc.) **requires** the T1/T2 test work first.
2. **Two sources of truth is the recurring architectural defect** — project definitions (A2),
   CCS bonus math (A3), save contract (A9), stats grid (A7), map modes (A8), reference pages
   (A4/A5), region aggregates (baseline G17). Each is an instance of "no importable single
   source", which is A10/G9.
3. **The turn path is the whole perf story** (P10): one memoize (P1) + change-detection on the map
   repaint (P2) + one save/render per year-advance (P5) removes ~everything players feel, without
   the big split.

## Disposition

34 findings (A1–A12, P1–P10, T1–T12). Backlog issues filed for every actionable finding except:
P9 (quantification of already-filed CAR-354/G14 — noted there), P10 (informational negative
finding). Issues titled `[deep-audit carbon-capture-game/<A|P|T>] …`, status `backlog`, unassigned
with intended owner CEO (CTO lacks `tasks:assign`), each citing this doc + file:line. No product
code touched.
