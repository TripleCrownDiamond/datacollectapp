// FormEngine — main class
export { FormEngine } from './engine.js';
export type { FormDefinition, FormPage, FormQuestion, FormEvaluationResult, EngineOptions } from './engine.js';

// Expression evaluator (low-level)
export { parseExpression } from './expression/parser.js';
export { evaluate } from './expression/evaluator.js';
export type { AstNode, EvalContext } from './expression/types.js';

// Relevance evaluation
export { evaluateRelevance } from './relevance/evaluator.js';

// Validation
export { validateAnswer, validateAll } from './validation/validator.js';
export type { ValidationResult, QuestionValidation, ValidationConfig } from './validation/validator.js';

// Calculation
export { calculate, calculateAll, aggregateRepeatGroup } from './calculation/calculator.js';
export type { CalculatedField, CalculationResult } from './calculation/calculator.js';
