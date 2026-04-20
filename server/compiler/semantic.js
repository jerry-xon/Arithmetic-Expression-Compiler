/**
 * semantic.js — Semantic Analysis
 *
 * Walks the AST and validates:
 *  1. All literals are finite numbers
 *  2. No division by zero (literal)
 *  3. Operators are valid
 *  4. No unresolved identifiers (all leaves are numbers)
 *
 * Returns { valid: boolean, checks: Array<{ok, rule, detail}>, warnings: [] }
 */

const VALID_BINARY_OPS = new Set(['+', '-', '*', '/']);
const VALID_UNARY_OPS = new Set(['-']);

function analyze(ast) {
  const checks = [];
  const warnings = [];
  let valid = true;

  function addCheck(ok, rule, detail) {
    checks.push({ ok, rule, detail });
    if (!ok) valid = false;
  }

  function visit(node) {
    if (!node) return;

    switch (node.type) {
      case 'NumberLiteral': {
        const isFinite = Number.isFinite(node.value);
        addCheck(isFinite, 'Numeric literal is finite', `'${node.raw}' → ${node.value}`);
        break;
      }

      case 'BinaryExpression': {
        const opValid = VALID_BINARY_OPS.has(node.operator);
        addCheck(opValid, 'Binary operator is valid', `Operator '${node.operator}' is supported`);

        // Division by zero (only detectable statically for literal divisors)
        if (node.operator === '/') {
          const isLiteralZero =
            node.right.type === 'NumberLiteral' && node.right.value === 0;
          if (isLiteralZero) {
            addCheck(false, 'No division by zero', `Right operand of '/' is literally 0`);
          } else {
            addCheck(true, 'No division by zero', 'Divisor is not a literal zero');
          }
        }

        visit(node.left);
        visit(node.right);
        break;
      }

      case 'UnaryExpression': {
        const opValid = VALID_UNARY_OPS.has(node.operator);
        addCheck(opValid, 'Unary operator is valid', `Unary '${node.operator}' is supported`);
        visit(node.argument);
        break;
      }

      default: {
        addCheck(false, 'Known node type', `Unknown AST node: '${node.type}'`);
      }
    }
  }

  visit(ast);

  // Deduplicate: keep only unique rules
  const seen = new Set();
  const dedupedChecks = checks.filter(c => {
    const key = c.rule;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid, checks: dedupedChecks, warnings };
}

module.exports = { analyze };
