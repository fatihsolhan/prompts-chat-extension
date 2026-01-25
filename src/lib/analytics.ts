const MEASUREMENT_ID = 'G-DJHNJ4X9N5';
const API_SECRET = 'ZVcFULe_SR2Q0yxrhAl7Jg';

let clientId: string | null = null;
let platformInfo: PlatformInfo | null = null;

// requestIdleCallback polyfill for environments that don't support it
const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, options);
  }
  // Fallback: use setTimeout with a small delay
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, options?.timeout ?? 1) as unknown as number;
};

// Deferred execution for non-critical analytics
function deferredTrack(fn: () => Promise<void>): void {
  requestIdleCallbackPolyfill(() => {
    fn().catch(() => {});
  }, { timeout: 2000 });
}

interface PlatformInfo {
  browser: string;
  os: string;
  context: 'popup' | 'sidepanel' | 'unknown';
  version: string;
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
  if (ua.includes('Chrome')) return 'chrome';
  return 'unknown';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'windows';
  if (ua.includes('Mac')) return 'macos';
  if (ua.includes('Linux')) return 'linux';
  if (ua.includes('Android')) return 'android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'ios';
  return 'unknown';
}

function detectContext(): 'popup' | 'sidepanel' | 'unknown' {
  const root = document.getElementById('root');
  const context = root?.dataset.context;
  if (context === 'popup') return 'popup';
  if (context === 'sidepanel') return 'sidepanel';
  return 'unknown';
}

function getPlatformInfo(): PlatformInfo {
  if (platformInfo) return platformInfo;

  platformInfo = {
    browser: detectBrowser(),
    os: detectOS(),
    context: detectContext(),
    version: browser.runtime.getManifest().version,
  };

  return platformInfo;
}

async function getClientId(): Promise<string> {
  if (clientId) return clientId;

  try {
    const result = await browser.storage.local.get('ga_client_id');
    const storedId = result.ga_client_id;
    if (typeof storedId === 'string' && storedId) {
      clientId = storedId;
      return clientId;
    }

    clientId = crypto.randomUUID();
    await browser.storage.local.set({ ga_client_id: clientId });
    return clientId;
  } catch {
    clientId = crypto.randomUUID();
    return clientId;
  }
}

async function sendEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  if (!API_SECRET) return;

  try {
    const cid = await getClientId();
    const platform = getPlatformInfo();

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
                browser: platform.browser,
                os: platform.os,
                context: platform.context,
                ext_version: platform.version,
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

// Deferred tracking for non-critical events (waits for idle time)
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  deferredTrack(() => sendEvent(name, params));
}

// Immediate tracking for critical events like extension_opened
export function trackEventImmediate(
  name: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  return sendEvent(name, params);
}

export const analytics = {
  // Core actions
  promptCopied: (promptId: string, category?: string, promptType?: string) =>
    trackEvent('prompt_copied', {
      prompt_id: promptId,
      category: category || 'unknown',
      prompt_type: promptType || 'TEXT',
    }),

  promptRun: (promptId: string, aiPlatform: string, category?: string, promptType?: string) =>
    trackEvent('prompt_run', {
      prompt_id: promptId,
      ai_platform: aiPlatform,
      category: category || 'unknown',
      prompt_type: promptType || 'TEXT',
    }),

  promptViewed: (promptId: string, promptType?: string, category?: string) =>
    trackEvent('prompt_viewed', {
      prompt_id: promptId,
      prompt_type: promptType || 'TEXT',
      category: category || 'unknown',
    }),

  // Discovery
  filterApplied: (filterType: 'category' | 'tag' | 'type' | 'sort', value: string) =>
    trackEvent('filter_applied', { filter_type: filterType, value }),

  searchPerformed: (hasResults: boolean, resultCount?: number) =>
    trackEvent('search_performed', {
      has_results: hasResults,
      result_count: resultCount || 0,
    }),

  // Session (immediate - these should fire right away)
  extensionOpened: () =>
    trackEventImmediate('extension_opened'),

  sidepanelOpened: () =>
    trackEventImmediate('sidepanel_opened'),

  // Engagement
  variableFilled: (promptId: string, variableCount: number) =>
    trackEvent('variable_filled', { prompt_id: promptId, variable_count: variableCount }),

  externalLinkClicked: (destination: 'prompts_chat' | 'github' | 'author_profile') =>
    trackEvent('external_link_clicked', { destination }),

  // Errors (useful for debugging)
  errorOccurred: (errorType: string, context?: string) =>
    trackEvent('error_occurred', { error_type: errorType, context: context || 'unknown' }),
};

