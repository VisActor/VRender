const { app } = require('electron');

const fromProject = request => require(require.resolve(request, { paths: [process.cwd()] }));
const { EventsEnum } = fromProject('jest-electron/lib/utils/constant');
const { WindowPool } = require('./window-pool');

const debugMode = !!process.env.DEBUG_MODE;
const concurrency = Number(process.env.CONCURRENCY);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  const windowPool = new WindowPool(concurrency, debugMode);

  process.on(EventsEnum.ProcMessage, ({ test, id, type }) => {
    if (type === EventsEnum.ProcRunTest) {
      windowPool.runTest(id, test).then(({ result, id: resultId }) => {
        process.send({ result, id: resultId, type: EventsEnum.ProcRunTestResult });
      });
      return;
    }

    if (type === EventsEnum.ProcInitialWin) {
      windowPool.clearSaveTests();
      process.send({ type: EventsEnum.ProcInitialWinEnd });
      return;
    }

    console.error('Invalid message type', type);
  });

  process.send({ type: EventsEnum.ProcReady });
});
