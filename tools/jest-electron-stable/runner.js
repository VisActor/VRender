const { electronProc } = require('./proc');

const isDebugMode = () => process.env.DEBUG_MODE === '1';

function createConcurrencyLimiter(limit) {
  const concurrency = Math.max(1, limit);
  const queue = [];
  let active = 0;

  const runNext = () => {
    active -= 1;
    const next = queue.shift();
    if (next) {
      next();
    }
  };

  return task =>
    new Promise((resolve, reject) => {
      const run = () => {
        active += 1;
        Promise.resolve()
          .then(task)
          .then(resolve, reject)
          .finally(runNext);
      };

      if (active < concurrency) {
        run();
      } else {
        queue.push(run);
      }
    });
}

class StableElectronRunner {
  constructor(globalConfig) {
    this._globalConfig = globalConfig;
    this._debugMode = isDebugMode();
  }

  getConcurrency(testSize) {
    const { maxWorkers, watch, watchAll } = this._globalConfig;
    const isWatch = watch || watchAll;
    const concurrency = Math.max(1, Math.min(testSize, maxWorkers));
    return isWatch ? Math.ceil(concurrency / 2) : concurrency;
  }

  async runTests(tests, watcher, onStart, onResult, onFailure) {
    const concurrency = this.getConcurrency(tests.length);
    electronProc.debugMode = this._debugMode;
    electronProc.concurrency = concurrency;

    process.on('exit', () => {
      electronProc.kill();
    });

    if (this._debugMode) {
      electronProc.onClose(() => {
        process.exit();
      });
    }

    await electronProc.initialWin();

    const limit = createConcurrencyLimiter(concurrency);

    await Promise.all(
      tests.map(test =>
        limit(async () => {
          onStart(test);
          const config = test.context.config;
          const globalConfig = this._globalConfig;

          return electronProc
            .runTest({
              serializableModuleMap: test.context.moduleMap.toJSON(),
              config,
              globalConfig,
              path: test.path
            })
            .then(testResult => {
              if (testResult.failureMessage != null) {
                onFailure(test, testResult.failureMessage);
                return;
              }
              onResult(test, testResult);
            })
            .catch(error => onFailure(test, error));
        })
      )
    );

    if (!this._debugMode) {
      electronProc.kill();
    }
  }
}

module.exports = StableElectronRunner;
module.exports.default = StableElectronRunner;
