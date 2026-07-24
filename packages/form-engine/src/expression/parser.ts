import type { AstNode, BinaryOperator } from './types.js';

type Token =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'variable'; value: string }
  | { type: 'op'; value: string }
  | { type: 'paren_open' }
  | { type: 'paren_close' }
  | { type: 'comma' };

interface TokenWithValue {
  type: string;
  value: string;
}

function hasValue(t: Token): t is Token & TokenWithValue {
  return 'value' in t;
}

function getOpValue(t: Token | undefined): string | undefined {
  if (!t) return undefined;
  return t.type === 'op' && 'value' in t ? (t as TokenWithValue).value : undefined;
}

function getIdentValue(t: Token | undefined): string | undefined {
  if (!t) return undefined;
  return t.type === 'ident' && 'value' in t ? (t as TokenWithValue).value : undefined;
}

/**
 * Parses a form expression string into an AST.
 */
export function parseExpression(input: string): AstNode {
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  return parser.parse();
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '$' && input[i + 1] === '{') {
      const end = input.indexOf('}', i);
      if (end === -1) throw new Error(`Unclosed variable at position ${i}`);
      tokens.push({ type: 'variable', value: input.slice(i + 2, end).trim() });
      i = end + 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let str = '';
      while (j < input.length && input[j] !== quote) {
        if (input[j] === '\\') { j++; if (j < input.length) str += input[j]; }
        else { str += input[j]; }
        j++;
      }
      if (j >= input.length) throw new Error(`Unclosed string at position ${i}`);
      tokens.push({ type: 'string', value: str });
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(input[i + 1]))) {
      let j = i;
      let num = '';
      while (j < input.length && /[0-9.]/.test(input[j])) { num += input[j]; j++; }
      tokens.push({ type: 'number', value: parseFloat(num) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      let ident = '';
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j])) { ident += input[j]; j++; }
      if (['and', 'or', 'contains', 'not'].includes(ident)) {
        tokens.push({ type: 'op', value: ident });
      } else if (ident === 'true') {
        tokens.push({ type: 'string', value: 'true' });
      } else if (ident === 'false') {
        tokens.push({ type: 'string', value: 'false' });
      } else if (['null', 'undefined', 'empty'].includes(ident)) {
        tokens.push({ type: 'string', value: '' });
      } else {
        tokens.push({ type: 'ident', value: ident });
      }
      i = j;
      continue;
    }

    if (ch === '(') { tokens.push({ type: 'paren_open' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'paren_close' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'comma' }); i++; continue; }

    const next = input[i + 1];
    if (ch === '!' && next === '=') { tokens.push({ type: 'op', value: '!=' }); i += 2; continue; }
    if (ch === '<' && next === '=') { tokens.push({ type: 'op', value: '<=' }); i += 2; continue; }
    if (ch === '>' && next === '=') { tokens.push({ type: 'op', value: '>=' }); i += 2; continue; }

    if (['=', '<', '>', '+', '-', '*', '/', '!'].includes(ch)) {
      tokens.push({ type: 'op', value: ch }); i++; continue;
    }

    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }

  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error('Unexpected end of expression');
    this.pos++;
    return token;
  }

  private match(...types: string[]): Token | undefined {
    const token = this.peek();
    if (token && types.includes(token.type)) return this.consume();
    return undefined;
  }

  parse(): AstNode { return this.parseOr(); }

  private parseOr(): AstNode {
    let left = this.parseAnd();
    while (getOpValue(this.peek()) === 'or') {
      this.consume();
      left = { kind: 'binary', operator: 'or', left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): AstNode {
    let left = this.parseComparison();
    while (getOpValue(this.peek()) === 'and') {
      this.consume();
      left = { kind: 'binary', operator: 'and', left, right: this.parseComparison() };
    }
    return left;
  }

  private parseComparison(): AstNode {
    let left = this.parseAddSub();
    const compOps: BinaryOperator[] = ['=', '!=', '<', '<=', '>', '>=', 'contains'];
    const opVal = getOpValue(this.peek());
    if (opVal && compOps.includes(opVal as BinaryOperator)) {
      this.consume();
      return { kind: 'binary', operator: opVal as BinaryOperator, left, right: this.parseAddSub() };
    }
    return left;
  }

  private parseAddSub(): AstNode {
    let left = this.parseMulDiv();
    while (this.peek()?.type === 'op') {
      const opVal = getOpValue(this.peek());
      if (opVal === '+' || opVal === '-') {
        this.consume();
        left = { kind: 'binary', operator: opVal, left, right: this.parseMulDiv() };
      } else break;
    }
    return left;
  }

  private parseMulDiv(): AstNode {
    let left = this.parseUnary();
    while (this.peek()?.type === 'op') {
      const opVal = getOpValue(this.peek());
      if (opVal === '*' || opVal === '/') {
        this.consume();
        left = { kind: 'binary', operator: opVal, left, right: this.parseUnary() };
      } else break;
    }
    return left;
  }

  private parseUnary(): AstNode {
    const token = this.peek();
    if (!token) return this.parsePrimary();
    const opVal = getOpValue(token);
    if (opVal === '!') {
      this.consume();
      return { kind: 'unary', operator: '!', operand: this.parseUnary() };
    }
    if (opVal === '-') {
      this.consume();
      return { kind: 'binary', operator: '-', left: { kind: 'literal', value: 0 }, right: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'paren_open') {
      this.consume();
      const inner = this.parse();
      if (!this.match('paren_close')) throw new Error('Missing closing parenthesis');
      return { kind: 'group', inner };
    }

    if (token.type === 'string') {
      this.consume();
      return { kind: 'literal', value: (token as Token & { value: string }).value };
    }

    if (token.type === 'number') {
      this.consume();
      return { kind: 'literal', value: (token as Token & { value: number }).value };
    }

    if (token.type === 'variable') {
      this.consume();
      return { kind: 'variable', name: (token as Token & { value: string }).value };
    }

    if (token.type === 'ident') {
      const name = (token as Token & { value: string }).value;
      this.consume();

      if (this.peek()?.type === 'paren_open') {
        this.consume();
        const args: AstNode[] = [];
        if (this.peek()?.type !== 'paren_close') {
          args.push(this.parse());
          while (this.peek()?.type === 'comma') {
            this.consume();
            args.push(this.parse());
          }
        }
        if (!this.match('paren_close')) throw new Error(`Missing closing parenthesis in function '${name}'`);
        return { kind: 'function', name, args };
      }

      return { kind: 'variable', name };
    }

    throw new Error(`Unexpected token ${JSON.stringify(token)}`);
  }
}
