/**
 * FencePro screenshot capture script.
 *
 * Drives the dev server (must already be running on http://localhost:3001)
 * through the canonical demo flows and saves desktop + mobile screenshot
 * pairs into docs/screenshots/.
 *
 * Usage:
 *   npm run dev           # in one terminal
 *   npm run screenshots   # in another
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const URL = "http://localhost:3001";
const OUT = "docs/screenshots";

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 },
};

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(name, viewport, run) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await run(page);
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  ✓ ${path}`);
  await ctx.close();
}

async function bothViewports(baseName, run) {
  for (const [variant, viewport] of Object.entries(VIEWPORTS)) {
    const suffix = variant === "mobile" ? "-mobile" : "";
    await shoot(`${baseName}${suffix}`, viewport, run);
  }
}

console.log("Capturing FencePro screenshots...");

console.log("\n[1/6] Dashboard");
await bothViewports("dashboard", async (page) => {
  await page.waitForSelector("text=Rocky Mtn Fence Co.", { timeout: 5000 }).catch(async () => {
    await page.waitForSelector("text=Acme Fence Co.", { timeout: 5000 });
  });
  await page.waitForTimeout(800);
});

console.log("\n[2/6] New Estimate (mid-flow)");
await bothViewports("new-estimate", async (page) => {
  await page.click("text=+ New Estimate");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^[A-Z][a-z]+ County$/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page.waitForSelector("text=Wood Privacy");
  await page.waitForTimeout(400);
});

console.log("\n[3/6] Estimate card (full chat flow)");
await bothViewports("estimate-card", async (page) => {
  await page.click("text=+ New Estimate");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^[A-Z][a-z]+ County$/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page.click("text=Wood Privacy");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1500);
  await page.waitForSelector("text=YOUR ESTIMATE");
  await page.waitForTimeout(400);
});

console.log("\n[4/6] Mock checkout");
await bothViewports("mock-checkout", async (page) => {
  await page.click("text=+ New Estimate");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^[A-Z][a-z]+ County$/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page.click("text=Wood Privacy");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1500);
  await page.fill("input[placeholder='Client name']", "Demo Client");
  await page.fill("input[placeholder='Client email']", "demo@example.com");
  await page.locator("button", { hasText: /Send Estimate/ }).click();
  await page.waitForTimeout(1500);
  // Navigate back to dashboard, then use the demo shortcut Link
  // (React Router-aware so the in-memory session is preserved).
  // Clicking the email's raw <a> would cause a full reload and drop the
  // session map — known issue tracked for v0.1.1.
  // The icon text "DSH" is always visible; the "DASH" label is hidden on mobile.
  await page.locator("button", { hasText: "DSH" }).first().click();
  await page.waitForTimeout(500);
  await page.locator("text=/simulate payment/i").first().click();
  await page.waitForURL(/\/checkout\//, { timeout: 5000 });
  await page.waitForTimeout(800);
});

console.log("\n[5/6] Email preview (estimate)");
await bothViewports("email-preview", async (page) => {
  await page.click("text=+ New Estimate");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^[A-Z][a-z]+ County$/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page.click("text=Wood Privacy");
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1100);
  await page
    .locator("button", { hasText: /^Confirm:/ })
    .first()
    .click();
  await page.waitForTimeout(1500);
  await page.fill("input[placeholder='Client name']", "Demo Client");
  await page.fill("input[placeholder='Client email']", "demo@example.com");
  await page.locator("button", { hasText: /Send Estimate/ }).click();
  await page.waitForTimeout(1500);
  // Click toast to open the preview modal
  await page.locator("text=/EMAIL SENT/").first().click();
  await page.waitForTimeout(500);
});

console.log("\n[6/6] Project detail");
await bothViewports("project-detail", async (page) => {
  await page.waitForSelector("text=Acme Fence Co.").catch(() => {});
  await page.waitForTimeout(500);
  // Click first sample project (matches both desktop table row + mobile card)
  await page.locator("text=/Sample Client/i").first().click();
  await page.waitForSelector("text=Financial Summary");
  await page.waitForTimeout(400);
});

await browser.close();
console.log("\nAll screenshots captured.");
