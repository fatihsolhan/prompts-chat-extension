import { AI_MODELS } from '@/lib/constants';
import { expect, test } from './fixtures';
import { openPopup } from './pages/popup';

test.describe('prompts.chat alignment', () => {
  test('it should have same number of prompts', async ({ page, extensionId }) => {
    await page.goto('https://prompts.chat/');
    const remotePrompts = await page.locator('.prompt-card:not(.contribute-card)').count();
    await openPopup(page, extensionId);
    const promptCards = await page.getByTestId('prompt-card').all();
    const localPrompts = promptCards.length;
    expect(localPrompts).toBe(remotePrompts);
  })

  test('it should have same prompt titles', async ({ page, extensionId }) => {
    await page.goto('https://prompts.chat/');
    const remotePrompts = page.locator('.prompt-card:not(.contribute-card)')
    const titleElements = await remotePrompts.locator('.prompt-title').all();
    const titles = await Promise.all(titleElements.map(async title => {
      const innerText = await title.innerText();
      return innerText.trim().replace('’', '\'');
    })).then(titles => titles.sort());

    await openPopup(page, extensionId);
    const promptCards = await page.getByTestId('prompt-card').all();
    const localTitles = await Promise.all(promptCards.map(async card => {
      const innerText = await card.locator('h3').innerText();
      return innerText.trim();
    })).then(titles => titles.sort());

    expect(localTitles).toEqual(expect.arrayContaining(titles));
  });

  test.skip('it should have same prompt contents', {
    annotation: {
      type: 'issue',
      description: 'We have to figure out source of truth with the remote prompts. Whether parse from CSV or from the README.md'
    }
  }, async ({ page, extensionId }) => {
    await page.goto('https://prompts.chat/');
    const remotePrompts = await page.locator('.prompt-card:not(.contribute-card)').all();
    const contents = await Promise.all(remotePrompts.map(async card => {
      const content = await card.locator('.prompt-content').innerText();
      return content.trim();
    })).then(contents => contents.sort());

    await openPopup(page, extensionId);
    const promptCards = await page.getByTestId('prompt-card').all();
    const localContents = await Promise.all(promptCards.map(async card => {
      const content = await card.locator('p').innerText();
      return content.trim();
    })).then(contents => contents.sort());

    expect(localContents).toEqual(contents);
  });
})

test.describe('UI tests', () => {
  test('it should display the prompt list', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    const promptList = page.locator('[data-testid="prompt-list"]');
    await expect(promptList).toBeVisible();
  });

  test('it should be able to search for a prompt', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    const prompt = 'Act as a Unit Tester Assistant';
    const input = page.locator('input');
    await input.fill(prompt);
    const promptTitle = page.locator('h3', { hasText: prompt });
    await expect(promptTitle).toBeVisible();
  });

  test('it should be able to toggle dev mode', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    const nonDevPrompt = 'Act as an AI Assisted Doctor'
    const devPrompt = 'Act as a Unit Tester Assistant'
    const input = page.locator('input');

    await input.fill(nonDevPrompt);
    const nonDevPromptTitle = page.locator('h3', { hasText: nonDevPrompt });
    await expect(nonDevPromptTitle).toBeVisible();

    const devModeToggle = page.getByTestId('dev-mode-toggle');
    await devModeToggle.click();

    await input.clear();
    await input.fill(devPrompt);
    const devPromptTitle = page.locator('h3', { hasText: devPrompt });
    await expect(devPromptTitle).toBeVisible();
    await expect(nonDevPromptTitle).not.toBeVisible();
  });

  test('it should be able to expand a prompt', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);;
    const firstPromptCard = page.getByTestId('prompt-card').first();
    const showMoreButton = firstPromptCard.getByTestId('show-more-button');
    let showMoreButtonBoundingBox = await showMoreButton.boundingBox();
    if (!showMoreButtonBoundingBox) {
      throw new Error('Show more button not found');
    }
    const showMoreButtonY = showMoreButtonBoundingBox.y;
    await showMoreButton.click();

    showMoreButtonBoundingBox = await showMoreButton.boundingBox();
    if (!showMoreButtonBoundingBox) {
      throw new Error('Show more button not found');
    }
    const showLessButtonY = showMoreButtonBoundingBox.y;

    expect(showLessButtonY).toBeGreaterThan(showMoreButtonY);
  });

  test('it should be able to copy a prompt', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const firstPromptCard = page.getByTestId('prompt-card').first();
    const promptText = await firstPromptCard.locator('p').textContent();
    const copyButton = firstPromptCard.getByTestId('copy-button');
    await copyButton.click();
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(promptText);
  });

  test('it should be able to parse contributors', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    const nonDefaultContributor = page.getByTestId('prompt-card').locator('a', { hasNotText: '@f' }).first();
    await expect(nonDefaultContributor).toBeVisible();
  });
})

test.describe('it should send the prompt to the selected AI model', () => {
  test('prompt url is supported by the AI model', async ({ page, extensionId }) => {
    await openPopup(page, extensionId);
    const promptCard = page.getByTestId('prompt-card').first();
    const prompt = await promptCard.locator('p').textContent();
    const selectModelButton = promptCard.getByTestId('select-model-button');
    const usePromptButton = promptCard.getByTestId('use-prompt-button');
    const model = AI_MODELS.find(model => model.id === 'chatgpt');
    if (!model) {
      throw new Error('Model not found');
    }
    const selectModelItem = page.getByTestId(`select-model-item-${model.id}`);
    await selectModelButton.click();
    await selectModelItem.click();

    const newTab = page.context().waitForEvent('page');

    await usePromptButton.click();

    const newPage = await newTab;
    const url = model.promptUrl.replace('{prompt}', encodeURIComponent(prompt || ''));
    await expect(newPage).toHaveURL(url);

    const inputOrContentEditable = newPage.locator(model.inputSelector);
    await expect(inputOrContentEditable).toBeVisible();
    const inputOrContentEditableText = await inputOrContentEditable.textContent();
    expect(inputOrContentEditableText).toBe(prompt || '');
  })

  test.skip('prompt url is not supported by the AI model', {
    annotation: {
      type: 'issue',
      description: 'Gemini does not have prompt url but it requires a login to use it so we skip this test'
    }
  }, async ({ }) => { })
})
