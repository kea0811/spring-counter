import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react';
import { useSpringCounter } from './useSpringCounter';
import { formatCounterValue } from './format';
import type { SpringCounterOptions } from './types';

// Visually hidden, but readable by assistive tech. The animated number is
// `aria-hidden`, so screen readers announce this stable target value once
// instead of every intermediate frame.
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface SpringCounterProps extends SpringCounterOptions {
  /** The target number to spring toward. */
  value: number;
  /** Element or tag to render as the wrapper. Default: `'span'`. */
  as?: ElementType;
  /**
   * The text announced to screen readers. Defaults to the formatted *target*
   * value, so assistive tech reads the destination once rather than the
   * animation.
   */
  label?: string;
  /** Optional className applied to the wrapper. */
  className?: string;
  /** Optional inline styles applied to the wrapper. */
  style?: CSSProperties;
}

/**
 * `<SpringCounter>` — a drop-in animated number. Give it a `value`; when the
 * value changes it springs from its current position to the new one.
 *
 * The animated digits are hidden from assistive tech and the formatted target
 * value is exposed as a stable, visually-hidden label in their place.
 *
 * @example
 * ```tsx
 * <SpringCounter value={1234} prefix="$" />
 * <SpringCounter value={0.97} decimals={2} suffix="%" stiffness={120} damping={14} />
 * ```
 */
export function SpringCounter({
  value,
  stiffness,
  damping,
  mass,
  precision,
  from,
  decimals,
  locale,
  format,
  prefix,
  suffix,
  disabled,
  respectReducedMotion,
  onRest,
  as,
  label,
  className,
  style,
}: SpringCounterProps): ReactElement {
  const { formatted, isAnimating } = useSpringCounter(value, {
    stiffness,
    damping,
    mass,
    precision,
    from,
    decimals,
    locale,
    format,
    prefix,
    suffix,
    disabled,
    respectReducedMotion,
    onRest,
  });

  const Tag: ElementType = as ?? 'span';
  const accessibleText =
    label ?? formatCounterValue(value, { decimals, locale, format, prefix, suffix });

  return createElement(
    Tag,
    {
      className,
      style,
      'data-spring-counter': '',
      'data-animating': isAnimating ? '' : undefined,
    },
    createElement(
      'span',
      { 'aria-hidden': 'true', 'data-spring-counter-value': '' },
      formatted,
    ),
    createElement('span', { style: SR_ONLY, 'data-spring-counter-label': '' }, accessibleText),
  );
}
