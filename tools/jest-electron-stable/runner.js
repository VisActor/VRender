const throat = require('throat');
const { electronProc } = require('./proc');

const isDebugMode = () => process.env.DEBUG_MODE === '1';

class StableElectronRunner {
  constructor(globalConfig) {
    this._globalConfig = globalConfig;
    this._debugMode = isDebugMode();
  }

  getConcurrency(testSize) {
    const { maxWorkers, watch, watchAll } = this._globalConfig;
    const isWatch = watch || watchAll;
    const concurrency = Math.min(testSize, maxWorkers);
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

    await Promise.all(
      tests.map(
        throat(concurrency, async test => {
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
