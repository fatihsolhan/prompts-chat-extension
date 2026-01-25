import type { Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

// Simple LRU cache for highlighted code
const highlightCache = new Map<string, string>();
const MAX_CACHE_SIZE = 500; // Cache up to 500 highlighted snippets

function getCacheKey(code: string, lang: string): string {
  // Use a simple hash-like key combining content and language
  return `${lang}:${code.length}:${code.slice(0, 100)}:${code.slice(-50)}`;
}

function addToCache(key: string, value: string): void {
  // If cache is full, remove oldest entries (first 100)
  if (highlightCache.size >= MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(highlightCache.keys()).slice(0, 100);
    keysToDelete.forEach(k => highlightCache.delete(k));
  }
  highlightCache.set(key, value);
}

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  // Dynamic import for code splitting - shiki is only loaded when needed
  highlighterPromise = import('shiki').then(({ createHighlighter }) =>
    createHighlighter({
      themes: ['github-dark-dimmed'],
      langs: ['json', 'yaml'],
    })
  );

  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
}

export async function highlightCode(
  code: string,
  lang: 'json' | 'yaml'
): Promise<string> {
  // Check cache first
  const cacheKey = getCacheKey(code, lang);
  const cached = highlightCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark-dimmed',
  });

  // Store in cache
  addToCache(cacheKey, html);

  return html;
}

// Clear cache if needed (e.g., on theme change)
export function clearHighlightCache(): void {
  highlightCache.clear();
}
