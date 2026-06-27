// @ts-check
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
  await page.evaluate(() => {
    const obj = /** @type {HTMLObjectElement} */ (
      document.getElementById('map-object')
    )
    const first = obj.contentDocument?.querySelector('.region')
    first?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    )
  })
}

async function startGame(page) {
  await page.goto('game.html')
  await waitForMapRegions(page)
  await selectFirstRegion(page)
  await page.locator('#confirm-setup-btn').click()
  await expect(page.locator('#header-controls')).toBeVisible()
}

async function expectTabStaysInDialog(page, dialogSelector) {
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab')
    await expect
      .poll(() =>
        page.evaluate((selector) => {
          const dialog = document.querySelector(selector)
          return !!(dialog && dialog.contains(document.activeElement))
        }, dialogSelector)
      )
      .toBe(true)
  }
}

async function expectEscapeClosesAndRestoresFocus(
  page,
  triggerSelector,
  dialogSelector
) {
  await expectTabStaysInDialog(page, dialogSelector)
  await page.keyboard.press('Escape')
  await expect(page.locator(dialogSelector).locator('..')).toBeHidden()
  await expect
    .poll(() =>
      page.evaluate(
        (selector) => document.activeElement === document.querySelector(selector),
        triggerSelector
      )
    )
    .toBe(true)
}

test.describe('Modal dialog accessibility', () => {
  test('carbon tax sliders have screen-reader labels', async ({ page }) => {
    await startGame(page)

    await page.evaluate(() => {
      const state = window.__carbonTestBridge.getState()
      const allianceStatus = window.__carbonTestBridge.ALLIANCE_STATUS
      const regionId = state.homeRegion
      state.alliance[regionId] = {
        ...(state.alliance[regionId] || {}),
        status: allianceStatus.ALLIED,
      }
      window.showCarbonTaxPopup(regionId)
    })

    const dialog = page.getByRole('dialog', { name: /Carbon Tax/ })
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('slider', { name: /Carbon tax rate for / })
    ).toBeVisible()
    await expect(
      dialog.getByRole('slider', {
        name: /Carbon tax yearly growth rate for /,
      })
    ).toBeVisible()
  })

  test('carbon balance dialog traps focus, closes with Escape, and restores focus', async ({
    page,
  }) => {
    await startGame(page)

    await page.locator('#net-co2-stat').focus()
    await page.keyboard.press('Enter')

    await expect(
      page.getByRole('dialog', { name: 'Global Carbon Balance' })
    ).toBeVisible()
    await expectEscapeClosesAndRestoresFocus(
      page,
      '#net-co2-stat',
      '.carbon-balance-dialog'
    )
  })

  test('monthly income dialog traps focus, closes with Escape, and restores focus', async ({
    page,
  }) => {
    await startGame(page)

    await page.locator('#income-display').focus()
    await page.keyboard.press('Enter')

    await expect(
      page.getByRole('dialog', { name: 'Monthly Income Breakdown' })
    ).toBeVisible()
    await expectEscapeClosesAndRestoresFocus(
      page,
      '#income-display',
      '.income-breakdown-dialog'
    )
  })

  test('stat detail dialog traps focus, closes with Escape, and restores focus', async ({
    page,
  }) => {
    await startGame(page)

    const trigger = page.locator('.header-stat').first()
    await trigger.focus()
    await page.keyboard.press('Enter')

    await expect(
      page.getByRole('dialog', { name: 'Climate Alliance' })
    ).toBeVisible()
    await expectEscapeClosesAndRestoresFocus(
      page,
      '.header-stat',
      '.stat-detail-dialog'
    )
  })

  test('event popup traps focus, closes with Escape, and restores focus', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = () => 0
    })
    await startGame(page)

    await page.locator('#next-month').focus()
    await page.keyboard.press('Enter')

    await expect(page.locator('#event-popup[role="dialog"]')).toBeVisible()
    await expectEscapeClosesAndRestoresFocus(
      page,
      '#next-month',
      '#event-popup'
    )
  })
})
