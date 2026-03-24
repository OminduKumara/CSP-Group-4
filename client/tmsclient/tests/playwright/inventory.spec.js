import { test, expect } from '@playwright/test';

test.describe('Inventory Page', () => {
  test('Player can view inventory and request item', async ({ page }) => {
    // Login as player (assume test user exists)
    await page.goto('/login');
    await page.fill('input[name="username"]', 'player1');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/inventory');
    await expect(page.locator('h2')).toHaveText('Inventory');
    // If inventory exists, try to request first item
    const firstRequestBtn = page.locator('button', { hasText: 'Request' }).first();
    if (await firstRequestBtn.isVisible()) {
      await firstRequestBtn.click();
      await page.fill('input[type="number"]', '1');
      await page.fill('input[placeholder="Comment"]', 'Need for practice');
      await page.click('button', { hasText: 'Request' });
      await expect(page.locator('h3')).toContainText('Transactions');
    }
  });

  test('Admin can add and issue inventory', async ({ page }) => {
    // Login as admin (assume test admin exists)
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin1');
    await page.fill('input[name="password"]', 'adminpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    await page.click('button', { hasText: 'Inventory' });
    await page.fill('input[placeholder="Name"]', 'Test Racket');
    await page.fill('input[placeholder="Category"]', 'Racket');
    await page.fill('input[type="number"]', '5');
    await page.click('button', { hasText: 'Add' });
    await expect(page.locator('li')).toContainText('Test Racket');
    // Issue item
    const firstIssueBtn = page.locator('button', { hasText: 'Issue' }).first();
    if (await firstIssueBtn.isVisible()) {
      await firstIssueBtn.click();
      await page.fill('input[type="number"]', '1');
      await page.fill('input[placeholder="Player User ID"]', '2');
      await page.fill('input[placeholder="Comment"]', 'Issued for match');
      await page.click('button', { hasText: 'Issue' });
      await expect(page.locator('h3')).toContainText('Transactions');
    }
  });
});
