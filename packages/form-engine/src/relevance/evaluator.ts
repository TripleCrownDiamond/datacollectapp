import { parseExpression } from '../expression/parser.js';
import { evaluate } from '../expression/evaluator.js';
import { warn } from '../logger.js';
import type { EvalContext } from '../expression/types.js';

/**
 * Evaluates a relevance condition string.
 *
 * @param condition - The relevance expression (e.g. "${sexe} = 'f'")
 * @param context - Current form answers and state
 * @returns true if the question should be visible
 */
export function evaluateRelevance(condition: string, context: EvalContext): boolean {
  const trimmed = condition.trim();

  // Empty condition = always visible
  if (!trimmed) return true;

  // Handle simple boolean-like values
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  try {
    const ast = parseExpression(trimmed);
    const result = evaluate(ast, context);
    return Boolean(result);
  } catch (err) {
    // If parsing fails, return true (show the question) and log the error
    warn(`[form-engine] Failed to evaluate: "${condition}"`, err);
    return true;
  }
}

/**
 * Evaluates all questions in a list and returns a map of question name → visibility.
 */
export function evaluateAllRelevance(
  conditions: Array<{ name: string; condition?: string }>,
  context: EvalContext,
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  for (const { name, condition } of conditions) {
    if (condition) {
      results[name] = evaluateRelevance(condition, context);
    } else {
      results[name] = true; // Always visible if no condition
    }
  }

  return results;
}
