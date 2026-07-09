import { describe, it, expect } from 'vitest';
import { formatCounterValue } from './format';

describe('formatCounterValue', () => {
  it('uses sensible defaults when called with no options', () => {
    expect(formatCounterValue(5)).toBe('5');
  });

  it('rounds to whole numbers by default and groups thousands', () => {
    expect(formatCounterValue(1234.6, { locale: 'en-US' })).toBe('1,235');
  });

  it('honors decimals, locale, prefix, and suffix together', () => {
    expect(
      formatCounterValue(1234.567, {
        decimals: 2,
        locale: 'en-US',
        prefix: '$',
        suffix: ' USD',
      }),
    ).toBe('$1,234.57 USD');
  });

  it('lets a custom format function take over completely', () => {
    const result = formatCounterValue(42.9, {
      decimals: 2,
      prefix: '$',
      format: (v) => `~${Math.round(v)}`,
    });
    expect(result).toBe('~43');
  });
});
