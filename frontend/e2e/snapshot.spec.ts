// example.spec.ts
import { test, expect } from "@playwright/test";

test("login test", async ({ page }) => {
  await page.goto("https://console.pagoda.co");
  expect(await page.screenshot()).toMatchSnapshot("login.png");
});
