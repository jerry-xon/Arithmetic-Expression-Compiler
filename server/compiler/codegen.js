/**
 * codegen.js — Intermediate Code Generation
 *
 * Performs a post-order traversal of the AST and emits
 * Three-Address Code (TAC) instructions of the form:
 *
 *   t1 = <operand1> <op> <operand2>
 *   t2 = <op> <operand>          (for unary)
 *
 * Each instruction object:
 *   { id, instruction, temp, op, left, right, astNodeId }
 *
 * Example:
 *   3 + 4 * 2
 *   → t1 = 4 * 2
 *   → t2 = 3 + t1
 */

let tempCounter = 0;

function newTemp() {
  return `t${++tempCounter}`;
}

// Assign unique IDs to every AST node (needed to link code lines → AST nodes)
let nodeIdCounter = 0;
function labelNodes(node) {
  if (!node) return;
  node._id = ++nodeIdCounter;
  if (node.left) labelNodes(node.left);
  if (node.right) labelNodes(node.right);
  if (node.argument) labelNodes(node.argument);
}

function generate(ast) {
  tempCounter = 0;
  nodeIdCounter = 0;
  const instructions = [];

  labelNodes(ast);

  function emit(node) {
    if (!node) return null;

    if (node.type === 'NumberLiteral') {
      return { temp: String(node.value), astNodeId: node._id };
    }

    if (node.type === 'UnaryExpression') {
      const arg = emit(node.argument);
      const t = newTemp();
      const instr = `${t} = -${arg.temp}`;
      instructions.push({
        id: instructions.length + 1,
        instruction: instr,
        temp: t,
        op: 'unary-',
        left: arg.temp,
        right: null,
        astNodeId: node._id,
      });
      return { temp: t, astNodeId: node._id };
    }

    if (node.type === 'BinaryExpression') {
      const left = emit(node.left);
      const right = emit(node.right);
      const t = newTemp();
      const instr = `${t} = ${left.temp} ${node.operator} ${right.temp}`;
      instructions.push({
        id: instructions.length + 1,
        instruction: instr,
        temp: t,
        op: node.operator,
        left: left.temp,
        right: right.temp,
        astNodeId: node._id,
      });
      return { temp: t, astNodeId: node._id };
    }

    return null;
  }

  const result = emit(ast);

  return {
    instructions,
    resultTemp: result ? result.temp : null,
  };
}

module.exports = { generate };
