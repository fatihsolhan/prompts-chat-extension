import { marked } from "marked";

export interface Prompt {
  act: string;
  prompt: string;
  for_devs: boolean;
  contributor?: string;
}

export const fetchPrompts = async (): Promise<Prompt[]> => {
  const readmeResponse = await fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/README.md');
  const readmeText = await readmeResponse.text();
  const parsedPrompts = parsePromptsFromReadme(readmeText);
  return parsedPrompts.sort((a, b) => a.act.localeCompare(b.act));
};

export const parsePromptsFromReadme = (markdown: string): Prompt[] => {
  const tokens = marked.lexer(markdown);
  const prompts: Prompt[] = [];

  let currentPrompt: Partial<Prompt> = {};
  let isInPromptSection = false;

  const contributorFormats = [
    /Contributed by:\s*\[([^\]]+)\]/i,
    /Contributed by\s*\[([^\]]+)\]/i,
    /Contributed by:\s*@([^\s\]]+)/i,
    /Contributed by\s*@([^\s\]]+)/i,
  ];

  const normalizeTitle = (title: string): string => {
    // Keep everything exactly as it appears in the source
    return title;
  };

  tokens.forEach((token) => {
    // Start collecting prompts after the "# Prompts" section
    if (token.type === 'heading' && token.depth === 1 && token.text === 'Prompts') {
      isInPromptSection = true;
      return;
    }

    if (!isInPromptSection) return;

    // Parse h2 headers as prompt titles
    if (token.type === 'heading' && token.depth === 2) {
      const normalizedText = normalizeTitle(token.text);
      if (normalizedText.toLowerCase().startsWith('act as')) {
        if (currentPrompt.act) {
          // Save previous prompt if exists
          if (currentPrompt.prompt && typeof currentPrompt.for_devs === 'boolean') {
            prompts.push(currentPrompt as Prompt);
          }
        }
        currentPrompt = {
          act: normalizedText,
          for_devs: false, // Default value
          contributor: 'f' // Default contributor
        };
      }
    }

    // Parse contributor information
    if (token.type === 'paragraph' && currentPrompt.act) {
      for (const format of contributorFormats) {
        const match = token.text.match(format);
        if (match) {
          currentPrompt.contributor = match[1].replace(/^@/, '');
          break;
        }
      }
    }

    // Parse prompt content from blockquotes
    if (token.type === 'blockquote' && currentPrompt.act) {
      let blockquoteText = '';

      // Safely handle token.tokens
      if (token.tokens) {
        blockquoteText = token.tokens
          .map(t => {
            if (t.type === 'paragraph') {
              return t.text;
            } else if (t.type === 'list') {
              // Handle list items with proper type
              const items = t.items as Array<{ text: string; type?: string }>;
              return items
                .map(item => item.text)
                .join('\n');
            }
            return '';
          })
          .filter(Boolean)
          .join('\n')
          .trim();
      }

      if (blockquoteText) {
        currentPrompt.prompt = blockquoteText;
      }
    }
  });

  // Add the last prompt
  if (currentPrompt.act && currentPrompt.prompt && typeof currentPrompt.for_devs === 'boolean') {
    prompts.push(currentPrompt as Prompt);
  }

  // Debug missing prompts
  const missingPrompts = [
    "Act As A Chef",
    "Act As A Financial Analyst",
    "Act As A Florist",
    "Act As A Tea-Taster",
    "Act As An Automobile Mechanic",
    "Act As An Investment Manager"
  ];

  const foundTitles = prompts.map(p => p.act);
  console.log('Missing prompts check:');
  missingPrompts.forEach(title => {
    const found = foundTitles.some(t => t.toLowerCase() === title.toLowerCase());
    console.log(`${title}: ${found ? 'Found' : 'Missing'}`);
  });

  return prompts;
};
