import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOKEN_COLORS = {
  NUMBER:  { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: 'var(--accent-blue)', label: 'number' },
  OPERATOR:{ bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: 'var(--accent-red)', label: 'operator' },
  LPAREN:  { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)', text: 'var(--accent-yellow)', label: 'lparen' },
  RPAREN:  { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)', text: 'var(--accent-yellow)', label: 'rparen' },
};

function CharHighlight({ expression, tokens }) {
  if (!expression) return null;

  // Build a map of position → token type
  const posMap = {};
  if (tokens) {
    tokens.forEach(tok => {
      for (let j = tok.position; j < tok.position + tok.length; j++) {
        posMap[j] = tok.type;
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-0.5 font-mono text-base sm:text-lg leading-relaxed mb-5 p-4 rounded-12 backdrop-blur-sm"
         style={{
           background: 'rgba(255, 255, 255, 0.02)',
           border: '1.5px solid rgba(255, 255, 255, 0.1)',
         }}>
      {expression.split('').map((ch, i) => {
        if (ch === ' ') return <span key={i} className="w-2 sm:w-3" />;
        const type = posMap[i];
        const colors = type ? TOKEN_COLORS[type] : null;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, type: 'spring', stiffness: 300 }}
            className="px-1 rounded-lg font-bold transition-all duration-300 hover:scale-110"
            style={colors
              ? {
                  background: colors.bg,
                  color: colors.text,
                  border: `1.5px solid ${colors.border}`,
                  boxShadow: `0 0 8px ${colors.border}40`,
                }
              : { color: 'var(--text-muted)', opacity: 0.5 }
            }
            title={type ? `${type} token` : 'whitespace'}
          >
            {ch}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function TokenizerView({ expression, tokens, visible }) {
  const [revealed, setRevealed] = useState([]);

  useEffect(() => {
    if (!tokens || !visible) { setRevealed([]); return; }
    setRevealed([]);
    tokens.forEach((_, i) => {
      setTimeout(() => setRevealed(prev => [...prev, i]), i * 100 + 150);
    });
  }, [tokens, visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      <div className="panel-title">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: 'var(--accent-blue)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-bold">🔍 Lexical Analysis</span>
      </div>
      <div className="p-6 sm:p-7">
        {/* Character highlight */}
        <div className="mb-6">
          <p className="text-xs sm:text-sm text-text-muted mb-3 uppercase tracking-widest font-bold">Input Analysis</p>
          <CharHighlight expression={expression} tokens={tokens} />
        </div>

        {/* Token chips */}
        <div>
          <p className="text-xs sm:text-sm text-text-muted mb-4 uppercase tracking-widest font-bold">
            Token Stream <span className="text-accent-blue text-base ml-2">({tokens?.length ?? 0} tokens)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {tokens && tokens.slice(0, revealed.length).map((tok, i) => {
                const colors = TOKEN_COLORS[tok.type] || TOKEN_COLORS.OPERATOR;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5, y: 12, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.3, y: -12 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-2 cursor-default group"
                    title={`${tok.type} • Value: ${tok.value} • Position: ${tok.position}`}
                  >
                    <motion.div
                      className="px-4 py-2.5 rounded-10 font-mono text-sm sm:text-base font-bold transition-all duration-300"
                      style={{
                        background: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        color: colors.text,
                        boxShadow: `0 4px 12px ${colors.border}30`,
                      }}
                      whileHover={{ scale: 1.08, y: -2 }}
                    >
                      {String(tok.value)}
                    </motion.div>
                    <span className="text-[9px] sm:text-xs uppercase tracking-widest font-black opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: colors.text }}>
                      {colors.label}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend */}
        <motion.div
          className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Object.entries(TOKEN_COLORS).map(([type, c], idx) => (
            <motion.div
              key={type}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium"
              style={{ color: c.text }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + idx * 0.05 }}
            >
              <div className="w-3 h-3 rounded-md" style={{ background: c.bg, border: `1.5px solid ${c.border}` }} />
              {c.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
