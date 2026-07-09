import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { useSpringCounter } from './useSpringCounter';
import type { SpringCounterOptions } from './types';
import { installRaf, type RafHarness } from '../test/raf';

let raf: RafHarness;

beforeEach(() => {
  raf = installRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function Probe({ value, options }: { value: number; options?: SpringCounterOptions }) {
  const { current, formatted, isAnimating } = useSpringCounter(value, options);
  return (
    <div>
      <span data-testid="current">{current}</span>
      <span data-testid="formatted">{formatted}</span>
      <span data-testid="animating">{isAnimating ? 'yes' : 'no'}</span>
    </div>
  );
}

const current = () => screen.getByTestId('current').textContent;
const animating = () => screen.getByTestId('animating').textContent;

function reducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe('useSpringCounter', () => {
  it('counts up from 0 to the target on mount and settles exactly', () => {
    render(<Probe value={100} />);
    expect(current()).toBe('0');
    expect(animating()).toBe('yes');

    const frames = raf.runToRest();
    expect(frames).toBeGreaterThan(1);
    expect(frames).toBeLessThan(5000);
    expect(current()).toBe('100');
    expect(animating()).toBe('no');
  });

  it('starts from a custom `from` value', () => {
    render(<Probe value={100} options={{ from: 90 }} />);
    expect(current()).toBe('90');
    raf.runToRest();
    expect(current()).toBe('100');
  });

  it('accepts a fully custom spring config', () => {
    render(
      <Probe
        value={100}
        options={{ stiffness: 300, damping: 30, mass: 2, precision: 0.001, from: 0 }}
      />,
    );
    const frames = raf.runToRest();
    expect(frames).toBeLessThan(5000);
    expect(current()).toBe('100');
  });

  it('retargets from its resting position when the value changes', () => {
    const { rerender } = render(<Probe value={0} options={{ from: 0 }} />);
    raf.runToRest();
    expect(current()).toBe('0');

    rerender(<Probe value={50} options={{ from: 0 }} />);
    expect(animating()).toBe('yes');
    raf.runToRest();
    expect(current()).toBe('50');
  });

  it('retargets smoothly from a mid-flight position', () => {
    const { rerender } = render(<Probe value={1000} options={{ from: 0 }} />);
    raf.step(); // dt=0 priming frame
    raf.step();
    raf.step();
    const mid = Number(current());
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1000);

    rerender(<Probe value={0} options={{ from: 0 }} />);
    raf.runToRest();
    expect(current()).toBe('0');
  });

  it('clamps a huge frame delta so a backgrounded tab does not teleport', () => {
    render(<Probe value={1000} options={{ from: 0 }} />);
    raf.step(); // priming frame (dt = 0)
    raf.step(5000); // ~5s jump, clamped internally
    const afterJump = Number(current());
    expect(afterJump).toBeGreaterThan(0);
    expect(afterJump).toBeLessThan(1000);
    raf.runToRest();
    expect(current()).toBe('1000');
  });

  it('shows the target instantly and fires onRest when disabled', () => {
    const onRest = vi.fn();
    render(<Probe value={42} options={{ disabled: true, onRest }} />);
    expect(current()).toBe('42');
    expect(animating()).toBe('no');
    expect(raf.pending()).toBe(0);
    expect(onRest).toHaveBeenCalledWith(42);
  });

  it('works when disabled without an onRest callback', () => {
    render(<Probe value={7} options={{ disabled: true }} />);
    expect(current()).toBe('7');
    expect(raf.pending()).toBe(0);
  });

  it('calls onRest with the target exactly once when it settles', () => {
    const onRest = vi.fn();
    render(<Probe value={100} options={{ onRest }} />);
    raf.runToRest();
    expect(onRest).toHaveBeenCalledTimes(1);
    expect(onRest).toHaveBeenCalledWith(100);
  });

  it('skips the animation under prefers-reduced-motion', () => {
    reducedMotion(true);
    render(<Probe value={500} />);
    expect(current()).toBe('500');
    expect(animating()).toBe('no');
    expect(raf.pending()).toBe(0);
  });

  it('animates under reduced motion when respectReducedMotion is false', () => {
    reducedMotion(true);
    render(<Probe value={200} options={{ respectReducedMotion: false }} />);
    expect(animating()).toBe('yes');
    raf.runToRest();
    expect(current()).toBe('200');
  });

  it('applies formatting to the live value', () => {
    render(
      <Probe
        value={1234.5}
        options={{ from: 1234.5, decimals: 2, prefix: '$', locale: 'en-US' }}
      />,
    );
    raf.runToRest();
    expect(screen.getByTestId('formatted').textContent).toBe('$1,234.50');
  });

  it('stays correct under StrictMode (simulated unmount/remount)', () => {
    render(
      <StrictMode>
        <Probe value={100} options={{ from: 0 }} />
      </StrictMode>,
    );
    raf.runToRest();
    expect(current()).toBe('100');
    expect(animating()).toBe('no');
  });
});
