---
name: product-gap-grooming-CAR-238
description: PM product-gap & backlog grooming pass (CAR-238) — prioritized findings for the climate game's core user journeys, deduped against the open backlog and the prior CAR-173 / CAR-194 / CAR-224 passes.
type: reference
last_reviewed: 2026-06-26
---

# Product Gap & Backlog Grooming Pass — CAR-238

PM quality-loop pass. Reviewed the carbon-capture climate-strategy game
(`index.html` launch/menu, `game.html` play screen, `game.js` logic, `style.css`)
against its core user journeys: launch / Continue → difficulty & granularity
setup → play (select region, build/upgrade/replace projects, negotiate alliances,
assign research / build research centers, adjust carbon-tax, switch map data-views,
advance months/years, react to events) → win/lose → restart / play-again / exit →
resume → tutorial/help → achievements/stats.

## Method

- Traced the journeys end-to-end in the actual code, verifying every claim
  against line refs.
- Cross-checked the **47 open issues** plus the three prior PM passes
  (`docs/product-gap-grooming-CAR-173.md` → CAR-186/187;
  `docs/product-gap-grooming-CAR-194.md` → CAR-198…203;
  `docs/product-gap-grooming-CAR-224.md` → CAR-227/228/229) and the gap-tracking
  docs (`docs/TODO.md`, `docs/NICE-TO-HAVE.md`).
- The backlog is **extremely well-groomed** across four consecutive PM passes.
  The 31 open product/UX issues already cover: tutorial access
  (CAR-104/202/229), autosave + save/load (CAR-186/227/144/165/164), achievements
  (CAR-228/142/214), news history & empty states (CAR-213/139/105), win/lose &
  difficulty surfacing (CAR-199/200/201/102/163), endgame dead-end (CAR-198),
  granularity caption (CAR-203), exit confirm (CAR-187), glossary (CAR-143),
  noscript/map-load fallbacks (CAR-159/100), the full a11y set
  (CAR-71/101/137/138/177/178/197/179), brand (CAR-49/230) and the balance
  bugs (CAR-166/231). Phase 4-5 stretch goals (sound, multiplayer, scenarios,
  sandbox, save slots, animated map) are intentionally deferred in
  `docs/NICE-TO-HAVE.md` and are out of scope.
- Only a genuinely-new, small, reversible gap is filed.

## Findings (prioritized)

| # | Issue | Pri | Gap |
|---|-------|-----|-----|
| F1 | **CAR-243** | Low | The Research Centers empty state (shown before any region is allied) tells the player *"Go to the **Diplomacy tab** to recruit allies!"* — but there is no Diplomacy tab. Sidebar tabs are World / Region / Tech, and alliances are formed via a region's **"Negotiate Alliance"** button. A wrong-pointer dead end at an early onboarding decision point. One-line copy fix. |

### Key evidence (verified)
- **F1** `.rc-no-allies` block at `game.js:12767-12768` renders `Go to the
  Diplomacy tab to recruit allies!`. Sidebar tabs are exactly **World / Region /
  Tech** (`game.html:290-292`). The real recruit flow is the **"Negotiate
  Alliance"** button (`game.js:14350`: `Use the "Negotiate Alliance" button
  above to recruit them.`). `grep -ni diplomacy` over `game.js`/`game.html`/
  `index.html` returns this **single** occurrence — it is not a tab that was
  renamed, it never existed. Distinct from CAR-105 (which covers *silent* empty
  states; here the copy is present but wrong).

## Considered but NOT filed (dedup / already-resolved / wrong lane)
- **Map data-view dropdown** (alliance / happiness / emissions / renewables /
  economy / power / stability, `game.html:164-172`) — traced; each mode recolors
  the map and renders a legend. No gap.
- **Alliance / negotiation flow** — select region → "Negotiate Alliance" →
  accept/reject/cancel with feedback; no stuck state found.
- **Research-point assignment** — the assignment modal handles locked techs and
  lets the player switch the assigned project; no misallocation dead end.
- **Project build / replace flow** — affordability-gated buttons, completion
  feedback present; "can't afford" guidance is already tracked by **CAR-105**.
- **Endgame / win-lose surfacing** — note the play HUD now carries a persistent
  `#win-progress-stat` ("reach +1.0 °C by 2050, then hold it for 12 months") and
  `game.html` now has an `#endgame-banner` with **View Results** / **Play Again**.
  These overlap the intent of **CAR-198/199/201**; appear partly addressed in
  code already, so nothing new filed — left for those issues' owners to confirm
  and close.
- **Mid-month action persistence**, **autosave indicator**, **achievements
  persistence**, **news history** — all already tracked (CAR-227/186/228/213).
- **`pushMessage` warning/info tone styling** — visual styling, Designer's lane
  (Design/UX audit).

## Disposition
One new, small, reversible issue filed (**CAR-243**, Low). After four consecutive
PM passes the product backlog is confirmed exhaustively groomed for product/flow
gaps; the only genuinely-new item this pass was a wrong-navigation-pointer copy
bug in the research-center onboarding path. Nothing else rose above the noise
floor. Reported, not implemented — feeds the engineers.
