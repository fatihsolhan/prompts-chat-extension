import { ApiPrompt, Category, Prompt, PromptsResponse } from "./types";

const API_URL = "https://prompts.chat/prompts.json";

let cachedPrompts: Prompt[] | null = null;
let cachedCategories: Category[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

function mapApiPromptToPrompt(apiPrompt: ApiPrompt): Prompt {
  return {
    id: apiPrompt.id,
    title: apiPrompt.title,
    slug: apiPrompt.slug,
    description: apiPrompt.description || undefined,
    content: apiPrompt.content || "",
    type: apiPrompt.type || "TEXT",
    structuredFormat: apiPrompt.structuredFormat || undefined,
    mediaUrl: apiPrompt.mediaUrl || undefined,
    author: apiPrompt.author?.username || "anonymous",
    authorAvatar: apiPrompt.author?.avatar || undefined,
    category: apiPrompt.category?.name,
    tags:
      apiPrompt.tags?.map((t) => ({
        name: t.name,
        color: t.color || "#888",
      })) || [],
    votes: apiPrompt.voteCount || 0,
    createdAt: apiPrompt.createdAt,
    isFeatured: apiPrompt.isFeatured || false,
  };
}

function extractCategories(prompts: ApiPrompt[]): Category[] {
  const categoryMap = new Map<string, Category>();

  prompts.forEach((p) => {
    if (!p.category) return;
    if (!categoryMap.has(p.category.name)) {
      categoryMap.set(p.category.name, {
        name: p.category.name,
        icon: p.category.icon,
      });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPrompts(): Promise<PromptsResponse> {
  if (cachedPrompts && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return {
      prompts: cachedPrompts,
      categories: cachedCategories || [],
      total: cachedPrompts.length,
    };
  }

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const apiPrompts: ApiPrompt[] = data.prompts;

  const prompts = apiPrompts.map(mapApiPromptToPrompt);
  const categories = extractCategories(apiPrompts);

  cachedPrompts = prompts;
  cachedCategories = categories;
  cacheTimestamp = Date.now();

  return {
    prompts,
    categories,
    total: prompts.length,
  };
}

export function invalidateCache(): void {
  cachedPrompts = null;
  cachedCategories = null;
  cacheTimestamp = null;
}
