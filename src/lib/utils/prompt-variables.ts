import { slugify } from './string';

export interface PromptVariable {
  name: string;
  default?: string;
}

export interface StoredPromptData {
  act: string;
  values: Record<string, string>;
  lastUpdated: number;
}

export type StoredVariables = Record<string, StoredPromptData>;

export function extractVariables(text: string): PromptVariable[] {
  const patterns = [
    /\${([^}]+)}/g,  // ${var:default}
    /\{\{([^}]+)\}\}/g  // {{var}}
  ];
  
  const variables: PromptVariable[] = [];
  
  patterns.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const [variable, defaultValue] = match[1].split(':').map(s => s.trim());
      if (variable) {
        variables.push({ name: variable, default: defaultValue || '' });
      }
    }
  });

  // Remove duplicates by name
  return Array.from(
    new Map(variables.map(v => [v.name, v])).values()
  );
}

export const updatePromptPreview = (
  promptText: string,
  values?: Record<string, string>,
  act?: string
): string => {
  const variables = extractVariables(promptText);

  if (variables.length === 0) {
    return promptText;
  }

  // If values not provided but act is, try to load from storage
  if (!values && act) {
    try {
      const stored = loadStoredVariables();
      const key = slugify(act);
      const storedData = stored[key];
      
      values = Object.fromEntries(
        variables.map(v => {
          const storedValue = storedData?.values?.[v.name];
          return [v.name, storedValue !== undefined ? storedValue : v.default || ''];
        })
      );
    } catch (error) {
      console.error('Error loading stored variables:', error);
    }
  }

  let previewText = promptText;

  // When no values provided and no stored values found
  if (!values) {
    variables.forEach(variable => {
      const pattern = new RegExp(`\\$\{${variable.name}[^}]*\}`, 'g');
      const replacement = variable.default || `<b>${variable.name}</b>`;
      previewText = previewText.replace(pattern, replacement);
    });
    return previewText;
  }

  // Replace variables with user inputs or defaults
  variables.forEach(variable => {
    const pattern = new RegExp(`\\$\{${variable.name}[^}]*\}`, 'g');
    const value = values[variable.name]?.trim();
    let replacement;

    if (value) {
      replacement = value; // User entered value
    } else if (variable.default) {
      replacement = variable.default; // Show default value
    } else {
      replacement = variable.name; // No value or default, show variable name
    }
    replacement = `<b>${replacement}</b>`;

    previewText = previewText.replace(pattern, replacement);
  });

  // Also handle {{var}} format
  previewText = previewText.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
    const value = values[name]?.trim();
    return value ? `<b>${value}</b>` : `<b>{{${name}}}</b>`;
  });

  return previewText;
};

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

const STORAGE_KEY = 'prompt_variables';

export const loadStoredVariables = (): StoredVariables => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading stored variables:', error);
    return {};
  }
};

export const removeStoredVariables = (act: string): void => {
  try {
    const stored = loadStoredVariables();
    const key = slugify(act);
    delete stored[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error removing stored variables:', error);
  }
};

export const saveVariableValues = (
  act: string,
  values: Record<string, string>,
  variables: PromptVariable[]
): void => {
  try {
    // Check if all values are empty (restored to defaults)
    const allEmpty = variables.every(variable => 
      !values[variable.name] || values[variable.name].trim() === ''
    );

    if (allEmpty) {
      // If all values are empty/default, remove from storage
      removeStoredVariables(act);
      return;
    }

    // Save as normal
    const stored = loadStoredVariables();
    const key = slugify(act);
    
    stored[key] = {
      act,
      values,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error saving variable values:', error);
  }
};
