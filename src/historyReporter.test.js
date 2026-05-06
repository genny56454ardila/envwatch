const { formatEntry, printRecentHistory, printFullHistory } = require('./historyReporter');
const { clearHistory, recordChange } = require('./envHistory');

beforeEach(() => {
  clearHistory();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
});

const makeEntry = (overrides = {}) => ({
  timestamp: new Date('2024-06-01T12:00:00Z').getTime(),
  envFile: '.env',
  added: {},
  removed: {},
  changed: {},
  ...overrides,
});

test('formatEntry includes timestamp and file', () => {
  const entry = makeEntry();
  const out = formatEntry(entry);
  expect(out).toContain('2024-06-01T12:00:00.000Z');
  expect(out).toContain('.env');
});

test('formatEntry shows added keys with +', () => {
  const entry = makeEntry({ added: { NEW_KEY: 'hello' } });
  const out = formatEntry(entry);
  expect(out).toContain('+ NEW_KEY');
  expect(out).toContain('hello');
});

test('formatEntry shows removed keys with -', () => {
  const entry = makeEntry({ removed: { OLD_KEY: 'bye' } });
  const out = formatEntry(entry);
  expect(out).toContain('- OLD_KEY');
});

test('formatEntry shows changed keys with ~', () => {
  const entry = makeEntry({ changed: { PORT: { from: '3000', to: '4000' } } });
  const out = formatEntry(entry);
  expect(out).toContain('~ PORT');
  expect(out).toContain('3000');
  expect(out).toContain('4000');
});

test('formatEntry shows (no changes) when diff is empty', () => {
  const entry = makeEntry();
  const out = formatEntry(entry);
  expect(out).toContain('(no changes)');
});

test('printRecentHistory prints message when no history', () => {
  printRecentHistory();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No env change history'));
});

test('printRecentHistory prints entries when history exists', () => {
  recordChange({ added: { X: '1' }, removed: {}, changed: {} }, '.env');
  printRecentHistory(5);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Last 1'));
});

test('printFullHistory prints all entries', () => {
  recordChange({ added: { A: '1' }, removed: {}, changed: {} }, '.env');
  recordChange({ added: {}, removed: { A: '1' }, changed: {} }, '.env');
  printFullHistory();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2 event(s)'));
});
