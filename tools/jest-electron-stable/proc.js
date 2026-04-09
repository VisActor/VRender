const path = require('path');
const { spawn } = require('child_process');
const electron = require('electron');
const { EventsEnum } = require('jest-electron/lib/utils/constant');
const { uuid } = require('jest-electron/lib/utils/uuid');
const { delay } = require('jest-electron/lib/utils/delay');

const DEFAULT_STARTUP_TIMEOUT = Number(process.env.VRENDER_JEST_ELECTRON_STARTUP_TIMEOUT || 10000);
const DEFAULT_STARTUP_RETRIES = Number(process.env.VRENDER_JEST_ELECTRON_STARTUP_RETRIES || 3);
const DEFAULT_STARTUP_BACKOFF = Number(process.env.VRENDER_JEST_ELECTRON_STARTUP_BACKOFF || 300);

class ElectronProc {
  constructor(debugMode = false, concurrency = 1) {
    this.debugMode = debugMode;
    this.concurrency = concurrency;
    this.lock = false;
    this.proc = undefined;
    this.onCloseCallback = () => {};
  }

  async get() {
    if (this.proc) {
      return this.proc;
    }

    if (this.lock) {
      await delay();
      return this.get();
    }

    this.lock = true;
    try {
      this.proc = await this.createWithRetry();
      this.proc.on('close', () => {
        if (this.proc) {
          this.proc = undefined;
        }
        this.onCloseCallback();
      });
      return this.proc;
    } finally {
      this.lock = false;
    }
  }

  async createWithRetry() {
    let attempt = 0;
    let lastError;

    while (attempt < DEFAULT_STARTUP_RETRIES) {
      attempt += 1;
      try {
        return await this.createOnce(attempt);
      } catch (error) {
        lastError = error;
        if (attempt < DEFAULT_STARTUP_RETRIES) {
          await delay(DEFAULT_STARTUP_BACKOFF * attempt);
        }
      }
    }

    throw lastError;
  }

  async createOnce(attempt) {
    return new Promise((resolve, reject) => {
      const entry = path.join(__dirname, 'main/index.js');
      const args = [entry];

      if (process.env.JEST_ELECTRON_NO_SANDBOX) {
        args.unshift('--no-sandbox');
      }

      if (process.env.JEST_ELECTRON_STARTUP_ARGS) {
        args.unshift(...process.env.JEST_ELECTRON_STARTUP_ARGS.split(/\s+/).filter(Boolean));
      }

      const proc = spawn(electron, args, {
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          DEBUG_MODE: this.debugMode ? 'true' : '',
          CONCURRENCY: `${this.concurrency}`
        }
      });

      let settled = false;
      let stdout = '';
      let stderr = '';
      const timeout = setTimeout(() => {
        finalize(
          new Error(`Electron startup timed out after ${DEFAULT_STARTUP_TIMEOUT}ms on attempt ${attempt}`)
        );
      }, DEFAULT_STARTUP_TIMEOUT);

      proc.stdout?.on('data', chunk => {
        stdout += chunk.toString();
      });

      proc.stderr?.on('data', chunk => {
        stderr += chunk.toString();
      });

      const cleanup = () => {
        clearTimeout(timeout);
        proc.removeListener(EventsEnum.ProcMessage, onMessage);
        proc.removeListener('error', onError);
        proc.removeListener('exit', onExit);
        proc.removeListener('close', onClose);
      };

      const finalize = error => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();

        if (error) {
          if (!proc.killed) {
            proc.kill();
          }

          reject(
            new Error(
              [error.message, stdout ? `stdout:\n${stdout.trim()}` : '', stderr ? `stderr:\n${stderr.trim()}` : '']
                .filter(Boolean)
                .join('\n')
            )
          );
          return;
        }

        resolve(proc);
      };

      const onMessage = message => {
        if (message?.type === EventsEnum.ProcReady) {
          finalize();
        }
      };

      const onError = error => {
        finalize(new Error(`Electron startup error on attempt ${attempt}: ${error.message}`));
      };

      const onExit = (code, signal) => {
        finalize(new Error(`Electron exited before ready on attempt ${attempt} with code ${code} signal ${signal}`));
      };

      const onClose = (code, signal) => {
        finalize(new Error(`Electron closed before ready on attempt ${attempt} with code ${code} signal ${signal}`));
      };

      proc.on(EventsEnum.ProcMessage, onMessage);
      proc.once('error', onError);
      proc.once('exit', onExit);
      proc.once('close', onClose);
    });
  }

  kill() {
    if (this.proc) {
      this.proc.kill();
      this.proc = undefined;
    }
  }

  runTest(test) {
    const id = uuid();
    return new Promise(resolve => {
      this.get().then(proc => {
        const listener = ({ result, id: resultId, type }) => {
          if (type === EventsEnum.ProcRunTestResult && resultId === id) {
            proc.removeListener(EventsEnum.ProcMessage, listener);
            resolve(result);
          }
        };

        proc.on(EventsEnum.ProcMessage, listener);
        proc.send({ type: EventsEnum.ProcRunTest, test, id });
      });
    });
  }

  initialWin() {
    return new Promise(resolve => {
      this.get().then(proc => {
        const listener = ({ type }) => {
          if (type === EventsEnum.ProcInitialWinEnd) {
            proc.removeListener(EventsEnum.ProcMessage, listener);
            resolve();
          }
        };

        proc.on(EventsEnum.ProcMessage, listener);
        proc.send({ type: EventsEnum.ProcInitialWin });
      });
    });
  }

  onClose(callback) {
    this.onCloseCallback = callback;
  }
}

module.exports = {
  ElectronProc,
  electronProc: new ElectronProc()
};
