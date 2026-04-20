/**
 * evaluator.js — Tree-Walking Evaluator
 *
 * Recursively evaluates the AST produced by the parser.
 * Returns a numeric result or throws a runtime error.
 */

function evaluate(node) {
  if (!node) throw { type: 'EvalError', message: 'Empty AST node' };

  switch (node.type) {
    case 'NumberLiteral':
      return node.value;

    case 'UnaryExpression':
      if (node.operator === '-') return -evaluate(node.argument);
      throw { type: 'EvalError', message: `Unknown unary operator '${node.operator}'` };

    case 'BinaryExpression': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);

      switch (node.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
          if (right === 0) {
            throw {
              type: 'RuntimeError',
              message: 'Division by zero',
              position: node.position,
            };
          }
          return left / right;
        default:
          throw { type: 'EvalError', message: `Unknown operator '${node.operator}'` };
      }
    }

    default:
      throw { type: 'EvalError', message: `Unknown node type '${node.type}'` };
  }
}

module.exports = { evaluate };
