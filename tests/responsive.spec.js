import { test, expect } from '@playwright/test';

/**
 * SubTrack Responsive Design Test Suite
 * Tests the current navigation architecture:
 *   - Mobile  (<768px):  Bottom-Nav visible, Sidebar hidden
 *   - Tablet  (768–1023px): Sidebar visible (icon-only), Bottom-Nav hidden
 *   - Desktop (≥1024px): Full Sidebar visible, Bottom-Nav hidden
 *
 * Also tests no horizontal overflow on all pages at all viewports.
 */

const BASE_URL = 'http://localhost:5179';

const VIEWPORTS = [
  { name: '375px',  width: 375,  height: 800 },
  { name: '768px',  width: 768,  height: 800 },
  { name: '1280px', width: 1280, height: 800 },
];

const PAGES = [
  { name: 'Dashboard',     hash: '#dashboard',     navLabel: 'Dashboard' },
  { name: 'Abonnements',   hash: '#subscriptions', navLabel: 'Abonnements' },
  { name: 'Analytics',     hash: '#analytics',     navLabel: 'Analytics' },
  { name: 'Einstellungen', hash: '#settings',      navLabel: 'Einstellungen' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to a page using whichever nav is appropriate for the viewport. */
const navigateTo = async (page, navLabel, viewportWidth) => {
  if (viewportWidth < 768) {
    // Use bottom-nav on mobile
    const btn = page.locator('.bottom-nav-item').filter({ hasText: navLabel });
    await btn.click();
  } else {
    // Use sidebar on tablet/desktop — click by JS to avoid off-screen issues
    await page.evaluate((label) => {
      const btn = Array.from(document.querySelectorAll('nav button')).find(
        (b) => b.textContent.trim() === label || b.getAttribute('title') === label
      );
      if (btn) btn.click();
    }, navLabel);
  }
  await page.waitForTimeout(300);
};

// ---------------------------------------------------------------------------
// No horizontal overflow — all viewports × all pages
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const pg of PAGES) {
      test(`${pg.name} — no horizontal overflow at ${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${pg.hash}`);
        await page.waitForLoadState('networkidle');

        await navigateTo(page, pg.navLabel, viewport.width);
        await page.waitForTimeout(400);

        const noOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });

        expect(
          noOverflow,
          `Page "${pg.name}" at ${viewport.width}px has horizontal overflow ` +
          `(scrollWidth: ${await page.evaluate(() => document.documentElement.scrollWidth)}, ` +
          `innerWidth: ${viewport.width})`
        ).toBe(true);

        await page.screenshot({
          path: `screenshots/${viewport.width}_${pg.name.toLowerCase()}.png`,
          fullPage: true,
        });
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Mobile (<768px): Bottom-Nav visible, Sidebar hidden
// ---------------------------------------------------------------------------

test.describe('Mobile navigation (375px)', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('Bottom-Nav is visible on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();
  });

  test('Sidebar is hidden on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebarVisible = await page.evaluate(() => {
      const sidebar = document.querySelector('.dashboard-sidebar');
      if (!sidebar) return false;
      const style = window.getComputedStyle(sidebar);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    expect(sidebarVisible).toBe(false);
  });

  test('Bottom-Nav has 4 items', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const items = page.locator('.bottom-nav-item');
    await expect(items).toHaveCount(4);
  });

  test('Bottom-Nav items meet 44px touch target height', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const touchTargets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.bottom-nav-item')).map((b) => ({
        text: b.textContent.trim(),
        height: b.getBoundingClientRect().height,
      }));
    });

    for (const target of touchTargets) {
      expect(
        target.height,
        `Bottom-Nav item "${target.text}" is only ${target.height}px tall (min 44px)`
      ).toBeGreaterThanOrEqual(44);
    }
  });

  test('Bottom-Nav sets data-active on click', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    // Click the Abonnements item
    const abosBtn = page.locator('.bottom-nav-item').filter({ hasText: 'Abonnements' });
    await abosBtn.click();
    await page.waitForTimeout(300);

    const isActive = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.bottom-nav-item')).find(
        (b) => b.textContent.includes('Abonnements')
      );
      return btn?.getAttribute('data-active') === 'true';
    });

    expect(isActive).toBe(true);
  });

  test('Clicking Bottom-Nav deactivates previous item', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    // Navigate away from Dashboard
    const analyticsBtn = page.locator('.bottom-nav-item').filter({ hasText: 'Analytics' });
    await analyticsBtn.click();
    await page.waitForTimeout(300);

    const dashboardActive = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.bottom-nav-item')).find(
        (b) => b.textContent.includes('Dashboard')
      );
      return btn?.getAttribute('data-active') === 'true';
    });

    expect(dashboardActive).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tablet (768px–1023px): Sidebar visible (icon-only), Bottom-Nav hidden
// ---------------------------------------------------------------------------

test.describe('Tablet navigation (768px)', () => {
  test.use({ viewport: { width: 768, height: 800 } });

  test('Sidebar is visible on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.dashboard-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('Bottom-Nav is hidden on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const bottomNavVisible = await page.evaluate(() => {
      const nav = document.querySelector('.bottom-nav');
      if (!nav) return false;
      const style = window.getComputedStyle(nav);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    expect(bottomNavVisible).toBe(false);
  });

  test('Sidebar nav labels are hidden (icon-only mode) on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const labelVisible = await page.evaluate(() => {
      const label = document.querySelector('.nav-item .nav-label');
      if (!label) return false;
      const style = window.getComputedStyle(label);
      return style.display !== 'none';
    });

    expect(labelVisible).toBe(false);
  });

  test('Sidebar nav buttons have title attribute for tooltip accessibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.nav-item')).map((b) => b.getAttribute('title'));
    });

    for (const title of titles) {
      expect(title).toBeTruthy();
    }
  });

  test('Sidebar nav sets data-active correctly on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    // Click Analytics via title attribute
    await page.evaluate(() => {
      const btn = document.querySelector('.nav-item[title="Analytics"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);

    const isActive = await page.evaluate(() => {
      const btn = document.querySelector('.nav-item[title="Analytics"]');
      return btn?.getAttribute('data-active') === 'true';
    });

    expect(isActive).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Desktop (≥1024px): Full Sidebar visible, Bottom-Nav hidden
// ---------------------------------------------------------------------------

test.describe('Desktop sidebar (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Sidebar is visible and sticky on desktop', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.dashboard-sidebar');
    await expect(sidebar).toBeVisible();

    const position = await page.evaluate(() => {
      const s = document.querySelector('.dashboard-sidebar');
      return s ? window.getComputedStyle(s).position : null;
    });
    expect(position).toBe('sticky');
  });

  test('Sidebar nav labels are visible (full mode) on desktop', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const labelVisible = await page.evaluate(() => {
      const label = document.querySelector('.nav-item .nav-label');
      if (!label) return false;
      const style = window.getComputedStyle(label);
      return style.display !== 'none';
    });

    expect(labelVisible).toBe(true);
  });

  test('Bottom-Nav is hidden on desktop', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const bottomNavVisible = await page.evaluate(() => {
      const nav = document.querySelector('.bottom-nav');
      if (!nav) return false;
      const style = window.getComputedStyle(nav);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    expect(bottomNavVisible).toBe(false);
  });

  test('All 4 nav items are present in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const labels = ['Dashboard', 'Abonnements', 'Analytics', 'Einstellungen'];
    for (const label of labels) {
      const btn = page.locator('.nav-item').filter({ hasText: label });
      await expect(btn).toBeVisible();
    }
  });

  test('Sidebar nav sets data-active on click on desktop', async ({ page }) => {
    await page.goto(`${BASE_URL}/#dashboard`);
    await page.waitForLoadState('networkidle');

    const einstellungenBtn = page.locator('.nav-item').filter({ hasText: 'Einstellungen' });
    await einstellungenBtn.click();
    await page.waitForTimeout(300);

    const isActive = await page.evaluate(() => {
      const btn = document.querySelector('.nav-item[title="Einstellungen"]');
      return btn?.getAttribute('data-active') === 'true';
    });

    expect(isActive).toBe(true);
  });
});
