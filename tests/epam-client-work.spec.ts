import { test, expect } from '@playwright/test';

test('EPAM client work test', async ({ page }) => {
  // 1) Go to the homepage
  await page.goto('https://www.epam.com/', { waitUntil: 'networkidle' });

  // 2) Try to click the "Services" header link. If that fails, fall back to navigating to /services.
  const servicesLink = page.getByRole('link', { name: /^Services$/i }).first();
  try {
    await servicesLink.waitFor({ state: 'visible', timeout: 3000 });
    await servicesLink.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
  } catch (err) {
    // fallback: navigate directly to the services page
    await page.goto('https://www.epam.com/services', { waitUntil: 'networkidle' });
  }

  // 3) Locate the "Explore Our Client Work" link and activate it.
  const exploreLink = page.getByRole('link', { name: /Explore Our Client Work/i }).first();
  try {
    await exploreLink.waitFor({ state: 'visible', timeout: 4000 });
    await exploreLink.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
  } catch (err) {
    const fallbackLocator = page.locator('a', { hasText: /Explore Our Client Work/i }).first();
    if (await fallbackLocator.count() > 0) {
      const href = await fallbackLocator.getAttribute('href');
      if (href) {
        const target = href.startsWith('http') ? href : new URL(href, 'https://www.epam.com').toString();
        await page.goto(target, { waitUntil: 'networkidle' });
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  // 4) Verify "Client Work" text is visible on the resulting page
  const clientWorkLocator = page.getByRole('heading', { name: /Client Work/i }).first();
  if (await clientWorkLocator.count() > 0) {
    await expect(clientWorkLocator).toBeVisible({ timeout: 5000 });
  } else {
    const textLocator = page.locator('text=/Client Work/i');
    await expect(textLocator.first()).toBeVisible({ timeout: 5000 });
  }

  // Optional: capture screenshot for evidence
  await page.screenshot({ path: 'client-work-page.png', fullPage: true });
});
