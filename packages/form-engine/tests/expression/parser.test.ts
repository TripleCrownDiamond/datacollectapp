import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpression } from '../../src/expression/parser.js';
import type { AstNode } from '../../src/expression/types.js';

function lit(value: string | number | boolean): AstNode {
  return { kind: 'literal', value };
}

function var_(name: string): AstNode {
  return { kind: 'variable', name };
}

function bin(
  operator: AstNode extends { kind: 'binary' } ? AstNode['operator'] : never,
  left: AstNode,
  right: AstNode,
): AstNode {
  return { kind: 'binary', operator, left, right };
}

function unary(operator: '!' | '-', operand: AstNode): AstNode {
  return { kind: 'unary', operator, operand };
}

function fn(name: string, ...args: AstNode[]): AstNode {
  return { kind: 'function', name, args };
}

function group(inner: AstNode): AstNode {
  return { kind: 'group', inner };
}

describe('Expression Parser', () => {
  // ─── Variables ────────────────────────────────────────────────────────
  describe('variables', () => {
    it('parses a simple variable reference', () => {
      assert.deepStrictEqual(parseExpression('${name}'), var_('name'));
    });

    it('parses a variable with dots', () => {
      assert.deepStrictEqual(parseExpression('${person.name}'), var_('person.name'));
    });

    it('parses a bare identifier as variable', () => {
      assert.deepStrictEqual(parseExpression('age'), var_('age'));
    });

    it('throws on unclosed variable', () => {
      assert.throws(() => parseExpression('${name'), { message: /Unclosed variable/ });
    });
  });

  // ─── Literals ─────────────────────────────────────────────────────────
  describe('literals', () => {
    it('parses a string literal with single quotes', () => {
      assert.deepStrictEqual(parseExpression("'hello'"), lit('hello'));
    });

    it('parses a string literal with double quotes', () => {
      assert.deepStrictEqual(parseExpression('"hello"'), lit('hello'));
    });

    it('parses a string with escaped quote', () => {
      assert.deepStrictEqual(parseExpression("'he\\'llo'"), lit("he'llo"));
    });

    it('throws on unclosed string', () => {
      assert.throws(() => parseExpression("'hello"), { message: /Unclosed string/ });
    });

    it('parses an integer literal', () => {
      assert.deepStrictEqual(parseExpression('42'), lit(42));
    });

    it('parses a decimal literal', () => {
      assert.deepStrictEqual(parseExpression('3.14'), lit(3.14));
    });

    it('parses a negative number', () => {
      assert.deepStrictEqual(parseExpression('-5'), bin('-', lit(0), lit(5)));
    });

    it('parses boolean true', () => {
      assert.deepStrictEqual(parseExpression('true'), lit('true'));
    });

    it('parses boolean false', () => {
      assert.deepStrictEqual(parseExpression('false'), lit('false'));
    });
  });

  // ─── Binary operators ─────────────────────────────────────────────────
  describe('binary operators', () => {
    it('parses equality', () => {
      assert.deepStrictEqual(parseExpression("${a} = 'b'"), bin('=', var_('a'), lit('b')));
    });

    it('parses inequality', () => {
      assert.deepStrictEqual(parseExpression("${a} != 'b'"), bin('!=', var_('a'), lit('b')));
    });

    it('parses less than', () => {
      assert.deepStrictEqual(parseExpression('${a} < 5'), bin('<', var_('a'), lit(5)));
    });

    it('parses less or equal', () => {
      assert.deepStrictEqual(parseExpression('${a} <= 5'), bin('<=', var_('a'), lit(5)));
    });

    it('parses greater than', () => {
      assert.deepStrictEqual(parseExpression('${a} > 5'), bin('>', var_('a'), lit(5)));
    });

    it('parses greater or equal', () => {
      assert.deepStrictEqual(parseExpression('${a} >= 5'), bin('>=', var_('a'), lit(5)));
    });

    it('parses contains', () => {
      assert.deepStrictEqual(
        parseExpression("${a} contains 'bc'"),
        bin('contains', var_('a'), lit('bc')),
      );
    });

    it('parses logical AND', () => {
      const ast = parseExpression("${a} = 'x' and ${b} = 'y'");
      assert.deepStrictEqual(
        ast,
        bin('and', bin('=', var_('a'), lit('x')), bin('=', var_('b'), lit('y'))),
      );
    });

    it('parses logical OR', () => {
      const ast = parseExpression("${a} = 'x' or ${b} = 'y'");
      assert.deepStrictEqual(
        ast,
        bin('or', bin('=', var_('a'), lit('x')), bin('=', var_('b'), lit('y'))),
      );
    });

    it('parses addition', () => {
      assert.deepStrictEqual(parseExpression('${a} + ${b}'), bin('+', var_('a'), var_('b')));
    });

    it('parses subtraction', () => {
      assert.deepStrictEqual(parseExpression('${a} - ${b}'), bin('-', var_('a'), var_('b')));
    });

    it('parses multiplication', () => {
      assert.deepStrictEqual(parseExpression('${a} * ${b}'), bin('*', var_('a'), var_('b')));
    });

    it('parses division', () => {
      assert.deepStrictEqual(parseExpression('${a} / ${b}'), bin('/', var_('a'), var_('b')));
    });
  });

  // ─── Operator precedence ──────────────────────────────────────────────
  describe('operator precedence', () => {
    it('AND binds tighter than OR', () => {
      const ast = parseExpression('${a} = 1 and ${b} = 2 or ${c} = 3');
      // Expected: (a=1 and b=2) or c=3
      const leftAnd = bin('and', bin('=', var_('a'), lit(1)), bin('=', var_('b'), lit(2)));
      assert.deepStrictEqual(ast, bin('or', leftAnd, bin('=', var_('c'), lit(3))));
    });

    it('comparison binds tighter than AND', () => {
      const ast = parseExpression("${a} = 'x' and ${b} = 'y'");
      assert.deepStrictEqual(
        ast,
        bin('and', bin('=', var_('a'), lit('x')), bin('=', var_('b'), lit('y'))),
      );
    });

    it('add/sub binds tighter than comparison', () => {
      const ast = parseExpression('${a} + ${b} = ${c}');
      // Expected: (a + b) = c
      assert.deepStrictEqual(ast, bin('=', bin('+', var_('a'), var_('b')), var_('c')));
    });

    it('mul/div binds tighter than add/sub', () => {
      const ast = parseExpression('${a} + ${b} * ${c}');
      // Expected: a + (b * c)
      assert.deepStrictEqual(ast, bin('+', var_('a'), bin('*', var_('b'), var_('c'))));
    });

    it('handles chained arithmetic', () => {
      const ast = parseExpression('${a} + ${b} - ${c}');
      // Left-associative: (a + b) - c
      assert.deepStrictEqual(ast, bin('-', bin('+', var_('a'), var_('b')), var_('c')));
    });
  });

  // ─── Unary operators ──────────────────────────────────────────────────
  describe('unary operators', () => {
    it('parses NOT (!) operator', () => {
      assert.deepStrictEqual(parseExpression('!${visible}'), unary('!', var_('visible')));
    });

    it('parses double negation', () => {
      assert.deepStrictEqual(parseExpression('!!${x}'), unary('!', unary('!', var_('x'))));
    });

    it('parses unary minus as 0 - operand', () => {
      assert.deepStrictEqual(parseExpression('-${x}'), bin('-', lit(0), var_('x')));
    });
  });

  // ─── Function calls ───────────────────────────────────────────────────
  describe('function calls', () => {
    it('parses a function with no args', () => {
      assert.deepStrictEqual(parseExpression('now()'), fn('now'));
    });

    it('parses a function with one arg', () => {
      assert.deepStrictEqual(parseExpression('count(${items})'), fn('count', var_('items')));
    });

    it('parses a function with multiple args', () => {
      assert.deepStrictEqual(
        parseExpression("selected(${colors}, 'red')"),
        fn('selected', var_('colors'), lit('red')),
      );
    });

    it('parses nested function calls', () => {
      assert.deepStrictEqual(parseExpression('sum(${items})'), fn('sum', var_('items')));
    });

    it('throws on missing closing paren in function', () => {
      assert.throws(() => parseExpression('count(${items}'), {
        message: /Missing closing parenthesis/,
      });
    });
  });

  // ─── Grouping ─────────────────────────────────────────────────────────
  describe('grouping', () => {
    it('parses parenthesized expression', () => {
      assert.deepStrictEqual(parseExpression('(${a} + ${b})'), group(bin('+', var_('a'), var_('b'))));
    });

    it('grouping overrides precedence', () => {
      assert.deepStrictEqual(
        parseExpression('(${a} + ${b}) * ${c}'),
        bin('*', group(bin('+', var_('a'), var_('b'))), var_('c')),
      );
    });

    it('handles nested parentheses', () => {
      assert.deepStrictEqual(parseExpression('((${a}))'), group(group(var_('a'))));
    });

    it('throws on missing closing paren', () => {
      assert.throws(() => parseExpression('(${a}'), { message: /Missing closing parenthesis/ });
    });
  });

  // ─── Complex expressions ──────────────────────────────────────────────
  describe('complex expressions', () => {
    it('parses a typical relevance condition', () => {
      const ast = parseExpression("${sexe} = 'f' and ${age} >= 18");
      assert.deepStrictEqual(
        ast,
        bin('and', bin('=', var_('sexe'), lit('f')), bin('>=', var_('age'), lit(18))),
      );
    });

    it('parses a calculation formula', () => {
      const ast = parseExpression('(${a} + ${b}) * 1.19');
      assert.deepStrictEqual(
        ast,
        bin('*', group(bin('+', var_('a'), var_('b'))), lit(1.19)),
      );
    });
  });

  // ─── Error handling ───────────────────────────────────────────────────
  describe('error handling', () => {
    it('throws on unexpected character', () => {
      assert.throws(() => parseExpression('${a} @ ${b}'), { message: /Unexpected character/ });
    });

    it('throws on unexpected end', () => {
      assert.throws(() => parseExpression('${a} +'), { message: /Unexpected end of expression/ });
    });

    it('throws on empty expression', () => {
      assert.throws(() => parseExpression(''), { message: /Unexpected end of expression/ });
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('ignores whitespace', () => {
      assert.deepStrictEqual(parseExpression('${a}'), parseExpression('  ${a}  '));
    });

    it('parses numeric comparison strings correctly', () => {
      assert.deepStrictEqual(parseExpression('${val} = 0.5'), bin('=', var_('val'), lit(0.5)));
    });

    it('parses not keyword as function call', () => {
      // 'not' is NOT in the operator list, so not(${x}) is a function call
      const ast = parseExpression('not(${x})');
      assert.deepStrictEqual(ast, fn('not', var_('x')));
    });
  });
});
