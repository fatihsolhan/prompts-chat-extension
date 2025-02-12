import { AI_MODELS } from '@/lib/constants';
import { hasSameDomain } from '@/lib/utils/dom';
import { onMessage, sendMessage } from 'webext-bridge/background';
import { Tabs } from 'wxt/browser';

export default defineBackground(() => {
  const getActiveTab = async () => {
    const [activeTab] = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (activeTab) return activeTab;

    const [firstTab] = await browser.tabs.query({
      lastFocusedWindow: true
    });

    return firstTab;
  }

  const constructPromptUrl = (promptUrl: string, prompt: string) => {
    return promptUrl.replace('{prompt}', encodeURIComponent(prompt));
  }

  const waitForTabToLoad = (requestedTabId: number) => {
    return new Promise((resolve) => {
      const handleTabUpdate = (tabId: number, info: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab) => {
        if (info.status === 'complete' && tabId === requestedTabId) {
          browser.tabs.onUpdated.removeListener(handleTabUpdate);
          resolve(tab);
        }
      }
      browser.tabs.onUpdated.addListener(handleTabUpdate);
    });
  }

  const insertPrompt = async ({ prompt, inputSelector }: { prompt: string, inputSelector: string }) => {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) return { success: false };

    try {
      const response = await sendMessage('insertPrompt', {
        prompt,
        inputSelector
      }, { context: 'content-script', tabId: activeTab.id });
      return response || { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  onMessage('usePrompt', async ({ data }) => {
    const { modelId, prompt } = data;
    const model = AI_MODELS.find(m => m.id === modelId);
    if (!model) return { success: false };

    try {
      const activeTab = await getActiveTab();
      if (!activeTab?.id) return { success: false };

      const isOnDomain = activeTab?.url && hasSameDomain(activeTab.url, model.baseUrl);

      if (isOnDomain) {
        return await insertPrompt({ prompt, inputSelector: model.inputSelector });
      }

      if (model.promptUrl) {
        const promptUrl = constructPromptUrl(model.promptUrl, prompt);
        const tab = await browser.tabs.create({ url: promptUrl });
        return { success: !!tab?.id };
      }

      const tabCreated = await browser.tabs.create({ url: model.baseUrl });
      if (!tabCreated?.id) return { success: false };

      await waitForTabToLoad(tabCreated.id);
      return await insertPrompt({ prompt, inputSelector: model.inputSelector });
    } catch (error) {
      return { success: false };
    }
  });
});
