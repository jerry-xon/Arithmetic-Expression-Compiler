import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGE_CONTENT = {
  idle: {
    title: 'Ready to Compile',
    color: 'var(--accent-purple)',
    icon: '⌨️',
    body: 'Enter an arithmetic expression and press Compile to begin the journey through each compiler stage. Use Step to advance manually or Play for automatic progression.',
    details: [],
  },
  input: {
    title: 'Stage 1 — Input',
    color: 'var(--accent-purple)',
    icon: '⌨️',
    body: 'The compiler receives the raw source string. Characters are scanned left-to-right for tokenization in the next phase.',
    details: [
      { label: 'Operators', value: '+  −  ×  ÷' },
      { label: 'Characters', value: '0–9, (, )' },
      { label: 'Next', value: 'Lexical Analysis' },
    ],
  },
  lexer: {
    title: 'Stage 2 — Lexer',
    color: 'var(--accent-blue)',
    icon: '🔍',
    body: 'The lexer (tokenizer) scans the input character-by-character and groups them into meaningful tokens. Whitespace is discarded and boundaries are identified.',
    details: [
      { label: 'NUMBER', value: 'Digit sequences → numeric value' },
      { label: 'OPERATOR', value: '+ − * / → operator token' },
      { label: 'DELIM', value: '( ) → grouping tokens' },
    ],
  },
  parser: {
    title: 'Stage 3 — Parser',
    color: 'var(--accent-teal)',
    icon: '🌳',
    body: 'A Recursive Descent Parser consumes the token stream and builds an Abstract Syntax Tree. Operator precedence is encoded structurally — * and / are deeper nodes.',
    details: [
      { label: 'Strategy', value: 'Recursive Descent' },
      { label: 'Precedence', value: '* / before + −' },
      { label: 'Association', value: 'Left-to-right' },
    ],
  },
  semantic: {
    title: 'Stage 4 — Semantic Analysis',
    color: 'var(--accent-yellow)',
    icon: '✅',
    body: 'The semantic analyzer walks the AST and validates logical correctness, type consistency, and detects static errors like division by zero.',
    details: [
      { label: 'Type Check', value: 'All operands numeric' },
      { label: 'Div-by-Zero', value: 'Detected for literals' },
      { label: 'Operators', value: 'Only +  −  *  /' },
    ],
  },
  codegen: {
    title: 'Stage 5 — Code Generation',
    color: 'var(--accent-orange)',
    icon: '⚙️',
    body: 'The code generator traverses the AST in post-order and emits Three-Address Code. Each instruction uses at most one operator and two operands.',
    details: [
      { label: 'Traversal', value: 'Post-order (leaves first)' },
      { label: 'Format', value: 'tN = operand OP operand' },
      { label: 'Temporaries', value: 't1, t2, t3 …' },
    ],
  },
  result: {
    title: 'Stage 6 — Evaluation',
    color: 'var(--accent-green)',
    icon: '🎯',
    body: 'The tree-walking evaluator recursively computes each subtree bottom-up. Leaf nodes return values; internal nodes apply operators to their children\'s results.',
    details: [
      { label: 'Strategy', value: 'Tree-walking interpreter' },
      { label: 'Traversal', value: 'Post-order recursive' },
      { label: 'Result', value: 'Final numeric value' },
    ],
  },
  error: {
    title: '⚠️ Compilation Error',
    color: 'var(--accent-red)',
    icon: '❌',
    body: 'An error occurred during compilation. Check the error details and fix your expression. Common issues: unmatched parentheses, division by zero, or invalid characters.',
    details: [
      { label: 'Lexer', value: 'Unknown characters' },
      { label: 'Parser', value: 'Invalid syntax' },
      { label: 'Runtime', value: 'Division by zero' },
    ],
  },
};

export default function ExplainPanel({ stage, error }) {
  const key = error ? 'error' : (stage || 'idle');
  const content = STAGE_CONTENT[key] || STAGE_CONTENT.idle;

  return (
    <div className="card h-full flex flex-col">
      <div className="panel-title">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: content.color }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-bold">📖 Explanation</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto"
        >
          {/* Title + icon */}
          <div className="flex items-start gap-4">
            <motion.div
              className="w-12 h-12 rounded-12 flex items-center justify-center text-2xl flex-shrink-0 backdrop-blur-xl"
              style={{
                background: `${content.color}20`,
                border: `1.5px solid ${content.color}40`,
              }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {content.icon}
            </motion.div>
            <motion.h3
              className="text-lg font-bold leading-tight pt-1"
              style={{ color: content.color }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {content.title}
            </motion.h3>
          </div>

          {/* Body text */}
          <motion.p
            className="text-sm text-text-secondary leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {content.body}
          </motion.p>

          {/* Details table */}
          {content.details.length > 0 && (
            <motion.div
              className="rounded-12 overflow-hidden backdrop-blur-xl"
              style={{
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {content.details.map((d, i) => (
                <motion.div
                  key={i}
                  className="flex gap-3 px-5 py-3.5 text-sm items-center transition-all duration-300 hover:bg-white/5 group"
                  style={{
                    borderTop: i > 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    background: i % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                >
                  <span
                    className="font-mono font-bold flex-shrink-0 text-xs uppercase tracking-wider"
                    style={{ color: content.color }}
                  >
                    {d.label}
                  </span>
                  <span className="text-text-secondary text-xs group-hover:text-text-primary transition-colors">{d.value}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
