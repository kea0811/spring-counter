/**
 * The physical properties of the spring that drives the count. The defaults
 * (`stiffness: 170`, `damping: 26`, `mass: 1`) are critically damped, so the
 * number eases in and settles crisply without overshooting. Lower the damping
 * for a bouncy count; raise the mass for a heavier, slower feel.
 */
export interface SpringConfig {
  /** Spring constant — how hard it pulls toward the target. Default: `170`. */
  stiffness?: number;
  /** Resistance that bleeds off velocity. Higher = less bounce. Default: `26`. */
  damping?: number;
  /** Weight of the value. Higher = slower to accelerate. Default: `1`. */
  mass?: number;
  /**
   * How close (in value and velocity) counts as "settled". Once the number is
   * within `precision` of the target and nearly still, it snaps and stops.
   * Default: `0.01`.
   */
  precision?: number;
}

/** Options that control how the numeric value is turned into a display string. */
export interface FormatOptions {
  /** Number of decimal places to show. Default: `0`. */
  decimals?: number;
  /**
   * BCP-47 locale (or list) passed to `Number.prototype.toLocaleString`, which
   * controls grouping separators and decimal marks. Defaults to the runtime's
   * locale.
   */
  locale?: string | string[];
  /**
   * Fully custom formatter. When provided it takes over completely and
   * `decimals`, `locale`, `prefix`, and `suffix` are ignored.
   */
  format?: (value: number) => string;
  /** Text prepended to the formatted number, e.g. `'$'`. Default: `''`. */
  prefix?: string;
  /** Text appended to the formatted number, e.g. `'%'` or `'+'`. Default: `''`. */
  suffix?: string;
}

export interface SpringCounterOptions extends SpringConfig, FormatOptions {
  /**
   * The value the counter starts from on its first render, before it springs to
   * the target. Defaults to `0`, so a counter counts up on mount. Set it to the
   * initial value to skip the mount animation.
   */
  from?: number;
  /**
   * Skip the physics entirely and show the target value instantly. Defaults to
   * `false`, but reduced motion also forces this on unless
   * `respectReducedMotion` is `false`.
   */
  disabled?: boolean;
  /**
   * Honor the user's `prefers-reduced-motion` setting by skipping the animation.
   * Default: `true`.
   */
  respectReducedMotion?: boolean;
  /** Called with the target value each time the counter settles at rest. */
  onRest?: (value: number) => void;
}

export interface SpringCounterState {
  /** The live, un-rounded numeric value at this instant. */
  current: number;
  /** `current` run through the configured formatting (prefix, decimals, etc.). */
  formatted: string;
  /** Whether the spring is currently in motion toward the target. */
  isAnimating: boolean;
}
