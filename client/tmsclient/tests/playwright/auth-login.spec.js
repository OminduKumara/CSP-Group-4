import { test, expect } from '@playwright/test';

const loginApi = '**/api/auth/login';

// Prompt: Generate a Playwright test that validates a successful player login and redirects to /dashboard.
test('logs in as a player and redirects to dashboard', async ({ page }) => {
  await page.route(loginApi, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 10,
        username: 'player1',
        identityNumber: 'it23575776',
        email: 'player1@sliit.lk',
        role: 'Player',
        isApproved: true,
        approvedAt: new Date().toISOString(),
        token: 'mock-player-token'
      })
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Email or Identity Number').fill('it23575776');
  await page.getByPlaceholder('Password').fill('Pass@123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

// Prompt: Generate a Playwright test that validates an admin login redirects to /admin.
test('logs in as admin and redirects to admin dashboard', async ({ page }) => {
  await page.route(loginApi, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'admin',
        identityNumber: 'it10000001',
        email: 'admin@sliit.lk',
        role: 'Admin',
        isApproved: true,
        approvedAt: new Date().toISOString(),
        token: 'mock-admin-token'
      })
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Email or Identity Number').fill('admin@sliit.lk');
  await page.getByPlaceholder('Password').fill('Pass@123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Pending Registration Requests' })).toBeVisible();
});

// Prompt: Generate a Playwright test that shows an error message when login API returns 401.
test('shows login error message for invalid credentials', async ({ page }) => {
  await page.route(loginApi, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' })
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Email or Identity Number').fill('wrong-user');
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
