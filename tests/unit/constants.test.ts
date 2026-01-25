import { describe, it, expect } from 'vitest';
import {
  CHAT_PLATFORMS,
  CODE_PLATFORMS,
  AI_MODELS,
  buildPlatformUrl,
  getPlatformById,
  getModelById,
} from '../../src/lib/constants';

describe('Platform Constants', () => {
  const required = ['id', 'name', 'icon', 'baseUrl', 'inputSelector'];

  it('should have chat and code platforms defined', () => {
    expect(CHAT_PLATFORMS.length).toBeGreaterThan(0);
    expect(CODE_PLATFORMS.length).toBeGreaterThan(0);
  });

  it('should have AI_MODELS combining both platform types', () => {
    expect(AI_MODELS.length).toBe(CHAT_PLATFORMS.length + CODE_PLATFORMS.length);
  });

  it('should have required properties on each platform', () => {
    AI_MODELS.forEach((platform) => {
      required.forEach((prop) => {
        expect(platform).toHaveProperty(prop);
      });
    });
  });

  it('should have unique platform IDs', () => {
    const ids = AI_MODELS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('buildPlatformUrl', () => {
  const prompt = 'Hello World!';
  const encoded = encodeURIComponent(prompt);

  const cases = [
    ['chatgpt', 'https://chatgpt.com', `https://chatgpt.com/?q=${encoded}`],
    ['claude', 'https://claude.ai/new', `https://claude.ai/new?q=${encoded}`],
    ['cursor', 'cursor://anysphere.cursor-deeplink/prompt', `cursor://anysphere.cursor-deeplink/prompt?text=${encoded}`],
    ['bolt', 'https://bolt.new', `https://bolt.new?prompt=${encoded}`],
    ['perplexity', 'https://www.perplexity.ai', `https://www.perplexity.ai/search?q=${encoded}`],
    ['lovable', 'https://lovable.dev', `https://lovable.dev/?autosubmit=true#prompt=${encoded}`],
    ['github-copilot', 'https://github.com/copilot', `https://github.com/copilot?prompt=${encoded}`],
    ['huggingface', 'https://huggingface.co/chat', `https://huggingface.co/chat/?prompt=${encoded}`],
    ['unknown', 'https://example.com', `https://example.com?q=${encoded}`],
  ] as const;

  it.each(cases)('should build %s URL correctly', (platformId, baseUrl, expectedUrl) => {
    expect(buildPlatformUrl(platformId, baseUrl, prompt)).toBe(expectedUrl);
  });

  it('should properly encode special characters', () => {
    const specialPrompt = 'Hello & "World"!';
    const url = buildPlatformUrl('chatgpt', 'https://chatgpt.com', specialPrompt);
    expect(url).toContain(encodeURIComponent(specialPrompt));
  });
});

describe('getPlatformById', () => {
  it('should return platform for valid IDs', () => {
    expect(getPlatformById('chatgpt')?.name).toBe('ChatGPT');
    expect(getPlatformById('cursor')?.name).toBe('Cursor');
  });

  it('should return undefined for invalid ID', () => {
    expect(getPlatformById('nonexistent')).toBeUndefined();
  });
});

describe('getModelById', () => {
  it('should be an alias for getPlatformById', () => {
    expect(getModelById('claude')).toEqual(getPlatformById('claude'));
  });
});
