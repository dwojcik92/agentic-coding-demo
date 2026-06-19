import { test, expect } from "@playwright/test";

test.describe("Expert System Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("renders the hero bar with Expert System title", async ({ page }) => {
    await expect(page.getByText("Expert System", { exact: true })).toBeVisible();
  });

  test("shows crop and stage info", async ({ page }) => {
    await expect(page.getByText(/Tomato/)).toBeVisible();
    await expect(page.getByText(/Stage/)).toBeVisible();
  });

  test("has Stream, Step, and Reset buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Stream" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Step" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("starts showing data on first reading", async ({ page }) => {
    await page.getByRole("button", { name: /Take first reading/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText("Sensor Telemetry")).toBeVisible();
    await expect(page.getByText("Decision Feed")).toBeVisible();
    await expect(page.getByText("System KPIs")).toBeVisible();
  });

  test("Auto mode streams multiple steps", async ({ page }) => {
    await page.getByRole("button", { name: /Take first reading/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Stream" }).click();
    await page.waitForTimeout(4000);
    const pauseBtn = page.getByRole("button", { name: "Pause" });
    await expect(pauseBtn).toBeVisible();
  });

  test("navigates to Rules tab and shows rules", async ({ page }) => {
    await page.getByRole("button", { name: "Rules" }).click();
    await expect(page.getByText("Rule Book")).toBeVisible();
    await expect(page.getByText(/rules loaded/)).toBeVisible();
  });

  test("navigates to Knowledge Base tab", async ({ page }) => {
    await page.getByRole("button", { name: "Knowledge Base" }).click();
    await expect(page.getByText("Knowledge Base", { exact: true })).toBeVisible();
  });

  test("navigates to Decisions tab", async ({ page }) => {
    await page.getByRole("button", { name: "Decisions" }).click();
    await expect(page.getByText("Decision History")).toBeVisible();
  });
});
