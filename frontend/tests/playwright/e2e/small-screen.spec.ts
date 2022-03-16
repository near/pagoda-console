import { test, devices, expect } from "@playwright/test";

test.use({
  ...devices["iPhone 11"],
});

test("test", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "networkidle",
  });

  await page
    .locator("text=See you on the big screen!")
    .waitFor({ state: "visible" });

  await page
    .locator(
      "text=We’re working to deliver the best mobile experience possible. In the meantime, please visit us on a device with a larger screen."
    )
    .waitFor({ state: "visible" });
});
