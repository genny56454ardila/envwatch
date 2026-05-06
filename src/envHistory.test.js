const {
  recordChange,
  getHistory,
  getRecentHistory,
  clearHistory,
  historySize,
  MAX_HISTORY,
} = require('./envHistory');

beforeEach(() => {
  clearHistory();
});

const makeDiff = (overrides = {}) => ({
  added: {},
  removed: {},
  changed: {},
  ...overrides,
});

test('records a change and returns an entry', () => {
  const diff = makeDiff({ added: { FOO: 'bar' } });
  const entry = recordChange(diff, '.env');
  expect(entry.envFile).toBe('.env');
  expect(entry.added).toEqual({ FOO: 'bar' });
  expect(typeof entry.timestamp).toBe('number');
});

test('getHistory returns all recorded entries', () => {
  recordChange(makeDiff({ added: { A: '1' } }), '.env');
  recordChange(makeDiff({ removed: { B: '2' } }), '.env');
  expect(getHistory()).toHaveLength(2);
});

test('getHistory returns a copy, not the internal array', () => {
  recordChange(makeDiff(), '.env');
  const h = getHistory();
  h.push({ fake: true });
  expect(historySize()).toBe(1);
});

test('getRecentHistory returns last n entries', () => {
  for (let i = 0; i < 5; i++) {
    recordChange(makeDiff({ added: { [`K${i}`]: `${i}` } }), '.env');
  }
  const recent = getRecentHistory(3);
  expect(recent).toHaveLength(3);
  expect(recent[2].added).toEqual({ K4: '4' });
});

test('clearHistory resets history', () => {
  recordChange(makeDiff(), '.env');
  clearHistory();
  expect(historySize()).toBe(0);
});

test('does not exceed MAX_HISTORY entries', () => {
  for (let i = 0; i < MAX_HISTORY + 10; i++) {
    recordChange(makeDiff({ added: { [`X${i}`]: `${i}` } }), '.env');
  }
  expect(historySize()).toBe(MAX_HISTORY);
});

test('oldest entry is dropped when limit exceeded', () => {
  recordChange(makeDiff({ added: { FIRST: 'yes' } }), '.env');
  for (let i = 0; i < MAX_HISTORY; i++) {
    recordChange(makeDiff(), '.env');
  }
  const all = getHistory();
  expect(all[0].added).not.toEqual({ FIRST: 'yes' });
});
