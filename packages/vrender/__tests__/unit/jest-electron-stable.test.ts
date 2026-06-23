/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const process: any;
declare const require: any;
export {};

const { spawnSync } = require('child_process');
const path = require('path');

describe('stable Electron Jest runner', () => {
  const packageRoot = path.resolve(__dirname, '../..');

  test('loads in a plain node process from the package working directory', () => {
    const result = spawnSync(process.execPath, ['-e', "require('../../tools/jest-electron-stable/runner')"], {
      cwd: packageRoot,
      encoding: 'utf8'
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  test('loads under Jest without relying on repo-level hoists', () => {
    const runnerPath = path.resolve(__dirname, '../../../../tools/jest-electron-stable/runner.js');

    expect(() => require(runnerPath)).not.toThrow();
  });

  test('does not require repo-level throat hoists', () => {
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `
          const Module = require('module');
          const originalLoad = Module._load;
          Module._load = function(request, parent, isMain) {
            if (request === 'throat') {
              throw new Error('bare throat unavailable');
            }
            return originalLoad.apply(this, arguments);
          };
          require('../../tools/jest-electron-stable/runner');
        `
      ],
      {
        cwd: packageRoot,
        encoding: 'utf8'
      }
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  test('resolves Electron without a repo-level bare electron hoist', () => {
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `
          const Module = require('module');
          const originalLoad = Module._load;
          Module._load = function(request, parent, isMain) {
            if (request === 'electron') {
              throw new Error('bare electron unavailable');
            }
            return originalLoad.apply(this, arguments);
          };
          require('../../tools/jest-electron-stable/proc');
        `
      ],
      {
        cwd: packageRoot,
        encoding: 'utf8'
      }
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  test('rejects startup failures instead of hanging initialization', async () => {
    const { ElectronProc } = require('../../../../tools/jest-electron-stable/proc');
    const electronProc = new ElectronProc();
    electronProc.createWithRetry = jest.fn(() => Promise.reject(new Error('startup failed')));

    const result = await Promise.race([
      electronProc.initialWin().then(
        () => 'resolved',
        (error: Error) => `rejected:${error.message}`
      ),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 50))
    ]);

    expect(result).toBe('rejected:startup failed');
  });
});
