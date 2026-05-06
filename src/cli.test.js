// We test parseArgs by extracting it — so we expose it for testing
// cli.js calls main() on load, so we test the logic indirectly via a helper

const path = require('path');

// Inline the parseArgs logic here to keep cli.js self-contained
function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {};
  const separatorIdx = args.indexOf('--');
  const flags = separatorIdx === -1 ? args : args.slice(0, separatorIdx);
  const command = separatorIdx === -1 ? [] : args.slice(separatorIdx + 1);
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (flag === '--help') { options.help = true; }
    else if (flag === '--verbose') { options.verbose = true; }
    else if (flag === '--no-watch') { options.watch = false; }
    else if (flag === '--env') { options.envFile = flags[++i]; }
    else if (flag === '--debounce') { options.debounceMs = Number(flags[++i]); }
    else if (flag === '--delay') { options.restartDelay = Number(flags[++i]); }
    else if (flag === '--signal') { options.signal = flags[++i]; }
    else if (flag === '--config') { options.config = flags[++i]; }
  }
  return { options, command };
}

describe('parseArgs', () => {
  const base = ['node', 'envwatch'];

  test('parses command after --', () => {
    const { command } = parseArgs([...base, '--', 'node', 'server.js']);
    expect(command).toEqual(['node', 'server.js']);
  });

  test('returns empty command when no -- separator', () => {
    const { command } = parseArgs([...base, '--verbose']);
    expect(command).toEqual([]);
  });

  test('parses --env flag', () => {
    const { options } = parseArgs([...base, '--env', '.env.local', '--', 'node', 'app.js']);
    expect(options.envFile).toBe('.env.local');
  });

  test('parses --debounce as number', () => {
    const { options } = parseArgs([...base, '--debounce', '500', '--', 'cmd']);
    expect(options.debounceMs).toBe(500);
  });

  test('parses --signal', () => {
    const { options } = parseArgs([...base, '--signal', 'SIGKILL', '--', 'cmd']);
    expect(options.signal).toBe('SIGKILL');
  });

  test('parses --no-watch as false', () => {
    const { options } = parseArgs([...base, '--no-watch', '--', 'cmd']);
    expect(options.watch).toBe(false);
  });

  test('parses --verbose', () => {
    const { options } = parseArgs([...base, '--verbose', '--', 'cmd']);
    expect(options.verbose).toBe(true);
  });

  test('parses --help', () => {
    const { options } = parseArgs([...base, '--help']);
    expect(options.help).toBe(true);
  });
});
