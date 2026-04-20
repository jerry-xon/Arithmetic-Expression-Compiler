import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SemanticView({ semantic, visible }) {
  if (!visible || !semantic) return null;

  const { valid, checks, warnings } = semantic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="panel-title">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: valid ? '#56cf8a' : '#ff6b6b' }}
        />
        Semantic Analysis
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-md"
          style={valid
            ? { background: 'rgba(86,207,138,0.12)', color: '#56cf8a' }
            : { background: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }
          }
        >
          {valid ? '✓ Valid' : '✗ Errors found'}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <AnimatePresence>
          {checks.map((check, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
              className={`semantic-check ${check.ok ? 'semantic-ok' : 'semantic-err'}`}
            >
              <span className="text-base mt-0.5 flex-shrink-0">{check.ok ? '✓' : '✗'}</span>
              <div>
                <div className="font-semibold text-sm">{check.rule}</div>
                <div className="text-xs opacity-75 mt-0.5 font-mono">{check.detail}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {warnings && warnings.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">Warnings</p>
            {warnings.map((w, i) => (
              <div key={i} className="text-xs text-accent-yellow px-3 py-2 rounded-lg bg-yellow-500/8 border border-yellow-500/20">
                ⚠ {w}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
