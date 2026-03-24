import { test, expect } from '@playwright/test';

const signupApi = '**/api/auth/signup';

// Prompt: Generate a Playwright test that validates password mismatch in signup form without backend dependency.
test('shows validation error for mismatched passwords', async ({ page }) => {
  await page.goto('/signup');

  await page.getByPlaceholder('Username').fill('newplayer');
  await page.getByPlaceholder('Identity Number').fill('it23999999');
  await page.getByPlaceholder('Email').fill('newplayer@sliit.lk');
  await page.getByPlaceholder('Password').fill('Pass@123');
  await page.getByPlaceholder('Confirm Password').fill('Pass@456');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page.getByText('Passwords do not match')).toBeVisible();
  await expect(page).toHaveURL(/\/signup$/);
});

// Prompt: Generate a Playwright test that validates successful signup redirects the user to /login.
test('signs up successfully and redirects to login', async ({ page }) => {
  await page.route(signupApi, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Signup successful' })
    });
  });

  await page.goto('/signup');

  await page.getByPlaceholder('Username').fill('newplayer');
  await page.getByPlaceholder('Identity Number').fill('it23999999');
  await page.getByPlaceholder('Email').fill('newplayer@sliit.lk');
  await page.getByPlaceholder('Password').fill('Pass@123');
  await page.getByPlaceholder('Confirm Password').fill('Pass@123');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
