/**
 * Relationship Value Object Tests
 */

import { Relationship, RelationshipType } from '../Relationship';
import { ComponentId } from '../ComponentId';

describe('Relationship', () => {
  describe('creation', () => {
    it('should create relationship with default type IMPORTS', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();
      const relationship = new Relationship(fromId, toId);

      expect(relationship.getFrom()).toBe(fromId);
      expect(relationship.getTo()).toBe(toId);
      expect(relationship.getType()).toBe(RelationshipType.IMPORTS);
    });

    it('should create relationship with explicit type', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();
      const relationship = new Relationship(fromId, toId, RelationshipType.EXTENDS);

      expect(relationship.getType()).toBe(RelationshipType.EXTENDS);
    });

    it('should support all relationship types', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();

      const types = [
        RelationshipType.IMPORTS,
        RelationshipType.EXTENDS,
        RelationshipType.IMPLEMENTS,
        RelationshipType.USES,
        RelationshipType.COMPOSES,
      ];

      types.forEach((type) => {
        const rel = new Relationship(fromId, toId, type);
        expect(rel.getType()).toBe(type);
      });
    });
  });

  describe('equality', () => {
    it('should be equal for same IDs and type', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();

      const rel1 = new Relationship(fromId, toId, RelationshipType.IMPORTS);
      const rel2 = new Relationship(fromId, toId, RelationshipType.IMPORTS);

      expect(rel1.equals(rel2)).toBe(true);
    });

    it('should not be equal for different from ID', () => {
      const toId = ComponentId.create();

      const rel1 = new Relationship(ComponentId.create(), toId, RelationshipType.IMPORTS);
      const rel2 = new Relationship(ComponentId.create(), toId, RelationshipType.IMPORTS);

      expect(rel1.equals(rel2)).toBe(false);
    });

    it('should not be equal for different to ID', () => {
      const fromId = ComponentId.create();

      const rel1 = new Relationship(fromId, ComponentId.create(), RelationshipType.IMPORTS);
      const rel2 = new Relationship(fromId, ComponentId.create(), RelationshipType.IMPORTS);

      expect(rel1.equals(rel2)).toBe(false);
    });

    it('should not be equal for different type', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();

      const rel1 = new Relationship(fromId, toId, RelationshipType.IMPORTS);
      const rel2 = new Relationship(fromId, toId, RelationshipType.EXTENDS);

      expect(rel1.equals(rel2)).toBe(false);
    });
  });

  describe('string representation', () => {
    it('should have proper string representation', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();
      const relationship = new Relationship(fromId, toId, RelationshipType.IMPORTS);

      const str = relationship.toString();
      expect(str).toContain(fromId.toString());
      expect(str).toContain(toId.toString());
      expect(str).toContain(RelationshipType.IMPORTS);
      expect(str).toContain('--');
      expect(str).toContain('-->');
    });

    it('should include correct relationship type in string', () => {
      const fromId = ComponentId.create();
      const toId = ComponentId.create();

      const relImports = new Relationship(fromId, toId, RelationshipType.IMPORTS);
      expect(relImports.toString()).toContain(RelationshipType.IMPORTS);

      const relExtends = new Relationship(fromId, toId, RelationshipType.EXTENDS);
      expect(relExtends.toString()).toContain(RelationshipType.EXTENDS);
    });
  });
});
