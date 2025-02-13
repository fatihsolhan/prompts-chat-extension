import { Page } from "playwright/test";
import { expect } from "../fixtures";

export async function openPopup(page: Page, extensionId: string) {
  const popup = await page.goto(`chrome-extension://${extensionId}/popup.html`);
  expect(popup).toBeDefined();
  const promptList = page.getByTestId('prompt-list');
  await promptList.waitFor({ state: 'visible' });
}
