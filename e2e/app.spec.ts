import { test, expect } from '@playwright/test';

test('home page responds with 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('page has html structure', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  const html = await page.content();
  expect(html).toContain('<html');
  expect(html).toContain('main.js');
});

test('login route responds', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await page.goto('/#/login');
  const html = await page.content();
  expect(html).toContain('<html');
});

test('register route responds', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await page.goto('/#/register');
  const html = await page.content();
  expect(html).toContain('<html');
});