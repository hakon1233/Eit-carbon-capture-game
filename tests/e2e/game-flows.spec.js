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
