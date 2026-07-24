import { parseExpression } from '../expression/parser.js';
import { evaluate } from '../expression/evaluator.js';
import type { EvalContext } from '../expression/types.js';
import { warn } from '../logger.js';

/** A calculated field definition */
export interface CalculatedField {
  name: string;
  formula: string;
}

/** Result of a calculation run */
export interface CalculationResult {
  name: string;
  value: unknown;
}

/**
 * Evaluates a single calculation formula.
 *
 * @param formula - The calculation expression (e.g. "${a} * ${b}")
 * @param context - Current answers and repeat state
 * @returns The computed value
 */
export function calculate(formula: string, context: EvalContext): unknown {
  const trimmed = formula.trim();
  if (!trimmed) return null;

  try {
    const ast = parseExpression(trimmed);
    return evaluate(ast, context);
  } catch (err) {
    warn(`[form-engine] Failed to evaluate: "${formula}"`, err);
    return null;
  }
}

/**
 * Evaluates all calculated fields in dependency order.
 * Fields that depend on other calculated fields are evaluated after their dependencies.
 *
 * @param fields - Array of { name, formula } to evaluate
 * @param initialAnswers - The starting answers (from user input)
 * @returns Array of { name, value } results
 */
export function calculateAll(
  fields: CalculatedField[],
  initialAnswers: Record<string, unknown>,
): CalculationResult[] {
  const results: CalculationResult[] = [];
  const answers = { ...initialAnswers };
  const evaluated = new Set<string>();

  // Simple topological evaluation: try each field, skip if deps not ready, retry
  const remaining = [...fields];
  let previousLength = -1;

  while (remaining.length > 0 && remaining.length !== previousLength) {
    previousLength = remaining.length;
    const batch = [...remaining];
    remaining.length = 0;

    for (const field of batch) {
      const context: EvalContext = { answers };
      const value = calculate(field.formula, context);
      answers[field.name] = value;
      evaluated.add(field.name);
      results.push({ name: field.name, value });
    }
  }

  // If fields remain (circular dependency), evaluate them with null
  for (const field of remaining) {
    results.push({ name: field.name, value: null });
  }

  return results;
}

/**
 * Aggregates values from a repeat group.
 * Used for statistics like count, sum, avg on repeated sections.
 */
export function aggregateRepeatGroup(
  groupName: string,
  fieldName: string,
  answers: Record<string, unknown>,
  operation: 'count' | 'sum' | 'avg' | 'min' | 'max',
): number | null {
  const group = answers[groupName];

  if (!Array.isArray(group) || group.length === 0) {
    return operation === 'count' ? 0 : null;
  }

  const values = group
    .map((item: Record<string, unknown>) => Number(item[fieldName]))
    .filter((n: number) => !isNaN(n));

  if (values.length === 0) {
    return operation === 'count' ? 0 : null;
  }

  switch (operation) {
    case 'count':
      return group.length;
    case 'sum':
      return values.reduce((a: number, b: number) => a + b, 0);
    case 'avg':
      return values.reduce((a: number, b: number) => a + b, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
  }
}
