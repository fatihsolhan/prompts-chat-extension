import { AI_MODELS } from '@/lib/constants';
import { Category, Prompt, Tag } from '@/lib/types';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePromptsQuery } from '../hooks/usePrompts';
import { useWxtStorage, selectedModelStorage, isDarkModeStorage, platformEnabledStorage } from '@/utils/storage';

type SortOption = 'latest' | 'votes' | 'alphabetical';
type TypeFilter = 'all' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

interface PromptsContextValue {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;

  query: string;
  sortBy: SortOption;
  selectedCategory: string | null;
  selectedTags: string[];
  selectedType: TypeFilter;

  categories: Category[];
  allTags: Tag[];

  selectedModel: string;
  isDarkMode: boolean;
  platformEnabled: Record<string, boolean>;
  isPlatformEnabled: (platformId: string) => boolean;

  setQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedType: (type: TypeFilter) => void;
  clearAllFilters: () => void;
  setSelectedModel: (model: string) => Promise<void>;
  setIsDarkMode: (dark: boolean) => Promise<void>;
  setPlatformEnabled: (platformId: string, enabled: boolean) => Promise<void>;
  refetch: () => void;
}

const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

interface PromptsProviderProps {
  children: ReactNode;
}

export function PromptsProvider({ children }: PromptsProviderProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');

  const { value: selectedModel, setValue: setSelectedModel } = useWxtStorage(selectedModelStorage);
  const { value: isDarkMode, setValue: setIsDarkModeStorage } = useWxtStorage(isDarkModeStorage);
  const { value: platformEnabled, setValue: setPlatformEnabledStorage } = useWxtStorage(platformEnabledStorage);

  const isPlatformEnabled = useCallback((platformId: string) => {
    const settings = platformEnabled || {};
    return settings[platformId] !== false; // default to enabled
  }, [platformEnabled]);

  const setPlatformEnabled = useCallback(async (platformId: string, enabled: boolean) => {
    const current = platformEnabled || {};
    await setPlatformEnabledStorage({ ...current, [platformId]: enabled });
  }, [platformEnabled, setPlatformEnabledStorage]);

  // Wrapper for setIsDarkMode that also updates DOM immediately
  const setIsDarkMode = useCallback(async (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark);
    return setIsDarkModeStorage(dark);
  }, [setIsDarkModeStorage]);

  const {
    prompts,
    categories,
    totalCount,
    isLoading,
    error,
    refetch,
  } = usePromptsQuery();

  const allTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    prompts.forEach(p => {
      p.tags?.forEach(t => {
        if (!tagMap.has(t.name)) {
          tagMap.set(t.name, t);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    // Cache lowercase query once for all comparisons
    const lowerQuery = query ? query.toLowerCase() : '';
    const hasQuery = lowerQuery.length > 0;
    const hasCategory = selectedCategory !== null;
    const hasTags = selectedTags.length > 0;
    const hasType = selectedType !== 'all';

    // Single pass filter combining all conditions
    const result = prompts.filter(p => {
      // Query filter - use short-circuit evaluation for OR conditions
      if (hasQuery) {
        const matchesQuery =
          p.title.toLowerCase().includes(lowerQuery) ||
          p.content.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.tags?.some(t => t.name.toLowerCase().includes(lowerQuery));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (hasCategory && p.category !== selectedCategory) {
        return false;
      }

      // Tags filter
      if (hasTags && !selectedTags.some(tag => p.tags?.some(t => t.name === tag))) {
        return false;
      }

      // Type filter - TEXT includes both TEXT and STRUCTURED types
      if (hasType) {
        if (selectedType === 'TEXT') {
          if (p.type !== 'TEXT' && p.type !== 'STRUCTURED') return false;
        } else if (p.type !== selectedType) {
          return false;
        }
      }

      return true;
    });

    // Sort as separate operation (required after filter)
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'votes':
        result.sort((a, b) => b.votes - a.votes);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [prompts, query, sortBy, selectedCategory, selectedTags, selectedType]);

  const clearAllFilters = () => {
    setQuery('');
    setSelectedType('all');
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const value = useMemo<PromptsContextValue>(() => ({
    prompts,
    filteredPrompts,
    totalCount,
    isLoading,
    error,
    query,
    sortBy,
    selectedCategory,
    selectedTags,
    selectedType,
    categories,
    allTags,
    selectedModel: selectedModel || AI_MODELS[0].id,
    isDarkMode: isDarkMode || false,
    platformEnabled: platformEnabled || {},
    isPlatformEnabled,
    setQuery,
    setSortBy,
    setSelectedCategory,
    setSelectedTags,
    setSelectedType,
    clearAllFilters,
    setSelectedModel,
    setIsDarkMode,
    setPlatformEnabled,
    refetch,
  }), [
    prompts,
    filteredPrompts,
    totalCount,
    isLoading,
    error,
    query,
    sortBy,
    selectedCategory,
    selectedTags,
    selectedType,
    categories,
    allTags,
    selectedModel,
    isDarkMode,
    platformEnabled,
    isPlatformEnabled,
    setSelectedModel,
    setIsDarkMode,
    setPlatformEnabled,
    refetch,
  ]);

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts(): PromptsContextValue {
  const context = useContext(PromptsContext);
  if (!context) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
