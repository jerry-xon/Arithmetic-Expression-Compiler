
/**
 * api.js — Backend communication utility
 */

// For local dev, Vite proxies `/compile` to the backend (see `vite.config.js`).
// For deployments, you can either:
// - host client+server together and leave this empty (same-origin), or
// - set `VITE_API_BASE` to your server origin (e.g. https://my-api.onrender.com)
const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/$/, '');

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
