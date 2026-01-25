import { buildPlatformUrl, getPlatformById } from '@/lib/constants';
import type { Browser } from 'wxt/browser';

interface UsePromptMessage {
  action: string;
  data?: {
    modelId: string;
    prompt: string;
  };
}

export default defineBackground(() => {
  function isOnModelDomain(currentUrl: string, baseUrl: string): boolean {
    try {
      const currentUrlObj = new URL(currentUrl);
      const baseUrlObj = new URL(baseUrl);
      return currentUrlObj.hostname === baseUrlObj.hostname;
    } catch {
      return false;
    }
  }

  async function getActiveTab() {
    const tabs = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (tabs.length > 0) {
      return tabs[0];
    }

    const allTabs = await browser.tabs.query({
      lastFocusedWindow: true
    });

    return allTabs[0];
  }

  async function insertPrompt({ prompt, inputSelector }: { prompt: string; inputSelector: string }) {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) return { success: false };

    try {
      return await browser.tabs.sendMessage(activeTab.id, {
        action: 'insertPrompt',
        data: { prompt, inputSelector }
      });
    } catch {
      return { success: false };
    }
  }

  function waitForTabToLoad(requestedTabId: number): Promise<Browser.tabs.Tab> {
    return new Promise(resolve => {
      const listener = (tabId: number, info: Browser.tabs.OnUpdatedInfo, tab: Browser.tabs.Tab) => {
        if (info.status === 'complete' && tabId === requestedTabId) {
          browser.tabs.onUpdated.removeListener(listener);
          resolve(tab);
        }
      };
      browser.tabs.onUpdated.addListener(listener);
    });
  }

  async function handleUsePrompt(message: UsePromptMessage) {
    if (!message.data) return false;

    const { modelId, prompt } = message.data;
    const platform = getPlatformById(modelId);
    if (!platform) return false;

    try {
      const activeTab = await getActiveTab();

      const isOnDomain = activeTab?.url && isOnModelDomain(activeTab.url, platform.baseUrl);

      if (isOnDomain && platform.inputSelector) {
        const response = await insertPrompt({ prompt, inputSelector: platform.inputSelector });
        if (response?.success) return true;
      }

      if (platform.supportsQuerystring || platform.isDeeplink) {
        const url = buildPlatformUrl(platform.id, platform.baseUrl, prompt);
        const tab = await browser.tabs.create({ url });
        return !!tab?.id;
      }

      if (platform.inputSelector) {
        const tabCreated = await browser.tabs.create({ url: platform.baseUrl });
        if (!tabCreated?.id) return false;

        await waitForTabToLoad(tabCreated.id);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await insertPrompt({ prompt, inputSelector: platform.inputSelector });
        return response?.success ?? false;
      }

      const tab = await browser.tabs.create({ url: platform.baseUrl });
      return !!tab?.id;
    } catch (error) {
      console.error('Error in handleUsePrompt:', error);
      return false;
    }
  }

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'usePrompt') {
      handleUsePrompt(message)
        .then(success => sendResponse({ success }));
      return true;
    }
  });
});
