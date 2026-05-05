const fs = require('fs');
const path = require('path');
const os = require('os');
const { watchEnvFile, debounce } = require('./fileWatcher');

function writeTmp(content) {
  const tmpPath = path.join(os.tmpdir(), `envwatch-test-${Date.now()}.env`);
  fs.writeFileSync(tmpPath, content, 'utf8');
  return tmpPath;
}

describe('debounce', () => {
  jest.useFakeTimers();

  it('delays execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on repeated calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced();
    jest.advanceTimersByTime(50);
    debounced();
    jest.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('watchEnvFile', () => {
  it('throws if file does not exist', () => {
    expect(() => watchEnvFile('/nonexistent/.env', jest.fn())).toThrow(
      'envwatch: file not found'
    );
  });

  it('returns stop() and currentVars', () => {
    const tmpPath = writeTmp('PORT=3000\nNODE_ENV=development\n');
    const handle = watchEnvFile(tmpPath, jest.fn());
    expect(typeof handle.stop).toBe('function');
    expect(handle.currentVars).toEqual({ PORT: '3000', NODE_ENV: 'development' });
    handle.stop();
    fs.unlinkSync(tmpPath);
  });

  it('calls onChange when file content changes', (done) => {
    const tmpPath = writeTmp('KEY=original\n');
    const handle = watchEnvFile(tmpPath, (newVars, prevVars) => {
      expect(newVars.KEY).toBe('updated');
      expect(prevVars.KEY).toBe('original');
      handle.stop();
      fs.unlinkSync(tmpPath);
      done();
    }, { debounceMs: 50 });

    setTimeout(() => {
      fs.writeFileSync(tmpPath, 'KEY=updated\n', 'utf8');
    }, 100);
  });
});
