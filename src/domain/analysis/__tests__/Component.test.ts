/**
 * Component Entity Tests
 */

import { Component } from '../Component';
import { ComponentId } from '../ComponentId';
import { Framework, FrameworkType } from '../Framework';
import { ValidationError } from '../../errors/ValidationError';

describe('Component', () => {
  const createComponent = (
    name: string,
    filePath: string,
    hooks: string[] = [],
    dependencies: string[] = []
  ) => {
    return new Component(
      ComponentId.create(),
      name,
      filePath,
      Framework.create(FrameworkType.REACT),
      hooks,
      dependencies
    );
  };

  describe('creation', () => {
    it('should create component with valid data', () => {
      const component = createComponent('Button', 'components/Button.tsx');

      expect(component.getName()).toBe('Button');
      expect(component.getFilePath()).toBe('components/Button.tsx');
      expect(component.getFramework().getType()).toBe(FrameworkType.REACT);
    });

    it('should throw error for empty name', () => {
      expect(() => createComponent('', 'components/Button.tsx')).toThrow(ValidationError);
    });

    it('should throw error for empty file path', () => {
      expect(() => createComponent('Button', '')).toThrow(ValidationError);
    });

    it('should throw error for invalid component name (not PascalCase)', () => {
      expect(() => createComponent('button', 'components/button.tsx')).toThrow(ValidationError);
      expect(() => createComponent('myButton', 'components/myButton.tsx')).toThrow(ValidationError);
    });

    it('should accept valid PascalCase names', () => {
      expect(() => createComponent('Button', 'components/Button.tsx')).not.toThrow();
      expect(() => createComponent('MyComponent', 'components/MyComponent.tsx')).not.toThrow();
      expect(() => createComponent('Button123', 'components/Button123.tsx')).not.toThrow();
    });
  });

  describe('hooks', () => {
    it('should return hooks', () => {
      const component = createComponent('Button', 'components/Button.tsx', ['useState', 'useEffect']);

      expect(component.getHooks()).toEqual(['useState', 'useEffect']);
    });

    it('should check if has specific hook', () => {
      const component = createComponent('Button', 'components/Button.tsx', ['useState']);

      expect(component.hasHook('useState')).toBe(true);
      expect(component.hasHook('useEffect')).toBe(false);
    });

    it('should check if has any hooks', () => {
      const withHooks = createComponent('Button', 'components/Button.tsx', ['useState']);
      const withoutHooks = createComponent('Input', 'components/Input.tsx');

      expect(withHooks.hasHooks()).toBe(true);
      expect(withoutHooks.hasHooks()).toBe(false);
    });
  });

  describe('dependencies', () => {
    it('should return dependencies', () => {
      const component = createComponent(
        'Button',
        'components/Button.tsx',
        [],
        ['react', 'styled-components']
      );

      expect(component.getDependencies()).toEqual(['react', 'styled-components']);
    });
  });

  describe('file helpers', () => {
    it('should get file name', () => {
      const component = createComponent('Button', 'components/Button.tsx');

      expect(component.getFileName()).toBe('Button.tsx');
    });

    it('should get directory', () => {
      const component = createComponent('Button', 'components/ui/Button.tsx');

      expect(component.getDirectory()).toBe('components/ui');
    });

    it('should handle root directory', () => {
      const component = createComponent('Button', 'Button.tsx');

      expect(component.getDirectory()).toBe('');
    });
  });

  describe('equality', () => {
    it('should be equal for same ID', () => {
      const id = ComponentId.create();
      const comp1 = new Component(id, 'Button', 'components/Button.tsx', Framework.create(FrameworkType.REACT));
      const comp2 = new Component(id, 'Input', 'components/Input.tsx', Framework.create(FrameworkType.VUE));

      expect(comp1.equals(comp2)).toBe(true);
    });

    it('should not be equal for different IDs', () => {
      const comp1 = createComponent('Button', 'components/Button.tsx');
      const comp2 = createComponent('Button', 'components/Button.tsx');

      expect(comp1.equals(comp2)).toBe(false);
    });
  });

  describe('string representation', () => {
    it('should have proper string representation', () => {
      const component = createComponent('Button', 'components/Button.tsx');

      expect(component.toString()).toBe('Button (React)');
    });
  });
});
