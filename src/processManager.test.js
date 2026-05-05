const { spawnProcess, killCurrentProcess, restartProcess, getCurrentProcess } = require('./processManager');

// Helper: wait for a short duration
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

describe('spawnProcess', () => {
  it('spawns a process and returns a ChildProcess', () => {
    const child = spawnProcess('node', ['-e', 'setTimeout(()=>{},500)'], {});
    expect(child).toBeDefined();
    expect(typeof child.kill).toBe('function');
    child.kill('SIGKILL');
  });

  it('injects env variables into the child process', (done) => {
    const child = spawnProcess(
      'node',
      ['-e', 'process.exit(process.env.TEST_VAR === "hello" ? 0 : 1)'],
      { TEST_VAR: 'hello' }
    );
    child.on('exit', (code) => {
      expect(code).toBe(0);
      done();
    });
  });
});

describe('killCurrentProcess', () => {
  it('resolves immediately when no process is running', async () => {
    // Reset internal state by calling kill with nothing running
    await expect(killCurrentProcess()).resolves.toBeUndefined();
  });
});

describe('restartProcess', () => {
  it('kills the old process and starts a new one', async () => {
    // Start a long-running process
    const first = spawnProcess('node', ['-e', 'setTimeout(()=>{},5000)'], {});
    const firstPid = first.pid;

    // Manually set it as current via restartProcess bootstrapping
    const second = await restartProcess('node', ['-e', 'setTimeout(()=>{},5000)'], {});
    expect(second).toBeDefined();
    expect(second.pid).not.toBe(firstPid);

    second.kill('SIGKILL');
    await wait(100);
  });

  it('getCurrentProcess returns the latest spawned process', async () => {
    const child = await restartProcess('node', ['-e', 'setTimeout(()=>{},2000)'], {});
    expect(getCurrentProcess()).toBe(child);
    child.kill('SIGKILL');
    await wait(100);
  });
});
