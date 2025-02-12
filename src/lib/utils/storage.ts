import { useEffect, useState } from 'react';
import { storage } from 'wxt/storage';
import { AI_MODELS } from '../constants';

export interface StorageData {
  selectedModel: string;
  isDarkMode: boolean;
  isDevMode: boolean;
}

export const selectedModelStorage = storage.defineItem<string>('sync:selectedModel', {
  fallback: AI_MODELS[0].id,
  version: 1,
});

export const isDarkModeStorage = storage.defineItem<boolean>('local:isDarkMode', {
  fallback: false,
  version: 1,
});

export const isDevModeStorage = storage.defineItem<boolean>('local:isDevMode', {
  fallback: false,
  version: 1,
});

interface UseStorageOptions<T> {
  storageItem: ReturnType<typeof storage.defineItem<T>>;
  defaultValue: T;
}

export function useStorage<T>({ storageItem, defaultValue }: UseStorageOptions<T>) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    storageItem.getValue().then((storedValue) => {
      if (isMounted) {
        setValue(storedValue ?? defaultValue);
        setIsLoading(false);
      }
    });

    const unwatch = storageItem.watch((newValue) => {
      if (isMounted) {
        setValue(newValue ?? defaultValue);
      }
    });

    return () => {
      isMounted = false;
      unwatch();
    };
  }, [storageItem, defaultValue]);

  const updateValue = async (newValue: T) => {
    try {
      if (storageItem === selectedModelStorage && !AI_MODELS.some(model => model.id === newValue)) {
        throw new Error('Invalid model ID');
      }
      await storageItem.setValue(newValue);
    } catch (error) {
      console.error(`Error saving storage value:`, error);
      throw error;
    }
  };

  return { value, isLoading, setValue: updateValue };
}
