import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpression } from '../../src/expression/parser.js';
import { evaluate } from '../../src/expression/evaluator.js';
import type { EvalContext } from '../../src/expression/types.js';

function ctx(answers: Record<string, unknown> = {}, repeatIndex?: number): EvalContext {
  return { answers, repeatIndex };
}

function evalExpr(expr: string, context: EvalContext = ctx()): unknown {
  const ast = parseExpression(expr);
  return evaluate(ast, context);
}

describe('Expression Evaluator', () => {
  // ─── Literals ─────────────────────────────────────────────────────────
  describe('literals', () => {
    it('evaluates string literals', () => {
      assert.strictEqual(evalExpr("'hello'"), 'hello');
    });

    it('evaluates number literals', () => {
      assert.strictEqual(evalExpr('42'), 42);
    });

    it('evaluates decimal literals', () => {
      assert.strictEqual(evalExpr('3.14'), 3.14);
    });
  });

  // ─── Variables ────────────────────────────────────────────────────────
  describe('variables', () => {
    it('resolves a variable from context', () => {
      assert.strictEqual(evalExpr('${name}', ctx({ name: 'Alice' })), 'Alice');
    });

    it('returns null for unknown variables', () => {
      assert.strictEqual(evalExpr('${unknown}', ctx({})), null);
    });

    it('resolves bare identifier as variable', () => {
      assert.strictEqual(evalExpr('age', ctx({ age: 25 })), 25);
    });

    it('resolves repeat-indexed array values', () => {
      const context = ctx({ items: ['a', 'b', 'c'] }, 1);
      assert.strictEqual(evalExpr('${items}', context), 'b');
    });

    it('returns full array when repeatIndex is undefined', () => {
      const context = ctx({ items: ['a', 'b', 'c'] });
      assert.deepStrictEqual(evalExpr('${items}', context), ['a', 'b', 'c']);
    });

    it('handles repeatIndex beyond array length', () => {
      const context = ctx({ items: ['a'] }, 5);
      assert.strictEqual(evalExpr('${items}', context), undefined);
    });
  });

  // ─── Comparison operators ─────────────────────────────────────────────
  describe('comparison operators', () => {
    it('equality (string)', () => {
      assert.strictEqual(evalExpr("'abc' = 'abc'", ctx()), true);
      assert.strictEqual(evalExpr("'abc' = 'xyz'", ctx()), false);
    });

    it('equality (number)', () => {
      assert.strictEqual(evalExpr('5 = 5', ctx()), true);
      assert.strictEqual(evalExpr('5 = 6', ctx()), false);
    });

    it('equality (string vs number coercision)', () => {
      assert.strictEqual(evalExpr("5 = '5'", ctx()), true);
    });

    it('inequality', () => {
      assert.strictEqual(evalExpr("'a' != 'b'", ctx()), true);
      assert.strictEqual(evalExpr("'a' != 'a'", ctx()), false);
    });

    it('less than (numbers)', () => {
      assert.strictEqual(evalExpr('3 < 5', ctx()), true);
      assert.strictEqual(evalExpr('5 < 3', ctx()), false);
      assert.strictEqual(evalExpr('3 < 3', ctx()), false);
    });

    it('less or equal', () => {
      assert.strictEqual(evalExpr('3 <= 5', ctx()), true);
      assert.strictEqual(evalExpr('3 <= 3', ctx()), true);
      assert.strictEqual(evalExpr('5 <= 3', ctx()), false);
    });

    it('greater than', () => {
      assert.strictEqual(evalExpr('5 > 3', ctx()), true);
      assert.strictEqual(evalExpr('3 > 5', ctx()), false);
    });

    it('greater or equal', () => {
      assert.strictEqual(evalExpr('5 >= 3', ctx()), true);
      assert.strictEqual(evalExpr('5 >= 5', ctx()), true);
      assert.strictEqual(evalExpr('3 >= 5', ctx()), false);
    });

    it('contains (substring match)', () => {
      assert.strictEqual(evalExpr("'hello world' contains 'world'", ctx()), true);
      assert.strictEqual(evalExpr("'hello world' contains 'xyz'", ctx()), false);
    });

    it('contains with variable', () => {
      assert.strictEqual(evalExpr("${a} contains 'bc'", ctx({ a: 'abcd' })), true);
    });
  });

  // ─── Logical operators ────────────────────────────────────────────────
  describe('logical operators', () => {
    it('AND (both truthy)', () => {
      assert.strictEqual(evalExpr('1 and 1', ctx()), true);
    });

    it('AND (one falsy)', () => {
      assert.strictEqual(evalExpr('1 and 0', ctx()), false);
    });

    it('OR (both falsy)', () => {
      assert.strictEqual(evalExpr('0 or 0', ctx()), false);
    });

    it('OR (one truthy)', () => {
      assert.strictEqual(evalExpr('0 or 1', ctx()), true);
    });

    it('NOT (!) operator', () => {
      assert.strictEqual(evalExpr('!0', ctx()), true);
      assert.strictEqual(evalExpr('!1', ctx()), false);
      assert.strictEqual(evalExpr('!!1', ctx()), true);
    });

    it('combines logical operators with precedence', () => {
      // true and false or true => (true and false) or true => false or true => true
      assert.strictEqual(
        evalExpr("'a' = 'a' and 'b' = 'c' or 'd' = 'd'", ctx()),
        true,
      );
    });
  });

  // ─── Arithmetic operators ─────────────────────────────────────────────
  describe('arithmetic operators', () => {
    it('addition', () => {
      assert.strictEqual(evalExpr('2 + 3', ctx()), 5);
    });

    it('subtraction', () => {
      assert.strictEqual(evalExpr('5 - 3', ctx()), 2);
    });

    it('multiplication', () => {
      assert.strictEqual(evalExpr('3 * 4', ctx()), 12);
    });

    it('division', () => {
      assert.strictEqual(evalExpr('10 / 2', ctx()), 5);
    });

    it('division by zero returns null', () => {
      assert.strictEqual(evalExpr('10 / 0', ctx()), null);
    });

    it('respects operator precedence', () => {
      assert.strictEqual(evalExpr('2 + 3 * 4', ctx()), 14); // 2 + (3*4)
      assert.strictEqual(evalExpr('(2 + 3) * 4', ctx()), 20);
    });

    it('unary minus', () => {
      assert.strictEqual(evalExpr('-5', ctx()), -5);
    });
  });

  // ─── Function: count ──────────────────────────────────────────────────
  describe('count() function', () => {
    it('returns 0 with no args', () => {
      assert.strictEqual(evalExpr('count()', ctx()), 0);
    });

    it('counts array elements', () => {
      assert.strictEqual(evalExpr('count(${items})', ctx({ items: [1, 2, 3] })), 3);
    });

    it('returns 1 for non-null scalar', () => {
      assert.strictEqual(evalExpr('count(${x})', ctx({ x: 'hello' })), 1);
    });

    it('returns 0 for null/undefined', () => {
      assert.strictEqual(evalExpr('count(${x})', ctx({ x: null })), 0);
    });

    it('returns 0 for unknown variable', () => {
      assert.strictEqual(evalExpr('count(${x})', ctx({})), 0);
    });
  });

  // ─── Function: sum ────────────────────────────────────────────────────
  describe('sum() function', () => {
    it('returns 0 with no args', () => {
      assert.strictEqual(evalExpr('sum()', ctx()), 0);
    });

    it('sums an array of numbers', () => {
      assert.strictEqual(evalExpr('sum(${vals})', ctx({ vals: [1, 2, 3, 4] })), 10);
    });

    it('returns number value for scalar', () => {
      assert.strictEqual(evalExpr('sum(${x})', ctx({ x: 42 })), 42);
    });

    it('returns 0 for missing variable', () => {
      assert.strictEqual(evalExpr('sum(${x})', ctx({})), 0);
    });
  });

  // ─── Function: min ────────────────────────────────────────────────────
  describe('min() function', () => {
    it('returns min of array', () => {
      assert.strictEqual(evalExpr('min(${vals})', ctx({ vals: [5, 2, 8, 1] })), 1);
    });

    it('returns null for empty array', () => {
      assert.strictEqual(evalExpr('min(${vals})', ctx({ vals: [] })), null);
    });

    it('returns value for scalar', () => {
      assert.strictEqual(evalExpr('min(${x})', ctx({ x: 42 })), 42);
    });
  });

  // ─── Function: max ────────────────────────────────────────────────────
  describe('max() function', () => {
    it('returns max of array', () => {
      assert.strictEqual(evalExpr('max(${vals})', ctx({ vals: [5, 2, 8, 1] })), 8);
    });

    it('returns null for empty array', () => {
      assert.strictEqual(evalExpr('max(${vals})', ctx({ vals: [] })), null);
    });
  });

  // ─── Function: avg / mean ─────────────────────────────────────────────
  describe('avg() / mean() function', () => {
    it('averages an array', () => {
      assert.strictEqual(evalExpr('avg(${vals})', ctx({ vals: [1, 2, 3, 4] })), 2.5);
    });

    it('avg handles single element', () => {
      assert.strictEqual(evalExpr('avg(${vals})', ctx({ vals: [7] })), 7);
    });

    it('avg returns null for empty array', () => {
      assert.strictEqual(evalExpr('avg(${vals})', ctx({ vals: [] })), null);
    });

    it('mean is alias for avg', () => {
      assert.strictEqual(evalExpr('mean(${vals})', ctx({ vals: [1, 2, 3] })), 2);
    });
  });

  // ─── Function: if ─────────────────────────────────────────────────────
  describe('if() function', () => {
    it('returns then-value when condition is truthy', () => {
      assert.strictEqual(evalExpr("if(1, 'yes', 'no')", ctx()), 'yes');
    });

    it('returns else-value when condition is falsy', () => {
      assert.strictEqual(evalExpr("if(0, 'yes', 'no')", ctx()), 'no');
    });

    it('returns null when no else branch', () => {
      assert.strictEqual(evalExpr("if(0, 'yes')", ctx()), null);
    });

    it('works with variables as condition', () => {
      assert.strictEqual(evalExpr("if(${active}, 'on', 'off')", ctx({ active: 1 })), 'on');
    });
  });

  // ─── Function: coalesce ───────────────────────────────────────────────
  describe('coalesce() function', () => {
    it('returns first non-null value', () => {
      assert.strictEqual(evalExpr("coalesce(null, null, 'c')", ctx()), 'c');
    });

    it('returns null when all values are null', () => {
      assert.strictEqual(evalExpr('coalesce(null, null)', ctx()), null);
    });

    it('skips empty strings', () => {
      assert.strictEqual(evalExpr("coalesce('', null, 'b')", ctx()), 'b');
    });
  });

  // ─── Function: selected ───────────────────────────────────────────────
  describe('selected() function', () => {
    it('checks if value is in space-separated string', () => {
      assert.strictEqual(evalExpr("selected('a b c', 'b')", ctx()), true);
      assert.strictEqual(evalExpr("selected('a b c', 'd')", ctx()), false);
    });

    it('checks if value is in array', () => {
      const context = ctx({ choices: ['a', 'b', 'c'] });
      assert.strictEqual(evalExpr("selected(${choices}, 'b')", context), true);
      assert.strictEqual(evalExpr("selected(${choices}, 'd')", context), false);
    });

    it('returns false when args < 2', () => {
      assert.strictEqual(evalExpr('selected()', ctx()), false);
    });
  });

  // ─── Function: string-length ──────────────────────────────────────────
  describe('string-length() function', () => {
    it('returns length of string', () => {
      assert.strictEqual(evalExpr("string-length('hello')", ctx()), 5);
    });

    it('returns 0 for empty string', () => {
      assert.strictEqual(evalExpr("string-length('')", ctx()), 0);
    });

    it('returns 0 with no args', () => {
      assert.strictEqual(evalExpr('string-length()', ctx()), 0);
    });

    it('works with variable', () => {
      assert.strictEqual(evalExpr('string-length(${name})', ctx({ name: 'Alice' })), 5);
    });
  });

  // ─── Complex expressions ──────────────────────────────────────────────
  describe('complex expressions', () => {
    it('evaluates a typical relevance condition', () => {
      const context = ctx({ sexe: 'f', age: 25 });
      assert.strictEqual(evalExpr("${sexe} = 'f' and ${age} >= 18", context), true);
      assert.strictEqual(evalExpr("${sexe} = 'm' and ${age} >= 18", context), false);
    });

    it('evaluates nested arithmetic', () => {
      assert.strictEqual(evalExpr('(${a} + ${b}) * ${c}', ctx({ a: 10, b: 5, c: 2 })), 30);
    });

    it('evaluates contains with variable', () => {
      assert.strictEqual(evalExpr("${text} contains 'world'", ctx({ text: 'hello world' })), true);
    });
  });

  // ─── Null/undefined handling ──────────────────────────────────────────
  describe('null/undefined handling', () => {
    it('null is coerced to empty string in comparisons', () => {
      assert.strictEqual(evalExpr("null = ''", ctx()), true);
    });

    it('null is falsy in logical expressions', () => {
      assert.strictEqual(evalExpr('null and true', ctx()), false);
      assert.strictEqual(evalExpr('null or true', ctx()), true);
    });

    it('null converts to 0 in arithmetic', () => {
      assert.strictEqual(evalExpr('null + 5', ctx()), 5);
    });
  });
});
