import { expect, test } from "@playwright/test";

// Smoke: the deployed shell loads on a phone viewport with zero console errors.
test("title screen loads with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Gaffer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New game" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("no horizontal scroll at phone width", async ({ page }) => {
  await page.goto("./");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
