# Visual Arithmetic Expression Compiler

A full-stack web application that visually demonstrates every stage of compiler pipeline for arithmetic expressions — from raw characters to a final evaluated result.

## What It Does

Enter any arithmetic expression (e.g. `3 + 4 * 2`) and watch the compiler pipeline animate through:

1. **Lexical Analysis** — tokenizes the input into typed tokens
2. **Parsing** — builds an Abstract Syntax Tree (AST) with correct operator precedence
3. **Semantic Analysis** — validates the AST (types, operators, division by zero)
4. **Code Generation** — emits Three-Address Code (TAC)
5. **Evaluation** — tree-walking interpreter computes the result

## Tech Stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Backend  | Node.js, Express                              |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, D3.js |

## Project Structure

```
visual-compiler/
├── server/                  ← Node.js backend
│   ├── compiler/
│   │   ├── lexer.js         ← Tokenizer
│   │   ├── parser.js        ← Recursive Descent Parser
│   │   ├── ast.js           ← AST node factories
│   │   ├── semantic.js      ← Semantic analyzer
│   │   ├── codegen.js       ← Three-Address Code generator
│   │   └── evaluator.js     ← Tree-walking evaluator
│   ├── server.js            ← Express API (POST /compile)
│   └── package.json
│
└── client/                  ← React frontend
    ├── src/
    │   ├── components/
    │   │   ├── Pipeline.jsx       ← Animated pipeline progress bar
    │   │   ├── Controls.jsx       ← Play / Step / Reset buttons
    │   │   ├── TokenizerView.jsx  ← Animated token chips
    │   │   ├── ASTView.jsx        ← D3 AST tree visualization
    │   │   ├── SemanticView.jsx   ← Semantic check list
    │   │   ├── CodeGenView.jsx    ← Animated TAC lines
    │   │   ├── ResultView.jsx     ← Final result display
    │   │   ├── ExplainPanel.jsx   ← Right-side explanation panel
    │   │   └── ErrorDisplay.jsx   ← Error with position highlighting
    │   ├── utils/
    │   │   └── api.js             ← Backend communication
    │   ├── App.jsx                ← Main app orchestrator
    │   ├── main.jsx               ← React entry point
    │   └── index.css              ← Global styles + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Run

### Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** v8 or higher (comes with Node)

### Step 1 — Install backend dependencies

```bash
cd visual-compiler/server
npm install
```

### Step 2 — Install frontend dependencies

```bash
cd visual-compiler/client
npm install
```

### Step 3 — Start the backend

```bash
# In terminal 1
cd visual-compiler/server
npm start
```

You should see:
```
🚀 Visual Compiler API running at http://localhost:5000
   POST http://localhost:5000/compile
```

### Step 4 — Start the frontend

```bash
# In terminal 2
cd visual-compiler/client
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 5 — Open the app

Open your browser and go to: **http://localhost:5173**

---

## API Reference

### `POST /compile`

**Request body:**
```json
{ "expression": "3 + 4 * 2" }
```

**Response:**
```json
{
  "expression": "3 + 4 * 2",
  "stage": "complete",
  "tokens": [
    { "type": "NUMBER", "value": 3, "raw": "3", "position": 0, "length": 1 },
    { "type": "OPERATOR", "value": "+", "raw": "+", "position": 2, "length": 1 },
    ...
  ],
  "ast": {
    "type": "BinaryExpression",
    "operator": "+",
    "left": { "type": "NumberLiteral", "value": 3 },
    "right": {
      "type": "BinaryExpression",
      "operator": "*",
      "left": { "type": "NumberLiteral", "value": 4 },
      "right": { "type": "NumberLiteral", "value": 2 }
    }
  },
  "semantic": {
    "valid": true,
    "checks": [
      { "ok": true, "rule": "Numeric literal is finite", "detail": "'3' → 3" },
      ...
    ]
  },
  "intermediateCode": {
    "instructions": [
      { "id": 1, "instruction": "t1 = 4 * 2", "temp": "t1", "op": "*", "left": "4", "right": "2" },
      { "id": 2, "instruction": "t2 = 3 + t1", "temp": "t2", "op": "+", "left": "3", "right": "t1" }
    ],
    "resultTemp": "t2"
  },
  "result": 11,
  "error": null
}
```

---

## Test Expressions

| Expression        | Expected Result | Tests                  |
|-------------------|----------------|------------------------|
| `3 + 4 * 2`       | `11`           | Operator precedence    |
| `(1 + 2) * 3`     | `9`            | Parentheses grouping   |
| `10 / (5 - 5)`    | Error          | Division by zero       |
| `2 * (3 + 4) - 1` | `13`           | Complex expression     |
| `-3 + 7`          | `4`            | Unary negation         |
| `100 / 4 / 5`     | `5`            | Left associativity     |
| `3 + * 4`         | Parse error    | Syntax error handling  |

---

## Development

### Run backend with auto-reload

```bash
cd server
npm run dev   # uses nodemon
```

### Run frontend dev server

```bash
cd client
npm run dev   # Vite HMR
```
