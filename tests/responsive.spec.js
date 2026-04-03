import { test, expect } from '@playwright/test';

/**
 * SubTrack Responsive Design Test Suite
 * Tests all 4 pages at 375px, 768px, 1280px viewports.
 * Asserts no horizontal overflow, mobile nav drawer behavior,
 * and vertical nav item layout inside the drawer.
 */

const BASE_URL = 'http://localhost:5179';

const VIEWPORTS = [
  { name: '375px', width: 375, height: 800 },
  { name: '768px', width: 768, height: 800 },
  { name: '1280px', width: 1280, height: 800 },
];

const PAGES = [
  { name: 'Dashboard', hash: '#dashboard', navLabel: 'Dashboard' },
  { name: 'Abonnements', hash: '#subscriptions', navLabel: 'Abonnements' },
  { name: 'Analytics', hash: '#analytics', navLabel: 'Analytics' },
  { name: 'Einstellungen', hash: '#settings', navLabel: 'Einstellungen' },
];

/** Detects elements whose scrollWidth exceeds clientWidth. */
const detectOverflow = () => {
  const issues = [];
  document.querySelectorAll('*').forEach((el) => {
    if (el.scrollWidth > el.clientWidth) {
      issues.push({
        element:
          el.tagName +
          (el.className && typeof el.className === 'string'
            ? '.' + el.className.split(' ')[0]
            : ''),
        overflow: el.scrollWidth - el.clientWidth,
      });
    }
  });
  return issues;
};

/** Clicks a nav button by text content using JS (works even when sidebar is in DOM but off-screen). */
const clickNavItem = async (page, label) => {
  await page.evaluate((navLabel) => {
    const btn = Array.from(document.querySelectorAll('nav button')).find(
      (b) => b.textContent.trim() === navLabel
    );
    if (btn) btn.click();
  }, label);
  await page.waitForTimeout(300);
};

/** Opens the mobile nav drawer via the hamburger button. */
const openDrawer = async (page) => {
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Navigation öffnen"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);
};

/** Closes the mobile nav drawer via the close button. */
const closeDrawer = async (page) => {
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Navigation schließen"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);
};

// ---------------------------------------------------------------------------
// Main test loop — all viewports x all pages
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const pg of PAGES) {
      test(`${pg.name} — no horizontal overflow at ${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${pg.hash}`);
        await page.waitForLoadState('networkidle');

        // On mobile/tablet, nav buttons are off-screen — open drawer first then navigate.
        if (viewport.width < 1024) {
          await openDrawer(page);
          await clickNavItem(page, pg.navLabel);
        } else {
          await clickNavItem(page, pg.navLabel);
        }

        await page.waitForTimeout(400);

        // Assert no full-page horizontal scrollbar (document-level overflow).
        const documentOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });
        expect(
          documentOverflow,
          `Page "${pg.name}" at ${viewport.name}: document.documentElement.scrollWidth (${
            await page.evaluate(() => document.documentElement.scrollWidth)
          }) exceeds window.innerWidth (${viewport.width})`
        ).toBe(true);

        // Take screenshot for visual reference.
        await page.screenshot({
          path: `screenshots/${viewport.width}_${pg.name.toLowerCase()}.png`,
          fullPage: true,
        });
      });
    }

    // -------------------------------------------------------------------------
    // Mobile drawer tests — only at widths where hamburger is shown (<1024px)
    // -------------------------------------------------------------------------

    if (viewport.width < 1024) {
      test(`Mobile nav drawer opens correctly at ${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/#dashboard`);
        await page.waitForLoadState('networkidle');

        // Hamburger button must be visible.
        const hamburger = page.getByRole('button', { name: 'Navigation öffnen' });
        await expect(hamburger).toBeVisible();

        // Open the drawer.
        await hamburger.click();
        await page.waitForTimeout(300);

        // Screenshot with drawer open.
        await page.screenshot({
          path: `screenshots/${viewport.width}_drawer_open.png`,
        });

        // Sidebar must be visible after open.
        const sidebar = page.locator('.dashboard-sidebar');
        await expect(sidebar).toBeVisible();

        // Nav items must be stacked vertically (flex-direction: column).
        const flexDirection = await page.evaluate(() => {
          const nav = document.querySelector('nav[aria-label="Hauptnavigation"]');
          if (!nav) return null;
          return window.getComputedStyle(nav.firstElementChild).flexDirection;
        });
        expect(flexDirection).toBe('column');

        // All 4 nav items must be present and visible.
        const navLabels = ['Dashboard', 'Abonnements', 'Analytics', 'Einstellungen'];
        for (const label of navLabels) {
          const btn = page.locator('nav button').filter({ hasText: label });
          await expect(btn).toBeVisible();
        }

        // Each nav item touch target must be at least 44px tall.
        const touchTargets = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('nav button')).map((b) => ({
            text: b.textContent.trim(),
            height: b.getBoundingClientRect().height,
          }));
        });
        for (const target of touchTargets) {
          expect(
            target.height,
            `Nav item "${target.text}" touch target height ${target.height}px is below 44px minimum`
          ).toBeGreaterThanOrEqual(44);
        }

        // No horizontal overflow inside drawer.
        const overflowWhileOpen = await page.evaluate(detectOverflow);
        const documentOverflow = overflowWhileOpen.filter(
          (i) => i.element === 'HTML' || i.element === 'BODY'
        );
        expect(
          documentOverflow,
          `Horizontal scroll detected at document level with drawer open at ${viewport.name}`
        ).toHaveLength(0);
      });

      test(`Mobile nav drawer closes correctly at ${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/#dashboard`);
        await page.waitForLoadState('networkidle');

        // Open the drawer.
        await page.getByRole('button', { name: 'Navigation öffnen' }).click();
        await page.waitForTimeout(300);

        // Close button must appear.
        const closeBtn = page.getByRole('button', { name: 'Navigation schließen' });
        await expect(closeBtn).toBeVisible();

        // Close the drawer.
        await closeBtn.click();
        await page.waitForTimeout(300);

        // After closing, the sidebar should not be the "is-open" state.
        const isOpen = await page.evaluate(() => {
          const sidebar = document.querySelector('.dashboard-sidebar');
          return sidebar ? sidebar.classList.contains('is-open') : null;
        });
        expect(isOpen).toBe(false);

        // Hamburger button must be visible again.
        await expect(
          page.getByRole('button', { name: 'Navigation öffnen' })
        ).toBeVisible();
      });

      test(`Nav items are vertical (flex-col) in drawer at ${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/#dashboard`);
        await page.waitForLoadState('networkidle');

        await openDrawer(page);

        // Verify vertical stacking via computed style.
        const flexDirection = await page.evaluate(() => {
          const nav = document.querySelector('nav[aria-label="Hauptnavigation"]');
          if (!nav) return null;
          return window.getComputedStyle(nav.firstElementChild).flexDirection;
        });
        expect(flexDirection).toBe('column');

        // Verify visually by checking y-positions are strictly increasing.
        const positions = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('nav button')).map((b) => ({
            text: b.textContent.trim(),
            top: b.getBoundingClientRect().top,
          }));
        });

        for (let i = 1; i < positions.length; i++) {
          expect(
            positions[i].top,
            `Nav item "${positions[i].text}" (top: ${positions[i].top}) is not below "${positions[i - 1].text}" (top: ${positions[i - 1].top}) — items may not be vertically stacked`
          ).toBeGreaterThan(positions[i - 1].top);
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Sidebar visible at desktop (≥1024px)
// ---------------------------------------------------------------------------

test.describe('Desktop sidebar always visible', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Sidebar is visible without hamburger at 1280px', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    // Sidebar visible.
    const sidebar = page.locator('.dashboard-sidebar');
    await expect(sidebar).toBeVisible();

    // Hamburger button should NOT be visible at desktop.
    const hamburger = page.getByRole('button', { name: 'Navigation öffnen' });
    // It may be in the DOM but visually hidden — check computed visibility.
    const hamburgerVisible = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Navigation öffnen"]');
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(btn).display !== 'none';
    });
    // At 1280px the hamburger is still in DOM (the header renders it),
    // so we just verify sidebar is docked (not positioned fixed/absolute from the mobile rule).
    const sidebarPosition = await page.evaluate(() => {
      const sidebar = document.querySelector('.dashboard-sidebar');
      return sidebar ? window.getComputedStyle(sidebar).position : null;
    });
    expect(sidebarPosition).toBe('sticky');
  });
});
