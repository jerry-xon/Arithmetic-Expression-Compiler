import React from 'react';
import { motion } from 'framer-motion';

export default function ResultView({ result, expression, visible }) {
  if (!visible || result === null || result === undefined) return null;

  const formatted = Number.isInteger(result)
    ? String(result)
    : parseFloat(result.toFixed(8)).toString();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="card overflow-hidden relative"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="panel-title relative z-10">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: 'var(--accent-green)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-bold">🎉 Success!</span>
      </div>

      <div className="p-8 sm:p-10 lg:p-12 flex flex-col items-center gap-6 sm:gap-8 relative z-10">
        {/* Expression echo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-text-secondary font-mono px-5 py-3 rounded-xl"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1.5px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <span className="text-text-muted">{expression}</span>
          <span className="text-accent-purple font-bold mx-2">=</span>
        </motion.div>

        {/* Result number - Main attraction */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotateZ: -10 }}
          animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 rounded-3xl blur-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
              opacity: 0.3,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div
            className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono relative z-10 tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 50%, var(--accent-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 8px 32px rgba(139, 92, 246, 0.4))',
            }}
          >
            {formatted}
          </div>
        </motion.div>

        {/* Celebration confetti */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background: [
                  'var(--accent-purple)',
                  'var(--accent-teal)',
                  'var(--accent-yellow)',
                  'var(--accent-green)',
                  'var(--accent-blue)',
                  'var(--accent-orange)',
                ][i % 6],
              }}
              initial={{ scale: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                y: [0, -40, -80],
                x: [0, (i % 2 === 0 ? 30 : -30), (i % 2 === 0 ? 60 : -60)],
                rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
              }}
              transition={{
                duration: 1.5,
                delay: 0.3 + i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Status message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <p className="text-sm sm:text-base font-semibold text-text-secondary">
            ✓ Expression evaluated successfully
          </p>
          <p className="text-xs text-text-muted">
            All 6 compilation stages completed without errors
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
