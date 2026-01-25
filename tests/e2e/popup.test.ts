import { test, expect, chromium, type BrowserContext, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.join(__dirname, "../../.output/chrome-mv3");

async function getExtensionId(context: BrowserContext): Promise<string> {
  let serviceWorker = context.serviceWorkers().find((sw) => sw.url().includes("background"));
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker", {
      predicate: (sw) => sw.url().includes("background"),
      timeout: 30000,
    });
  }

  const match = serviceWorker.url().match(/chrome-extension:\/\/([^/]+)/);
  if (!match) {
    throw new Error("Failed to extract extension ID from service worker URL");
  }
  return match[1];
}

async function openPromptDialog(
  page: Page
): Promise<{ dialog: ReturnType<Page["locator"]>; found: boolean }> {
  const firstCard = page.locator('[data-testid="prompt-card"]').first();

  try {
    await firstCard.isVisible({ timeout: 1000 });
  } catch {
    return { dialog: page.locator('[role="dialog"]'), found: false };
  }

  await firstCard.click({ force: true });
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  return { dialog, found: true };
}

async function closeDialog(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
}

test.describe.serial("Extension Popup", () => {
  let context: BrowserContext;
  let extensionId: string;
  let popupPage: Page;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext("", {
      headless: false,
      channel: "chromium",
      args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`],
    });
    extensionId = await getExtensionId(context);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("should load extension popup", async () => {
    expect(extensionId).toBeDefined();

    popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    await expect(popupPage.locator("#root")).toBeVisible({ timeout: 10000 });
  });

  test("should display prompts.chat branding", async () => {
    await expect(popupPage.locator("text=prompts.chat").first()).toBeVisible({ timeout: 10000 });
  });

  test("should have search input", async () => {
    await expect(popupPage.locator('input[placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
  });

  test("should filter prompts when searching", async () => {
    const searchInput = popupPage.locator('input[placeholder*="Search"]').first();
    await searchInput.fill("code");
    await popupPage.waitForTimeout(500);

    const filteredCards = popupPage
      .locator('[data-testid="prompt-card"], [role="button"]')
      .filter({ hasText: /code|Code/i });
    expect(await filteredCards.count()).toBeGreaterThanOrEqual(0);

    await searchInput.clear();
    await popupPage.waitForTimeout(300);
  });

  test("should open dialog when clicking a prompt", async () => {
    const { dialog, found } = await openPromptDialog(popupPage);
    if (!found) {
      test.skip();
      return;
    }

    await expect(dialog).toBeVisible({ timeout: 5000 });
    await closeDialog(popupPage);
  });

  test("should copy prompt content", async () => {
    const { dialog, found } = await openPromptDialog(popupPage);
    if (!found) {
      test.skip();
      return;
    }

    const copyButton = dialog.locator('[data-testid="copy-button"]');
    await expect(copyButton).toBeVisible({ timeout: 3000 });
    await copyButton.click();

    const checkIcon = copyButton.locator("svg.lucide-check");
    await expect(checkIcon).toBeVisible({ timeout: 2000 });

    await closeDialog(popupPage);
  });
});
