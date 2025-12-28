const MEASUREMENT_ID = 'G-DJHNJ4X9N5';
const API_SECRET = 'ZVcFULe_SR2Q0yxrhAl7Jg';

let clientId: string | null = null;

async function getClientId(): Promise<string> {
  if (clientId) return clientId;

  try {
    const result = await chrome.storage.local.get('ga_client_id');
    if (result.ga_client_id) {
      clientId = result.ga_client_id;
      return clientId as string;
    }

    clientId = crypto.randomUUID();
    await chrome.storage.local.set({ ga_client_id: clientId });
    return clientId;
  } catch {
    clientId = crypto.randomUUID();
    return clientId;
  }
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  if (!API_SECRET) return;

  try {
    const cid = await getClientId();

    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: cid,
          events: [
            {
              name,
              params: {
                ...params,
                engagement_time_msec: 100,
              },
            },
          ],
        }),
      }
    );
  } catch {
  }
}

export const analytics = {
  promptCopied: (promptId: string, category?: string) =>
    trackEvent('prompt_copied', { prompt_id: promptId, category: category || 'unknown' }),

  promptRun: (promptId: string, platform: string, category?: string) =>
    trackEvent('prompt_run', { prompt_id: promptId, platform, category: category || 'unknown' }),

  promptFavorited: (promptId: string, action: 'add' | 'remove') =>
    trackEvent('prompt_favorite', { prompt_id: promptId, action }),

  promptViewed: (promptId: string, type?: string) =>
    trackEvent('prompt_viewed', { prompt_id: promptId, type: type || 'TEXT' }),

  filterApplied: (filterType: 'category' | 'tag' | 'type' | 'sort', value: string) =>
    trackEvent('filter_applied', { filter_type: filterType, value }),

  searchPerformed: () =>
    trackEvent('search_performed'),

  extensionOpened: () =>
    trackEvent('extension_opened'),
};

