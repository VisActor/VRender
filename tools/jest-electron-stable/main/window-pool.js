const path = require('path');
const url = require('url');
const { BrowserWindow, ipcMain, app } = require('electron');
const fromProject = request => require(require.resolve(request, { paths: [process.cwd()] }));
const { EventsEnum } = fromProject('jest-electron/lib/utils/constant');
const { delay } = fromProject('jest-electron/lib/utils/delay');
const { uuid } = fromProject('jest-electron/lib/utils/uuid');
const { Config } = fromProject('jest-electron/lib/utils/config');

const config = new Config(app.getPath('userData'));
const electronMainDir = path.dirname(require.resolve('jest-electron/lib/electron/main/index.html', { paths: [process.cwd()] }));

class WindowPool {
  constructor(maxSize = 1, debugMode = false) {
    this.pool = [];
    this.locked = false;
    this.maxSize = debugMode ? 1 : maxSize;
    this.debugMode = debugMode;

    ipcMain.on(EventsEnum.WebContentsReady, () => {
      this.runAllTest();
    });
  }

  async get() {
    if (this.locked) {
      await delay();
      return this.get();
    }

    this.locked = true;
    try {
      return await this.getAsync();
    } finally {
      this.locked = false;
    }
  }

  async getAsync() {
    const info = this.pool.find(item => item.idle);
    if (info) {
      return info.win;
    }

    if (this.isFull()) {
      await delay();
      return this.getAsync();
    }

    const win = await this.create();
    this.pool.push({ win, idle: true, tests: [] });
    return win;
  }

  async create() {
    return new Promise(resolve => {
      const winOptions = {
        ...config.read(),
        show: this.debugMode,
        focusable: this.debugMode,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: false
        }
      };

      let win = new BrowserWindow(winOptions);

      win.on('close', () => {
        const { width, height } = win.getBounds();
        config.write({ width, height });
      });

      win.on('closed', () => {
        this.removeWin(win);
        win = undefined;
      });

      const fileUrl = url.format({
        hash: encodeURIComponent(JSON.stringify({ debugMode: this.debugMode })),
        pathname: path.join(electronMainDir, 'index.html'),
        protocol: 'file:',
        slashes: true
      });

      win.loadURL(fileUrl);

      if (this.debugMode) {
        win.webContents.openDevTools();
      }

      win.webContents.on('did-finish-load', () => {
        resolve(win);
      });
    });
  }

  size() {
    return this.pool.length;
  }

  isFull() {
    return this.size() >= this.maxSize;
  }

  setIdle(win, idle) {
    const index = this.pool.findIndex(item => item.win === win);
    this.pool[index].idle = idle;
  }

  appendTest(win, test) {
    const index = this.pool.findIndex(item => item.win === win);
    this.pool[index].tests.push(test);
  }

  clearSaveTests() {
    this.pool.forEach(item => {
      item.tests = [];
      item.win.webContents.send(EventsEnum.ClearTestResults);
    });
  }

  removeWin(win) {
    const index = this.pool.findIndex(item => item.win === win);
    if (index !== -1) {
      this.pool.splice(index, 1);
    }
    win.destroy();
  }

  async runTest(id, test) {
    const win = await this.get();
    const result = await this.run(win, id, test);
    this.appendTest(win, test);
    return result;
  }

  async runAllTest() {
    await Promise.all(
      this.pool.map(async item => {
        for (const test of item.tests) {
          await this.run(item.win, uuid(), test);
        }
      })
    );
  }

  async run(win, id, test) {
    return new Promise(resolve => {
      this.setIdle(win, false);

      ipcMain.once(id, (event, result) => {
        this.setIdle(win, true);
        resolve({ result, id });
      });

      win.webContents.send(EventsEnum.StartRunTest, test, id);
    });
  }
}

module.exports = {
  WindowPool
};
