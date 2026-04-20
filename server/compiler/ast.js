/**
 * ast.js — AST Node Factory Functions
 * Every node type used by the parser lives here.
 */

function NumberLiteral(value, raw, position) {
  return { type: 'NumberLiteral', value, raw, position };
}

function BinaryExpression(operator, left, right, position) {
  return { type: 'BinaryExpression', operator, left, right, position };
}

function UnaryExpression(operator, argument, position) {
  return { type: 'UnaryExpression', operator, argument, position };
}

module.exports = { NumberLiteral, BinaryExpression, UnaryExpression };
