import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, calculateAll, aggregateRepeatGroup } from '../../src/calculation/calculator.js';
import type { EvalContext } from '../../src/expression/types.js';

function ctx(answers: Record<string, unknown> = {}): EvalContext {
  return { answers };
}

describe('Calculation Engine', () => {
  // ─── Single calculation ───────────────────────────────────────────────
  describe('calculate single formula', () => {
    it('evaluates a simple formula', () => {
      assert.strictEqual(calculate('${a} + ${b}', ctx({ a: 10, b: 5 })), 15);
    });

    it('evaluates a formula with mixed operators', () => {
      assert.strictEqual(calculate('(${a} + ${b}) * ${c}', ctx({ a: 2, b: 3, c: 4 })), 20);
    });

    it('returns null for empty formula', () => {
      assert.strictEqual(calculate('', ctx()), null);
    });

    it('returns null for whitespace-only formula', () => {
      assert.strictEqual(calculate('   ', ctx()), null);
    });

    it('handles division', () => {
      assert.strictEqual(calculate('${total} / ${count}', ctx({ total: 100, count: 4 })), 25);
    });

    it('returns null on parse error (logs warning)', () => {
      assert.strictEqual(calculate('${a +', ctx({ a: 1 })), null);
    });

    it('returns null for missing variable', () => {
      assert.strictEqual(calculate('${a}', ctx({})), null);
    });
  });

  // ─── calculateAll (dependency order) ──────────────────────────────────
  describe('calculateAll -- dependency ordering', () => {
    it('evaluates fields in order, adding to answers', () => {
      const fields = [
        { name: 'total', formula: '${price} * ${quantity}' },
        { name: 'tax', formula: '${total} * 0.2' },
      ];
      const results = calculateAll(fields, { price: 100, quantity: 2 });
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].name, 'total');
      assert.strictEqual(results[0].value, 200);
      assert.strictEqual(results[1].name, 'tax');
      assert.strictEqual(results[1].value, 40);
    });

    it('handles no dependencies between fields', () => {
      const fields = [
        { name: 'a', formula: '${x} + 1' },
        { name: 'b', formula: '${y} + 2' },
      ];
      const results = calculateAll(fields, { x: 10, y: 20 });
      assert.strictEqual(results[0].value, 11);
      assert.strictEqual(results[1].value, 22);
    });

    it('handles circular dependencies gracefully', () => {
      const fields = [
        { name: 'a', formula: '${b} + 1' },
        { name: 'b', formula: '${a} + 1' },
      ];
      const results = calculateAll(fields, {});
      assert.strictEqual(results.length, 2);
      assert.notStrictEqual(results[0].value, undefined);
      assert.notStrictEqual(results[1].value, undefined);
    });

    it('handles empty fields array', () => {
      assert.deepStrictEqual(calculateAll([], {}), []);
    });
  });

  // ─── aggregateRepeatGroup ─────────────────────────────────────────────
  describe('aggregateRepeatGroup', () => {
    const repeatData = {
      parcelles: [
        { surface: 10, rendement: 4.5 },
        { surface: 20, rendement: 3.2 },
        { surface: 15, rendement: 5.0 },
      ],
    };

    it('count returns number of items', () => {
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', repeatData, 'count'), 3);
    });

    it('sum aggregates all values', () => {
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', repeatData, 'sum'), 45);
    });

    it('avg calculates mean', () => {
      const avg = aggregateRepeatGroup('parcelles', 'rendement', repeatData, 'avg') as number;
      assert.ok(Math.abs(avg - 4.2333) < 0.01);
    });

    it('min returns smallest value', () => {
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', repeatData, 'min'), 10);
    });

    it('max returns largest value', () => {
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', repeatData, 'max'), 20);
    });

    it('returns 0 for count on empty group', () => {
      assert.strictEqual(aggregateRepeatGroup('empty', 'x', {}, 'count'), 0);
    });

    it('returns null for other operations on empty group', () => {
      assert.strictEqual(aggregateRepeatGroup('empty', 'x', {}, 'sum'), null);
      assert.strictEqual(aggregateRepeatGroup('empty', 'x', {}, 'avg'), null);
      assert.strictEqual(aggregateRepeatGroup('empty', 'x', {}, 'min'), null);
      assert.strictEqual(aggregateRepeatGroup('empty', 'x', {}, 'max'), null);
    });

    it('handles non-array group value', () => {
      const data = { parcelles: 'not_an_array' };
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', data, 'count'), 0);
      assert.strictEqual(aggregateRepeatGroup('parcelles', 'surface', data, 'sum'), null);
    });

    it('filters NaN values from aggregation', () => {
      const data = {
        items: [
          { val: 10 },
          { val: 'not_a_number' },
          { val: 20 },
        ],
      };
      assert.strictEqual(aggregateRepeatGroup('items', 'val', data, 'sum'), 30);
      assert.strictEqual(aggregateRepeatGroup('items', 'val', data, 'avg'), 15);
    });

    it('returns null for min/max on all-NaN values', () => {
      const data = {
        items: [{ val: 'abc' }, { val: 'def' }],
      };
      assert.strictEqual(aggregateRepeatGroup('items', 'val', data, 'min'), null);
      assert.strictEqual(aggregateRepeatGroup('items', 'val', data, 'max'), null);
    });
  });
});
