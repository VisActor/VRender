const { app, BrowserWindow } = require('electron');

const BASE_URL = process.env.D3_SMOKE_BASE_URL || 'http://127.0.0.1:3012/';
const ROUTE = process.env.D3_SMOKE_ROUTE || 'rect';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const withRoute = route => {
  const url = new URL(BASE_URL);
  url.searchParams.set('smoke', '1');
  url.searchParams.set('route', route);
  return url.toString();
};

const readSnapshot = win =>
  win.webContents.executeJavaScript(`
    (() => {
      const stage = window.stage ?? null;
      const app = window.__D3_HARNESS_APP__ ?? null;
      const canvas = document.getElementById('main');
      const dumpNode = node => {
        if (!node) {
          return null;
        }
        const attr = node.attribute ?? {};
        const theme = typeof node.getGraphicTheme === 'function' ? node.getGraphicTheme() : null;
        const children = typeof node.getChildren === 'function'
          ? node.getChildren().map(dumpNode)
          : Array.isArray(node.children)
            ? node.children.map(dumpNode)
            : [];
        return {
          type: node.type ?? node.name ?? 'unknown',
          numberType: node.numberType,
          valid: typeof node.isValid === 'function' ? node.isValid() : undefined,
          AABBBounds: node.AABBBounds
            ? {
                x1: node.AABBBounds.x1,
                y1: node.AABBBounds.y1,
                x2: node.AABBBounds.x2,
                y2: node.AABBBounds.y2
              }
            : null,
          globalAABBBounds: node.globalAABBBounds
            ? {
                x1: node.globalAABBBounds.x1,
                y1: node.globalAABBBounds.y1,
                x2: node.globalAABBBounds.x2,
                y2: node.globalAABBBounds.y2
              }
            : null,
          theme: theme
            ? {
                visible: theme.visible,
                opacity: theme.opacity,
                fill: theme.fill,
                fillOpacity: theme.fillOpacity,
                stroke: theme.stroke,
                strokeOpacity: theme.strokeOpacity,
                lineWidth: theme.lineWidth
              }
            : null,
          visible: attr.visible,
          x: attr.x,
          y: attr.y,
          width: attr.width,
          height: attr.height,
          fill: attr.fill,
          stroke: attr.stroke,
          renderStyle: attr.renderStyle,
          background: attr.background,
          lineWidth: attr.lineWidth,
          childCount: children.length,
          children
        };
      };

      const sample = (() => {
        if (!(canvas instanceof HTMLCanvasElement)) {
          return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return null;
        }
        const dpr = stage?.dpr ?? window.devicePixelRatio ?? 1;
        const points = [
          [100, 100],
          [210, 150],
          [300, 100],
          [300, 300],
          [500, 300]
        ];
        return points.map(([x, y]) => {
          const canvasX = Math.floor(x * dpr);
          const canvasY = Math.floor(y * dpr);
          const data = canvasX < canvas.width && canvasY < canvas.height
            ? Array.from(ctx.getImageData(canvasX, canvasY, 1, 1).data)
            : null;
          return { x, y, canvasX, canvasY, data };
        });
      })();

      const coarseScan = (() => {
        if (!(canvas instanceof HTMLCanvasElement)) {
          return null;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return null;
        }
        const hits = [];
        const columns = 16;
        const rows = 9;
        for (let col = 1; col <= columns; col++) {
          for (let row = 1; row <= rows; row++) {
            const x = Math.floor((stage.width * col) / (columns + 1));
            const y = Math.floor((stage.height * row) / (rows + 1));
            const canvasX = Math.floor(x * (stage?.dpr ?? window.devicePixelRatio ?? 1));
            const canvasY = Math.floor(y * (stage?.dpr ?? window.devicePixelRatio ?? 1));
            const data = Array.from(ctx.getImageData(canvasX, canvasY, 1, 1).data);
            if (data[0] !== 255 || data[1] !== 255 || data[2] !== 255 || data[3] !== 255) {
              hits.push({ x, y, canvasX, canvasY, data });
            }
          }
        }
        return hits;
      })();

      return {
        telemetry: window.__D3_SMOKE__ ?? null,
        stage: stage ? {
          width: stage.width,
          height: stage.height,
          dpr: stage.dpr,
          renderCount: stage.renderCount,
          viewWidth: stage.viewWidth,
          viewHeight: stage.viewHeight,
          viewBox: stage.viewBox,
          windowInfo: stage.window ? {
            width: stage.window.width,
            height: stage.window.height,
            dpr: stage.window.dpr,
            canvasCount: typeof stage.window.getChildren === 'function' ? stage.window.getChildren().length : undefined,
            contextCanvas: (() => {
              const context = stage.window.getContext?.();
              const nativeCanvas = context?.canvas ?? context?.nativeCanvas ?? null;
              return nativeCanvas
                ? {
                    id: nativeCanvas.id,
                    width: nativeCanvas.width,
                    height: nativeCanvas.height
                  }
                : null;
            })()
          } : null,
          childCount: typeof stage.getChildren === 'function' ? stage.getChildren().length : undefined,
          defaultLayerExists: !!stage.defaultLayer,
          defaultLayerChildCount:
            stage.defaultLayer && typeof stage.defaultLayer.getChildren === 'function'
              ? stage.defaultLayer.getChildren().length
              : undefined,
          defaultLayer: dumpNode(stage.defaultLayer)
        } : null,
        renderRegistry: stage?.renderService?.drawContribution
          ? (() => {
              const drawContribution = stage.renderService.drawContribution;
              const graphics =
                stage.defaultLayer && typeof stage.defaultLayer.getChildren === 'function'
                  ? stage.defaultLayer.getChildren()
                  : [];
              return {
                defaultKeys: Array.from(drawContribution.defaultRenderMap?.keys?.() ?? []),
                styleKeys: Array.from(drawContribution.styleRenderMap?.keys?.() ?? []),
                selected: graphics.map(graphic => ({
                  type: graphic.type,
                  renderStyle: graphic.attribute?.renderStyle,
                  renderer:
                    drawContribution.getRenderContribution(graphic)?.constructor?.name ?? null
                }))
              };
            })()
          : null,
        appRegistry: app?.registry
          ? {
              renderers: app.registry.renderer
                ?.getAll?.()
                ?.map(renderer => ({
                  type: renderer?.type ?? null,
                  numberType: renderer?.numberType ?? null,
                  constructorName: renderer?.constructor?.name ?? null
                })),
              pickers: app.registry.picker
                ?.getAll?.()
                ?.map(picker => ({
                  type: picker?.type ?? null,
                  numberType: picker?.numberType ?? null,
                  constructorName: picker?.constructor?.name ?? null
                }))
            }
          : null,
        canvas: canvas ? {
          width: canvas.width,
          height: canvas.height,
          styleWidth: canvas.style.width,
          styleHeight: canvas.style.height
        } : null,
        canvases: Array.from(document.querySelectorAll('canvas')).map((item, index) => ({
          index,
          id: item.id,
          className: item.className,
          width: item.width,
          height: item.height,
          styleWidth: item.style.width,
          styleHeight: item.style.height
        })),
        exportedCanvas: (() => {
          if (!stage || typeof stage.toCanvas !== 'function') {
            return null;
          }
          const exported = stage.toCanvas();
          if (!(exported instanceof HTMLCanvasElement)) {
            return null;
          }
          const ctx = exported.getContext('2d');
          if (!ctx) {
            return {
              width: exported.width,
              height: exported.height,
              sample: null
            };
          }
          const dpr = stage?.dpr ?? window.devicePixelRatio ?? 1;
          const canvasX = Math.floor(100 * dpr);
          const canvasY = Math.floor(100 * dpr);
          return {
            width: exported.width,
            height: exported.height,
            sample:
              canvasX < exported.width && canvasY < exported.height
                ? Array.from(ctx.getImageData(canvasX, canvasY, 1, 1).data)
                : null
          };
        })(),
        pixelSample: sample,
        coarseScan
      };
    })();
  `);

const readDrawCalls = win =>
  win.webContents.executeJavaScript(`
    (() => {
      const stage = window.stage;
      if (!stage?.window?.getContext) {
        return null;
      }
      const context = stage.window.getContext();
      const nativeContext =
        context?.nativeContext ??
        context?.context ??
        document.getElementById('main')?.getContext?.('2d') ??
        null;
      if (!nativeContext) {
        return null;
      }

      const counts = {};
      const methods = [
        'clearRect',
        'fillRect',
        'strokeRect',
        'beginPath',
        'moveTo',
        'lineTo',
        'bezierCurveTo',
        'quadraticCurveTo',
        'arc',
        'rect',
        'fill',
        'stroke',
        'drawImage'
      ];

      methods.forEach(name => {
        const original = nativeContext[name];
        if (typeof original !== 'function') {
          return;
        }
        counts[name] = 0;
        nativeContext[name] = function (...args) {
          counts[name] += 1;
          return original.apply(this, args);
        };
      });

      stage.render();
      return counts;
    })();
  `);

async function run() {
  const win = new BrowserWindow({
    show: false,
    width: 1600,
    height: 1000,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false
    }
  });

  await win.loadURL(withRoute(ROUTE));
  await sleep(1500);
  const snapshot = await readSnapshot(win);
  let drawCalls = null;
  let drawCallsError = null;
  try {
    drawCalls = await readDrawCalls(win);
  } catch (error) {
    drawCallsError = error instanceof Error ? error.stack ?? error.message : String(error);
  }
  process.stdout.write(`${JSON.stringify({ ...snapshot, drawCalls, drawCallsError }, null, 2)}\n`);
  await win.close();
}

app.whenReady()
  .then(run)
  .then(() => app.quit())
  .catch(error => {
    console.error(error);
    app.exit(1);
  });
