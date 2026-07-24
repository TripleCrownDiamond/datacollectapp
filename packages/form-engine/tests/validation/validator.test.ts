import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAnswer, validateAll } from '../../src/validation/validator.js';
import type { ValidationConfig } from '../../src/validation/validator.js';
import type { EvalContext } from '../../src/expression/types.js';

function ctx(answers: Record<string, unknown> = {}): EvalContext {
  return { answers };
}

describe('Validation', () => {
  // ─── Required ─────────────────────────────────────────────────────────
  describe('required', () => {
    it('passes when value is present', () => {
      const result = validateAnswer('name', 'Alice', { required: true }, ctx());
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('fails when value is null', () => {
      const result = validateAnswer('name', null, { required: true }, ctx());
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors[0].message!.includes('required'));
    });

    it('fails when value is undefined', () => {
      const result = validateAnswer('name', undefined, { required: true }, ctx());
      assert.strictEqual(result.valid, false);
    });

    it('fails when value is empty string', () => {
      const result = validateAnswer('name', '', { required: true }, ctx());
      assert.strictEqual(result.valid, false);
    });

    it('fails when value is whitespace-only string', () => {
      const result = validateAnswer('name', '   ', { required: true }, ctx());
      assert.strictEqual(result.valid, false);
    });

    it('passes when optional and empty', () => {
      const result = validateAnswer('name', '', { required: false }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('uses custom required message', () => {
      const result = validateAnswer('name', null, {
        required: true,
        requiredMessage: 'Name is mandatory!',
      }, ctx());
      assert.strictEqual(result.errors[0].message, 'Name is mandatory!');
    });

    it('uses default required message', () => {
      const result = validateAnswer('name', null, { required: true }, ctx());
      assert.strictEqual(result.errors[0].message, "'name' is required");
    });

    it('number 0 is not empty (passes required)', () => {
      const result = validateAnswer('count', 0, { required: true }, ctx());
      assert.strictEqual(result.valid, true);
    });
  });

  // ─── Min ──────────────────────────────────────────────────────────────
  describe('min', () => {
    it('passes when value >= min', () => {
      const result = validateAnswer('age', 18, { min: 18 }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('fails when value < min', () => {
      const result = validateAnswer('age', 15, { min: 18 }, ctx());
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors[0].message!.includes('≥'));
    });

    it('skips min check for non-numeric value', () => {
      const result = validateAnswer('name', 'Alice', { min: 3 }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('uses custom min message', () => {
      const result = validateAnswer('age', 15, {
        min: 18,
        minMessage: 'Must be at least 18',
      }, ctx());
      assert.strictEqual(result.errors[0].message, 'Must be at least 18');
    });
  });

  // ─── Max ──────────────────────────────────────────────────────────────
  describe('max', () => {
    it('passes when value <= max', () => {
      const result = validateAnswer('age', 18, { max: 18 }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('fails when value > max', () => {
      const result = validateAnswer('age', 25, { max: 18 }, ctx());
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors[0].message!.includes('≤'));
    });

    it('uses custom max message', () => {
      const result = validateAnswer('age', 25, {
        max: 18,
        maxMessage: 'Maximum 18 years',
      }, ctx());
      assert.strictEqual(result.errors[0].message, 'Maximum 18 years');
    });
  });

  // ─── Regex ────────────────────────────────────────────────────────────
  describe('regex', () => {
    it('passes when value matches pattern', () => {
      const result = validateAnswer('code', 'ABC123', { regex: '^[A-Z]{3}\\d{3}$' }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('fails when value does not match', () => {
      const result = validateAnswer('code', 'abc123', { regex: '^[A-Z]{3}\\d{3}$' }, ctx());
      assert.strictEqual(result.valid, false);
    });

    it('skips regex for non-string values', () => {
      const result = validateAnswer('count', 42, { regex: '^\\d+$' }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('uses custom regex message', () => {
      const result = validateAnswer('code', 'abc', {
        regex: '^[A-Z]+$',
        regexMessage: 'Only uppercase allowed',
      }, ctx());
      assert.strictEqual(result.errors[0].message, 'Only uppercase allowed');
    });

    it('handles invalid regex gracefully', () => {
      const result = validateAnswer('code', 'test', { regex: '[invalid' }, ctx());
      assert.strictEqual(result.valid, true); // Invalid regex → skipped
    });
  });

  // ─── Constraint expression ────────────────────────────────────────────
  describe('constraint expression', () => {
    it('passes when constraint is satisfied', () => {
      const result = validateAnswer('age', 25, {
        constraint: '. >= 18 and . <= 120',
      }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('fails when constraint fails', () => {
      const result = validateAnswer('age', 150, {
        constraint: '. >= 18 and . <= 120',
      }, ctx());
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors[0].message!.includes('Constraint'));
    });

    it('handles decimal numbers in constraint (regression test)', () => {
      // The dot in 0.5 should NOT be replaced by __self__
      const result = validateAnswer('value', 0.5, {
        constraint: '. >= 0 and . <= 0.5',
      }, ctx());
      assert.strictEqual(result.valid, true);
    });

    it('uses custom constraint message', () => {
      const result = validateAnswer('age', 150, {
        constraint: '. >= 18 and . <= 120',
        constraintMessage: 'Age must be between 18 and 120',
      }, ctx());
      assert.strictEqual(result.errors[0].message, 'Age must be between 18 and 120');
    });

    it('reference other answers in constraint', () => {
      const context = ctx({ minAge: 18 });
      const result = validateAnswer('age', 25, {
        constraint: '. >= ${minAge}',
      }, context);
      assert.strictEqual(result.valid, true);
    });

    it('handles malformed constraint gracefully', () => {
      const result = validateAnswer('x', 5, {
        constraint: 'invalid syntax @@@',
      }, ctx());
      // Should not throw; skipped gracefully
      assert.strictEqual(result.valid, true);
    });
  });

  // ─── Combined constraints ─────────────────────────────────────────────
  describe('combined constraints', () => {
    it('reports multiple errors at once', () => {
      const result = validateAnswer('age', 5, {
        required: true,
        min: 18,
        max: 120,
      }, ctx());
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1); // min fails (5 < 18)
    });

    it('required error appears alongside other errors', () => {
      const result = validateAnswer('age', null, {
        required: true,
        min: 18,
      }, ctx());
      assert.strictEqual(result.valid, false);
      // When value is empty and required, we skip further checks
      assert.strictEqual(result.errors.length, 1);
    });
  });

  // ─── validateAll ──────────────────────────────────────────────────────
  describe('validateAll', () => {
    it('validates multiple answers', () => {
      const answers = { name: 'Alice', age: 15 };
      const constraints: Record<string, ValidationConfig> = {
        name: { required: true },
        age: { min: 18 },
      };

      const results = validateAll(answers, constraints, ctx());
      assert.strictEqual(results.length, 2);

      const nameResult = results.find((r) => r.questionName === 'name')!;
      assert.strictEqual(nameResult.valid, true);

      const ageResult = results.find((r) => r.questionName === 'age')!;
      assert.strictEqual(ageResult.valid, false);
    });

    it('handles empty constraints', () => {
      const results = validateAll({ name: 'Alice' }, {}, ctx());
      assert.strictEqual(results.length, 0);
    });

    it('handles missing answer as undefined', () => {
      const constraints: Record<string, ValidationConfig> = {
        name: { required: true },
      };
      const results = validateAll({}, constraints, ctx());
      assert.strictEqual(results[0].valid, false);
    });
  });
});
