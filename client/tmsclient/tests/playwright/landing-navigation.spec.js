import { test, expect } from '@playwright/test';

// Prompt: Generate a Playwright test to verify landing page loads and Login button navigates to /login.
test('landing page navigation to login works', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome to SLIIT Tennis' })).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
