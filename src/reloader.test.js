jest.mock('./envParser');
jest.mock('./diffEnv');
jest.mock('./processManager');
jest.mock('./snapshotManager');
jest.mock('./logger');
jest.mock('./envValidator');

const { parseEnvFile } = require('./envParser');
const { diffEnv, hasChanges } = require('./diffEnv');
const { killCurrentProcess, spawnProcess } = require('./processManager');
const { saveSnapshot, loadSnapshot } = require('./snapshotManager');
const { log } = require('./logger');
const { validateEnv } = require('./envValidator');
const { handleEnvChange, startReloader } = require('./reloader');

beforeEach(() => jest.clearAllMocks());

describe('handleEnvChange', () => {
  const envPath = '.env';
  const command = ['node', 'app.js'];
  const newEnv = { PORT: '3000', NODE_ENV: 'development' };
  const oldEnv = { PORT: '8080' };

  test('reloads when changes are detected', async () => {
    parseEnvFile.mockResolvedValue(newEnv);
    loadSnapshot.mockResolvedValue(oldEnv);
    diffEnv.mockReturnValue({ added: {}, modified: { PORT: { old: '8080', new: '3000' } }, removed: [] });
    hasChanges.mockReturnValue(true);
    saveSnapshot.mockResolvedValue();

    await handleEnvChange(envPath, command);

    expect(saveSnapshot).toHaveBeenCalledWith(newEnv);
    expect(killCurrentProcess).toHaveBeenCalled();
    expect(spawnProcess).toHaveBeenCalledWith(command, expect.any(Object));
  });

  test('skips reload when no changes', async () => {
    parseEnvFile.mockResolvedValue(newEnv);
    loadSnapshot.mockResolvedValue(newEnv);
    diffEnv.mockReturnValue({ added: {}, modified: {}, removed: [] });
    hasChanges.mockReturnValue(false);

    await handleEnvChange(envPath, command);

    expect(spawnProcess).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('info', expect.stringContaining('No effective'));
  });

  test('skips reload when schema validation fails', async () => {
    const schema = { PORT: { required: true, type: 'number' } };
    parseEnvFile.mockResolvedValue({ PORT: 'bad' });
    validateEnv.mockReturnValue({ valid: false, errors: ['Invalid type for PORT'] });

    await handleEnvChange(envPath, command, schema);

    expect(spawnProcess).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('warn', expect.stringContaining('validation failed'));
  });

  test('logs error on exception', async () => {
    parseEnvFile.mockRejectedValue(new Error('file not found'));

    await handleEnvChange(envPath, command);

    expect(log).toHaveBeenCalledWith('error', expect.stringContaining('file not found'));
  });
});

describe('startReloader', () => {
  test('spawns process and sets up watcher', () => {
    const watchFn = jest.fn();
    const config = { envPath: '.env', command: ['node', 'server.js'] };

    startReloader(config, watchFn);

    expect(spawnProcess).toHaveBeenCalledWith(config.command, expect.any(Object));
    expect(watchFn).toHaveBeenCalledWith(config.envPath, expect.any(Function));
  });
});
