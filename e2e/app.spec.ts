import { test, expect } from '@playwright/test';

// BROKEN BRANCH: these tests intentionally fail to demonstrate
// what happens when E2E tests are not maintained after migration.

test('home page has correct title', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // This will fail: title is empty in AngularJS before JS loads
  await expect(page).toHaveTitle('Conduit - Home', { timeout: 5000 });
});

test('login form has email and password fields', async ({ page }) => {
  await page.goto('/#/login');
  await page.waitForTimeout(2000);
  // This will fail: AngularJS has not rendered yet in headless mode
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 3000 });
});

test('register form submits successfully', async ({ page }) => {
  await page.goto('/#/register');
  await page.waitForTimeout(2000);
  // This will fail: form is not rendered yet
  await expect(page.locator('input[ng-model="vm.formData.username"]')).toBeVisible({ timeout: 3000 });
});

test('article feed loads articles from API', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  // This will fail: no articles loaded because API is not mocked
  await expect(page.locator('.article-preview')).toHaveCount(10, { timeout: 5000 });
});