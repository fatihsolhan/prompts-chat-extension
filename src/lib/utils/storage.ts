import { useCallback, useEffect, useState } from 'react';
import { AI_MODELS } from '../constants';

export function useStorage<T>({
  key,
  defaultValue
}: {
  key: string;
  defaultValue: T;
}) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chrome?.storage) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    chrome.storage.sync.get(key).then(result => {
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

    chrome.storage.sync.onChanged.addListener(handleChange);

    return () => {
      isMounted = false;
      chrome.storage.sync.onChanged.removeListener(handleChange);
    };
  }, [key, defaultValue]);

  const updateValue = useCallback(async (newValueOrUpdater: T | ((prev: T) => T)) => {
    const newValue = typeof newValueOrUpdater === 'function'
      ? (newValueOrUpdater as (prev: T) => T)(value)
      : newValueOrUpdater;

    if (key === 'selectedModel' && typeof newValue === 'string') {
      if (!AI_MODELS.some(model => model.id === newValue)) {
        throw new Error('Invalid model ID');
      }
    }

    if (chrome?.storage) {
      await chrome.storage.sync.set({ [key]: newValue });
    }
    setValue(newValue);
  }, [key, value]);

  return { value, isLoading, setValue: updateValue };
}
