/// <reference types="chrome"/>
import { buildPlatformUrl, getPlatformById } from '@/lib/constants';

interface UsePromptMessage {
  action: 'usePrompt';
  data?: {
    modelId: string;
    prompt: string;
  };
}

interface InsertPromptMessage {
  action: 'insertPrompt';
  data: {
    prompt: string;
    inputSelector: string;
  };
}

type Message = UsePromptMessage | InsertPromptMessage;

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
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  if (tabs.length > 0) {
    return tabs[0];
  }

  const allTabs = await chrome.tabs.query({
    lastFocusedWindow: true
  });

  return allTabs[0];
}

async function insertPrompt({ prompt, inputSelector }: { prompt: string; inputSelector: string }) {
  const activeTab = await getActiveTab();
  if (!activeTab?.id) return { success: false };

  try {
    return await chrome.tabs.sendMessage(activeTab.id, {
      action: 'insertPrompt',
      data: { prompt, inputSelector }
    });
  } catch {
    return { success: false };
  }
}

function waitForTabToLoad(requestedTabId: number): Promise<chrome.tabs.Tab> {
  return new Promise(resolve => {
    const listener = (tabId: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (info.status === 'complete' && tabId === requestedTabId) {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(tab);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
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
      const tab = await chrome.tabs.create({ url });
      return !!tab?.id;
    }

    if (platform.inputSelector) {
      const tabCreated = await chrome.tabs.create({ url: platform.baseUrl });
      if (!tabCreated?.id) return false;

      await waitForTabToLoad(tabCreated.id);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await insertPrompt({ prompt, inputSelector: platform.inputSelector });
      return response?.success ?? false;
    }

    const tab = await chrome.tabs.create({ url: platform.baseUrl });
    return !!tab?.id;
  } catch (error) {
    console.error('Error in handleUsePrompt:', error);
    return false;
  }
}

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
  if (message.action === 'usePrompt') {
    handleUsePrompt(message as UsePromptMessage)
      .then(success => sendResponse({ success }));
    return true;
  }
});
