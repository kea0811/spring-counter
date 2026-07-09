import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * A deterministic requestAnimationFrame harness for tests. Frames only advance
 * when you call `step`/`frame`, and a monotonic clock is shared across calls so
 * the spring integrator sees sensible, increasing timestamps.
 */
export interface RafHarness {
  /** Advance the clock by `ms` (default 16) and run one frame. */
  step: (ms?: number) => void;
  /** Run one frame at an absolute timestamp `t` (ms). */
  frame: (t: number) => void;
  /** Step 16ms at a time until nothing is scheduled (or `cap` frames). */
  runToRest: (cap?: number) => number;
  /** How many frames are currently scheduled. */
  pending: () => number;
}

export function installRaf(): RafHarness {
  const callbacks = new Map<number, FrameRequestCallback>();
  let id = 0;
  let clock = 0;

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    id += 1;
    callbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (handle: number): void => {
    callbacks.delete(handle);
  });

  const frame = (t: number): void => {
    const pending = [...callbacks.values()];
    callbacks.clear();
    act(() => {
      pending.forEach((cb) => cb(t));
    });
  };

  const step = (ms = 16): void => {
    clock += ms;
    frame(clock);
  };

  const runToRest = (cap = 5000): number => {
    let count = 0;
    while (callbacks.size > 0 && count < cap) {
      step(16);
      count += 1;
    }
    return count;
  };

  return { step, frame, runToRest, pending: () => callbacks.size };
}
