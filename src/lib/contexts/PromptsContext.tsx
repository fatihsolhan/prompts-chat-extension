import { analytics } from '@/lib/analytics';
import { AI_MODELS } from '@/lib/constants';
import { Category, Prompt, Tag } from '@/lib/types';
import { useStorage } from '@/lib/utils/storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePromptsQuery } from '../hooks/usePrompts';

type SortOption = 'latest' | 'votes' | 'alphabetical';
type TabOption = 'all' | 'favorites';
type TypeFilter = 'all' | 'TEXT' | 'STRUCTURED' | 'IMAGE' | 'VIDEO' | 'AUDIO';

interface PromptsContextValue {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;

  query: string;
  activeTab: TabOption;
  sortBy: SortOption;
  selectedCategory: string | null;
  selectedTags: string[];
  selectedType: TypeFilter;

  categories: Category[];
  allTags: Tag[];

  favorites: string[];

  selectedModel: string;
  isDarkMode: boolean;

  setQuery: (query: string) => void;
  setActiveTab: (tab: TabOption) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedType: (type: TypeFilter) => void;
  toggleFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;
  setSelectedModel: (model: string) => Promise<void>;
  setIsDarkMode: (dark: boolean) => Promise<void>;
  refetch: () => void;
}

const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

interface PromptsProviderProps {
  children: ReactNode;
}

export function PromptsProvider({ children }: PromptsProviderProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');

  const { value: selectedModel, setValue: setSelectedModel } = useStorage({
    key: 'selectedModel',
    defaultValue: AI_MODELS[0].id,
  });

  const { value: isDarkMode, setValue: setIsDarkMode } = useStorage({
    key: 'isDarkMode',
    defaultValue: false,
  });

  const { value: favorites, setValue: setFavorites } = useStorage<string[]>({
    key: 'favorites',
    defaultValue: [],
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);
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
    let result = [...prompts];

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(t => t.name.toLowerCase().includes(lowerQuery))
      );
    }

    if (activeTab === 'favorites') {
      result = result.filter(p => favorites.includes(p.id));
    }
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter(p =>
        selectedTags.some(tag => p.tags?.some(t => t.name === tag))
      );
    }

    if (selectedType !== 'all') {
      result = result.filter(p => p.type === selectedType);
    }
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
  }, [prompts, query, activeTab, sortBy, favorites, selectedCategory, selectedTags, selectedType]);

  const toggleFavorite = useCallback((promptId: string) => {
    const isCurrentlyFavorite = favorites.includes(promptId);
    analytics.promptFavorited(promptId, isCurrentlyFavorite ? 'remove' : 'add');
    setFavorites(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  }, [favorites, setFavorites]);

  const isFavorite = useCallback((promptId: string) => {
    return favorites.includes(promptId);
  }, [favorites]);

  const value = useMemo<PromptsContextValue>(() => ({
    prompts,
    filteredPrompts,
    totalCount,
    isLoading,
    error,
    query,
    activeTab,
    sortBy,
    selectedCategory,
    selectedTags,
    selectedType,
    categories,
    allTags,
    favorites,
    selectedModel,
    isDarkMode,
    setQuery,
    setActiveTab,
    setSortBy,
    setSelectedCategory,
    setSelectedTags,
    setSelectedType,
    toggleFavorite,
    isFavorite,
    setSelectedModel,
    setIsDarkMode,
    refetch,
  }), [
    prompts,
    filteredPrompts,
    totalCount,
    isLoading,
    error,
    query,
    activeTab,
    sortBy,
    selectedCategory,
    selectedTags,
    selectedType,
    categories,
    allTags,
    favorites,
    selectedModel,
    isDarkMode,
    toggleFavorite,
    isFavorite,
    setSelectedModel,
    setIsDarkMode,
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
