import { storage } from '@wxt-dev/storage';
import { useEffect, useState } from 'react';

// Define storage items with type safety
export const selectedModelStorage = storage.defineItem<string>('sync:selectedModel', {
  fallback: 'chatgpt',
});

export const isDarkModeStorage = storage.defineItem<boolean>('sync:isDarkMode', {
  fallback: false,
});

// Note: ga_client_id initialization is handled in analytics.ts since it needs
// to generate a unique UUID on first access (storage.defineItem doesn't support functions)
export const gaClientIdStorage = storage.defineItem<string>('local:ga_client_id');

// React hook for WXT storage with type safety
export function useWxtStorage<T>(item: ReturnType<typeof storage.defineItem<T>>) {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    item.getValue().then(v => {
      setValue(v);
      setIsLoading(false);
    });

    const unwatch = item.watch(newValue => setValue(newValue));
    return unwatch;
  }, [item]);

  const update = async (newValue: T | ((prev: T | null) => T)) => {
    const valueToSet = typeof newValue === 'function'
      ? (newValue as (prev: T | null) => T)(value)
      : newValue;
    await item.setValue(valueToSet);
  };

  return { value, isLoading, setValue: update };
}
