// @ts-check
// CAR-100 — world map error/fallback state.
//
// When the map SVG fails to load (404, blocked request, parse stall) the player
// must see a readable message + retry instead of a silent blank map area, and
// the rest of the page must stay intact (no uncaught error bricking the session).
import { test, expect } from '@playwright/test'

const MAP_SVG_GLOB = '**/mapsvg-world-*.svg'

test('shows a fallback + retry when the map SVG fails to load', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  // Simulate a failed map load by aborting the SVG request — fires the
  // <object> error event the fallback is wired to.
  await page.route(MAP_SVG_GLOB, (route) => route.abort())

  await page.goto('game.html')

  // <object> error events are unreliable across browsers, so the fallback also
  // relies on an ~8s load watchdog — give the assertion room for it.
  const mapError = page.locator('#map-error')
  await expect(mapError).toBeVisible({ timeout: 12_000 })
  await expect(mapError).toContainText("Couldn't load the world map")
  await expect(page.locator('#map-error-retry')).toBeVisible()

  // The map failing must not crash the rest of the game shell.
  await expect(page.locator('.map-container')).toBeVisible()
  expect(pageErrors, `unexpected page errors: ${pageErrors.join('; ')}`).toEqual([])
})

test('retry reloads and recovers the map once the SVG is reachable again', async ({ page }) => {
  let failNext = true
  await page.route(MAP_SVG_GLOB, (route) => {
    if (failNext) {
      failNext = false
      return route.abort()
    }
    return route.continue()
  })

  await page.goto('game.html')
  await expect(page.locator('#map-error')).toBeVisible({ timeout: 12_000 })

  // Retry triggers a full page reload; the route now serves the SVG so the
  // reloaded page renders regions and the fallback stays hidden.
  await page.locator('#map-error-retry').click()

  await page.waitForFunction(() => {
    const obj = /** @type {HTMLObjectElement|null} */ (
      document.getElementById('map-object')
    )
    const doc = obj && obj.contentDocument
    return !!(doc && doc.querySelector('.region'))
  }, null, { timeout: 30_000 })
  await expect(page.locator('#map-error')).toBeHidden()
})

test('normal load path leaves the fallback hidden', async ({ page }) => {
  await page.goto('game.html')
  await page.waitForFunction(() => {
    const obj = /** @type {HTMLObjectElement|null} */ (
      document.getElementById('map-object')
    )
    const doc = obj && obj.contentDocument
    return !!(doc && doc.querySelector('.region'))
  }, null, { timeout: 30_000 })
  await expect(page.locator('#map-error')).toBeHidden()
})
