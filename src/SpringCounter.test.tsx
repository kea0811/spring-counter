import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SpringCounter } from './SpringCounter';
import { installRaf, type RafHarness } from '../test/raf';

let raf: RafHarness;

beforeEach(() => {
  raf = installRaf();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const q = (root: HTMLElement, sel: string) => root.querySelector(sel) as HTMLElement;

describe('SpringCounter', () => {
  it('animates the value while exposing a stable target label to screen readers', () => {
    const { container } = render(<SpringCounter value={100} from={0} locale="en-US" />);
    const value = q(container, '[data-spring-counter-value]');
    const label = q(container, '[data-spring-counter-label]');

    expect(value).toHaveAttribute('aria-hidden', 'true');
    expect(value.textContent).toBe('0');
    // The label already reads the destination, not the animation.
    expect(label.textContent).toBe('100');

    raf.runToRest();
    expect(value.textContent).toBe('100');
  });

  it('renders a span by default and toggles data-animating while in motion', () => {
    const { container } = render(<SpringCounter value={50} from={0} />);
    const root = q(container, '[data-spring-counter]');
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('data-animating', '');

    raf.runToRest();
    expect(root).not.toHaveAttribute('data-animating');
  });

  it('renders instantly and schedules no frames when disabled', () => {
    const { container } = render(<SpringCounter value={9} disabled />);
    expect(q(container, '[data-spring-counter-value]').textContent).toBe('9');
    expect(raf.pending()).toBe(0);
  });

  it('supports a custom wrapper element via `as`', () => {
    const { container } = render(<SpringCounter value={0} from={0} as="div" />);
    expect(q(container, 'div[data-spring-counter]')).toBeTruthy();
  });

  it('uses a custom format function for both the value and the label', () => {
    const format = (v: number) => `#${Math.round(v)}`;
    const { container } = render(<SpringCounter value={5} disabled format={format} />);
    expect(q(container, '[data-spring-counter-value]').textContent).toBe('#5');
    expect(q(container, '[data-spring-counter-label]').textContent).toBe('#5');
  });

  it('honors a custom accessible label', () => {
    const { container } = render(
      <SpringCounter value={1234} disabled label="1.2k signups" locale="en-US" />,
    );
    expect(q(container, '[data-spring-counter-label]').textContent).toBe('1.2k signups');
    // The visible value still formats normally.
    expect(q(container, '[data-spring-counter-value]').textContent).toBe('1,234');
  });
});
