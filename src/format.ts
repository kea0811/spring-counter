import type { FormatOptions } from './types';

/**
 * Turns a numeric value into its display string using the same rules the
 * `<SpringCounter>` component and `useSpringCounter` hook apply internally.
 *
 * A custom `format` function wins outright; otherwise the number is run through
 * `toLocaleString` with the requested `decimals` and `locale`, then wrapped in
 * the optional `prefix` / `suffix`.
 *
 * @example
 * formatCounterValue(1234.5, { decimals: 0, prefix: '$' }); // "$1,235"
 */
export function formatCounterValue(value: number, options: FormatOptions = {}): string {
  const { decimals = 0, locale, format, prefix = '', suffix = '' } = options;

  if (format) {
    return format(value);
  }

  const body = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${body}${suffix}`;
}
