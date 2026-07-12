// @ts-check
// CAR-408 — Browser QA re-validation of the CAR-405 fix that made
// REGIONAL_PROJECT_CAPS bind on the LIVE build path
// (buildProjectWithEffectiveness), not just the dead buildProject().
//
// These tests assert the player-visible contract of a hit cap:
//   1. the (N+1)th build of a capped type in one region is REFUSED with the
//      exact "<Region> has reached maximum <Project> capacity (<cap>). Try
//      another region." message,
//   2. the refusal does NOT spend funds and does NOT queue construction, and
//   3. the same type still builds in a DIFFERENT region (caps are per-region,
//      so "Try another region" is real, not a dead-end).
//
// Covers the early caps a player hits: forest=3, carbonCapture=2, nuclear=2.
// Builds are driven through window.__carbonTestBridge.buildProjectWithEffectiveness
// (the exact function the project buttons call) for determinism, but every
// assertion is against player-visible state: the #news-log message, the funds
// HUD, and state.underConstruction.
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

async function selectFirstRegion(page) {
  return page.evaluate(() => {
    const obj = /** @type {HTMLObjectElement} */ (
      document.getElementById('map-object')
    )
    const doc = obj.contentDocument
    const first = doc.querySelectorAll('.region')[0]
    first.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

/** Fresh game.html load -> active game with a home region chosen (auto-allied). */
async function startGame(page) {
  await page.goto('game.html')
  await waitForMapRegions(page)
  await selectFirstRegion(page)
  const confirmBtn = page.locator('#confirm-setup-btn')
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()
  await expect(page.locator('#setup-panel')).toBeHidden()
  await expect(page.locator('#header-controls')).toBeVisible()
}

/** Ally two distinct regions and top up funds. Returns their ids [primary, other]. */
async function setupTwoAlliedRegions(page) {
  return page.evaluate(() => {
    const b = window.__carbonTestBridge
    const st = b.getState()
    const ids = Object.keys(st.regions || {})
    // Prefer the auto-allied home region as primary.
    const primary =
      ids.find((id) => st.alliance?.[id]?.status === b.ALLIANCE_STATUS.ALLIED) ||
      ids[0]
    const other = ids.find((id) => id !== primary)
    for (const id of [primary, other]) {
      st.alliance[id] = st.alliance[id] || {}
      st.alliance[id].status = b.ALLIANCE_STATUS.ALLIED
      st.alliance[id].spentInRegion = st.alliance[id].spentInRegion || 0
      st.alliance[id].happiness = st.alliance[id].happiness ?? 70
      st.alliance[id].economicProjectCount =
        st.alliance[id].economicProjectCount || 0
      st.alliance[id].jobProjectCount = st.alliance[id].jobProjectCount || 0
    }
    st.funds = 100000
    return { primary, other }
  })
}

/** Build one project via the live path. Returns {funds, queued} snapshot after. */
async function build(page, regionId, type, cost = 1) {
  return page.evaluate(
    ({ regionId, type, cost }) => {
      const b = window.__carbonTestBridge
      b.buildProjectWithEffectiveness(regionId, type, {
        cost,
        co2Reduction: 0.02,
        effectMultiplier: 1,
      })
      const st = b.getState()
      return {
        funds: st.funds,
        queued: (st.underConstruction || []).filter(
          (c) => c.regionId === regionId && c.type === type,
        ).length,
        totalQueued: (st.underConstruction || []).length,
      }
    },
    { regionId, type, cost },
  )
}

/** Seed N completed projects of `type` into a region (bypasses build time). */
async function seedCompleted(page, regionId, type, n) {
  await page.evaluate(
    ({ regionId, type, n }) => {
      const st = window.__carbonTestBridge.getState()
      const region = st.regions[regionId]
      region.projects = region.projects || []
      for (let i = 0; i < n; i += 1) region.projects.push({ type })
    },
    { regionId, type, n },
  )
}

const newsText = (page) =>
  page.locator('#news-log').textContent().then((t) => t || '')

// Non-power capped types build straight into the construction queue, so we can
// exercise the real "completed+queued summed" counting by queuing up to the cap.
for (const { type, label, cap } of [
  { type: 'forest', label: 'Reforestation Program', cap: 3 },
  { type: 'carbonCapture', label: 'Basic Carbon Capture', cap: 2 },
]) {
  test(`${type}: (cap+1)th build in a region is refused, no spend, no queue; builds elsewhere`, async ({
    page,
  }) => {
    await startGame(page)
    const { primary, other } = await setupTwoAlliedRegions(page)

    // Build exactly `cap` of the type in the primary region — all succeed.
    let snap
    for (let i = 0; i < cap; i += 1) {
      snap = await build(page, primary, type, 1)
      expect(snap.queued).toBe(i + 1)
    }
    expect(snap.queued).toBe(cap)

    const fundsAtCap = snap.funds
    const totalQueuedAtCap = snap.totalQueued

    // The (cap+1)th build must be refused.
    const afterRefusal = await build(page, primary, type, 1)

    // 1. Exact player-visible refusal message. getRegionName isn't on the
    // bridge, but the message carries the region name; asserting the
    // "<label> capacity (<cap>). Try another region." tail pins the full
    // player-facing contract (correct label + correct cap number).
    const news = await newsText(page)
    const expectedTail = `has reached maximum ${label} capacity (${cap}). Try another region.`
    expect(news).toContain(expectedTail)

    // 2. No funds spent and no construction queued by the refused build.
    expect(afterRefusal.funds).toBe(fundsAtCap)
    expect(afterRefusal.queued).toBe(cap)
    expect(afterRefusal.totalQueued).toBe(totalQueuedAtCap)

    // 3. The same type still builds in a DIFFERENT region.
    const inOther = await build(page, other, type, 1)
    expect(inOther.queued).toBe(1)
    expect(inOther.totalQueued).toBe(totalQueuedAtCap + 1)
  })
}

// Nuclear is a POWER project (capacityGW > 0): building it opens the Add/Replace
// build-mode dialog. The cap check runs BEFORE that dialog, so a capped nuclear
// type must be refused up front with no dialog, no spend, no queue. Seed the
// region to cap with completed plants to exercise the pre-dialog refusal.
test('nuclear (power): capped type is refused before the build-mode dialog opens, no spend', async ({
  page,
}) => {
  await startGame(page)
  const { primary, other } = await setupTwoAlliedRegions(page)

  await seedCompleted(page, primary, 'nuclear', 2) // cap = 2

  const before = await page.evaluate(() => {
    const st = window.__carbonTestBridge.getState()
    return { funds: st.funds, totalQueued: (st.underConstruction || []).length }
  })

  const result = await page.evaluate(
    ({ primary }) => {
      const b = window.__carbonTestBridge
      b.buildProjectWithEffectiveness(primary, 'nuclear', {
        cost: 1,
        co2Reduction: 0,
        effectMultiplier: 1,
      })
      const st = b.getState()
      // Is the power build-mode dialog open? (CAR-217 overlay)
      const dialogOpen = !!document.querySelector(
        '#build-mode-overlay',
      )
      return {
        funds: st.funds,
        totalQueued: (st.underConstruction || []).length,
        dialogOpen,
      }
    },
    { primary },
  )

  // Refused: exact message, no dialog, no spend, no queue.
  const news = await newsText(page)
  expect(news).toContain('has reached maximum Nuclear Plant capacity (2). Try another region.')
  expect(result.dialogOpen).toBe(false)
  expect(result.funds).toBe(before.funds)
  expect(result.totalQueued).toBe(before.totalQueued)

  // A different region with no nuclear can still open the build path (dialog),
  // proving the cap is per-region. (We cancel by not confirming.)
  const otherOpens = await page.evaluate(
    ({ other }) => {
      const b = window.__carbonTestBridge
      b.buildProjectWithEffectiveness(other, 'nuclear', {
        cost: 1,
        co2Reduction: 0,
        effectMultiplier: 1,
      })
      return !!document.querySelector(
        '#build-mode-overlay',
      )
    },
    { other },
  )
  expect(otherOpens).toBe(true)
})
