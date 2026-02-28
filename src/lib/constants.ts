export interface Platform {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
  inputSelector: string;
  supportsQuerystring?: boolean;
  isDeeplink?: boolean;
  sponsor?: boolean;
}

export const CHAT_PLATFORMS: Platform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '/brand-logos/openai-icon.svg',
    baseUrl: 'https://chatgpt.com',
    inputSelector: '#prompt-textarea',
    supportsQuerystring: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '/brand-logos/claude-ai-icon.svg',
    baseUrl: 'https://claude.ai/new',
    inputSelector: '[contenteditable="true"]',
    supportsQuerystring: true,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    icon: '/brand-logos/copilot-color.svg',
    baseUrl: 'https://copilot.microsoft.com',
    inputSelector: '#userInput',
    supportsQuerystring: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '/brand-logos/deepseek-color.svg',
    baseUrl: 'https://chat.deepseek.com',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '/brand-logos/google-gemini-icon.svg',
    baseUrl: 'https://gemini.google.com/app',
    inputSelector: 'rich-textarea p',
    supportsQuerystring: false,
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '/brand-logos/grok.svg',
    baseUrl: 'https://grok.com/chat?reasoningMode=none',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '/brand-logos/perplexity-color.svg',
    baseUrl: 'https://www.perplexity.ai',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'mistral',
    name: 'Le Chat',
    icon: '/brand-logos/mistral-ai-icon.svg',
    baseUrl: 'https://chat.mistral.ai/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingChat',
    icon: '/brand-logos/huggingface-color.svg',
    baseUrl: 'https://huggingface.co/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'poe',
    name: 'Poe',
    icon: '/brand-logos/poe-color.svg',
    baseUrl: 'https://poe.com',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'llama',
    name: 'Meta AI',
    icon: '/brand-logos/meta-icon.svg',
    baseUrl: 'https://www.meta.ai',
    inputSelector: 'textarea',
    supportsQuerystring: false,
  },
  {
    id: 'phind',
    name: 'Phind',
    icon: '/brand-logos/phind.svg',
    baseUrl: 'https://www.phind.com',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'you',
    name: 'You.com',
    icon: '',
    baseUrl: 'https://you.com',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'fal',
    name: 'fal.ai',
    icon: '/brand-logos/fal.svg',
    baseUrl: 'https://fal.ai/sandbox',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'pi',
    name: 'Pi',
    icon: '/brand-logos/pi.svg',
    baseUrl: 'https://pi.ai',
    inputSelector: 'textarea',
    supportsQuerystring: false,
  },
  {
    id: 'manus',
    name: 'Manus',
    icon: '/brand-logos/manus.svg',
    baseUrl: 'https://manus.im/app',
    inputSelector: 'textarea',
    supportsQuerystring: false,
  },
  {
    id: 'duckai',
    name: 'Duck.ai',
    icon: '/brand-logos/duckduckgo.svg',
    baseUrl: 'https://duck.ai',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
];

export const CODE_PLATFORMS: Platform[] = [
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '/brand-logos/windsurf.svg',
    baseUrl: 'windsurf://',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: false,
    sponsor: true,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '/brand-logos/cursor.svg',
    baseUrl: 'cursor://anysphere.cursor-deeplink/prompt',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: true,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    icon: '/brand-logos/vscode.svg',
    baseUrl: 'vscode://',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: false,
  },
  {
    id: 'vscode-insiders',
    name: 'VS Code Insiders',
    icon: '',
    baseUrl: 'vscode-insiders://',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: false,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '/brand-logos/github-copilot-icon.svg',
    baseUrl: 'https://github.com/copilot',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'bolt',
    name: 'Bolt',
    icon: '/brand-logos/bolt.svg',
    baseUrl: 'https://bolt.new',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'lovable',
    name: 'Lovable',
    icon: '/brand-logos/lovable-color.svg',
    baseUrl: 'https://lovable.dev',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'v0',
    name: 'v0',
    icon: '/brand-logos/v0.svg',
    baseUrl: 'https://v0.dev/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'ai2sql',
    name: 'AI2SQL',
    icon: '',
    baseUrl: 'https://builder.ai2sql.io/dashboard/builder-all-lp?tab=generate',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
];

export const CHAT_MODELS = CHAT_PLATFORMS;
export const CODE_MODELS = CODE_PLATFORMS;
export const AI_MODELS = [...CHAT_PLATFORMS, ...CODE_PLATFORMS];

export function buildPlatformUrl(platformId: string, baseUrl: string, promptText: string): string {
  const encoded = encodeURIComponent(promptText);

  switch (platformId) {
    // Chat platforms
    case 'chatgpt':
      return `${baseUrl}/?q=${encoded}`;
    case 'claude':
      return `${baseUrl}?q=${encoded}`;
    case 'copilot':
      return `${baseUrl}/?q=${encoded}`;
    case 'deepseek':
      return `${baseUrl}/?q=${encoded}`;
    case 'grok':
      return `${baseUrl}&q=${encoded}`;
    case 'perplexity':
      return `${baseUrl}/search?q=${encoded}`;
    case 'mistral':
      return `${baseUrl}?q=${encoded}`;
    case 'huggingface':
      return `${baseUrl}/?prompt=${encoded}`;
    case 'poe':
      return `${baseUrl}/?q=${encoded}`;
    case 'phind':
      return `${baseUrl}/search?q=${encoded}`;
    case 'you':
      return `${baseUrl}/search?q=${encoded}`;
    case 'fal':
      return `${baseUrl}?prompt=${encoded}`;
    case 'duckai':
      return `${baseUrl}/chat?q=${encoded}`;
    // Code platforms
    case 'cursor':
      return `${baseUrl}?text=${encoded}`;
    case 'github-copilot':
      return `${baseUrl}?prompt=${encoded}`;
    case 'bolt':
      return `${baseUrl}?prompt=${encoded}`;
    case 'lovable':
      return `${baseUrl}/?autosubmit=true#prompt=${encoded}`;
    case 'v0':
      return `${baseUrl}?q=${encoded}`;
    case 'ai2sql':
      return `${baseUrl}&prompt=${encoded}`;
    default:
      return `${baseUrl}?q=${encoded}`;
  }
}

export function getPlatformById(id: string): Platform | undefined {
  return AI_MODELS.find(p => p.id === id);
}

export function getModelById(id: string): Platform | undefined {
  return getPlatformById(id);
}
