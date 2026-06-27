// @ts-check
// Browser QA pass (CAR-254) — covers two central in-game surfaces that the
// existing suite did not exercise: the carbon-balance breakdown popup (opened
// from the HUD net-CO2 stat) and the sidebar tab navigation (World/Region/Tech).
//
// Report-don't-fix: these tests document current behavior and guard against
// regressions in the carbon breakdown dialog + sidebar tabs.
import { test, expect } from '@playwright/test'

async function waitForMapRegions(page) {
  await page.waitForFunction(() => {
    const obj = /** @type {HTMLObjectElement|null} */ (
      document.getElementById('map-object')
    )
    const doc = obj && obj.contentDocument
    return !!(doc && doc.querySelector('.region'))
  }, null, { timeout: 30_000 })
}

/** Fresh game.html load -> active game with a home region chosen. */
async function startGame(page) {
  await page.goto('game.html')
  await waitForMapRegions(page)
  await page.evaluate(() => {
    const obj = /** @type {HTMLObjectElement} */ (
      document.getElementById('map-object')
    )
    const doc = obj.contentDocument
    doc.querySelectorAll('.region')[0].dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    )
  })
  await page.locator('#confirm-setup-btn').click()
  await expect(page.locator('#setup-panel')).toBeHidden()
  await expect(page.locator('#header-controls')).toBeVisible()
}

test.describe('Carbon-balance breakdown popup', () => {
  test('opens from the HUD net-CO2 stat and shows the regional breakdown', async ({
    page,
  }) => {
    await startGame(page)

    const stat = page.locator('#net-co2-stat')
    // HUD affordance is exposed as an accessible button.
    await expect(stat).toHaveAttribute('role', 'button')

    await stat.click()

    const popup = page.locator('#carbon-balance-popup')
    await expect(popup).toBeVisible()

    // Defaults to the "By Region" tab with at least one region row populated.
    const regionsTab = popup.locator('.carbon-tab[data-tab="regions"]')
    await expect(regionsTab).toHaveClass(/active/)
    await expect(page.locator('#carbon-tab-regions')).toHaveClass(/active/)
    await expect(page.locator('#carbon-regions-list')).not.toBeEmpty()

    // Net balance + ppm change render with their expected units.
    await expect(page.locator('#carbon-net-balance')).toContainText('Gt CO2/year')
    await expect(page.locator('#carbon-ppm-change')).toContainText('ppm/year')
  })

  test('switches to the Global Summary tab and lists emissions + removals', async ({
    page,
  }) => {
    await startGame(page)
    await page.locator('#net-co2-stat').click()

    const popup = page.locator('#carbon-balance-popup')
    await expect(popup).toBeVisible()

    await popup.locator('.carbon-tab[data-tab="global"]').click()

    await expect(page.locator('#carbon-tab-global')).toHaveClass(/active/)
    await expect(page.locator('#carbon-tab-regions')).not.toHaveClass(/active/)

    // Global summary surfaces the emissions and removals breakdown lists.
    await expect(page.locator('#carbon-emissions-list')).not.toBeEmpty()
    await expect(page.locator('#carbon-emissions-total')).toContainText(/\d/)
    await expect(page.locator('#carbon-removals-total')).toBeVisible()
  })

  // NOTE: focus-trap / Escape / focus-restore for this dialog is already covered
  // by modal-accessibility.spec.js ("carbon balance dialog traps focus ...").
})

test.describe('Sidebar tab navigation', () => {
  test('World/Region/Tech tabs switch the active panel', async ({ page }) => {
    await startGame(page)

    const tabs = page.locator('#sidebar-tabs .sidebar-tab')
    await expect(tabs).toHaveCount(3)
    await expect(tabs).toHaveText(['World', 'Region', 'Tech'])

    // World is active on game start.
    await expect(page.locator('.sidebar-tab[data-tab="world"]')).toHaveClass(/active/)
    await expect(page.locator('#world-tab-content')).toHaveClass(/active/)

    // Switch to Tech: the tech tab becomes active and the tech panel renders.
    await page.locator('.sidebar-tab[data-tab="tech"]').click()
    await expect(page.locator('.sidebar-tab[data-tab="tech"]')).toHaveClass(/active/)
    await expect(page.locator('#tech-panel')).toBeVisible()

    // Switch to Region tab.
    await page.locator('.sidebar-tab[data-tab="region"]').click()
    await expect(page.locator('.sidebar-tab[data-tab="region"]')).toHaveClass(/active/)
  })
})
