'use strict';

const { tokenize, tokenizeLine, getAssignments, getInvalidTokens, TOKEN_TYPES } = require('./envTokenize');

describe('tokenizeLine', () => {
  test('blank line returns BLANK token', () => {
    const t = tokenizeLine('', 1);
    expect(t.type).toBe(TOKEN_TYPES.BLANK);
    expect(t.line).toBe(1);
  });

  test('whitespace-only line returns BLANK token', () => {
    const t = tokenizeLine('   ', 2);
    expect(t.type).toBe(TOKEN_TYPES.BLANK);
  });

  test('comment line returns COMMENT token with text', () => {
    const t = tokenizeLine('# this is a comment', 3);
    expect(t.type).toBe(TOKEN_TYPES.COMMENT);
    expect(t.comment).toBe('this is a comment');
  });

  test('valid assignment returns ASSIGNMENT token', () => {
    const t = tokenizeLine('FOO=bar', 4);
    expect(t.type).toBe(TOKEN_TYPES.ASSIGNMENT);
    expect(t.key).toBe('FOO');
    expect(t.value).toBe('bar');
  });

  test('quoted value is unquoted', () => {
    const t = tokenizeLine('DB_URL="postgres://localhost"', 5);
    expect(t.value).toBe('postgres://localhost');
  });

  test('single-quoted value is unquoted', () => {
    const t = tokenizeLine("SECRET='abc123'", 6);
    expect(t.value).toBe('abc123');
  });

  test('inline comment is extracted', () => {
    const t = tokenizeLine('PORT=3000 # default port', 7);
    expect(t.value).toBe('3000');
    expect(t.comment).toBe('default port');
  });

  test('missing equals returns INVALID token', () => {
    const t = tokenizeLine('BADLINE', 8);
    expect(t.type).toBe(TOKEN_TYPES.INVALID);
    expect(t.reason).toMatch(/missing equals/);
  });

  test('invalid key name returns INVALID token', () => {
    const t = tokenizeLine('123BAD=value', 9);
    expect(t.type).toBe(TOKEN_TYPES.INVALID);
    expect(t.reason).toMatch(/invalid key name/);
  });
});

describe('tokenize', () => {
  test('tokenizes multi-line content', () => {
    const content = '# env file\nFOO=bar\n\nBAZ=qux';
    const tokens = tokenize(content);
    expect(tokens).toHaveLength(4);
    expect(tokens[0].type).toBe(TOKEN_TYPES.COMMENT);
    expect(tokens[1].type).toBe(TOKEN_TYPES.ASSIGNMENT);
    expect(tokens[2].type).toBe(TOKEN_TYPES.BLANK);
    expect(tokens[3].type).toBe(TOKEN_TYPES.ASSIGNMENT);
  });
});

describe('getAssignments', () => {
  test('returns only assignment tokens', () => {
    const tokens = tokenize('# comment\nFOO=1\nBAR=2\n\nBADLINE');
    const assignments = getAssignments(tokens);
    expect(assignments).toHaveLength(2);
    expect(assignments.map(t => t.key)).toEqual(['FOO', 'BAR']);
  });
});

describe('getInvalidTokens', () => {
  test('returns only invalid tokens', () => {
    const tokens = tokenize('FOO=ok\nBADLINE\n123=bad');
    const invalid = getInvalidTokens(tokens);
    expect(invalid).toHaveLength(2);
  });
});
