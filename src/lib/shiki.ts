import { createHighlighter, Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = createHighlighter({
    themes: ['github-dark-dimmed'],
    langs: ['json', 'yaml'],
  });

  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
}

export async function highlightCode(
  code: string,
  lang: 'json' | 'yaml'
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark-dimmed',
  });
}
