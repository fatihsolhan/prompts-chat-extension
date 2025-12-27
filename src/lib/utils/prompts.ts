import { TemplateVariable } from '../types';

export function parseTemplateVariables(content: string): TemplateVariable[] {
  const regex = /\$\{([^}:]+)(?::([^}]*))?\}/g;
  const variables: TemplateVariable[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        defaultValue: match[2]?.trim(),
        value: match[2]?.trim() || '',
      });
    }
  }

  return variables;
}

export function applyTemplateVariables(
  content: string,
  variables: TemplateVariable[]
): string {
  let result = content;

  for (const variable of variables) {
    const value = variable.value || variable.defaultValue || '';

    const patterns = [
      new RegExp(`\\$\\{${escapeRegex(variable.name)}\\}`, 'g'),
      new RegExp(`\\$\\{${escapeRegex(variable.name)}:[^}]*\\}`, 'g'),
    ];

    for (const pattern of patterns) {
      result = result.replace(pattern, value);
    }
  }

  return result;
}

export function hasTemplateVariables(content: string): boolean {
  return /\$\{[^}]+\}/.test(content);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
