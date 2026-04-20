import React from 'react';
import { motion } from 'framer-motion';

const ERROR_LABELS = {
  LexerError: { label: 'Lexical Analysis Error', color: 'var(--accent-orange)', icon: '📝', stage: 'Stage 2 — Lexer' },
  ParseError: { label: 'Parse Error', color: 'var(--accent-red)', icon: '🌳', stage: 'Stage 3 — Parser' },
  SemanticError: { label: 'Semantic Error', color: 'var(--accent-yellow)', icon: '✓', stage: 'Stage 4 — Semantic Analysis' },
  RuntimeError: { label: 'Runtime Error', color: 'var(--accent-red)', icon: '⚡', stage: 'Stage 5 — Evaluator' },
  EvalError: { label: 'Evaluation Error', color: 'var(--accent-red)', icon: '⚡', stage: 'Stage 5 — Evaluator' },
};

export default function ErrorDisplay({ error, expression }) {
  if (!error) return null;

  const meta = ERROR_LABELS[error.type] || { label: 'Error', color: 'var(--accent-red)', icon: '⚠️', stage: 'Compiler' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="rounded-16 overflow-hidden backdrop-blur-xl"
      style={{
        border: `1.5px solid ${meta.color}50`,
        background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}05)`,
      }}
    >
      {/* Header */}
      <motion.div
        className="px-6 sm:px-7 py-5 sm:py-6 flex items-start gap-4 sm:gap-5"
        style={{
          borderBottom: `1px solid ${meta.color}20`,
          background: `linear-gradient(90deg, ${meta.color}08, transparent)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.span
          animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
          transition={{ delay: 0.2, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-2xl sm:text-3xl flex-shrink-0 mt-1"
        >
          {meta.icon}
        </motion.span>
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-1">{meta.stage}</div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-base sm:text-lg font-bold" style={{ color: meta.color }}>
            {error.message}
          </p>
        </motion.div>

        {/* Position indicator */}
        {expression && error.position !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-sm sm:text-base p-4 rounded-12 overflow-x-auto backdrop-blur-sm"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${meta.color}30`,
            }}
          >
            <div className="text-text-secondary whitespace-nowrap mb-3 leading-relaxed">
              {expression.split('').map((ch, i) => {
                const isError = i >= error.position && i < error.position + (error.length || 1);
                return (
                  <span
                    key={i}
                    style={isError ? {
                      color: meta.color,
                      background: `${meta.color}30`,
                      borderRadius: '4px',
                      padding: '2px 4px',
                      fontWeight: 'bold',
                    } : {}}
                  >
                    {ch === ' ' ? '\u00a0' : ch}
                  </span>
                );
              })}
            </div>
            {error.position !== undefined && (
              <motion.div
                className="text-xs sm:text-sm whitespace-nowrap"
                style={{ color: meta.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <span>{'\u00a0'.repeat(error.position)}↑</span>
                {error.length > 1 && (
                  <span className="ml-1">
                    {'~'.repeat(Math.max(0, error.length - 1))}
                  </span>
                )}
                <span className="ml-2">Position {error.position}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Fix hint */}
        <motion.div
          className="flex gap-3 p-4 rounded-12 text-sm"
          style={{
            background: `${meta.color}12`,
            border: `1px solid ${meta.color}25`,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <span className="flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p className="font-semibold text-text-secondary mb-1">How to fix:</p>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              {error.type === 'LexerError' && 'Unsupported character found. Use digits, operators (+, −, *, /), and parentheses only.'}
              {error.type === 'ParseError' && 'Check for unmatched parentheses, missing operands, or consecutive operators without values between them.'}
              {error.type === 'SemanticError' && 'The expression is valid syntax but has a logical issue — check for division by zero or type mismatches.'}
              {(error.type === 'RuntimeError' || error.type === 'EvalError') && 'A runtime error occurred during evaluation — check for division by zero or overflow.'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
