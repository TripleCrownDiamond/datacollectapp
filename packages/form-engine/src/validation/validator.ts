import { parseExpression } from '../expression/parser.js';
import { evaluate } from '../expression/evaluator.js';
import type { EvalContext } from '../expression/types.js';

/** Result of a single validation check */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** Overall validation result for a question */
export interface QuestionValidation {
  questionName: string;
  valid: boolean;
  errors: ValidationResult[];
}

/** Validation configuration */
export interface ValidationConfig {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  max?: number;
  minMessage?: string;
  maxMessage?: string;
  regex?: string;
  regexMessage?: string;
  constraint?: string; // Expression-based constraint
  constraintMessage?: string;
}

/**
 * Validates a single answer against its question's constraints.
 */
export function validateAnswer(
  questionName: string,
  value: unknown,
  config: ValidationConfig,
  context: EvalContext,
): QuestionValidation {
  const errors: ValidationResult[] = [];

  // 1. Required check
  if (config.required) {
    if (isValueEmpty(value)) {
      errors.push({
        valid: false,
        message: config.requiredMessage || `'${questionName}' is required`,
      });
    }
  }

  // If value is empty and not required, skip further validation
  if (isValueEmpty(value)) {
    return { questionName, valid: errors.length === 0, errors };
  }

  const numValue = Number(value);

  // 2. Min check
  if (config.min !== undefined && !isNaN(numValue)) {
    if (numValue < config.min) {
      errors.push({
        valid: false,
        message: config.minMessage || `Value must be ≥ ${config.min}`,
      });
    }
  }

  // 3. Max check
  if (config.max !== undefined && !isNaN(numValue)) {
    if (numValue > config.max) {
      errors.push({
        valid: false,
        message: config.maxMessage || `Value must be ≤ ${config.max}`,
      });
    }
  }

  // 4. Regex check
  if (config.regex && typeof value === 'string') {
    try {
      const regex = new RegExp(config.regex);
      if (!regex.test(value)) {
        errors.push({
          valid: false,
          message: config.regexMessage || `Value does not match required pattern`,
        });
      }
    } catch {
      // Invalid regex — skip check
    }
  }

  // 5. Expression-based constraint (e.g. ". >= 0 and . <= 120")
  // The dot (.) refers to the current question's value.
  if (config.constraint) {
    try {
      // Replace standalone '.' with a special variable name
      // Uses negative lookbehind/lookahead to avoid matching periods in numbers
      const expr = config.constraint.replace(/(?<!\d)\.(?!\d)/g, '__self__');
      const ast = parseExpression(expr);
      // Inject the current value as __self__ in the context
      const augmentedContext: EvalContext = {
        ...context,
        answers: { ...context.answers, __self__: value },
      };
      const result = evaluate(ast, augmentedContext);
      if (!result) {
        errors.push({
          valid: false,
          message: config.constraintMessage || `Constraint validation failed`,
        });
      }
    } catch {
      // If constraint evaluation fails, skip
    }
  }

  return {
    questionName,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all answers in a submission against their question constraints.
 */
export function validateAll(
  answers: Record<string, unknown>,
  constraints: Record<string, ValidationConfig>,
  context: EvalContext,
): QuestionValidation[] {
  const results: QuestionValidation[] = [];

  for (const [questionName, config] of Object.entries(constraints)) {
    const value = answers[questionName];
    const result = validateAnswer(questionName, value, config, context);
    results.push(result);
  }

  return results;
}

function isValueEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (typeof value === 'number' && isNaN(value)) return true;
  return false;
}
