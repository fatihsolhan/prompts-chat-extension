import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPrompts, invalidateCache } from '../api';

export const promptsKeys = {
  all: ['prompts'] as const,
};

export function usePromptsQuery() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: promptsKeys.all,
    queryFn: fetchPrompts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const handleRefetch = useCallback(() => {
    invalidateCache();
    refetch();
  }, [refetch]);

  return {
    prompts: data?.prompts ?? [],
    categories: data?.categories ?? [],
    totalCount: data?.total ?? 0,
    isLoading,
    error: error as Error | null,
    refetch: handleRefetch,
  };
}
