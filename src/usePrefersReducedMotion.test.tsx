import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function Probe() {
  const reduced = usePrefersReducedMotion();
  return <span data-testid="rm">{reduced ? 'yes' : 'no'}</span>;
}

interface MockMql {
  matches: boolean;
  addEventListener?: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  removeEventListener?: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
}

function installMatchMedia(buildMql: () => MockMql): MockMql {
  const mql = buildMql();
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
  return mql;
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when matchMedia reports no preference', () => {
    installMatchMedia(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('no');
  });

  it('returns true when matchMedia reports reduced-motion preference', () => {
    installMatchMedia(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');
  });

  it('updates when the media query changes via addEventListener', () => {
    let listener: ((e: MediaQueryListEvent) => void) | undefined;
    const mql: MockMql = {
      matches: false,
      addEventListener: (_type, cb) => {
        listener = cb;
      },
      removeEventListener: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);

    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('no');

    act(() => {
      listener?.({ matches: true } as MediaQueryListEvent);
    });
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');
  });

  it('uses legacy addListener/removeListener when modern API is missing', () => {
    let listener: ((e: MediaQueryListEvent) => void) | undefined;
    const addListener = vi.fn((cb: (e: MediaQueryListEvent) => void) => {
      listener = cb;
    });
    const removeListener = vi.fn();
    const mql: MockMql = {
      matches: false,
      addListener,
      removeListener,
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);

    const { unmount } = render(<Probe />);
    expect(addListener).toHaveBeenCalledTimes(1);

    act(() => {
      listener?.({ matches: true } as MediaQueryListEvent);
    });
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');

    unmount();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });

  it('falls back to false when matchMedia is unavailable (SSR-ish)', () => {
    const original = window.matchMedia;
    delete (window as { matchMedia?: unknown }).matchMedia;
    try {
      render(<Probe />);
      expect(screen.getByTestId('rm')).toHaveTextContent('no');
    } finally {
      window.matchMedia = original;
    }
  });
});
