import { describe, it, expect, beforeEach } from 'vitest';
import { UnprocessableEntityException } from '@nestjs/common';
import { FormsService, type SchemaIssue } from './forms.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

/**
 * Unit tests for form schema validation at publication time.
 *
 * A published version is immutable and drives collection on every device —
 * an invalid schema that slips through cannot be fixed in place. These rules
 * are therefore business-critical (see docs/24_RISQUES_ET_LACUNES.md §6).
 *
 * `validateSchema` is pure: it never touches the database.
 */
describe('FormsService — schema validation', () => {
  let service: FormsService;

  beforeEach(() => {
    service = new FormsService(null as unknown as PrismaService);
  });

  /** Builds a minimal valid schema, overridable per test. */
  const buildSchema = (overrides: Record<string, unknown> = {}) => ({
    name: 'Enquête ménage',
    defaultLanguage: 'fr',
    languages: ['fr'],
    pages: [
      {
        name: 'identification',
        repeat: false,
        questions: [
          { name: 'village', type: 'text', label: { fr: 'Village' }, required: true },
        ],
      },
    ],
    ...overrides,
  });

  /** Runs validation and returns the `details` array of the thrown 422. */
  const collectIssues = (schema: unknown): SchemaIssue[] => {
    try {
      service.validateSchema(schema);
      return [];
    } catch (err) {
      expect(err).toBeInstanceOf(UnprocessableEntityException);
      const response = (err as UnprocessableEntityException).getResponse() as {
        details: SchemaIssue[];
      };
      return response.details;
    }
  };

  describe('valid schemas', () => {
    it('accepts a minimal well-formed schema', () => {
      const result = service.validateSchema(buildSchema());
      expect(result.name).toBe('Enquête ménage');
      expect(result.pages).toHaveLength(1);
    });

    it('accepts a backward reference in a relevance expression', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [
              {
                name: 'sexe',
                type: 'select_one',
                options: [
                  { value: 'm', label: { fr: 'Homme' } },
                  { value: 'f', label: { fr: 'Femme' } },
                ],
              },
              { name: 'enceinte', type: 'text', relevant: '${sexe} = "f"' },
            ],
          },
        ],
      });

      expect(() => service.validateSchema(schema)).not.toThrow();
    });

    it('allows a constraint to reference its own question', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [
              { name: 'age', type: 'integer', constraint: '${age} >= 0 and ${age} <= 120' },
            ],
          },
        ],
      });

      expect(() => service.validateSchema(schema)).not.toThrow();
    });
  });

  describe('structural rules', () => {
    it('rejects a schema with no questions at all', () => {
      const issues = collectIssues(buildSchema({ pages: [] }));
      expect(issues.some((i) => i.rule === 'min_questions')).toBe(true);
    });

    it('rejects duplicate question names across pages', () => {
      const schema = buildSchema({
        pages: [
          { name: 'p1', repeat: false, questions: [{ name: 'nom', type: 'text' }] },
          { name: 'p2', repeat: false, questions: [{ name: 'nom', type: 'text' }] },
        ],
      });

      const issues = collectIssues(schema);
      const duplicate = issues.find((i) => i.rule === 'unique_name');
      expect(duplicate).toBeDefined();
      expect(duplicate?.message).toContain('nom');
    });

    it('rejects duplicate page names', () => {
      const schema = buildSchema({
        pages: [
          { name: 'section', repeat: false, questions: [{ name: 'a', type: 'text' }] },
          { name: 'section', repeat: false, questions: [{ name: 'b', type: 'text' }] },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'unique_name' && i.path.endsWith('name'))).toBe(true);
    });

    it('rejects a choice question without options', () => {
      const schema = buildSchema({
        pages: [
          { name: 'p1', repeat: false, questions: [{ name: 'sexe', type: 'select_one' }] },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'options_required')).toBe(true);
    });

    it('rejects a calculate question without a formula', () => {
      const schema = buildSchema({
        pages: [
          { name: 'p1', repeat: false, questions: [{ name: 'total', type: 'calculate' }] },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'calculation_required')).toBe(true);
    });

    it('rejects a default language absent from the languages list', () => {
      const issues = collectIssues(buildSchema({ defaultLanguage: 'en', languages: ['fr'] }));
      expect(issues.some((i) => i.rule === 'language_coherence')).toBe(true);
    });
  });

  describe('expression rules', () => {
    it('rejects an unparseable expression', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [{ name: 'a', type: 'text', relevant: '${b} = = =' }],
          },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'expression_syntax')).toBe(true);
    });

    it('rejects a forward reference to a later question', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [
              { name: 'a', type: 'text', relevant: '${b} = "x"' },
              { name: 'b', type: 'text' },
            ],
          },
        ],
      });

      const issues = collectIssues(schema);
      const forward = issues.find((i) => i.rule === 'forward_reference');
      expect(forward).toBeDefined();
      expect(forward?.message).toContain('"b"');
    });

    it('rejects a reference to an unknown question', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [{ name: 'a', type: 'text', relevant: '${inexistant} = 1' }],
          },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'forward_reference')).toBe(true);
    });

    it('rejects a question whose relevance references itself', () => {
      const schema = buildSchema({
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [{ name: 'boucle', type: 'text', relevant: '${boucle} = "x"' }],
          },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.some((i) => i.rule === 'circular_reference')).toBe(true);
    });
  });

  describe('error reporting', () => {
    it('reports every problem at once rather than failing on the first', () => {
      const schema = buildSchema({
        defaultLanguage: 'en',
        languages: ['fr'],
        pages: [
          {
            name: 'p1',
            repeat: false,
            questions: [
              { name: 'sexe', type: 'select_one' }, // missing options
              { name: 'sexe', type: 'text' }, // duplicate name
              { name: 'calc', type: 'calculate' }, // missing calculation
            ],
          },
        ],
      });

      const issues = collectIssues(schema);
      const rules = issues.map((i) => i.rule);

      expect(rules).toContain('language_coherence');
      expect(rules).toContain('options_required');
      expect(rules).toContain('unique_name');
      expect(rules).toContain('calculation_required');
    });

    it('surfaces zod structural errors with a readable path', () => {
      // `name` is required by the zod schema.
      const issues = collectIssues({ pages: [] });
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toHaveProperty('path');
      expect(issues[0]).toHaveProperty('message');
    });

    it('rejects an invalid variable name (not a valid identifier)', () => {
      const schema = buildSchema({
        pages: [
          { name: 'p1', repeat: false, questions: [{ name: '2invalid', type: 'text' }] },
        ],
      });

      const issues = collectIssues(schema);
      expect(issues.length).toBeGreaterThan(0);
    });
  });
});
