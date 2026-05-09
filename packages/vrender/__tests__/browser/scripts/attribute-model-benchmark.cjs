const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const root = process.env.VRENDER_ROOT;
const out = process.env.VRENDER_BENCH_OUT;
const label = process.env.VRENDER_BENCH_LABEL || path.basename(root || '');

if (!root || !out) {
  throw new Error('VRENDER_ROOT and VRENDER_BENCH_OUT are required');
}

const repeats = Number(process.env.VRENDER_BENCH_REPEATS || 20);
const graphicsPerRun = Number(process.env.VRENDER_BENCH_GRAPHICS || 10000);
const stageRepeats = Number(process.env.VRENDER_BENCH_STAGE_REPEATS || 10);

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192 --expose-gc');
app.commandLine.appendSwitch('disable-gpu');

function toRendererSource() {
  const entry = path.join(root, 'packages/vrender/cjs/index.js');
  return `
    (async () => {
      const entry = ${JSON.stringify(entry)};
      const label = ${JSON.stringify(label)};
      const repeats = ${repeats};
      const graphicsPerRun = ${graphicsPerRun};
      const stageRepeats = ${stageRepeats};
      const v = require(entry);
      const createRect = v.createRect;
      if (typeof createRect !== 'function') {
        throw new Error('createRect is not available from ' + entry);
      }

      const results = [];
      const errors = [];
      const now = () => performance.now();
      const heap = () => performance.memory ? performance.memory.usedJSHeapSize : null;
      const runGc = () => {
        if (typeof globalThis.gc === 'function') {
          globalThis.gc();
        }
      };

      const bench = (name, fn) => {
        runGc();
        const heapBefore = heap();
        const start = now();
        let meta;
        try {
          meta = fn();
        } catch (err) {
          errors.push({ name, message: String(err && err.message || err), stack: String(err && err.stack || '') });
          return;
        }
        const duration = now() - start;
        runGc();
        const heapAfter = heap();
        results.push({
          name,
          ms: Number(duration.toFixed(3)),
          heapDelta: heapBefore == null || heapAfter == null ? null : heapAfter - heapBefore,
          ...(meta || {})
        });
      };

      const makeRectAttrs = i => ({
        x: i % 1000,
        y: (i * 3) % 800,
        width: 10 + (i % 9),
        height: 12 + (i % 7),
        fill: i % 2 ? '#1664ff' : '#ff8a00',
        stroke: '#222',
        lineWidth: 1,
        opacity: 1
      });

      bench('construct-rects', () => {
        let created = 0;
        for (let r = 0; r < repeats; r++) {
          const arr = new Array(graphicsPerRun);
          for (let i = 0; i < graphicsPerRun; i++) {
            arr[i] = createRect(makeRectAttrs(i));
          }
          created += arr.length;
        }
        return { repeats, graphicsPerRun, created };
      });

      bench('set-attributes-rects', () => {
        const arr = new Array(graphicsPerRun);
        for (let i = 0; i < graphicsPerRun; i++) {
          arr[i] = createRect(makeRectAttrs(i));
        }
        const nextA = { x: 10, y: 20, fill: '#8d72f6', opacity: 0.8 };
        const nextB = { x: 30, y: 40, fill: '#51d5e6', opacity: 1 };
        for (let r = 0; r < repeats; r++) {
          const attrs = r % 2 ? nextA : nextB;
          for (let i = 0; i < arr.length; i++) {
            arr[i].setAttributes(attrs);
          }
        }
        return { repeats, graphicsPerRun, writes: repeats * graphicsPerRun };
      });

      bench('state-switch-rects', () => {
        const arr = new Array(graphicsPerRun);
        for (let i = 0; i < graphicsPerRun; i++) {
          const rect = createRect(makeRectAttrs(i));
          rect.states = {
            hover: { fill: '#f00', lineWidth: 2 },
            selected: { fill: '#0f0', opacity: 0.6 }
          };
          arr[i] = rect;
        }
        for (let r = 0; r < repeats; r++) {
          const states = r % 2 ? ['hover'] : ['selected'];
          for (let i = 0; i < arr.length; i++) {
            arr[i].useStates(states, false);
          }
        }
        return { repeats, graphicsPerRun, switches: repeats * graphicsPerRun };
      });

      const createStageCompat = () => {
        if (typeof v.createBrowserVRenderApp === 'function') {
          const managedApp = v.createBrowserVRenderApp();
          const stage = managedApp.createStage({
            canvas: 'main',
            canvasControled: false,
            autoRender: false,
            autoRefresh: false,
            width: 1000,
            height: 800
          });
          return {
            stage,
            release() {
              try {
                stage.release && stage.release();
              } finally {
                managedApp.release && managedApp.release();
              }
            }
          };
        }
        if (typeof v.createStage === 'function') {
          const stage = v.createStage({
            canvas: 'main',
            canvasControled: false,
            autoRender: false,
            autoRefresh: false,
            width: 1000,
            height: 800
          });
          return {
            stage,
            release() {
              stage.release && stage.release();
            }
          };
        }
        throw new Error('No stage creation API is available');
      };

      bench('stage-add-release-rects', () => {
        let added = 0;
        for (let r = 0; r < stageRepeats; r++) {
          const managed = createStageCompat();
          try {
            for (let i = 0; i < graphicsPerRun; i++) {
              managed.stage.defaultLayer.add(createRect(makeRectAttrs(i)));
            }
            added += graphicsPerRun;
          } finally {
            managed.release();
          }
        }
        return { repeats: stageRepeats, graphicsPerRun, added };
      });

      return {
        label,
        entry,
        versions: {
          node: process.versions.node,
          chrome: process.versions.chrome,
          electron: process.versions.electron
        },
        config: { repeats, graphicsPerRun, stageRepeats },
        results,
        errors
      };
    })()
  `;
}

app
  .whenReady()
  .then(async () => {
    const win = new BrowserWindow({
      show: false,
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false
      }
    });
    await win.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          '<!doctype html><html><body><canvas id="main" width="1000" height="800"></canvas></body></html>'
        )
    );
    const result = await win.webContents.executeJavaScript(toRendererSource(), true);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    win.close();
    app.quit();
  })
  .catch(err => {
    console.error(err && err.stack ? err.stack : err);
    app.exit(1);
  });
