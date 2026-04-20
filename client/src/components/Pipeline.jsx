import React from 'react';
import { motion } from 'framer-motion';

const STAGE_META = [
  { id: 'input',    label: 'Input',    icon: '⌨', num: '1' },
  { id: 'lexer',    label: 'Lexer',    icon: '🔍', num: '2' },
  { id: 'parser',   label: 'Parser',   icon: '🌳', num: '3' },
  { id: 'semantic', label: 'Semantic', icon: '✅', num: '4' },
  { id: 'codegen',  label: 'CodeGen',  icon: '⚙', num: '5' },
  { id: 'result',   label: 'Result',   icon: '🎯', num: '6' },
];

const ACCENT = {
  done:    { ring: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--accent-green)' },
  active:  { ring: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.2)', text: 'var(--accent-purple)' },
  error:   { ring: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--accent-red)' },
  pending: { ring: 'rgba(255, 255, 255, 0.1)', bg: 'transparent', text: 'var(--text-muted)' },
};

export default function Pipeline({ currentStage, errorStage, onJump }) {
  function stateOf(stageId, idx) {
    const stageOrder = STAGE_META.map(s => s.id);
    const curIdx = stageOrder.indexOf(currentStage);
    const myIdx = stageOrder.indexOf(stageId);
    if (errorStage === stageId) return 'error';
    if (curIdx === -1) return 'pending';
    if (myIdx < curIdx) return 'done';
    if (myIdx === curIdx) return 'active';
    return 'pending';
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-1 sm:gap-2 min-w-max px-2">
        {STAGE_META.map((stage, idx) => {
          const state = stateOf(stage.id, idx);
          const colors = ACCENT[state];
          const isDone = state === 'done';
          const isActive = state === 'active';
          const isError = state === 'error';

          return (
            <React.Fragment key={stage.id}>
              <motion.button
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-10 cursor-pointer transition-all duration-300 min-w-fit"
                onClick={() => currentStage && onJump && onJump(stage.id)}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                title={`Jump to ${stage.label}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1.5px solid ${isError ? colors.ring : isDone ? 'rgba(16, 185, 129, 0.3)' : isActive ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                }}
              >
                <motion.div
                  className="relative flex items-center justify-center"
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 12px rgba(139, 92, 246, 0.3)`,
                      `0 0 24px rgba(139, 92, 246, 0.6)`,
                      `0 0 12px rgba(139, 92, 246, 0.3)`,
                    ]
                  } : {}}
                  transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                >
                  <motion.div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold relative"
                    style={{
                      border: `2px solid ${colors.ring}`,
                      background: colors.bg,
                      color: colors.text,
                    }}
                    animate={isActive ? {
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                  >
                    {isDone ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="text-base"
                      >
                        ✓
                      </motion.span>
                    ) : isError ? (
                      <motion.span
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 0.3 }}
                        className="text-base sm:text-lg"
                      >
                        ✕
                      </motion.span>
                    ) : (
                      <span>{stage.num}</span>
                    )}
                  </motion.div>
                </motion.div>
                <span
                  className="text-[9px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: colors.text, opacity: isActive ? 1 : 0.6 }}
                >
                  {stage.label}
                </span>
              </motion.button>

              {idx < STAGE_META.length - 1 && (
                <motion.div
                  className="flex-1 h-0.5 sm:h-1 rounded-full min-w-[6px] sm:min-w-[12px]"
                  style={{
                    background: isDone
                      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.5), rgba(16, 185, 129, 0.2))'
                      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
                  }}
                  animate={isDone ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={isDone ? { duration: 2, repeat: Infinity } : {}}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
