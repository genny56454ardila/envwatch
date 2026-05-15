'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { startEnvWatch } = require('./envWatch');
const { getHistory, clearHistory } = require('./envHistory');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-test-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

beforeEach(() => clearHistory());

test('startEnvWatch returns a stop function', async () => {
  const p = writeTmp('FOO=bar\n');
  const stop = await startEnvWatch(p, { reload: false });
  expect(typeof stop).toBe('function');
  stop();
  fs.unlinkSync(p);
});

test('handleEnvChange records a change when values differ', async () => {
  const p = writeTmp('FOO=bar\n');
  const stop = await startEnvWatch(p, { reload: false });

  // overwrite with new content
  fs.writeFileSync(p, 'FOO=baz\n', 'utf8');

  // give the watcher a moment
  await new Promise(r => setTimeout(r, 300));

  const history = getHistory();
  expect(history.length).toBeGreaterThan(0);
  const last = history[history.length - 1];
  expect(last.diff.modified.length).toBe(1);
  expect(last.diff.modified[0].key).toBe('FOO');

  stop();
  fs.unlinkSync(p);
});

test('handleEnvChange does not record when file content is identical', async () => {
  const p = writeTmp('FOO=same\n');
  const stop = await startEnvWatch(p, { reload: false });

  fs.writeFileSync(p, 'FOO=same\n', 'utf8');
  await new Promise(r => setTimeout(r, 300));

  expect(getHistory().length).toBe(0);

  stop();
  fs.unlinkSync(p);
});

test('startEnvWatch with snapshot option does not throw', async () => {
  const p = writeTmp('X=1\n');
  let stop;
  await expect(async () => {
    stop = await startEnvWatch(p, { reload: false, snapshot: true });
  }).not.toThrow();
  if (stop) stop();
  fs.unlinkSync(p);
});
