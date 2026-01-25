import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPrompts, invalidateCache } from '../../src/lib/api';

const mockApiResponse = {
  prompts: [
    {
      id: 'prompt-1',
      title: 'Test Prompt',
      slug: 'test-prompt',
      description: 'A test description',
      content: 'Test content',
      type: 'TEXT',
      author: { username: 'testuser', avatar: 'https://example.com/avatar.png' },
      category: { name: 'Testing', icon: 'test-icon' },
      tags: [
        { name: 'test', color: '#ff0000' },
        { name: 'unit', color: '#00ff00' },
      ],
      voteCount: 10,
      createdAt: '2024-01-01T00:00:00Z',
      isFeatured: true,
    },
    {
      id: 'prompt-2',
      title: 'Another Prompt',
      slug: 'another-prompt',
      content: 'Another content',
    },
  ],
};

function mockSuccessResponse(): void {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockApiResponse),
  } as Response);
}

describe('fetchPrompts', () => {
  beforeEach(() => {
    invalidateCache();
    vi.mocked(global.fetch).mockReset();
  });

  it('should fetch prompts from API', async () => {
    mockSuccessResponse();
    const result = await fetchPrompts();

    expect(global.fetch).toHaveBeenCalledWith('https://prompts.chat/prompts.json');
    expect(result.prompts).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should transform API response to internal format', async () => {
    mockSuccessResponse();
    const result = await fetchPrompts();
    const prompt = result.prompts[0];

    expect(prompt).toMatchObject({
      id: 'prompt-1',
      title: 'Test Prompt',
      author: 'testuser',
      authorAvatar: 'https://example.com/avatar.png',
      category: 'Testing',
      votes: 10,
      isFeatured: true,
    });
    expect(prompt.tags).toHaveLength(2);
  });

  it('should use default values for missing optional fields', async () => {
    mockSuccessResponse();
    const result = await fetchPrompts();
    const prompt = result.prompts[1];

    expect(prompt).toMatchObject({
      author: 'anonymous',
      type: 'TEXT',
      votes: 0,
      isFeatured: false,
    });
    expect(prompt.tags).toEqual([]);
  });

  it('should extract and sort categories', async () => {
    mockSuccessResponse();
    const result = await fetchPrompts();

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({ name: 'Testing', icon: 'test-icon' });
  });

  it('should cache results within TTL', async () => {
    mockSuccessResponse();
    await fetchPrompts();
    await fetchPrompts();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw error on API failure', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(fetchPrompts()).rejects.toThrow('API Error: 500 Internal Server Error');
  });
});

describe('invalidateCache', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it('should clear cache and force refetch', async () => {
    mockSuccessResponse();

    await fetchPrompts();
    invalidateCache();
    await fetchPrompts();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
