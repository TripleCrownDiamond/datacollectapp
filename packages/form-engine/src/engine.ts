import { evaluateRelevance } from './relevance/evaluator.js';
import { validateAnswer, type ValidationConfig } from './validation/validator.js';
import { calculate } from './calculation/calculator.js';
import type { EvalContext } from './expression/types.js';

/** A single page in the form */
export interface FormPage {
  name: string;
  label?: Record<string, string>;
  questions: FormQuestion[];
  repeat: boolean;
  repeatLabel?: string;
  /** Instances of a repeat group (auto-detected from answers if not set) */
  instances?: number;
}

/** A single question in the form */
export interface FormQuestion {
  name: string;
  type: string;
  label?: Record<string, string>;
  hint?: Record<string, string>;
  required?: boolean;
  requiredMessage?: string;
  relevant?: string;
  constraint?: string;
  constraintMessage?: Record<string, string>;
  calculation?: string;
  default?: string | number;
  options?: Array<{ value: string; label: Record<string, string> }>;
  appearance?: string;
  isSensitive?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  params?: Record<string, unknown>;
}

/** The full form schema used by the engine */
export interface FormDefinition {
  name: string;
  defaultLanguage: string;
  languages: string[];
  pages: FormPage[];
}

/** Options for engine evaluation */
export interface EngineOptions {
  language?: string;
}

/** Result of evaluating a form */
export interface FormEvaluationResult {
  /** Which questions are visible */
  relevance: Record<string, boolean>;
  /** Validation errors by question */
  validation: Record<string, Array<{ valid: boolean; message?: string }>>;
  /** Calculated values by question */
  calculated: Record<string, unknown>;
  /** All answers (user input + calculated) */
  allAnswers: Record<string, unknown>;
}

/**
 * FormEngine — the core evaluation engine for TerraCollect forms.
 *
 * Pure TypeScript, no UI dependencies. Used by mobile app, web preview,
 * and API server validation.
 */
export class FormEngine {
  private form: FormDefinition;
  private options: EngineOptions;

  constructor(form: FormDefinition, options?: EngineOptions) {
    this.form = form;
    this.options = options || {};
  }

  /**
   * Evaluates the form with the given answers.
   * Returns relevance, validation, and calculated values.
   */
  evaluate(answers: Record<string, unknown>): FormEvaluationResult {
    const allAnswers = { ...answers };
    const calculated: Record<string, unknown> = {};
    const relevance: Record<string, boolean> = {};
    const validation: Record<string, Array<{ valid: boolean; message?: string }>> = {};

    // Phase 1: Evaluate all questions in order (relevance + calculations)
    for (const page of this.form.pages) {
      // Infer repeat group instance count from answers
      let instances = 1;
      if (page.repeat) {
        const answersForGroup = allAnswers[page.name];
        if (Array.isArray(answersForGroup) && answersForGroup.length > 0) {
          instances = answersForGroup.length;
        } else {
          instances = page.instances ?? 1;
        }
      }

      for (let instance = 0; instance < instances; instance++) {
        const context: EvalContext = {
          answers: allAnswers,
          repeatIndex: instance,
        };

        for (const question of page.questions) {
          // Evaluate relevance
          if (question.relevant) {
            relevance[question.name] = evaluateRelevance(question.relevant, context);
          } else {
            relevance[question.name] = true;
          }

          // Evaluate calculation
          if (question.calculation) {
            const value = calculate(question.calculation, context);
            calculated[question.name] = value;
            allAnswers[question.name] = value;
          }

          // Build validation config
          const validationConfig: ValidationConfig = {};
          if (question.required) validationConfig.required = true;
          if (question.requiredMessage) validationConfig.requiredMessage = question.requiredMessage;
          if (question.min !== undefined) validationConfig.min = question.min;
          if (question.max !== undefined) validationConfig.max = question.max;
          if (question.regex) validationConfig.regex = question.regex;
          if (question.constraint) {
            validationConfig.constraint = question.constraint;
            validationConfig.constraintMessage =
              question.constraintMessage?.[this.options.language || 'fr'] || undefined;
          }

          // Validate
          if (Object.keys(validationConfig).length > 0) {
            const result = validateAnswer(question.name, allAnswers[question.name], validationConfig, context);
            validation[question.name] = result.errors;
          }
        }
      }
    }

    return {
      relevance,
      validation,
      calculated,
      allAnswers,
    };
  }

  /**
   * Validates the entire form, returning only validation results.
   * Useful for server-side submission validation.
   */
  validate(answers: Record<string, unknown>): Record<string, Array<{ valid: boolean; message?: string }>> {
    const result = this.evaluate(answers);
    return result.validation;
  }

  /**
   * Gets visible questions based on current answers.
   * Returns filtered pages with only visible questions.
   */
  getVisibleQuestions(answers: Record<string, unknown>): FormPage[] {
    const { relevance } = this.evaluate(answers);

    return this.form.pages
      .map((page) => ({
        ...page,
        questions: page.questions.filter((q) => relevance[q.name] !== false),
      }))
      .filter((page) => page.questions.length > 0);
  }

  /**
   * Gets all flat questions (for building question lists, exports, etc.)
   */
  getAllQuestions(): FormQuestion[] {
    return this.form.pages.flatMap((page) => page.questions);
  }
}
