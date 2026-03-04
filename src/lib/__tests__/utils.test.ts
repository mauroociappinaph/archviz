/**
 * Utils Tests
 */

import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const result = cn('base', condition && 'conditional');
    expect(result).toBe('base conditional');
  });

  it('should filter out falsy values', () => {
    const result = cn('class1', false && 'hidden', null, undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    // tailwind-merge should resolve conflicts
    expect(result).toContain('px-4');
  });
});
