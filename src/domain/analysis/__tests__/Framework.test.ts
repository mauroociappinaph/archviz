/**
 * Framework Value Object Tests
 */

import { Framework, FrameworkType } from '../Framework';

describe('Framework', () => {
  describe('create', () => {
    it('should create framework from enum', () => {
      const framework = Framework.create(FrameworkType.REACT);
      expect(framework.getType()).toBe(FrameworkType.REACT);
    });

    it('should convert to string correctly', () => {
      const framework = Framework.create(FrameworkType.REACT);
      expect(framework.toString()).toBe('React');
    });
  });

  describe('fromString', () => {
    it('should detect React framework', () => {
      const framework = Framework.fromString('react');
      expect(framework.getType()).toBe(FrameworkType.REACT);
    });

    it('should detect Vue framework', () => {
      const framework = Framework.fromString('vue');
      expect(framework.getType()).toBe(FrameworkType.VUE);
    });

    it('should detect Angular framework', () => {
      const framework = Framework.fromString('angular');
      expect(framework.getType()).toBe(FrameworkType.ANGULAR);
    });

    it('should detect Svelte framework', () => {
      const framework = Framework.fromString('svelte');
      expect(framework.getType()).toBe(FrameworkType.SVELTE);
    });

    it('should detect SolidJS framework', () => {
      const framework = Framework.fromString('solid');
      expect(framework.getType()).toBe(FrameworkType.SOLIDJS);
    });

    it('should detect Next.js framework', () => {
      const framework = Framework.fromString('next');
      expect(framework.getType()).toBe(FrameworkType.NEXTJS);
    });

    it('should handle case insensitivity', () => {
      const framework = Framework.fromString('REACT');
      expect(framework.getType()).toBe(FrameworkType.REACT);
    });

    it('should trim whitespace', () => {
      const framework = Framework.fromString('  react  ');
      expect(framework.getType()).toBe(FrameworkType.REACT);
    });

    it('should return UNKNOWN for unrecognized framework', () => {
      const framework = Framework.fromString('unknown-framework');
      expect(framework.getType()).toBe(FrameworkType.UNKNOWN);
    });
  });

  describe('detectPredominant', () => {
    it('should detect React as predominant', () => {
      const frameworks = [
        Framework.create(FrameworkType.REACT),
        Framework.create(FrameworkType.REACT),
        Framework.create(FrameworkType.VUE),
      ];

      const predominant = Framework.detectPredominant(frameworks);
      expect(predominant.getType()).toBe(FrameworkType.REACT);
    });

    it('should return UNKNOWN for empty array', () => {
      const predominant = Framework.detectPredominant([]);
      expect(predominant.getType()).toBe(FrameworkType.UNKNOWN);
    });

    it('should ignore UNKNOWN when finding predominant', () => {
      const frameworks = [
        Framework.create(FrameworkType.UNKNOWN),
        Framework.create(FrameworkType.UNKNOWN),
        Framework.create(FrameworkType.VUE),
      ];

      const predominant = Framework.detectPredominant(frameworks);
      expect(predominant.getType()).toBe(FrameworkType.VUE);
    });
  });

  describe('equality', () => {
    it('should be equal for same framework type', () => {
      const fw1 = Framework.create(FrameworkType.REACT);
      const fw2 = Framework.create(FrameworkType.REACT);

      expect(fw1.equals(fw2)).toBe(true);
    });

    it('should not be equal for different framework types', () => {
      const fw1 = Framework.create(FrameworkType.REACT);
      const fw2 = Framework.create(FrameworkType.VUE);

      expect(fw1.equals(fw2)).toBe(false);
    });
  });

  describe('isUnknown', () => {
    it('should return true for unknown framework', () => {
      const framework = Framework.create(FrameworkType.UNKNOWN);
      expect(framework.isUnknown()).toBe(true);
    });

    it('should return false for known framework', () => {
      const framework = Framework.create(FrameworkType.REACT);
      expect(framework.isUnknown()).toBe(false);
    });
  });
});
