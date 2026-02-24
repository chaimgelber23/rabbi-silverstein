import { chromium } from "playwright";
import { mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || "http://localhost:3002";
const label = process.argv[3] || "";
const scrollY = parseInt(process.argv[4] || "0");

const dir = join(__dirname, "../kbt shul/kbt-website/temporary-screenshots");
mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter((f) => f.startsWith("screenshot-"));
const nums = existing.map((f) => parseInt(f.match(/screenshot-(\d+)/)?.[1] || "0"));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(3000);

if (scrollY > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(500);
}

await page.screenshot({ path: join(dir, filename) });
console.log(`Saved: ${join(dir, filename)}`);
await browser.close();
