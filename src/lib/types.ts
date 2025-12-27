export interface ApiPrompt {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content: string;
  type: PromptType;
  structuredFormat?: string | null;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  mediaUrl?: string | null;
  voteCount: number;
  author: {
    name: string | null;
    username: string;
    avatar?: string | null;
    verified: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

export type PromptType = 'TEXT' | 'STRUCTURED' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface Tag {
  name: string;
  color: string;
}

export interface Prompt {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  type: PromptType;
  structuredFormat?: string;
  author: string;
  authorAvatar?: string;
  category?: string;
  tags: Tag[];
  votes: number;
  createdAt: string;
  isFeatured: boolean;
}

export interface Category {
  name: string;
  icon?: string;
}

export interface PromptsResponse {
  prompts: Prompt[];
  categories: Category[];
  total: number;
}

export interface TemplateVariable {
  name: string;
  defaultValue?: string;
  value?: string;
}
