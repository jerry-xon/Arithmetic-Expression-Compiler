/**
 * server.js — Express API Server
 *
 * POST /compile
 *   Body:  { expression: string }
 *   Returns pipeline output for all compiler stages.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const { tokenize } = require('./compiler/lexer');
const { parse } = require('./compiler/parser');
const { analyze } = require('./compiler/semantic');
const { generate } = require('./compiler/codegen');
const { evaluate } = require('./compiler/evaluator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In production, serve the built frontend (single-service deploy).
// Render (or any host) should run `npm run build` in `client/` beforehand.
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Visual Compiler API is running' });
});

app.post('/compile', (req, res) => {
  const { expression } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ error: { type: 'InputError', message: 'Expression is required' } });
  }

  const expr = expression.trim();
  if (!expr) {
    return res.status(400).json({ error: { type: 'InputError', message: 'Expression cannot be empty' } });
  }

  // Stage 1: Lexical Analysis
  let tokens;
  try {
    tokens = tokenize(expr);
  } catch (err) {
    return res.json({
      expression: expr,
      stage: 'lexer',
      tokens: null,
      ast: null,
      semantic: null,
      intermediateCode: null,
      result: null,
      error: err,
    });
  }

  // Stage 2: Parsing
  let ast;
  try {
    ast = parse(tokens);
  } catch (err) {
    return res.json({
      expression: expr,
      stage: 'parser',
      tokens,
      ast: null,
      semantic: null,
      intermediateCode: null,
      result: null,
      error: err,
    });
  }

  // Stage 3: Semantic Analysis
  let semantic;
  try {
    semantic = analyze(ast);
  } catch (err) {
    return res.json({
      expression: expr,
      stage: 'semantic',
      tokens,
      ast,
      semantic: null,
      intermediateCode: null,
      result: null,
      error: err,
    });
  }

  // If semantic errors found (e.g. division by zero), still generate code but flag it
  const semanticError = !semantic.valid
    ? semantic.checks.find(c => !c.ok)
    : null;

  // Stage 4: Code Generation
  let intermediateCode;
  try {
    intermediateCode = generate(ast);
  } catch (err) {
    return res.json({
      expression: expr,
      stage: 'codegen',
      tokens,
      ast,
      semantic,
      intermediateCode: null,
      result: null,
      error: err,
    });
  }

  // Stage 5: Evaluation
  let result = null;
  let evalError = null;
  try {
    const raw = evaluate(ast);
    // Round floating point display noise
    result = parseFloat(raw.toFixed(10));
  } catch (err) {
    evalError = err;
  }

  return res.json({
    expression: expr,
    stage: evalError ? 'evaluator' : 'complete',
    tokens,
    ast,
    semantic,
    intermediateCode,
    result,
    error: evalError || (semanticError ? { type: 'SemanticError', ...semanticError } : null),
  });
});

// SPA fallback (so refresh/deep links work when serving the client)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Visual Compiler API running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/compile\n`);
});
