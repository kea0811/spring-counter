import { describe, it, expect } from 'vitest';
import { version } from '../src/index';

describe('spring-counter (scaffold)', () => {
  it('exposes the initial version placeholder', () => {
    expect(version).toBe('0.1.0');
  });
});
