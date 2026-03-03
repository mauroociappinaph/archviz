/**
 * ID Value Object Tests
 * Tests for RepositoryId and ComponentId
 */

import { RepositoryId } from '../RepositoryId';
import { ComponentId } from '../ComponentId';
import { ValidationError } from '../../errors/ValidationError';

describe('RepositoryId', () => {
  describe('create', () => {
    it('should generate unique UUIDs', () => {
      const id1 = RepositoryId.create();
      const id2 = RepositoryId.create();

      expect(id1.toString()).not.toBe(id2.toString());
    });

    it('should generate valid UUID v4 format', () => {
      const id = RepositoryId.create();
      const uuid = id.toString();

      // UUID v4 regex: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidV4Regex);
    });
  });

  describe('fromString', () => {
    it('should create from valid UUID string', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = RepositoryId.fromString(validUuid);

      expect(id.toString()).toBe(validUuid);
    });

    it('should throw error for empty string', () => {
      expect(() => RepositoryId.fromString('')).toThrow(ValidationError);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => RepositoryId.fromString('not-a-uuid')).toThrow(ValidationError);
      expect(() => RepositoryId.fromString('123')).toThrow(ValidationError);
    });

    it('should throw error for UUID with wrong version', () => {
      // Version 5 instead of 4
      const wrongVersion = '550e8400-e29b-51d4-a716-446655440000';
      expect(() => RepositoryId.fromString(wrongVersion)).toThrow(ValidationError);
    });

    it('should throw error for non-string input', () => {
      expect(() => RepositoryId.fromString(null as any)).toThrow(ValidationError);
      expect(() => RepositoryId.fromString(undefined as any)).toThrow(ValidationError);
    });
  });

  describe('equality', () => {
    it('should be equal for same UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = RepositoryId.fromString(uuid);
      const id2 = RepositoryId.fromString(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should not be equal for different UUIDs', () => {
      const id1 = RepositoryId.create();
      const id2 = RepositoryId.create();

      expect(id1.equals(id2)).toBe(false);
    });
  });
});

describe('ComponentId', () => {
  describe('create', () => {
    it('should generate unique UUIDs', () => {
      const id1 = ComponentId.create();
      const id2 = ComponentId.create();

      expect(id1.toString()).not.toBe(id2.toString());
    });

    it('should generate valid UUID v4 format', () => {
      const id = ComponentId.create();
      const uuid = id.toString();

      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidV4Regex);
    });
  });

  describe('fromString', () => {
    it('should create from valid UUID string', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = ComponentId.fromString(validUuid);

      expect(id.toString()).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => ComponentId.fromString('invalid')).toThrow(ValidationError);
    });
  });

  describe('equality', () => {
    it('should be equal for same UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = ComponentId.fromString(uuid);
      const id2 = ComponentId.fromString(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should not be equal for different UUIDs', () => {
      const id1 = ComponentId.create();
      const id2 = ComponentId.create();

      expect(id1.equals(id2)).toBe(false);
    });
  });
});
