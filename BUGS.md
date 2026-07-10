# Bug Report - Carbon Capture Game

This document tracks bugs and issues found during testing sessions.

---

## CRITICAL BUGS

### BUG-001: Game State Race Condition - `state.regions` is undefined

**Severity:** CRITICAL - Game is unplayable
**Status:** ✅ FIXED
**Location:** `public/game.js` lines 2731-2732, 3928-3929

**Description:**
When navigating to `game.html`, JavaScript errors prevent the game from functioning. The `state.regions` object is `undefined` when map functions try to access it.

**Error Messages:**
```
TypeError: Cannot read properties of undefined (reading 'north_america')
    at selectRegion (game.js:2732:21)

TypeError: Cannot read properties of undefined (reading 'europe')
    at updateMapColors (game.js:3929:33)
```

**Root Cause:**
Race condition between map initialization and game state initialization:
1. `DOMContentLoaded` fires
2. `wireMap()` is called (line 4778)
3. `wireMap()` calls `initializeMap()` (line 4294)
4. `initializeMap()` calls `updateMapColors()` (line 4289) - **state.regions is undefined!**
5. Only LATER does `initGame()` get called (line 4794) which creates `state.regions`

**Impact:**
- Map regions cannot be selected (clicking does nothing)
- Map colors don't update correctly
- 34+ JavaScript exceptions on page load
- Core gameplay is broken

**Suggested Fix:**
Add null check at start of `updateMapColors()` and `selectRegion()`:
```javascript
function updateMapColors() {
  if (!svgDoc || !svgRegions.size || !state?.regions) {
    return;
  }
  // ... rest of function
}

function selectRegion(regionId) {
  if (!state?.regions || !state.regions[regionId]) {
    return;
  }
  // ... rest of function
}
```

---

### BUG-002: Income Shows $0/mo When Navigating Directly to game.html

**Severity:** Medium
**Status:** ✅ FIXED (consequence of BUG-001 fix)
**Location:** `public/game.js` - income calculation

**Description:**
When navigating directly to `game.html` (bypassing launch screen), the Income stat shows `+$0/mo`.

**Expected Behavior:**
Income should show the sum of all countries' climate finance contributions based on their GDP and climate dedication percentage.

**Actual Behavior:**
- **Direct navigation to game.html:** Income displays `+$0/mo`
- **Starting from launch screen (index.html):** Income correctly shows `+$5.0 B`

**Root Cause:**
Likely related to BUG-001 - when state is not properly initialized due to the race condition, income calculation fails or returns 0.

**Workaround:**
Always start the game from the launch screen (index.html) instead of navigating directly to game.html.

**Screenshot Evidence:**
- Direct to game.html: `Budget: $100 B | Income: +$0/mo | ...`
- From launch screen: `Budget: $100.0 B | Income: +$5.0 B | ...`

---

### BUG-004: `DIFFICULTY_SETTINGS` is not defined

**Severity:** CRITICAL
**Status:** ✅ FIXED
**Location:** `public/game.js` line 1846-1847

**Description:**
When the game initializes, the `calculateNetCO2Rate()` function throws a `ReferenceError` because `DIFFICULTY_SETTINGS` is not defined.

**Error Message:**
```
ReferenceError: DIFFICULTY_SETTINGS is not defined
    at calculateNetCO2Rate (game.js:1847:14)
    at updateUI (game.js:2788:19)
    at initGame (game.js:2444:3)
```

**Root Cause:**
The `calculateNetCO2Rate()` function references `DIFFICULTY_SETTINGS[state.difficulty].co2Rate` but `DIFFICULTY_SETTINGS` is either:
1. Not defined in game.js
2. Defined with a different name (possibly `DIFFICULTY_CONFIG` or similar)
3. Defined after it's first used

**Impact:**
- Net CO2 calculation fails
- UI updates may be incomplete
- Stats bar may not display correct values

**Suggested Fix:**
1. Find where difficulty settings are defined (search for `co2Rate`)
2. Ensure the constant name matches what's used in `calculateNetCO2Rate()`
3. Or use the existing `getDifficulty()` function which seems to work

---

## MEDIUM BUGS

### BUG-003: Map Region Click Events Not Working

**Severity:** Medium (consequence of BUG-001)
**Status:** ✅ FIXED (consequence of BUG-001 fix)
**Location:** `public/game.js` line 4255

**Description:**
Clicking on map regions does not select them. The "Region Actions" panel always shows "Select a region to take action."

**Root Cause:**
This is a symptom of BUG-001. When `selectRegion()` is called, it throws an error because `state.regions` is undefined, and the selection fails silently.

**Impact:**
- Cannot select any region
- Cannot build projects
- Cannot start campaigns
- Game is essentially unplayable

---

### BUG-006: Income Drops After Building First Project at Continent Level

**Severity:** MEDIUM
**Status:** ✅ FIXED
**Location:** `public/game.js` lines 1801-1830

**Description:**
When playing at continent-level granularity, the income displayed in the stats bar drops from ~$5.0 B to $2.0 B after building the first project.

**Root Cause:**
The `calculateProjectedIncome()` function only looked for country data directly in `CLIMATE_DATA[regionId]`:
```javascript
const countryData = CLIMATE_DATA[regionId]; // undefined for "north_america"!
```

But continent-level data is stored in `CLIMATE_DATA.REGION_AGGREGATES[regionId]`.

When no country data was found:
1. Before building projects: `totalIncome === 0`, so fallback `GAME_CONFIG.baseIncome` ($5B) was used
2. After building projects: Project income ($2B for Wind Farm) made `totalIncome > 0`, bypassing the fallback

**Impact:**
- Misleading income display at continent-level granularity
- Income appears to drop when it should increase after building income-generating projects

**Fix Applied:**
Modified `calculateProjectedIncome()` to aggregate climate finance from constituent countries when at continent-level granularity.

**IMPORTANT:** Country data is stored in `CLIMATE_DATA.COUNTRY_DATA`, NOT directly on `CLIMATE_DATA`:
```javascript
} else if (aggregateData && aggregateData.countries) {
  // Continent-level: aggregate climate finance from constituent countries
  aggregateData.countries.forEach(countryKey => {
    const countryInfo = CLIMATE_DATA.COUNTRY_DATA?.[countryKey];  // CORRECT PATH!
    if (countryInfo && countryInfo.climateFinance) {
      const gdpTrillions = countryInfo.gdp || 1;
      const climatePercent = countryInfo.climateFinance.currentPercent;
      let monthlyClimateIncome = (gdpTrillions * climatePercent / 100) / 12 * 1000;
      monthlyClimateIncome *= getDisasterIncomeMultiplier(countryKey);
      totalIncome += monthlyClimateIncome;
    }
  });
}
```

**Verification (Jan 2026):**
- Before fix: Income showed $5.0 B (fallback), dropped to $2.0 B after building project
- After fix: Income shows $114.4 B (properly aggregated), increases to $116.4 B (+$2 B from Wind Farm)

---

## MEDIUM BUGS (New)

### BUG-CAR-397: Legacy Saves Without Alliance State Crash on January Tick

**Severity:** MEDIUM
**Status:** ✅ FIXED
**Location:** `game.js` - `loadGame()` migration block

**Description:**
Save files created before the diplomatic alliance system did not include
`state.alliance`. `loadGame()` migrated several newer runtime collections, but
left alliance state missing. A loaded legacy game could continue until the month
advanced from December to January, where `nextMonth()` applies yearly carbon tax
growth with `Object.entries(state.alliance)` and crashed because `state.alliance`
was `undefined`.

**Fix Applied:**
`loadGame()` now rebuilds missing or partial alliance entries from loaded
`state.regions` using `initializeAllianceState()`. If the save has a known
`homeRegion` or selected region, that region is preserved as allied with default
carbon tax terms so the old run remains playable.

**Regression Guard:**
`scripts/test-legacy-save-alliance-migration.mjs` loads a legacy save shape and
asserts the alliance migration runs before the January carbon-tax loop can touch
`state.alliance`.

### BUG-009: Disasters Stat Shows "NaN" Intermittently

**Severity:** MEDIUM (Transient UI Issue)
**Status:** ✅ FIXED
**Location:** `public/game.js` - `countActiveDisasters()` function

**Description:**
After dismissing a disaster event popup, the "Disasters" stat in the top bar occasionally displays "NaN" instead of a number.

**Root Cause:**
The `countActiveDisasters()` function incorrectly treated `state.activeDisasters` (an array) as an object:
```javascript
// BROKEN - treated array as object of arrays
function countActiveDisasters() {
  let count = 0;
  Object.values(state.activeDisasters || {}).forEach(disasters => {
    count += disasters.length;  // disasters.length is undefined for disaster objects
  });
  return count;
}
```

**Fix Applied:**
```javascript
function countActiveDisasters() {
  // state.activeDisasters is an array of disaster objects
  return state.activeDisasters?.length || 0;
}
```

---

### BUG-010: Campaign System is Completely Broken

**Severity:** CRITICAL - Feature is Non-Functional
**Status:** ✅ FIXED
**Location:** `public/game.js` - `startClimateCampaign()` function (line ~2730)

**Description:**
The Climate Policy Campaign feature cannot be started for any region. Clicking the campaign button does nothing.

**Root Cause Analysis:**
The campaign system has a fundamental data structure mismatch:

1. **Game operates at continent level:** `state.regions` uses keys like 'europe', 'africa', 'asia'

2. **Campaign function expects country data:**
   ```javascript
   function startClimateCampaign(regionId) {
     const countryData = CLIMATE_DATA[regionId];  // FAILS!
     if (!countryData || !countryData.climateFinance) {
       pushMessage("Cannot start campaign: no climate finance data...", "bad");
       return false;
     }
   }
   ```

3. **CLIMATE_DATA structure doesn't match:**
   - `CLIMATE_DATA['europe']` = undefined
   - `CLIMATE_DATA.REGION_AGGREGATES['europe']` = exists but NO `climateFinance`
   - `CLIMATE_DATA.COUNTRY_DATA['germany']` = exists WITH `climateFinance`

4. **climateFinance only exists at country level:**
   ```javascript
   CLIMATE_DATA.COUNTRY_DATA['china'].climateFinance = {
     currentPercent: 2.5,
     maxPercent: 5,
     minPercent: 0.5,
     difficulty: 0.4,
     politicalResistance: 0.3
   }
   ```

**Impact:**
- Campaign button appears in UI but does nothing
- No error message displayed (fails silently at first check)
- Campaign feature is completely unusable at continent-level granularity

**Suggested Fixes (choose one):**
1. **Option A - Aggregate climateFinance for continents:**
   - Create `climateFinance` objects for `REGION_AGGREGATES` by averaging constituent countries
   - Modify campaign cost/difficulty calculations accordingly

2. **Option B - Make campaigns country-specific:**
   - At continent level, show dropdown/list of countries within the continent
   - Let players start campaigns for specific countries within their selected region

3. **Option C - Use different data lookup:**
   - Modify `startClimateCampaign()` to use `CLIMATE_DATA.getClimateData(regionId)`
   - If that doesn't return climateFinance, aggregate from constituent countries

**Fix Applied:**
Added new helper function `getRegionClimateData(regionId)` that:
1. First tries `CLIMATE_DATA.COUNTRY_DATA[regionId]` for country-level data
2. Falls back to `CLIMATE_DATA.REGION_AGGREGATES[regionId]` for continent-level
3. Aggregates climateFinance from constituent countries (weighted by GDP)
4. Returns data with `isAggregate` flag for different handling

Regional (aggregate) campaigns now:
- Cost 1.5x more due to coordination complexity
- Take 1.5x longer to complete
- Show "Regional Climate Policy Campaign" in messages
- Track constituent countries for proper effect application

---

## LOW / UI BUGS

### BUG-007: Changing Granularity Resets Game State

**Severity:** LOW (Design Decision)
**Status:** ✅ FIXED
**Location:** `public/game.js` - granularity change handler (line ~4365)

**Description:**
When changing the map granularity (Continents → Major Regions → Countries), the entire game state is reset. This includes:
- All built projects are lost
- Budget resets to starting value
- Date resets to Jan 2025
- All progress is wiped

**Fix Applied:**
Added confirmation dialog that warns players before allowing granularity change when progress exists:
```javascript
mapSelector.addEventListener("change", (event) => {
  const newValue = event.target.value;
  const hasProgress = state && (
    state.budget !== GAME_CONFIG.startingBudget ||
    state.month !== 1 ||
    state.year !== 2025 ||
    Object.values(state.regions || {}).some(r => r.projects?.length > 0)
  );

  if (hasProgress) {
    const confirmed = confirm(
      "⚠️ Changing map granularity will reset your game progress.\n\n" +
      "All projects, budget changes, and time progression will be lost.\n\n" +
      "Are you sure you want to continue?"
    );
    if (!confirmed) {
      event.target.value = currentGranularity;
      return;
    }
  }
  setGranularity(newValue, true);
});
```

**Behavior:**
- If no progress: granularity changes immediately (no dialog)
- If progress exists: confirmation dialog appears; Cancel reverts dropdown

---

### BUG-011: checkTippingPoints() Doesn't Auto-Update UI

**Severity:** LOW (Minor UI Timing)
**Status:** ✅ FIXED
**Location:** `public/game.js` - `checkTippingPoints()` function

**Description:**
When `checkTippingPoints()` triggers a tipping point, the stats bar counter (TIPPING: X/4) doesn't update immediately. A separate call to `updateUI()` is required.

**Fix Applied:**
Added `updateUI()` call when new tipping points are triggered:
```javascript
// Update UI if new tipping points were triggered
if (newlyTriggered.length > 0) {
  updateUI();
}
```

---

### BUG-008: Emissions Mode Shows Black/No Color at Country Level

**Severity:** LOW (Visual)
**Status:** ✅ NOT A BUG (Transient Issue)
**Location:** N/A

**Description:**
Initially observed that when viewing the map in "Emissions" mode at country-level granularity, all countries appeared black/dark instead of being colored by their emissions data.

**Investigation:**
Upon further testing, emissions mode works correctly at country level:
- Data lookup via `getClimateDataForRegion()` returns proper emissions data
- Colors are correctly generated (green for low, red for high emissions)
- Map displays USA/China/India in darker colors (high emissions)
- Smaller countries display in green (low emissions)

**Root Cause:**
The initial observation was likely due to:
1. Transient state during granularity switch
2. Map not fully redrawn after mode change
3. Cache or timing issue during initial test

**Resolution:**
No code changes required. Emissions mode functions correctly at all granularity levels.

---

## Testing Environment

- **Browser:** Chrome (via MCP browser automation)
- **URL:** `http://localhost:5174/Eit-carbon-capture-game/game.html`
- **Date:** January 2026
- **Game Version:** Latest commit on main branch

---

## Testing Sessions Log

### Session 1: Launch Screen and Game Start
- Launch screen (index.html) loads correctly
- Title, subtitle, and info cards display properly
- Difficulty selector dropdown works
- "New Game" button navigates to game.html correctly
- "Game Rules" and "Game Systems" links work
- No "Continue Game" button when no auto-save exists (correct behavior)

### Session 2: Game Initialization (From Launch Screen)
- Stats bar displays all 13 metrics correctly
- Budget: $100.0 B (correct for Normal difficulty)
- Income: +$5.0 B (correct - country climate finance working)
- Temp: +1.20°C, CO2: 420.0 ppm (correct starting values)
- NET CO2: +0.5/mo, FEEDBACK: +0.00, PROJECTS: 0, RP: 0
- CAMPAIGNS: 0, DISASTERS: 0, TIPPING: 0/4, YEARS: 75, DATE: Jan 2025
- Map loads with continent-level view (6 regions)
- Map colors display (blue gradient for temperature)

### Session 3: Region Selection Testing
- Clicking on map regions does NOT select them
- "Region Actions" panel shows "Select a region to take action"
- Console errors confirm `selectRegion()` fails
- Root cause: BUG-001 race condition still present

### Session 4: Direct Navigation Testing
- Navigating directly to game.html shows additional issues
- Income shows $0/mo instead of $5.0 B
- Same region selection failures
- 41+ JavaScript errors in console

### Session 5: Error Analysis
- Identified 2 distinct error types:
  1. `state.regions` undefined errors (BUG-001)
  2. `DIFFICULTY_SETTINGS` not defined error (BUG-004)
- Both errors prevent core gameplay

---

## Priority Order for Fixes

1. **BUG-001** - Must fix first, blocks all gameplay ✅ FIXED
2. **BUG-004** - Fix DIFFICULTY_SETTINGS reference ✅ FIXED
3. **BUG-002** - Will likely be fixed by BUG-001 ✅ FIXED
4. **BUG-003** - Will be fixed by fixing BUG-001 ✅ FIXED

---

## Fixes Applied (January 2026)

### Fix for BUG-001 & BUG-003: Race Condition
Added null checks to prevent accessing `state.regions` before initialization:

**`selectRegion()` (line 2737-2739):**
```javascript
function selectRegion(regionId) {
  if (!state?.regions || !state.regions[regionId]) {
    return;
  }
  // ...
}
```

**`updateMapColors()` (line 3923-3925):**
```javascript
function updateMapColors() {
  if (!svgDoc || !svgRegions.size || !state?.regions) {
    return;
  }
  // ...
}
```

**`updateRegionTemps()` (line 2728-2730):**
```javascript
function updateRegionTemps() {
  if (!state?.regions) {
    return;
  }
  // ...
}
```

### Fix for BUG-004: DIFFICULTY_SETTINGS not defined
Changed `calculateNetCO2Rate()` to use the existing `getCo2IncreaseRate()` function instead of undefined `DIFFICULTY_SETTINGS`:

**`calculateNetCO2Rate()` (line 1846-1850):**
```javascript
function calculateNetCO2Rate() {
  if (!state?.regions) {
    return 0;
  }
  let rate = getCo2IncreaseRate();  // Was: DIFFICULTY_SETTINGS[state.difficulty].co2Rate
  // ...
}
```

### Verification
All fixes verified working via browser testing:
- No console errors on page load
- Region selection works correctly
- Stats bar displays all values correctly
- Income shows proper value (+$5.0 B)

---

## What Works

- Launch screen UI and navigation
- Stats bar display (when state initializes correctly)
- Map SVG loading and rendering
- Difficulty selection storage
- Basic page styling and layout
- Collapsible sidebar panels

## What's Broken

~~- Region selection (critical)~~ ✅ FIXED
~~- Project building (blocked by region selection)~~ ✅ FIXED
~~- Campaign starting (blocked by region selection)~~ ✅ FIXED
~~- Direct navigation to game.html (partial failure)~~ ✅ FIXED

**All critical bugs have been resolved!**

---

## Session 2 Bugs (January 2026)

### BUG-012: setGranularity Dropdown Not Syncing

**Severity:** LOW
**Status:** ✅ FIXED
**Location:** `public/game.js` - `setGranularity()` function

**Description:**
When `setGranularity()` is called programmatically (e.g., during game load), the dropdown selector doesn't update to match the internal state. This causes the dropdown to show "Continents" while the game is actually at "Major Regions" granularity.

**Fix Applied:**
Added dropdown sync code to `setGranularity()`:
```javascript
if (mapSelector && mapSelector.value !== value) {
  mapSelector.value = value;
}
```

---

### BUG-013: Duplicate Major Region IDs

**Severity:** MEDIUM
**Status:** ✅ FIXED
**Location:** `public/game.js` - `getMacroRegionId()` and `getRegionalRegionId()` functions

**Description:**
At major_regions granularity, the game created 20 regions instead of 15 due to inconsistent naming between the fallback geo functions and `CLIMATE_DATA.MAJOR_REGIONS`.

**Example Duplicates:**
- `africa_north` AND `north_africa`
- `europe_north` AND `northern_europe`
- `asia_west` AND `west_asia`

**Root Cause:**
`getMacroRegionId()` used naming like `africa_north` but `CLIMATE_DATA.MAJOR_REGIONS` used `north_africa`.

**Fix Applied:**
Updated both `getMacroRegionId()` and `getRegionalRegionId()` to use CLIMATE_DATA naming conventions.

---

### BUG-014: climate_champion Achievement Triggers at Game Start

**Severity:** LOW
**Status:** ✅ FIXED
**Location:** `public/game.js` - ACHIEVEMENTS array

**Description:**
The "climate_champion" achievement for reducing temperature below a threshold triggered immediately on first `nextMonth()` call because the threshold (1.5°C) was above the starting temperature (1.2°C).

**Fix Applied:**
Changed threshold from 1.5°C to 1.1°C (between starting temp 1.2°C and win condition 1.0°C).

---

### BUG-015: Campaign Completion Doesn't Apply to Aggregate Regions

**Severity:** MEDIUM
**Status:** ✅ FIXED
**Location:** `public/game.js` - `processCampaigns()` function

**Description:**
When a Climate Policy Campaign completed at continent level, the climate finance increase wasn't applied because `processCampaigns()` only checked `CLIMATE_DATA[regionId]` which doesn't exist for continents.

**Root Cause:**
`startClimateCampaign()` was fixed to use `getRegionClimateData()` for aggregate regions, storing `isAggregate` and `countries` in the campaign object. But `processCampaigns()` didn't use this information when the campaign completed.

**Fix Applied:**
Updated `processCampaigns()` to check for `campaign.isAggregate` and apply climate finance changes to all constituent countries. For aggregate campaigns, shows average change across affected countries.

---

### BUG-016: nextMonth Income Calculation Ignores Aggregate Regions

**Severity:** MEDIUM
**Status:** ✅ FIXED
**Location:** `public/game.js` - `nextMonth()` function (income calculation)

**Description:**
The income calculation in `nextMonth()` only used `CLIMATE_DATA[regionId]` which fails for continent-level regions. This meant the displayed income (from `calculateProjectedIncome()` which was fixed) didn't match the actual income earned.

**Root Cause:**
`calculateProjectedIncome()` was previously fixed to check both `CLIMATE_DATA[regionId]` and `CLIMATE_DATA.REGION_AGGREGATES[regionId]`, but the actual `nextMonth()` calculation wasn't updated with the same pattern.

**Fix Applied:**
Updated `nextMonth()` to use the same aggregate data pattern:
```javascript
const aggregateData = CLIMATE_DATA.REGION_AGGREGATES?.[regionId];
if (countryData && countryData.climateFinance) {
  // Country-level handling
} else if (aggregateData && aggregateData.countries) {
  // Continent-level: aggregate from constituent countries
}
```

---

### BUG-017: deserializeGameState Missing State Properties

**Severity:** LOW (Backwards Compatibility)
**Status:** ✅ FIXED
**Location:** `public/game.js` - `deserializeGameState()` function

**Description:**
When loading old save files, some state properties that were added in later updates might be missing. This could cause undefined access errors for:
- `activeCampaigns`
- `totalSpent`
- `campaignHistory`
- `activeDisasters`
- `disasterHistory`

**Fix Applied:**
Added missing property initialization in `deserializeGameState()`:
```javascript
if (!state.activeCampaigns) state.activeCampaigns = [];
if (!state.totalSpent) state.totalSpent = 0;
if (!state.campaignHistory) state.campaignHistory = [];
if (!state.activeDisasters) state.activeDisasters = [];
if (!state.disasterHistory) state.disasterHistory = {};
```

---

## Verification Summary (Session 2)

All bugs BUG-012 through BUG-017 have been fixed and verified:

- **BUG-012**: Dropdown syncs correctly with granularity changes
- **BUG-013**: Major regions now correctly show 15 regions (not 20)
- **BUG-014**: climate_champion achievement requires actual temperature reduction
- **BUG-015**: Regional campaigns apply climate finance to all constituent countries
- **BUG-016**: Income calculation properly aggregates from countries at continent level
- **BUG-017**: Save/load handles all state properties for backwards compatibility
