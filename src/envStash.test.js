const { stashEnv, popStash, peekStash, listStashes, clearStashes, stashSize } = require('./envStash');

beforeEach(() => clearStashes());

const makeMap = (obj) => new Map(Object.entries(obj));

test('stashEnv pushes a snapshot and returns metadata', () => {
  const env = makeMap({ FOO: 'bar', BAZ: '1' });
  const meta = stashEnv(env, 'my-stash');
  expect(meta.label).toBe('my-stash');
  expect(meta.index).toBe(0);
  expect(typeof meta.timestamp).toBe('number');
  expect(stashSize()).toBe(1);
});

test('stashEnv uses default label when none given', () => {
  const env = makeMap({ A: '1' });
  const meta = stashEnv(env);
  expect(meta.label).toMatch(/stash@/);
});

test('popStash returns snapshot and removes it', () => {
  const env = makeMap({ X: 'hello' });
  stashEnv(env);
  const popped = popStash();
  expect(popped.get('X')).toBe('hello');
  expect(stashSize()).toBe(0);
});

test('popStash by index removes correct entry', () => {
  stashEnv(makeMap({ A: '1' }), 'first');
  stashEnv(makeMap({ B: '2' }), 'second');
  const popped = popStash(0);
  expect(popped.get('A')).toBe('1');
  expect(stashSize()).toBe(1);
});

test('popStash throws when stack is empty', () => {
  expect(() => popStash()).toThrow('No stashes available');
});

test('popStash throws on invalid index', () => {
  stashEnv(makeMap({ A: '1' }));
  expect(() => popStash(5)).toThrow('Invalid stash index');
});

test('peekStash returns snapshot without removing', () => {
  const env = makeMap({ KEY: 'value' });
  stashEnv(env);
  const peeked = peekStash();
  expect(peeked.get('KEY')).toBe('value');
  expect(stashSize()).toBe(1);
});

test('peekStash throws when empty', () => {
  expect(() => peekStash()).toThrow('No stashes available');
});

test('listStashes returns metadata array without snapshots', () => {
  stashEnv(makeMap({ A: '1' }), 'alpha');
  stashEnv(makeMap({ B: '2' }), 'beta');
  const list = listStashes();
  expect(list).toHaveLength(2);
  expect(list[0].label).toBe('alpha');
  expect(list[1].label).toBe('beta');
  expect(list[0].snapshot).toBeUndefined();
});

test('clearStashes empties the stack', () => {
  stashEnv(makeMap({ A: '1' }));
  stashEnv(makeMap({ B: '2' }));
  clearStashes();
  expect(stashSize()).toBe(0);
});

test('stashEnv snapshot is isolated from original map mutations', () => {
  const env = makeMap({ FOO: 'original' });
  stashEnv(env);
  env.set('FOO', 'mutated');
  const peeked = peekStash();
  expect(peeked.get('FOO')).toBe('original');
});
