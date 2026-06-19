import { test, expect } from "@playwright/test";

test.describe("Expert System Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("renders the dashboard header", async ({ page }) => {
    await expect(
      page.getByText("Expert System — Precision Agriculture")
    ).toBeVisible();
  });

  test("shows crop and stage info", async ({ page }) => {
    await expect(page.getByText(/Crop:.*Tomato/)).toBeVisible();
  });

  test("has Step, Auto, and Reset buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Step" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Auto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("starts showing data on Step click", async ({ page }) => {
    const stepBtn = page.getByRole("button", { name: "Step" });
    await stepBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.getByText("Sensor Readings Over Time")).toBeVisible();
    await expect(page.getByText("Current Sensor Status")).toBeVisible();
    await expect(page.getByText("Decisions")).toBeVisible();
  });

  test("Auto mode streams multiple steps", async ({ page }) => {
    await page.getByRole("button", { name: "Auto" }).click();
    await page.waitForTimeout(4000);
    const stopBtn = page.getByRole("button", { name: "Stop" });
    await expect(stopBtn).toBeVisible();
  });
});
