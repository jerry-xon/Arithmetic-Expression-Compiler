import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function parseInstruction(instr) {
  // e.g. "t1 = 4 * 2" or "t2 = 3 + t1" or "t1 = -5"
  const match = instr.match(/^(\w+)\s*=\s*(.+)$/);
  if (!match) return { temp: null, expr: instr };
  const [, temp, expr] = match;
  return { temp, expr };
}

function colorizeExpr(expr) {
  // Highlight temps, operators, numbers
  return expr.split(/(\bt\d+\b|[+\-*/]|\d+(?:\.\d+)?)/).map((part, i) => {
    if (/^t\d+$/.test(part)) return <span key={i} style={{ color: '#ff9f43', fontWeight: 600 }}>{part}</span>;
    if (/^[+\-*/]$/.test(part)) return <span key={i} style={{ color: '#ff6b6b', fontWeight: 700 }}> {part} </span>;
    if (/^\d/.test(part)) return <span key={i} style={{ color: '#4fc3f7' }}>{part}</span>;
    return <span key={i} style={{ color: '#9198b5' }}>{part}</span>;
  });
}

export default function CodeGenView({ intermediateCode, visible }) {
  const [revealed, setRevealed] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    if (!intermediateCode || !visible) { setRevealed([]); setActiveIdx(-1); return; }
    setRevealed([]);
    setActiveIdx(-1);

    const instructions = intermediateCode.instructions || [];
    instructions.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => [...prev, i]);
        setActiveIdx(i);
        setTimeout(() => setActiveIdx(-1), 500);
      }, i * 280 + 100);
    });
  }, [intermediateCode, visible]);

  if (!visible || !intermediateCode) return null;

  const instructions = intermediateCode.instructions || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="panel-title">
        <div className="w-2 h-2 rounded-full bg-accent-orange" />
        Intermediate Code — Three-Address Code (TAC)
        <span className="ml-auto text-[10px] text-text-muted normal-case tracking-normal">
          {instructions.length} instruction{instructions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="p-4">
        {instructions.length === 0 ? (
          <div className="text-text-muted text-sm font-mono">// Single literal — no instructions needed</div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {instructions.slice(0, revealed.length).map((instr, i) => {
                const { temp, expr } = parseInstruction(instr.instruction);
                const isActive = activeIdx === i;
                return (
                  <motion.div
                    key={instr.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="code-line"
                    style={isActive ? {
                      borderColor: 'rgba(124,106,255,0.5)',
                      background: 'rgba(124,106,255,0.1)',
                      boxShadow: '0 0 12px rgba(124,106,255,0.2)',
                    } : {}}
                  >
                    <span
                      className="text-xs font-semibold text-right select-none"
                      style={{ color: '#5d6480', minWidth: 20 }}
                    >
                      {instr.id}
                    </span>
                    <span className="flex-1 font-mono text-sm">
                      {temp && (
                        <>
                          <span style={{ color: '#ff9f43', fontWeight: 700 }}>{temp}</span>
                          <span style={{ color: '#5d6480' }}> = </span>
                        </>
                      )}
                      {expr && colorizeExpr(expr)}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#7c6aff', boxShadow: '0 0 8px #7c6aff' }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Result temp */}
        {intermediateCode.resultTemp && revealed.length === instructions.length && instructions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm font-mono"
          >
            <span className="text-text-muted">Result stored in:</span>
            <span
              className="px-2 py-0.5 rounded font-bold"
              style={{ background: 'rgba(255,159,67,0.15)', color: '#ff9f43' }}
            >
              {intermediateCode.resultTemp}
            </span>
          </motion.div>
        )}

        {/* TAC explanation */}
        <div className="mt-4 pt-4 border-t border-white/5 text-xs text-text-muted leading-relaxed">
          Each line uses at most <span style={{ color: '#e8eaf6' }}>3 addresses</span>: a result temp and up to 2 operands.
          Temporaries (<span style={{ color: '#ff9f43' }}>t1, t2…</span>) store intermediate values.
          This is what compilers hand to the optimizer and register allocator.
        </div>
      </div>
    </motion.div>
  );
}
