/**
 * parser.js — Recursive Descent Parser
 *
 * Grammar (EBNF):
 *   expression  → term ( ('+' | '-') term )*
 *   term        → unary ( ('*' | '/') unary )*
 *   unary       → '-' unary | primary
 *   primary     → NUMBER | '(' expression ')'
 *
 * Operator precedence is enforced structurally:
 *   * and / bind tighter than + and -.
 */

const { NumberLiteral, BinaryExpression, UnaryExpression } = require('./ast');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || null;
  }

  consume() {
    return this.tokens[this.pos++];
  }

  isOperator(...ops) {
    const t = this.peek();
    return t && t.type === 'OPERATOR' && ops.includes(t.value);
  }

  expect(type, valueHint) {
    const t = this.peek();
    if (!t) {
      throw {
        type: 'ParseError',
        message: `Unexpected end of expression${valueHint ? `, expected '${valueHint}'` : ''}`,
        position: this.tokens.length > 0
          ? this.tokens[this.tokens.length - 1].position + 1
          : 0,
        length: 1,
      };
    }
    if (t.type !== type) {
      throw {
        type: 'ParseError',
        message: `Expected ${valueHint || type}, got '${t.raw}'`,
        position: t.position,
        length: t.length,
      };
    }
    return this.consume();
  }

  // expression → term ( ('+' | '-') term )*
  parseExpression() {
    let left = this.parseTerm();
    while (this.isOperator('+', '-')) {
      const op = this.consume();
      const right = this.parseTerm();
      left = BinaryExpression(op.value, left, right, op.position);
    }
    return left;
  }

  // term → unary ( ('*' | '/') unary )*
  parseTerm() {
    let left = this.parseUnary();
    while (this.isOperator('*', '/')) {
      const op = this.consume();
      const right = this.parseUnary();
      left = BinaryExpression(op.value, left, right, op.position);
    }
    return left;
  }

  // unary → '-' unary | primary
  parseUnary() {
    if (this.isOperator('-')) {
      const op = this.consume();
      const arg = this.parseUnary();
      return UnaryExpression('-', arg, op.position);
    }
    return this.parsePrimary();
  }

  // primary → NUMBER | '(' expression ')'
  parsePrimary() {
    const t = this.peek();
    if (!t) {
      throw {
        type: 'ParseError',
        message: 'Unexpected end of expression, expected a number or \'(\'',
        position: this.tokens.length > 0
          ? this.tokens[this.tokens.length - 1].position + 1
          : 0,
        length: 1,
      };
    }

    if (t.type === 'NUMBER') {
      this.consume();
      return NumberLiteral(t.value, t.raw, t.position);
    }

    if (t.type === 'LPAREN') {
      this.consume(); // consume '('
      const expr = this.parseExpression();
      if (!this.peek() || this.peek().type !== 'RPAREN') {
        throw {
          type: 'ParseError',
          message: "Missing closing parenthesis ')'",
          position: t.position,
          length: 1,
        };
      }
      this.consume(); // consume ')'
      return expr;
    }

    throw {
      type: 'ParseError',
      message: `Unexpected token '${t.raw}' — expected a number or '('`,
      position: t.position,
      length: t.length,
    };
  }

  parse() {
    const ast = this.parseExpression();
    const remaining = this.peek();
    if (remaining) {
      throw {
        type: 'ParseError',
        message: `Unexpected token '${remaining.raw}' after valid expression`,
        position: remaining.position,
        length: remaining.length,
      };
    }
    return ast;
  }
}

function parse(tokens) {
  const parser = new Parser(tokens);
  return parser.parse();
}

module.exports = { parse };
