import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';

global.fetch = vi.fn();

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9abc-def012345678'),
  },
});

const mockBrowserApi = {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]),
    create: vi.fn().mockResolvedValue({ id: 2 }),
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
  },
};

// @ts-expect-error - mock global browser
global.browser = mockBrowserApi;
// @ts-expect-error - mock global chrome
global.chrome = mockBrowserApi;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
