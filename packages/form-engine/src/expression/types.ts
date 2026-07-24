/** AST node types for form expressions */
export type AstNode =
  | LiteralNode
  | VariableNode
  | BinaryOpNode
  | UnaryOpNode
  | FunctionCallNode
  | GroupNode;

export interface LiteralNode {
  kind: 'literal';
  value: string | number | boolean;
}

export interface VariableNode {
  kind: 'variable';
  name: string;
}

export interface BinaryOpNode {
  kind: 'binary';
  operator: BinaryOperator;
  left: AstNode;
  right: AstNode;
}

export interface UnaryOpNode {
  kind: 'unary';
  operator: '!' | '-';
  operand: AstNode;
}

export interface FunctionCallNode {
  kind: 'function';
  name: string;
  args: AstNode[];
}

export interface GroupNode {
  kind: 'group';
  inner: AstNode;
}

export type BinaryOperator =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'contains'
  | 'and'
  | 'or'
  | '+'
  | '-'
  | '*'
  | '/';

/** Evaluation context — contains current answers, repeat index, metadata */
export interface EvalContext {
  /** Current form answers: { variableName: value } */
  answers: Record<string, unknown>;
  /** Current repeat group index (0-based) */
  repeatIndex?: number;
  /** Ancestor repeat indices for nested repeats */
  repeatAncestors?: Record<string, number>;
}
