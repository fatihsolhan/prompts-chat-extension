export interface Platform {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
  inputSelector: string;
  supportsQuerystring?: boolean;
  isDeeplink?: boolean;
}

export const CHAT_PLATFORMS: Platform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '/openai-icon.svg',
    baseUrl: 'https://chatgpt.com',
    inputSelector: '#prompt-textarea',
    supportsQuerystring: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '/claude-ai-icon.svg',
    baseUrl: 'https://claude.ai/new',
    inputSelector: '[contenteditable="true"]',
    supportsQuerystring: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '/google-gemini-icon.svg',
    baseUrl: 'https://gemini.google.com/app',
    inputSelector: 'rich-textarea p',
    supportsQuerystring: false,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    icon: '/copilot-color.svg',
    baseUrl: 'https://copilot.microsoft.com',
    inputSelector: '#userInput',
    supportsQuerystring: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '/deepseek-color.svg',
    baseUrl: 'https://chat.deepseek.com',
    inputSelector: 'textarea',
    supportsQuerystring: false,
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '/grok.svg',
    baseUrl: 'https://grok.com/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '/perplexity-color.svg',
    baseUrl: 'https://www.perplexity.ai',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'mistral',
    name: 'Le Chat',
    icon: '/mistral-ai-icon.svg',
    baseUrl: 'https://chat.mistral.ai/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingChat',
    icon: '/huggingface-color.svg',
    baseUrl: 'https://huggingface.co/chat',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'poe',
    name: 'Poe',
    icon: '/poe-color.svg',
    baseUrl: 'https://poe.com',
    inputSelector: 'textarea',
    supportsQuerystring: false,
  },
];

export const CODE_PLATFORMS: Platform[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '/cursor.svg',
    baseUrl: 'cursor://anysphere.cursor-deeplink/prompt',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: true,
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '/windsurf.svg',
    baseUrl: 'windsurf://',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: false,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    icon: '/vscode.svg',
    baseUrl: 'vscode://',
    inputSelector: '',
    isDeeplink: true,
    supportsQuerystring: false,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '/github-copilot-icon.svg',
    baseUrl: 'https://github.com/copilot',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'bolt',
    name: 'Bolt',
    icon: '/bolt.svg',
    baseUrl: 'https://bolt.new',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'lovable',
    name: 'Lovable',
    icon: '/lovable-color.svg',
    baseUrl: 'https://lovable.dev',
    inputSelector: 'textarea',
    supportsQuerystring: true,
  },
  {
    id: 'v0',
    name: 'v0',
    icon: '/v0.svg',
    baseUrl: 'https://v0.dev/chat',
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
    case 'cursor':
      return `${baseUrl}?text=${encoded}`;
    case 'bolt':
      return `${baseUrl}?prompt=${encoded}`;
    case 'chatgpt':
      return `${baseUrl}/?q=${encoded}`;
    case 'claude':
      return `${baseUrl}?q=${encoded}`;
    case 'copilot':
      return `${baseUrl}/?q=${encoded}`;
    case 'deepseek':
      return `${baseUrl}/?q=${encoded}`;
    case 'github-copilot':
      return `${baseUrl}?prompt=${encoded}`;
    case 'grok':
      return `${baseUrl}?q=${encoded}`;
    case 'huggingface':
      return `${baseUrl}/?prompt=${encoded}`;
    case 'lovable':
      return `${baseUrl}/?autosubmit=true#prompt=${encoded}`;
    case 'mistral':
      return `${baseUrl}?q=${encoded}`;
    case 'perplexity':
      return `${baseUrl}/search?q=${encoded}`;
    case 'v0':
      return `${baseUrl}?q=${encoded}`;
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
