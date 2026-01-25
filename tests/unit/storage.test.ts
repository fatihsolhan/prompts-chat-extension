import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '../../src/lib/utils/storage';

declare const global: typeof globalThis & {
  browser: {
    storage: {
      sync: {
        get: ReturnType<typeof vi.fn>;
        set: ReturnType<typeof vi.fn>;
        onChanged: {
          addListener: ReturnType<typeof vi.fn>;
          removeListener: ReturnType<typeof vi.fn>;
        };
      };
    };
  };
};


describe('useStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.browser.storage.sync.get).mockResolvedValue({});
  });

  it('should return default value initially', async () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'testKey', defaultValue: 'default' })
    );

    expect(result.current.value).toBe('default');
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should load value from storage', async () => {
    vi.mocked(global.browser.storage.sync.get).mockResolvedValue({
      testKey: 'storedValue',
    });

    const { result } = renderHook(() =>
      useStorage({ key: 'testKey', defaultValue: 'default' })
    );

    await waitFor(() => {
      expect(result.current.value).toBe('storedValue');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should update value and persist to storage', async () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'testKey', defaultValue: 'default' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setValue('newValue');
    });

    expect(result.current.value).toBe('newValue');
    expect(global.browser.storage.sync.set).toHaveBeenCalledWith({ testKey: 'newValue' });
  });

  it('should support updater function', async () => {
    vi.mocked(global.browser.storage.sync.get).mockResolvedValue({ counter: 5 });

    const { result } = renderHook(() =>
      useStorage({ key: 'counter', defaultValue: 0 })
    );

    await waitFor(() => expect(result.current.value).toBe(5));

    await act(async () => {
      await result.current.setValue((prev: number) => prev + 1);
    });

    expect(result.current.value).toBe(6);
  });

  it('should register and remove storage change listener', async () => {
    const { unmount } = renderHook(() =>
      useStorage({ key: 'testKey', defaultValue: 'default' })
    );

    await waitFor(() => {
      expect(global.browser.storage.sync.onChanged.addListener).toHaveBeenCalled();
    });

    unmount();

    expect(global.browser.storage.sync.onChanged.removeListener).toHaveBeenCalled();
  });

  it('should validate model ID for selectedModel key', async () => {
    const { result } = renderHook(() =>
      useStorage({ key: 'selectedModel', defaultValue: 'chatgpt' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setValue('claude');
    });
    expect(result.current.value).toBe('claude');

    await expect(
      act(async () => {
        await result.current.setValue('invalid-model');
      })
    ).rejects.toThrow('Invalid model ID');
  });

  it('should handle array values', async () => {
    vi.mocked(global.browser.storage.sync.get).mockResolvedValue({
      selectedTags: ['id1', 'id2'],
    });

    const { result } = renderHook(() =>
      useStorage<string[]>({ key: 'selectedTags', defaultValue: [] })
    );

    await waitFor(() => {
      expect(result.current.value).toEqual(['id1', 'id2']);
    });

    await act(async () => {
      await result.current.setValue(['id1', 'id2', 'id3']);
    });

    expect(global.browser.storage.sync.set).toHaveBeenCalledWith({
      selectedTags: ['id1', 'id2', 'id3'],
    });
  });

  it('should handle boolean values', async () => {
    vi.mocked(global.browser.storage.sync.get).mockResolvedValue({ isDarkMode: true });

    const { result } = renderHook(() =>
      useStorage({ key: 'isDarkMode', defaultValue: false })
    );

    await waitFor(() => expect(result.current.value).toBe(true));

    await act(async () => {
      await result.current.setValue(false);
    });

    expect(result.current.value).toBe(false);
  });
});
