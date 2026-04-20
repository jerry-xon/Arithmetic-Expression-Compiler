import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { compileExpression } from './utils/api';
import Pipeline from './components/Pipeline';
import Controls from './components/Controls';
import TokenizerView from './components/TokenizerView';
import ASTView from './components/ASTView';
import SemanticView from './components/SemanticView';
import CodeGenView from './components/CodeGenView';
import ResultView from './components/ResultView';
import ExplainPanel from './components/ExplainPanel';
import ErrorDisplay from './components/ErrorDisplay';

const STAGE_ORDER = ['input', 'lexer', 'parser', 'semantic', 'codegen', 'result'];

const EXAMPLES = [
  '3 + 4 * 2',
  '(1 + 2) * 3',
  '10 / (5 - 5)',
  '2 * (3 + 4) - 1',
  '((2 + 3)) * (4 - 1)',
  '100 / 4 / 5',
  '-3 + 7',
  '3 + * 4',
];

export default function App() {
  const [expression, setExpression] = useState('3 + 4 * 2');
  const [compileData, setCompileData] = useState(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [showExamples, setShowExamples] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  const playTimerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const currentStage = STAGE_ORDER[currentStageIdx] || null;
  const hasError = compileData?.error;
  const errorStage = hasError ? compileData.stage : null;

  // Determine which views are visible (everything up to and including current stage)
  const stageVisible = (stageId) => {
    const idx = STAGE_ORDER.indexOf(stageId);
    return idx !== -1 && idx <= currentStageIdx;
  };

  // ---- Compile ----
  const handleCompile = useCallback(async () => {
    const expr = expression.trim();
    if (!expr) return;

    stopPlay();
    setIsLoading(true);
    setCompileData(null);
    setCurrentStageIdx(-1);
    setNetworkError(null);

    try {
      const data = await compileExpression(expr);
      setCompileData(data);
      // Auto-advance to first stage after compile
      setTimeout(() => setCurrentStageIdx(0), 100);
    } catch (err) {
      setNetworkError(err.message || 'Could not reach the backend. Is it running on localhost:5000?');
    } finally {
      setIsLoading(false);
    }
  }, [expression]);

  // ---- Step ----
  const handleStep = useCallback(() => {
    if (!compileData) return;
    setCurrentStageIdx(prev => {
      const next = prev + 1;
      // Stop at the stage where the error happened, or at the last stage
      if (hasError) {
        const errIdx = STAGE_ORDER.indexOf(compileData.stage);
        if (next > errIdx) return prev;
      }
      return Math.min(next, STAGE_ORDER.length - 1);
    });
  }, [compileData, hasError]);

  // ---- Play / Pause ----
  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    clearTimeout(playTimerRef.current);
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = 2300 - speed; // speed 300→2000 mapped to delay 2000→300
    playTimerRef.current = setTimeout(() => {
      setCurrentStageIdx(prev => {
        const maxIdx = hasError
          ? STAGE_ORDER.indexOf(compileData?.stage ?? 'result')
          : STAGE_ORDER.length - 1;
        const next = prev + 1;
        if (next > maxIdx) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, delay);
  }, [speed, hasError, compileData]);

  useEffect(() => {
    if (isPlaying && compileData) {
      scheduleNext();
    }
    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, currentStageIdx, scheduleNext, compileData]);

  // Auto-scroll visualization area on step change
  useEffect(() => {
    if (scrollContainerRef.current && compileData && currentStageIdx >= 0) {
      // Scroll to bottom of the container to show the newest step
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [currentStageIdx, compileData]);

  const handlePlay = useCallback(() => {
    if (!compileData) return;
    if (isPlaying) {
      stopPlay();
    } else {
      setIsPlaying(true);
    }
  }, [compileData, isPlaying, stopPlay]);

  // ---- Jump ----
  const handleJump = useCallback((stageId) => {
    stopPlay();
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx !== -1) setCurrentStageIdx(idx);
  }, [stopPlay]);

  // ---- Reset ----
  const handleReset = useCallback(() => {
    stopPlay();
    setCompileData(null);
    setCurrentStageIdx(-1);
    setNetworkError(null);
    inputRef.current?.focus();
  }, [stopPlay]);

  // Can we step / play further?
  const maxStageIdx = hasError
    ? STAGE_ORDER.indexOf(compileData?.stage ?? 'result')
    : STAGE_ORDER.length - 1;
  const canStep = compileData && currentStageIdx < maxStageIdx;
  const canPlay = compileData && currentStageIdx < maxStageIdx;

  // Key binding: Enter to compile
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCompile();
  };

  return (
    <div className="min-h-screen h-screen relative overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* ---- Main Content Area ---- */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header & Pipeline — Top Section */}
        <div className="border-b border-white/5 flex-shrink-0 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 space-y-3 sm:space-y-4">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
            {/* Compact Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl font-black" style={{
                  background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 50%, var(--accent-blue) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  ✨ Visual Compiler
                </div>
              </div>
            </motion.div>

            {/* Pipeline Stages — Below Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Pipeline
                currentStage={currentStage}
                errorStage={errorStage}
                onJump={handleJump}
              />
            </motion.div>

            {/* Input Section — Below Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center"
            >
              {/* Examples dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  className="btn btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 h-full"
                  onClick={() => setShowExamples(v => !v)}
                >
                  <span>📚</span>
                  <span>Examples</span>
                </button>
                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 z-50 rounded-12 overflow-hidden backdrop-blur-xl"
                      style={{
                        background: 'rgba(15, 18, 32, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                        minWidth: 240,
                      }}
                    >
                      {EXAMPLES.map((ex, idx) => (
                        <motion.button
                          key={ex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="w-full text-left px-5 py-3 font-mono text-sm text-text-secondary hover:bg-white/5 hover:text-accent-purple transition-all duration-200 border-b border-white/% last:border-0 group"
                          onClick={() => {
                            setExpression(ex);
                            setShowExamples(false);
                          }}
                        >
                          <span className="group-hover:text-accent-purple transition-colors">{ex}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expression input */}
              <input
                ref={inputRef}
                type="text"
                value={expression}
                onChange={e => setExpression(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter expression (e.g., 3 + 4 * 2)"
                className="flex-1 font-mono text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-12 outline-none transition-all duration-300 bg-white/3 min-w-0"
                style={{
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              />

              {/* Compile button */}
              <motion.button
                className="btn btn-primary px-4 sm:px-6 font-semibold text-xs sm:text-sm py-2 sm:py-2.5 h-full"
                onClick={handleCompile}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⟳
                  </motion.span>
                ) : '▶'}
                <span>{isLoading ? 'Compiling…' : 'Compile'}</span>
              </motion.button>
            </motion.div>

            {/* Network error — Inline */}
            <AnimatePresence>
              {networkError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-10 px-4 py-2.5 text-xs sm:text-sm backdrop-blur-xl border flex-shrink-0"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                  }}
                >
                  <span>🔌 Connection Error: {networkError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---- Visualization Area (Flex-1 to take remaining space) ---- */}
        <div className="flex-1 overflow-hidden px-6 sm:px-8 lg:px-12 py-4 sm:py-5">
          <div className="h-full flex gap-6 lg:gap-8 min-h-0 max-w-7xl mx-auto">

            {/* Left — Scrollable Visualization column (Wider) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex-[1.3] overflow-y-auto scrollbar-container min-h-0"
              ref={scrollContainerRef}
            >
            <div className="flex flex-col gap-4 lg:gap-5">

              {/* Compiler error */}
              <AnimatePresence>
                {compileData?.error && stageVisible(compileData.stage) && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ErrorDisplay
                      error={compileData.error}
                      expression={compileData.expression}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tokenizer */}
              <AnimatePresence>
                {stageVisible('lexer') && compileData?.tokens && (
                  <motion.div
                    key="tokens"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TokenizerView
                      expression={compileData.expression}
                      tokens={compileData.tokens}
                      visible
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AST */}
              <AnimatePresence>
                {stageVisible('parser') && compileData?.ast && (
                  <motion.div
                    key="ast"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ASTView
                      ast={compileData.ast}
                      visible
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Semantic */}
              <AnimatePresence>
                {stageVisible('semantic') && compileData?.semantic && (
                  <motion.div
                    key="semantic"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SemanticView
                      semantic={compileData.semantic}
                      visible
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Code Gen */}
              <AnimatePresence>
                {stageVisible('codegen') && compileData?.intermediateCode && (
                  <motion.div
                    key="codegen"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CodeGenView
                      intermediateCode={compileData.intermediateCode}
                      visible
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {stageVisible('result') && compileData?.result !== null && compileData?.result !== undefined && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <ResultView
                      result={compileData.result}
                      expression={compileData.expression}
                      visible
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!compileData && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card rounded-2xl border border-dashed p-12 sm:p-16 lg:p-20 text-center backdrop-blur-sm"
                  style={{
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.02) 100%)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="text-6xl sm:text-7xl mb-4"
                  >
                    ⌨
                  </motion.div>
                  <p className="text-lg sm:text-xl text-text-secondary font-semibold mb-2">Ready to compile</p>
                  <p className="text-sm text-text-muted mb-4">Enter an arithmetic expression above and click Compile</p>
                  <p className="text-xs text-text-muted font-mono opacity-60">Example: <code style={{ color: 'var(--accent-purple)' }}>3 + 4 * 2</code></p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right — Fixed Explanation panel (Compact) */}
          <div className="flex-1 flex-shrink-0 min-w-0">
            <div className="sticky top-20 w-full h-fit max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-container rounded-12">
              <ExplainPanel
                stage={currentStage}
                error={compileData?.error && stageVisible(compileData.stage) ? compileData.error : null}
              />
            </div>
          </div>
          </div>
        </div>
        {/* End of Visualization Area */}

        {/* ---- Controls Bar (Sticky Bottom) ---- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="sticky bottom-0 z-40 flex-shrink-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent px-6 sm:px-8 lg:px-12 py-3 sm:py-4"
        >
          <div className="max-w-7xl mx-auto">
            <Controls
              isPlaying={isPlaying}
              canStep={canStep}
              canPlay={canPlay}
              onPlay={handlePlay}
              onStep={handleStep}
              onReset={handleReset}
              speed={speed}
              onSpeedChange={setSpeed}
              currentStageLabel={currentStage}
              totalStages={STAGE_ORDER.length}
              currentStageIndex={currentStageIdx}
            />
          </div>
        </motion.div>
      </div>
      {/* End Main Content Area */}
    </div>
  );
}
