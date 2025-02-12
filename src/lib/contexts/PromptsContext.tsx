import { AI_MODELS } from "@/lib/constants";
import { Prompt, fetchPrompts } from "@/lib/utils/prompts";
import { isDarkModeStorage, isDevModeStorage, selectedModelStorage, useStorage } from "@/lib/utils/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface PromptsContextType {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  isLoading: boolean;
  error: Error | null;
  query: string;
  devMode: boolean;
  selectedModel: string;
  isDarkMode: boolean;
  setIsDarkMode: (newValue: boolean) => Promise<void>;
  setQuery: (query: string) => void;
  setDevMode: (newValue: boolean) => Promise<void>;
  setSelectedModel: (newValue: string) => Promise<void>;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState("");

  const { value: isDarkMode, setValue: setIsDarkMode } = useStorage({
    storageItem: isDarkModeStorage,
    defaultValue: false
  });

  const { value: isDevMode, setValue: setDevMode } = useStorage({
    storageItem: isDevModeStorage,
    defaultValue: false
  });

  const { value: selectedModel, setValue: setSelectedModel } = useStorage({
    storageItem: selectedModelStorage,
    defaultValue: AI_MODELS[0].id
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setIsLoading(true);
    fetchPrompts()
      .then(setPrompts)
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to fetch prompts')))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = !query ||
        prompt.act.toLowerCase().includes(query.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(query.toLowerCase());

      const matchesDevMode = !isDevMode || prompt.for_devs === true;

      return matchesSearch && matchesDevMode;
    })
    .sort((a, b) => a.act.localeCompare(b.act));

  const value = useMemo(() => ({
    prompts,
    filteredPrompts,
    isLoading: isLoading,
    error,
    query,
    devMode: isDevMode,
    selectedModel,
    isDarkMode,
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel,
  }), [
    prompts,
    filteredPrompts,
    isLoading,
    error,
    query,
    isDevMode,
    selectedModel,
    isDarkMode,
    setIsDarkMode,
    setQuery,
    setDevMode,
    setSelectedModel
  ]);

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePromptsContext() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
