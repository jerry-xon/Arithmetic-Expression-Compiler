import React from 'react';
import { motion } from 'framer-motion';

export default function Controls({
  isPlaying,
  canStep,
  canPlay,
  onPlay,
  onStep,
  onReset,
  speed,
  onSpeedChange,
  currentStageLabel,
  totalStages,
  currentStageIndex,
}) {
  return (
    <div className="card p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Control buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Step button */}
          <motion.button
            className="btn btn-secondary"
            onClick={onStep}
            disabled={!canStep}
            whileHover={{ scale: canStep ? 1.05 : 1 }}
            whileTap={{ scale: canStep ? 0.95 : 1 }}
          >
            <span>⏭️</span>
            <span className="hidden sm:inline">Step</span>
          </motion.button>

          {/* Play/Pause toggle */}
          <motion.button
            className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
            onClick={onPlay}
            disabled={!canPlay && !isPlaying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ minWidth: '120px' }}
          >
            <motion.span
              key={isPlaying ? 'pause' : 'play'}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </motion.span>
            <span className="hidden sm:inline font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
          </motion.button>

          {/* Reset button */}
          <motion.button
            className="btn btn-danger"
            onClick={onReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>↺</span>
            <span className="hidden sm:inline">Reset</span>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="w-full sm:w-px h-px sm:h-6 bg-white/10" style={{ opacity: 0.3 }}></div>

        {/* Speed control */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Playback</span>
          <span className="text-xs text-text-muted min-w-fit">🐢</span>
          <input
            type="range"
            min={300}
            max={2000}
            value={speed}
            onChange={e => onSpeedChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-full cursor-pointer accent-accent-purple min-w-20"
            title="Animation speed: Slow to Fast"
            style={{
              background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.5))',
            }}
          />
          <span className="text-xs text-text-muted min-w-fit">🐇</span>
        </div>

        {/* Stage indicator */}
        {currentStageLabel && (
          <motion.div
            key={currentStageLabel}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <span className="text-xs font-semibold text-text-muted uppercase">Stage</span>
            <span
              className="font-mono text-sm px-2.5 py-1 rounded-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {currentStageIndex + 1}/{totalStages}
            </span>
            <span className="text-xs font-semibold text-text-secondary capitalize">{currentStageLabel}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
