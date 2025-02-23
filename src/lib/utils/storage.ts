import { useEffect, useState } from 'react';
import { AI_MODELS } from '../constants';

declare global {
  const browser: typeof chrome;
}

interface StorageWrapper {
  sync: {
    get: <T>(key?: string | string[] | object) => Promise<T>;
    set: (items: object) => Promise<void>;
    onChanged: {
      addListener: (callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void) => void;
      removeListener: (callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void) => void;
    };
  };
}

// Create a safer storage access wrapper
const createStorageWrapper = (): StorageWrapper => {
  const browserAPI = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : undefined;
  const syncStorage = browserAPI?.storage?.sync;

  if (!syncStorage) {
    console.warn('Storage API not available, using fallback storage');
    return {
      sync: {
        get: async <T>(key?: string | string[] | object): Promise<T> => {
          console.debug('Fallback storage get:', key);
          return {} as T;
        },
        set: async (items: object) => {
          console.debug('Fallback storage set:', items);
        },
        onChanged: {
          addListener: () => {
            console.debug('Fallback storage addListener');
          },
          removeListener: () => {
            console.debug('Fallback storage removeListener');
          }
        }
      }
    };
  }

  return { sync: syncStorage as StorageWrapper['sync'] };
};

const storage = createStorageWrapper();

export interface StorageData {
  selectedModel: string;
  isDarkMode: boolean;
  isDevMode: boolean;
}

interface UseStorageOptions<K extends keyof StorageData> {
  key: K;
  defaultValue: StorageData[K];
}

export function useStorage<K extends keyof StorageData>({
  key,
  defaultValue
}: UseStorageOptions<K>) {
  const [value, setValue] = useState<StorageData[K]>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void storage.sync.get<{[key: string]: StorageData[K]}>(key).then(result => {
      if (isMounted) {
        setValue(result[key] ?? defaultValue);
        setIsLoading(false);
      }
    });

    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    storage.sync.onChanged.addListener(handleChange);

    return () => {
      isMounted = false;
      storage.sync.onChanged.removeListener(handleChange);
    };
  }, [key, defaultValue]);

  const updateValue = async (newValue: StorageData[K]) => {
    try {
      if (key === 'selectedModel' && !AI_MODELS.some(model => model.id === newValue)) {
        throw new Error('Invalid model ID');
      }
      await storage.sync.set({ [key]: newValue });
      setValue(newValue);
    } catch (error) {
      console.error(`Error saving storage value for ${key}:`, error);
      throw error;
    }
  };

  return { value, isLoading, setValue: updateValue };
}
