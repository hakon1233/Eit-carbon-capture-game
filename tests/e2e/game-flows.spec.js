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
