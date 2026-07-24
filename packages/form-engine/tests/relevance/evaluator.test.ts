import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRelevance, evaluateAllRelevance } from '../../src/relevance/evaluator.js';
import type { EvalContext } from '../../src/expression/types.js';

function ctx(answers: Record<string, unknown> = {}): EvalContext {
  return { answers };
}

describe('Relevance Evaluator', () => {
  // ─── Empty / trivial conditions ───────────────────────────────────────
  describe('empty / trivial conditions', () => {
    it('empty condition is always visible', () => {
      assert.strictEqual(evaluateRelevance('', ctx()), true);
    });

    it('whitespace-only condition is visible', () => {
      assert.strictEqual(evaluateRelevance('   ', ctx()), true);
    });

    it('"true" literal is visible', () => {
      assert.strictEqual(evaluateRelevance('true', ctx()), true);
    });

    it('"false" literal is hidden', () => {
      assert.strictEqual(evaluateRelevance('false', ctx()), false);
    });
  });

  // ─── Simple comparisons ───────────────────────────────────────────────
  describe('simple comparisons', () => {
    it('equals condition', () => {
      const context = ctx({ sexe: 'f' });
      assert.strictEqual(evaluateRelevance("${sexe} = 'f'", context), true);
      assert.strictEqual(evaluateRelevance("${sexe} = 'm'", context), false);
    });

    it('not equals condition', () => {
      const context = ctx({ statut: 'non' });
      assert.strictEqual(evaluateRelevance("${statut} != 'oui'", context), true);
      assert.strictEqual(evaluateRelevance("${statut} != 'non'", context), false);
    });

    it('numeric comparison', () => {
      const context = ctx({ age: 25 });
      assert.strictEqual(evaluateRelevance('${age} >= 18', context), true);
      assert.strictEqual(evaluateRelevance('${age} < 18', context), false);
    });

    it('contains substring', () => {
      const context = ctx({ culture: 'maïs' });
      assert.strictEqual(evaluateRelevance("${culture} contains 'ma'", context), true);
      assert.strictEqual(evaluateRelevance("${culture} contains 'riz'", context), false);
    });
  });

  // ─── Logical combinations ─────────────────────────────────────────────
  describe('logical combinations', () => {
    it('AND condition', () => {
      const context = ctx({ sexe: 'f', age: 25 });
      assert.strictEqual(evaluateRelevance("${sexe} = 'f' and ${age} >= 18", context), true);
      assert.strictEqual(evaluateRelevance("${sexe} = 'm' and ${age} >= 18", context), false);
    });

    it('OR condition', () => {
      const context = ctx({ type: 'urgent' });
      assert.strictEqual(evaluateRelevance("${type} = 'urgent' or ${type} = 'crash'", context), true);
      assert.strictEqual(evaluateRelevance("${type} = 'normal'", context), false);
    });

    it('complex combination with parentheses', () => {
      const context = ctx({ a: 1, b: 0, c: 1 });
      assert.strictEqual(
        evaluateRelevance('(${a} = 1 or ${b} = 1) and ${c} = 1', context),
        true,
      );
      assert.strictEqual(
        evaluateRelevance('(${a} = 0 or ${b} = 1) and ${c} = 1', context),
        false,
      );
    });

    it('NOT condition', () => {
      const context = ctx({ visible: false });
      assert.strictEqual(evaluateRelevance('${visible}', context), false);
      assert.strictEqual(evaluateRelevance('!${visible}', context), true);
    });
  });

  // ─── Missing / null values ────────────────────────────────────────────
  describe('missing / null values', () => {
    it('unknown variable evaluates to null/falsy', () => {
      assert.strictEqual(evaluateRelevance("${unknown} = 'x'", ctx()), false);
    });

    it('null variable is falsy', () => {
      assert.strictEqual(evaluateRelevance('${x}', ctx({ x: null })), false);
    });

    it('empty string variable is falsy', () => {
      assert.strictEqual(evaluateRelevance('${x}', ctx({ x: '' })), false);
    });
  });

  // ─── evaluateAllRelevance ─────────────────────────────────────────────
  describe('evaluateAllRelevance', () => {
    it('evaluates multiple conditions', () => {
      const conditions = [
        { name: 'q1', condition: "${sexe} = 'f'" },
        { name: 'q2', condition: "${age} >= 18" },
        { name: 'q3' },
      ];
      const context = ctx({ sexe: 'f', age: 15 });
      const result = evaluateAllRelevance(conditions, context);

      assert.strictEqual(result.q1, true);
      assert.strictEqual(result.q2, false);
      assert.strictEqual(result.q3, true);
    });

    it('handles empty conditions list', () => {
      assert.deepStrictEqual(evaluateAllRelevance([], ctx()), {});
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles malformed expression gracefully (falls back to true)', () => {
      // Expression that will fail to parse — logs warning and returns true
      assert.strictEqual(evaluateRelevance('${a +', ctx({ a: 1 })), true);
    });

    it('handles undefined context answers', () => {
      assert.strictEqual(evaluateRelevance("${x} = 'y'", ctx()), false);
    });

    it('evaluates bare variable as truthy/falsy', () => {
      assert.strictEqual(evaluateRelevance('${a}', ctx({ a: 1 })), true);
      assert.strictEqual(evaluateRelevance('${a}', ctx({ a: 0 })), false);
    });
  });
});
