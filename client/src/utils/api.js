/**
 * api.js — Backend communication utility
 */

const API_BASE = 'http://localhost:5000';

export async function compileExpression(expression) {
  const response = await fetch(`${API_BASE}/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error ${response.status}: ${text}`);
  }

  return response.json();
}
