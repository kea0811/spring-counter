import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { formatCounterValue } from './format';
import type { SpringCounterOptions, SpringCounterState } from './types';

export const DEFAULT_STIFFNESS = 170;
export const DEFAULT_DAMPING = 26;
export const DEFAULT_MASS = 1;
export const DEFAULT_PRECISION = 0.01;
export const DEFAULT_FROM = 0;

/** Longest frame delta we integrate in one go (~4 frames). Guards against the
 *  giant `dt` you get after a background tab wakes up, which would otherwise
 *  fling the spring across the screen. */
const MAX_FRAME_SECONDS = 0.064;
/** Fixed physics sub-step. Integrating at a constant 120 Hz keeps the spring
 *  stable and frame-rate independent regardless of the real display refresh. */
const STEP_SECONDS = 1 / 120;

/**
 * Animates a number toward `value` using a real spring simulation. Whenever
 * `value` changes the spring retargets from wherever it currently is — with its
 * current velocity intact — so mid-flight changes stay smooth instead of
 * restarting.
 *
 * The entire requestAnimationFrame lifecycle lives inside a single `useEffect`,
 * which keeps it safe under React 18 + 19 StrictMode's simulated
 * unmount/remount cycle.
 *
 * @example
 * ```tsx
 * const { formatted, isAnimating } = useSpringCounter(1234, { prefix: '$' });
 * return <span aria-hidden={isAnimating}>{formatted}</span>;
 * ```
 */
export function useSpringCounter(
  value: number,
  options: SpringCounterOptions = {},
): SpringCounterState {
  const {
    stiffness = DEFAULT_STIFFNESS,
    damping = DEFAULT_DAMPING,
    mass = DEFAULT_MASS,
    precision = DEFAULT_PRECISION,
    from = DEFAULT_FROM,
    decimals,
    locale,
    format,
    prefix,
    suffix,
    disabled = false,
    respectReducedMotion = true,
    onRest,
  } = options;

  const prefersReducedMotion = usePrefersReducedMotion();
  const isDisabled = disabled || (respectReducedMotion && prefersReducedMotion);

  const [current, setCurrent] = useState<number>(() => (isDisabled ? value : from));
  const [isAnimating, setIsAnimating] = useState(false);

  // Physics state lives in refs so a retarget (value change) resumes from the
  // exact position and velocity, and so per-frame updates never re-run effects.
  const positionRef = useRef(current);
  const velocityRef = useRef(0);

  // Keep the latest onRest without making it an effect dependency, so passing an
  // inline callback doesn't restart the animation.
  const onRestRef = useRef(onRest);
  useEffect(() => {
    onRestRef.current = onRest;
  }, [onRest]);

  useEffect(() => {
    if (isDisabled) {
      positionRef.current = value;
      velocityRef.current = 0;
      setCurrent(value);
      setIsAnimating(false);
      onRestRef.current?.(value);
      return;
    }

    let frame: number;
    let lastTime: number | null = null;
    setIsAnimating(true);

    const tick = (now: number): void => {
      let dt = lastTime === null ? 0 : (now - lastTime) / 1000;
      lastTime = now;
      if (dt > MAX_FRAME_SECONDS) {
        dt = MAX_FRAME_SECONDS;
      }

      let x = positionRef.current;
      let v = velocityRef.current;
      let remaining = dt;
      while (remaining > 0) {
        const h = Math.min(STEP_SECONDS, remaining);
        const springForce = -stiffness * (x - value);
        const dampingForce = -damping * v;
        const acceleration = (springForce + dampingForce) / mass;
        v += acceleration * h;
        x += v * h;
        remaining -= h;
      }

      const settled = Math.abs(value - x) < precision && Math.abs(v) < precision;
      if (settled) {
        positionRef.current = value;
        velocityRef.current = 0;
        setCurrent(value);
        setIsAnimating(false);
        onRestRef.current?.(value);
        return;
      }

      positionRef.current = x;
      velocityRef.current = v;
      setCurrent(x);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, isDisabled, stiffness, damping, mass, precision]);

  const formatted = formatCounterValue(current, {
    decimals,
    locale,
    format,
    prefix,
    suffix,
  });

  return { current, formatted, isAnimating };
}
