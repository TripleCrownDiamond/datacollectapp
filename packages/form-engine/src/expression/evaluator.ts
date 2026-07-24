import type { AstNode, EvalContext, BinaryOperator } from './types.js';
import { warn } from '../logger.js';

export function evaluate(node: AstNode, context: EvalContext): unknown {
  switch (node.kind) {
    case 'literal': return node.value;
    case 'variable': return resolveVariable(node.name, context);
    case 'binary': return evaluateBinary(node.operator, node.left, node.right, context);
    case 'unary': return evaluateUnary(node.operator, node.operand, context);
    case 'function': return evaluateFunction(node.name, node.args, context);
    case 'group': return evaluate(node.inner, context);
  }
}

function resolveVariable(name: string, context: EvalContext): unknown {
  if (name in context.answers) {
    const value = context.answers[name];
    if (Array.isArray(value)) {
      if (context.repeatIndex !== undefined && context.repeatIndex < value.length) {
        return value[context.repeatIndex];
      }
      return value;
    }
    return value;
  }
  return null;
}

function evaluateBinary(op: BinaryOperator, left: AstNode, right: AstNode, context: EvalContext): unknown {
  const lval = evaluate(left, context);
  const rval = evaluate(right, context);

  switch (op) {
    case '=': return coerceString(lval) === coerceString(rval);
    case '!=': return coerceString(lval) !== coerceString(rval);
    case '<': return compareValues(lval, rval) < 0;
    case '<=': return compareValues(lval, rval) <= 0;
    case '>': return compareValues(lval, rval) > 0;
    case '>=': return compareValues(lval, rval) >= 0;
    case 'contains': return coerceString(lval).includes(coerceString(rval));
    case 'and': return Boolean(lval) && Boolean(rval);
    case 'or': return Boolean(lval) || Boolean(rval);
    case '+': return Number(lval) + Number(rval);
    case '-': return Number(lval) - Number(rval);
    case '*': return Number(lval) * Number(rval);
    case '/': { const d = Number(rval); return d === 0 ? null : Number(lval) / d; }
  }
}

function evaluateUnary(op: '!' | '-', operand: AstNode, context: EvalContext): unknown {
  const val = evaluate(operand, context);
  return op === '!' ? !Boolean(val) : -Number(val);
}

function evaluateFunction(name: string, args: AstNode[], context: EvalContext): unknown {
  switch (name.toLowerCase()) {
    case 'count': {
      if (args.length === 0) return 0;
      const val = evaluate(args[0], context);
      return Array.isArray(val) ? val.length : (val !== null && val !== undefined ? 1 : 0);
    }
    case 'sum': {
      if (args.length === 0) return 0;
      const val = evaluate(args[0], context);
      if (Array.isArray(val)) {
        return val.reduce((acc: number, item: unknown) => {
          if (typeof item === 'number') return acc + item;
          return acc + Number(item);
        }, 0);
      }
      return Number(val) || 0;
    }
    case 'min': {
      const val = evaluate(args[0], context);
      if (Array.isArray(val) && val.length > 0) {
        const nums = val.map((v) => Number(v)).filter((n) => !isNaN(n));
        return nums.length > 0 ? Math.min(...nums) : null;
      }
      return Number(val);
    }
    case 'max': {
      const val = evaluate(args[0], context);
      if (Array.isArray(val) && val.length > 0) {
        const nums = val.map((v) => Number(v)).filter((n) => !isNaN(n));
        return nums.length > 0 ? Math.max(...nums) : null;
      }
      return Number(val);
    }
    case 'avg':
    case 'mean': {
      const val = evaluate(args[0], context);
      if (Array.isArray(val) && val.length > 0) {
        const nums = val.map((v) => Number(v)).filter((n) => !isNaN(n));
        return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
      }
      return Number(val);
    }
    case 'if': {
      if (args.length < 2) return null;
      const cond = evaluate(args[0], context);
      return cond ? evaluate(args[1], context) : args.length > 2 ? evaluate(args[2], context) : null;
    }
    case 'coalesce': {
      for (const arg of args) {
        const val = evaluate(arg, context);
        if (val !== null && val !== undefined && val !== '') return val;
      }
      return null;
    }
    case 'selected': {
      if (args.length < 2) return false;
      const val = evaluate(args[0], context);
      const search = coerceString(evaluate(args[1], context));
      if (Array.isArray(val)) return val.includes(search);
      return coerceString(val).split(' ').includes(search);
    }
    case 'string-length': {
      if (args.length === 0) return 0;
      return coerceString(evaluate(args[0], context)).length;
    }
    default:
      warn(`Unknown function: ${name}`);
      return null;
  }
}

function coerceString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

function compareValues(a: unknown, b: unknown): number {
  const na = Number(a);
  const nb = Number(b);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  return coerceString(a).localeCompare(coerceString(b));
}
