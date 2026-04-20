/**
 * lexer.js — Lexical Analysis
 * Converts a raw arithmetic string into a stream of typed tokens.
 *
 * Token types:
 *   NUMBER      — integer or float literal
 *   OPERATOR    — + - * /
 *   LPAREN      — (
 *   RPAREN      — )
 */

function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // NUMBER — one or more digits, optional decimal point
    if (/[0-9]/.test(ch)) {
      let num = '';
      const start = i;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i++;
      }
      // Validate: not multiple dots
      if ((num.match(/\./g) || []).length > 1) {
        throw {
          type: 'LexerError',
          message: `Invalid number literal: '${num}'`,
          position: start,
          length: num.length,
        };
      }
      tokens.push({
        type: 'NUMBER',
        value: parseFloat(num),
        raw: num,
        position: start,
        length: num.length,
      });
      continue;
    }

    // OPERATOR
    if (['+', '-', '*', '/'].includes(ch)) {
      tokens.push({
        type: 'OPERATOR',
        value: ch,
        raw: ch,
        position: i,
        length: 1,
      });
      i++;
      continue;
    }

    // LPAREN
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', raw: '(', position: i, length: 1 });
      i++;
      continue;
    }

    // RPAREN
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', raw: ')', position: i, length: 1 });
      i++;
      continue;
    }

    // Unknown character
    throw {
      type: 'LexerError',
      message: `Unexpected character '${ch}' at position ${i}`,
      position: i,
      length: 1,
    };
  }

  if (tokens.length === 0) {
    throw { type: 'LexerError', message: 'Empty expression', position: 0, length: 0 };
  }

  return tokens;
}

module.exports = { tokenize };
