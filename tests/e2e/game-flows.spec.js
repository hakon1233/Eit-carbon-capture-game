// @ts-check
// Browser QA pass (CAR-58) — drives the real Carbon Capture game headless
// through its key user flows: launch -> setup -> start -> advance month -> restart.
//
// Report-don't-fix: these tests document current behavior and surface regressions.
// The map is rendered inside an <object> (separate same-origin SVG document); we
// reach into its contentDocument to drive region selection the way a user would.
//
// NOTE: #game-panel is an intentionally zero-height layout wrapper, so we assert
// game-started state via #header-controls / #next-month and the HUD stats, which
// are the elements a player actually sees.
import { test, expect } from '@playwright/test'

/**
 * Wait until the world-map <object> has loaded its SVG and at least one
 * clickable `.region` path exists inside its content document.
 */
async function waitForMapRegions(page) {
  await page.waitForFunction(() => {
    const obj = /** @type {HTMLObjectElement|null} */ (
      document.getElementById('map-object')
    )
    const doc = obj && obj.contentDocument
    return !!(doc && doc.querySelector('.region'))
  }, null, { timeout: 30_000 })
}

/**
 * Select a home region during setup by dispatching a click on the first
 * `.region` path inside the map SVG. The game delegates clicks to the SVG
 * root, so a bubbling MouseEvent reaches the same handler a real click would.
 * Returns the number of regions found (sanity signal).
 */
async function selectFirstRegion(page) {
  return page.evaluate(() => {
    const obj = /** @type {HTMLObjectElement} */ (
      document.getElementById('map-object')
    )
    const doc = obj.contentDocument
    const regions = doc.querySelectorAll('.region')
    const first = regions[0]
    first.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    )
    return regions.length
  })
}

/** Go from a fresh game.html load to an active game with a home region chosen. */
async function startGame(page) {
  await page.goto('game.html')
  await waitForMapRegions(page)
  await selectFirstRegion(page)
  const confirmBtn = page.locator('#confirm-setup-btn')
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()
  // Game started == setup panel gone, header controls present.
  await expect(page.locator('#setup-panel')).toBeHidden()
  await expect(page.locator('#header-controls')).toBeVisible()
}

/**
 * Dismiss the random event popup if it is currently showing. Month-advance can
 * surface an event popup (game.js:displayNextPopup) that intercepts #next-month;
 * the dismiss button closes it. hideEventPopup schedules the next queued popup
 * after ~200ms, so we re-check a couple of times.
 */
async function dismissEventPopupIfPresent(page) {
  for (let i = 0; i < 4; i += 1) {
    const showing = await page.evaluate(() => {
      const c = document.getElementById('event-popup-container')
      return !!(c && !c.classList.contains('hidden'))
    })
    if (!showing) return
    await page.locator('#event-popup .popup-dismiss').click()
    await page.waitForTimeout(250)
  }
}

/** Advance the in-game clock by one month, clearing any event popup around it. */
async function advanceMonth(page) {
  await dismissEventPopupIfPresent(page)
  await page.locator('#next-month').click()
  await dismissEventPopupIfPresent(page)
}

async function readSavedGame(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('carbonCaptureGameSave') || 'null'),
  )
}

test.describe('Launch screen (index.html)', () => {
  test('renders branding and a New Game CTA', async ({ page }) => {
    await page.goto('')
    await expect(page.locator('#launch-screen')).toBeVisible()
    await expect(page.locator('#start-game-btn')).toBeVisible()
    await expect(page.locator('#difficulty')).toBeVisible()
    await expect(page.locator('.launch-card').first()).toContainText(
      'hold it for 12 months in a row',
    )
    await expect(page).toHaveTitle(/Carbon Capture/i)
  })

  test('New Game navigates to the game screen', async ({ page }) => {
    await page.goto('')
    await page.selectOption('#difficulty', { index: 0 })
    await page.click('#start-game-btn')
    await expect(page).toHaveURL(/game\.html/)
    await expect(page.locator('#setup-panel')).toBeVisible()
  })

  // CAR-140: the `hidden` Continue button was still painted because author
  // `.primary-button { display: inline-flex }` outranks the UA `[hidden]` rule.
  // A first-time visitor (no save) must NOT see a stray Continue button.
  test('Continue stays hidden for a first-time player with no save', async ({
    page,
  }) => {
    await page.goto('')
    // No save seeded => Continue is hidden (attribute + actually not painted).
    await expect(page.locator('#continue-btn')).toBeHidden()
    await expect(page.locator('#start-game-btn')).toBeVisible()
  })

  test('Continue shows and resumes when an active save exists', async ({
    page,
  }) => {
    await page.goto('')
    // Seed a non-game-over save the way the launch script's hasActiveSave() reads it.
    await page.evaluate(() => {
      localStorage.setItem(
        'carbonCaptureGameSave',
        JSON.stringify({ state: { gameOver: false } }),
      )
    })
    await page.reload()
    await expect(page.locator('#continue-btn')).toBeVisible()
    await page.click('#continue-btn')
    await expect(page).toHaveURL(/game\.html/)
  })
})

test.describe('Game setup & start', () => {
  test('setup panel shows until a region is chosen, then game starts', async ({
    page,
  }) => {
    await page.goto('game.html')

    // Fresh load => setup mode.
    await expect(page.locator('#setup-panel')).toBeVisible()
    const confirmBtn = page.locator('#confirm-setup-btn')
    await expect(confirmBtn).toBeDisabled()

    await waitForMapRegions(page)
    const regionCount = await selectFirstRegion(page)
    expect(regionCount).toBeGreaterThan(0)

    // Selecting a region enables confirmation and shows region details.
    await expect(confirmBtn).toBeEnabled()
    await expect(page.locator('#setup-selected-region')).toContainText(/.+/)

    await confirmBtn.click()

    // Game view is now active.
    await expect(page.locator('#setup-panel')).toBeHidden()
    await expect(page.locator('#header-controls')).toBeVisible()
    await expect(page.locator('#next-month')).toBeVisible()

    // Core HUD stats are populated with sensible values.
    await expect(page.locator('#credits')).toContainText(/\$/)
    await expect(page.locator('#temperature')).toContainText(/°C/)
    await expect(page.locator('#co2')).toContainText(/ppm/)
    await expect(page.locator('#date')).toContainText(/\d{4}/)
    await expect(page.locator('#win-progress-stat')).toBeVisible()
    await expect(page.locator('#win-progress-value')).toContainText(/\+1\.\d{2} -> \+1\.00/)

    await page.screenshot({
      path: 'playwright-report/started-game.png',
      fullPage: true,
    })
  })

  test('cancelling a setup granularity change keeps the selected region', async ({
    page,
  }) => {
    await page.goto('game.html')
    await waitForMapRegions(page)
    await selectFirstRegion(page)

    const confirmBtn = page.locator('#confirm-setup-btn')
    await expect(confirmBtn).toBeEnabled()
    const selectedRegionText = (
      await page.locator('#setup-selected-region').textContent()
    )?.trim()

    let dialogMessage = ''
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message()
      return dialog.dismiss()
    })
    await page.locator('.granularity-btn[data-granularity="major_regions"]').click()
    expect(dialogMessage).toContain('Change map granularity?')

    await expect(confirmBtn).toBeEnabled()
    await expect(page.locator('#setup-selected-region')).toContainText(
      selectedRegionText,
    )
    await expect(
      page.locator('.granularity-btn[data-granularity="continents"]'),
    ).toHaveClass(/active/)
    await expect(
      page.locator('.granularity-btn[data-granularity="major_regions"]'),
    ).not.toHaveClass(/active/)
  })

  test('accepting a setup granularity change clears the selected region', async ({
    page,
  }) => {
    await page.goto('game.html')
    await waitForMapRegions(page)
    await selectFirstRegion(page)

    const confirmBtn = page.locator('#confirm-setup-btn')
    await expect(confirmBtn).toBeEnabled()

    let dialogMessage = ''
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message()
      return dialog.accept()
    })
    await page.locator('.granularity-btn[data-granularity="major_regions"]').click()
    expect(dialogMessage).toContain('Change map granularity?')

    await expect(confirmBtn).toBeDisabled()
    await expect(page.locator('#setup-selected-region')).toContainText(
      'No region selected',
    )
    await expect(
      page.locator('.granularity-btn[data-granularity="major_regions"]'),
    ).toHaveClass(/active/)
  })
})

test.describe('Core gameplay loop', () => {
  test('advancing a month changes the in-game date', async ({ page }) => {
    await startGame(page)

    const before = (await page.locator('#date').textContent())?.trim()
    await page.locator('#next-month').click()
    // The date label should advance off its starting value.
    await expect
      .poll(async () => (await page.locator('#date').textContent())?.trim())
      .not.toBe(before)
  })

  test('restart returns to setup mode', async ({ page }) => {
    await startGame(page)

    // Mid-game restart prompts a confirm() (CAR-74) to guard against accidental
    // data loss; accept it so the restart proceeds.
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Restart the game?')
      await dialog.accept()
    })
    await page.locator('#restart-button').click()
    await expect(page.locator('#setup-panel')).toBeVisible()
    await expect(page.locator('#confirm-setup-btn')).toBeDisabled()
  })

  // CAR-74: the restart guard's whole point is that *cancelling* it leaves the
  // live game untouched (a stray click must not wipe progress). The accept branch
  // is covered above; this pins the cancel branch so a regression that drops the
  // guard — or treats cancel as confirm — fails loudly.
  test('cancelling the restart confirmation keeps the game running', async ({
    page,
  }) => {
    await startGame(page)

    let dialogMessage = ''
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message()
      return dialog.dismiss()
    })
    await page.locator('#restart-button').click()

    // The guard prompted, and dismissing it leaves the active game in place.
    expect(dialogMessage).toContain('Restart the game?')
    await expect(page.locator('#setup-panel')).toBeHidden()
    await expect(page.locator('#header-controls')).toBeVisible()
  })

  // CAR-198: the endgame re-entry banner must never appear during a live run —
  // it is only revealed when the results modal is dismissed after game over.
  // (Game-over itself is unreachable in a fast headless test: a loss needs temp
  // >= +2.0°C for 3 straight months or year > 2100, so we assert the banner is
  // present-but-hidden during normal play, which is the failure mode this fix
  // could regress.)
  test('endgame re-entry banner stays hidden during a live run', async ({
    page,
  }) => {
    await startGame(page)

    const banner = page.locator('#endgame-banner')
    await expect(banner).toBeHidden()
    // Its controls exist in the DOM so dismiss-after-game-over has a target.
    await expect(page.locator('#endgame-banner-view')).toHaveCount(1)
    await expect(page.locator('#endgame-banner-play-again')).toHaveCount(1)

    // Advancing time must not reveal it while the run is still going.
    await page.locator('#next-month').click()
    await expect(banner).toBeHidden()
  })

  test('How to play replays the interactive tutorial during a normal game', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('gameDifficulty', 'normal')
    })

    await startGame(page)

    await page.getByRole('button', { name: 'How to play' }).click()

    await expect(page.locator('#tutorial-overlay')).toBeVisible()
    await expect(page.locator('#tutorial-overlay')).toContainText('1 /')

    await page.locator('.tutorial-popup-close').click()
    await expect(page.locator('#tutorial-overlay')).toBeHidden()

    await page.getByRole('button', { name: 'How to play' }).click()
    await expect(page.locator('#tutorial-overlay')).toBeVisible()
    await expect(page.locator('#tutorial-overlay')).toContainText('1 /')
  })
})

// Climate build-a-project coverage (originally CAR-171 / CAR-192). Unlike the
// CAR-217 power tests, this drives the REAL project-button click path end to end:
// open the Climate tab, click an affordable project, and assert the player-visible
// signals. A non-power Climate project routes straight through to construction
// with no build-mode dialog, so this is the deterministic UI path.
test.describe('Build-a-project mechanic (Climate)', () => {
  test('building a Climate project spends funds and queues construction', async ({
    page,
  }) => {
    await startGame(page)

    // Re-select the auto-allied home region in game mode so its project menu renders.
    await selectFirstRegion(page)
    await page.locator('#project-buttons .category-tab', { hasText: 'Climate' })
      .first()
      .click()

    // First affordable (enabled) Climate project — non-power, so it builds
    // directly without the power build-mode dialog.
    const projectBtn = page
      .locator('#project-buttons button.project-button:not([disabled])')
      .first()
    await expect(projectBtn).toBeVisible()

    const underConstructionBefore = Number(
      (await page.locator('#under-construction').textContent())?.trim()
    )
    const creditsBefore = (await page.locator('#credits').textContent())?.trim()

    await projectBtn.click()

    // Under-construction HUD counter increments by one.
    await expect
      .poll(async () =>
        Number((await page.locator('#under-construction').textContent())?.trim())
      )
      .toBe(underConstructionBefore + 1)

    // Funds were spent (credits label changed off its starting value).
    await expect
      .poll(async () => (await page.locator('#credits').textContent())?.trim())
      .not.toBe(creditsBefore)

    // The player gets a confirmation in the news log.
    await expect(page.locator('#news-log')).toContainText(/Construction started/i)
  })

  test('a built Climate project completes and increments the projects HUD', async ({
    page,
  }) => {
    await startGame(page)

    await selectFirstRegion(page)
    await page.locator('#project-buttons .category-tab', { hasText: 'Climate' })
      .first()
      .click()

    // Reforestation is the cheapest/shortest Climate build (4 months), so
    // completion is reachable quickly and deterministically.
    const reforestationBtn = page
      .locator('#project-buttons button.project-button:not([disabled])', {
        hasText: /Reforestation/i,
      })
      .first()
    await expect(reforestationBtn).toBeVisible()

    const underConstructionBefore = Number(
      (await page.locator('#under-construction').textContent())?.trim()
    )
    const projectsBuiltBefore = Number(
      (await page.locator('#projects-display').textContent())?.trim()
    )

    await reforestationBtn.click()

    await expect
      .poll(async () =>
        Number((await page.locator('#under-construction').textContent())?.trim())
      )
      .toBe(underConstructionBefore + 1)

    // Advance one month at a time, dismissing any random event popup that would
    // otherwise intercept #next-month, until the build finishes. The 10-advance
    // cap fails loudly rather than hanging if the completion path regresses.
    let completed = false
    for (let i = 0; i < 10; i += 1) {
      await advanceMonth(page)
      const built = Number(
        (await page.locator('#projects-display').textContent())?.trim()
      )
      if (built >= projectsBuiltBefore + 1) {
        completed = true
        break
      }
    }

    expect(
      completed,
      'Reforestation did not complete within 10 month-advances'
    ).toBe(true)

    // Under-construction returns to its baseline once the build finishes.
    await expect
      .poll(async () =>
        Number((await page.locator('#under-construction').textContent())?.trim())
      )
      .toBe(underConstructionBefore)

    // The player gets a completion confirmation in the news log.
    await expect(page.locator('#news-log')).toContainText(/completed/i)
  })
})

test.describe('Mid-month autosave', () => {
  test('project builds persist immediately without waiting for month advance', async ({
    page,
  }) => {
    await startGame(page)

    const beforeSave = await readSavedGame(page)
    const beforeQueued = beforeSave.state.underConstruction?.length || 0

    const built = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = Object.keys(st.alliance || {}).find(
        (id) => st.alliance[id]?.status === b.ALLIANCE_STATUS.ALLIED,
      )
      if (!regionId) return { ok: false }
      st.funds = Math.max(st.funds, 1000)
      const fundsBefore = st.funds
      b.buildProjectWithEffectiveness(regionId, 'forest', {
        cost: 1,
        effectMultiplier: 1,
      })
      return { ok: true, fundsBefore }
    })
    expect(built.ok).toBe(true)

    const afterSave = await readSavedGame(page)
    expect(afterSave.state.underConstruction?.length || 0).toBe(
      beforeQueued + 1,
    )
    expect(afterSave.state.funds).toBeLessThan(built.fundsBefore)
  })

  test('alliance, negotiation, and carbon-tax actions persist immediately', async ({
    page,
  }) => {
    await startGame(page)

    const acceptedRegion = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = Object.keys(st.alliance || {}).find(
        (id) => st.alliance[id]?.status !== b.ALLIANCE_STATUS.ALLIED,
      )
      if (!regionId) return null
      st.alliance[regionId].status = b.ALLIANCE_STATUS.NEUTRAL
      window.acceptSpontaneousRequest(regionId)
      return regionId
    })
    expect(acceptedRegion).toBeTruthy()

    let save = await readSavedGame(page)
    expect(save.state.alliance[acceptedRegion].status).toBe('allied')

    const rejectedRegion = await page.evaluate((accepted) => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = Object.keys(st.alliance || {}).find(
        (id) =>
          id !== accepted &&
          st.alliance[id]?.status !== b.ALLIANCE_STATUS.ALLIED,
      )
      if (!regionId) return null
      st.alliance[regionId].status = b.ALLIANCE_STATUS.NEUTRAL
      st.alliance[regionId].interest = 80
      window.rejectSpontaneousRequest(regionId)
      return regionId
    }, acceptedRegion)
    expect(rejectedRegion).toBeTruthy()

    save = await readSavedGame(page)
    expect(save.state.alliance[rejectedRegion].status).toBe('neutral')
    expect(save.state.alliance[rejectedRegion].interest).toBe(65)

    const negotiation = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = 'autosave_test_region'
      st.alliance[regionId] = {
        status: b.ALLIANCE_STATUS.NEUTRAL,
        interest: 50,
        lastApproached: null,
      }
      st.funds = Math.max(st.funds, 1000)
      const cost = b.calculateNegotiationCost(regionId)
      const fundsBefore = st.funds
      window.startNegotiation(regionId)
      return { regionId, cost, fundsBefore, fundsAfter: st.funds }
    })
    expect(negotiation).toBeTruthy()

    save = await readSavedGame(page)
    expect(save.state.pendingNegotiation?.regionId).toBe(negotiation.regionId)
    expect(save.state.alliance[negotiation.regionId].status).toBe('negotiating')
    expect(negotiation.cost).toBeGreaterThan(0)
    expect(save.state.funds).toBeLessThan(negotiation.fundsBefore)
    expect(save.state.funds).toBe(negotiation.fundsAfter)

    const tax = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = Object.keys(st.alliance || {}).find(
        (id) => st.alliance[id]?.status === b.ALLIANCE_STATUS.ALLIED,
      )
      if (!regionId) return null
      window.updateCarbonTaxRate(regionId, 42)
      window.updateCarbonTaxGrowth(regionId, 9)
      return { regionId }
    })
    expect(tax).toBeTruthy()

    save = await readSavedGame(page)
    expect(save.state.alliance[tax.regionId].carbonTax.ratePerTon).toBe(42)
    expect(save.state.alliance[tax.regionId].carbonTax.yearlyGrowthRate).toBe(9)
  })
})

// CAR-217: the power "build mode" dialog (Add Capacity vs Replace Fossil) used
// to be unreachable dead code — building a power project always hard-coded
// buildMode "add", so the Replace-Fossil lever (the only way to retire coal/gas
// and cut power-sector CO2) could never fire. These tests drive the now-wired
// flow through the real dialog and assert the Replace branch actually retires
// fossil capacity on completion.
//
// The flow is driven via window.__carbonTestBridge (a thin read/drive hook added
// for exactly this — fossil retirement is otherwise invisible from the DOM).
test.describe('Power build-mode dialog (Add vs Replace Fossil)', () => {
  test('building a power project opens the Add/Replace dialog', async ({
    page,
  }) => {
    await startGame(page)

    // Drive the real build entry point for a power project (solar, capacityGW>0)
    // in the player's allied home region, exactly as a project-button click does.
    const opened = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      const regionId = Object.keys(st.alliance || {}).find(
        (id) => st.alliance[id]?.status === b.ALLIANCE_STATUS.ALLIED,
      )
      if (!regionId) return false
      st.funds = Math.max(st.funds, 1000)
      b.buildProjectWithEffectiveness(regionId, 'solar', {
        cost: 1,
        effectMultiplier: 1,
      })
      return true
    })
    expect(opened).toBe(true)

    // The previously-unreachable dialog now appears, offering both modes.
    const overlay = page.locator('#build-mode-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay.locator('[data-mode="add"]')).toBeVisible()
    await expect(overlay.locator('[data-mode="replace"]')).toBeVisible()
  })

  test('Replace Fossil retires fossil capacity and is reflected in state', async ({
    page,
  }) => {
    await startGame(page)

    // Pick an allied region that actually has fossil (coal/gas) to retire, then
    // start a power build there. Force-ally a fossil region if the home region
    // has none, so the Replace branch is genuinely exercised.
    const setup = await page.evaluate(() => {
      const b = window.__carbonTestBridge
      const st = b.getState()
      let chosen = null
      let fossilType = null
      for (const regionId of Object.keys(st.regions)) {
        if (!st.alliance?.[regionId]) continue
        const mix = b.getClimateDataForRegion(regionId)?.power?.currentMixTWh || {}
        if ((mix.coal || 0) > 0) {
          chosen = regionId
          fossilType = 'coal'
          break
        }
        if ((mix.gas || 0) > 0 && !chosen) {
          chosen = regionId
          fossilType = 'gas'
        }
      }
      if (!chosen) return { ok: false }
      st.alliance[chosen].status = b.ALLIANCE_STATUS.ALLIED
      st.funds = Math.max(st.funds, 1000)
      const before = st.regions[chosen].retiredFossilGW?.[fossilType] || 0
      b.buildProjectWithEffectiveness(chosen, 'solar', {
        cost: 1,
        effectMultiplier: 1,
      })
      return { ok: true, chosen, fossilType, before }
    })
    expect(setup.ok).toBe(true)

    // Choose "Replace Fossil" and confirm.
    const overlay = page.locator('#build-mode-overlay')
    await expect(overlay).toBeVisible()
    await overlay.locator('[data-mode="replace"]').click()
    await expect(overlay.locator('#replace-options')).toBeVisible()
    await overlay.locator('.confirm-build-btn').click()
    await expect(overlay).toHaveCount(0)

    // The queued construction carries the replace intent (this is what was
    // impossible before the fix — buildMode was always "add").
    const queued = await page.evaluate(() => {
      const st = window.__carbonTestBridge.getState()
      const c = (st.underConstruction || []).find(
        (x) => x.type === 'solar' && x.buildMode === 'replace',
      )
      if (!c) return null
      return {
        id: c.id,
        buildMode: c.buildMode,
        gw: c.replaceCapacityGW,
        fossilType: c.replaceFossilType,
      }
    })
    expect(queued).not.toBeNull()
    expect(queued.buildMode).toBe('replace')
    expect(queued.gw).toBeGreaterThan(0)
    expect(['coal', 'gas']).toContain(queued.fossilType)

    // Fast-forward this build to completion and advance one month; on completion
    // the chosen fossil capacity must be retired (region.retiredFossilGW grows).
    await page.evaluate((id) => {
      const st = window.__carbonTestBridge.getState()
      const c = st.underConstruction.find((x) => x.id === id)
      c.monthsRemaining = 1
    }, queued.id)

    await page.locator('#next-month').click()

    const after = await page.evaluate(
      ({ chosen, fossilType }) => {
        const st = window.__carbonTestBridge.getState()
        return st.regions[chosen].retiredFossilGW?.[fossilType] || 0
      },
      { chosen: setup.chosen, fossilType: queued.fossilType },
    )
    expect(after).toBeGreaterThan(setup.before)
  })
})

// CAR-236: prior passes pinned only the "endgame banner stays hidden during a
// live run" invariant (CAR-198). The actual game-over transition — checkWinLose
// flipping state.gameOver, showEndgameResultsModal painting the results dialog,
// time controls disabling, and the re-entry banner being revealed only once the
// modal is dismissed — was never exercised. This drives the deterministic
// time-out loss (year > GAME_CONFIG.loseYear=2100), which trips checkWinLose
// independent of the climate sim, and asserts the whole transition end to end.
test.describe('Endgame results modal (CAR-236)', () => {
  test('reaching the lose year ends the run and shows the defeat results modal', async ({
    page,
  }) => {
    await startGame(page)

    // Force the time-out lose condition deterministically: checkWinLose loses
    // when state.year > loseYear, regardless of temperature/streaks, so this is
    // robust against the monthly climate recompute.
    await page.evaluate(() => {
      window.__carbonTestBridge.getState().year = 2101
    })

    // Advance one month to run updateEndgameStreaks() -> checkWinLose().
    await dismissEventPopupIfPresent(page)
    await page.locator('#next-month').click()

    const popup = page.locator('#endgame-results-popup')
    await expect(popup).toBeVisible()
    await expect(page.locator('#endgame-results-title')).toHaveText('Run Failed')
    await expect(page.locator('#endgame-results-outcome')).toHaveText(
      'Climate Catastrophe',
    )
    await expect(page.locator('#endgame-results-dialog')).toHaveClass(/defeat/)

    // Game-over disables the time controls (updateControls).
    await expect(page.locator('#next-month')).toBeDisabled()

    // The re-entry banner stays hidden while the modal is open...
    await expect(page.locator('#endgame-banner')).toBeHidden()

    // ...and is revealed once the player dismisses the results modal, so the
    // player is never stranded on a frozen board with no forward affordance.
    await page.locator('#endgame-results-dialog .popup-close').click()
    await expect(popup).toBeHidden()
    await expect(page.locator('#endgame-banner')).toBeVisible()

    // Play Again from the banner clears game-over and returns to setup mode.
    await page.locator('#endgame-banner-play-again').click()
    await expect(page.locator('#setup-panel')).toBeVisible()
  })
})

test.describe('Console & page health', () => {
  test('no uncaught page errors during a full setup->play cycle', async ({
    page,
  }) => {
    /** @type {string[]} */
    const pageErrors = []
    page.on('pageerror', (err) => pageErrors.push(String(err)))

    await startGame(page)
    await page.locator('#next-month').click()

    expect(
      pageErrors,
      `Uncaught page errors:\n${pageErrors.join('\n')}`
    ).toEqual([])
  })
})
