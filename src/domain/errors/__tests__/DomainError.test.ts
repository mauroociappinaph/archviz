/**
 * Domain Error Tests
 */

import { ValidationError } from '../ValidationError';

describe('ValidationError', () => {
  describe('creation', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Invalid email format');

      expect(error.message).toBe('Invalid email format');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should include code and statusCode in JSON', () => {
      const error = new ValidationError('Test error');
      const json = error.toJSON();

      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(400);
    });
  });

  describe('factory methods', () => {
    it('should create empty field error', () => {
      const error = ValidationError.emptyField('username');

      expect(error.message).toBe('username cannot be empty');
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should create invalid URL error', () => {
      const error = ValidationError.invalidUrl('not-a-url');

      expect(error.message).toBe('Invalid URL format: not-a-url');
    });

    it('should create invalid component name error', () => {
      const error = ValidationError.invalidComponentName('my-component');

      expect(error.message).toBe('Invalid component name: my-component');
    });
  });
});
