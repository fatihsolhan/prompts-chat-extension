import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.join(__dirname, '../../.output/chrome-mv3');

async function getExtensionId(context: BrowserContext): Promise<string> {
  let serviceWorker = context.serviceWorkers().find(sw => sw.url().includes('background'));
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', {
      predicate: sw => sw.url().includes('background'),
      timeout: 30000,
    });
  }

  const match = serviceWorker.url().match(/chrome-extension:\/\/([^/]+)/);
  if (!match) {
    throw new Error('Failed to extract extension ID from service worker URL');
  }
  return match[1];
}

test.describe.serial('Extension Side Panel', () => {
  let context: BrowserContext;
  let extensionId: string;
  let sidePanelPage: Page;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    extensionId = await getExtensionId(context);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('should load side panel', async () => {
    expect(extensionId).toBeDefined();

    sidePanelPage = await context.newPage();
    await sidePanelPage.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await sidePanelPage.waitForLoadState('domcontentloaded');

    await expect(sidePanelPage.locator('#root[data-context="sidepanel"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display prompts.chat branding in side panel', async () => {
    await expect(sidePanelPage.locator('text=prompts.chat').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search input in side panel', async () => {
    await expect(sidePanelPage.locator('input[placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show side panel notice or render app correctly', async () => {
    const notice = sidePanelPage.locator('[data-testid="sidepanel-notice"]');
    const hasNotice = (await notice.count()) > 0;

    if (hasNotice) {
      await expect(notice).toBeVisible();
    } else {
      await expect(sidePanelPage.locator('#root')).toBeVisible();
    }
  });
});
