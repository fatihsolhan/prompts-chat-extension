import { describe, it, expect } from 'vitest';
import {
  parseTemplateVariables,
  applyTemplateVariables,
  hasTemplateVariables,
} from '../../src/lib/utils/prompts';

describe('parseTemplateVariables', () => {
  it('should return empty array for content without variables', () => {
    expect(parseTemplateVariables('Hello, this is a simple prompt.')).toEqual([]);
  });

  it('should parse single variable without default', () => {
    expect(parseTemplateVariables('Hello ${name}!')).toEqual([
      { name: 'name', defaultValue: undefined, value: '' },
    ]);
  });

  it('should parse single variable with default value', () => {
    expect(parseTemplateVariables('Hello ${name:World}!')).toEqual([
      { name: 'name', defaultValue: 'World', value: 'World' },
    ]);
  });

  it('should parse multiple variables', () => {
    const result = parseTemplateVariables('Hello ${name:World}, welcome to ${place:Earth}!');
    expect(result).toEqual([
      { name: 'name', defaultValue: 'World', value: 'World' },
      { name: 'place', defaultValue: 'Earth', value: 'Earth' },
    ]);
  });

  it('should deduplicate variables with same name', () => {
    const result = parseTemplateVariables('Hello ${name}, ${name} again!');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('name');
  });

  it('should trim whitespace from variable names', () => {
    const result = parseTemplateVariables('Hello ${ name : default }!');
    expect(result[0]).toMatchObject({ name: 'name', defaultValue: 'default' });
  });

  it('should handle empty default value', () => {
    expect(parseTemplateVariables('Hello ${name:}!')[0]).toEqual(
      { name: 'name', defaultValue: '', value: '' }
    );
  });
});

describe('applyTemplateVariables', () => {
  it('should return original content when no variables provided', () => {
    expect(applyTemplateVariables('Hello World!', [])).toBe('Hello World!');
  });

  it('should replace variable without default', () => {
    expect(applyTemplateVariables('Hello ${name}!', [{ name: 'name', value: 'John' }]))
      .toBe('Hello John!');
  });

  it('should replace variable with default syntax', () => {
    expect(applyTemplateVariables('Hello ${name:World}!', [{ name: 'name', value: 'John' }]))
      .toBe('Hello John!');
  });

  it('should use default value when value is empty', () => {
    const variables = [{ name: 'name', defaultValue: 'World', value: '' }];
    expect(applyTemplateVariables('Hello ${name:World}!', variables)).toBe('Hello World!');
  });

  it('should replace multiple variables', () => {
    const variables = [
      { name: 'name', value: 'Alice' },
      { name: 'place', value: 'Mars' },
    ];
    expect(applyTemplateVariables('Hello ${name:Guest}, welcome to ${place:Earth}!', variables))
      .toBe('Hello Alice, welcome to Mars!');
  });

  it('should replace all occurrences of same variable', () => {
    expect(applyTemplateVariables('${name} said hello to ${name}', [{ name: 'name', value: 'Bob' }]))
      .toBe('Bob said hello to Bob');
  });

  it('should handle special regex characters in variable names', () => {
    expect(applyTemplateVariables('Value: ${item.price}', [{ name: 'item.price', value: '$100' }]))
      .toBe('Value: $100');
  });
});

describe('hasTemplateVariables', () => {
  const valid = ['Hello ${name}!', 'Hello ${name:World}!', '${a} and ${b}'];
  const invalid = ['Hello World!', 'Hello ${name!', 'Hello $name}'];

  it.each(valid)('should return true for "%s"', (content) => {
    expect(hasTemplateVariables(content)).toBe(true);
  });

  it.each(invalid)('should return false for "%s"', (content) => {
    expect(hasTemplateVariables(content)).toBe(false);
  });
});
