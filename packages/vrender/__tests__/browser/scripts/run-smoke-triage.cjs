const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const BASE_URL = process.env.D3_SMOKE_BASE_URL || 'http://127.0.0.1:3012/';
const OUT_FILE =
  process.env.D3_SMOKE_OUT ||
  path.resolve(process.cwd(), '__tests__/browser/.smoke-triage.json');
const LOAD_TIMEOUT_MS = Number(process.env.D3_SMOKE_TIMEOUT_MS || 3500);
const SETTLE_MS = Number(process.env.D3_SMOKE_SETTLE_MS || 800);
const ROUTE_FILTER = process.env.D3_SMOKE_ROUTES
  ? new Set(
      process.env.D3_SMOKE_ROUTES.split(',')
        .map(route => route.trim())
        .filter(Boolean)
    )
  : null;
const BASELINE_ONLY = process.env.D3_SMOKE_BASELINE_ONLY === '1';
const INCLUDE_SNAPSHOT = process.env.D3_SMOKE_INCLUDE_SNAPSHOT === '1';

const baselineCandidates = new Set([
  'rect',
  'state',
  'animate-state',
  'interactive-test',
  'shared-state-batch-smoke',
  'react'
]);
const historicalRoutes = new Set([
  'vchart',
  'vtable',
  'anxu-picker',
  'gif-image',
  'performance',
  'performance-test',
  'memory'
]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const writeSnapshot = results => {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        pageCount: results.length,
        results
      },
      null,
      2
    )
  );
};

const escapeRoute = route => encodeURIComponent(route);

const withRoute = route => {
  const url = new URL(BASE_URL);
  url.searchParams.set('smoke', '1');
  if (route) {
    url.searchParams.set('route', route);
  }
  return url.toString();
};

const readHarnessPageList = async win => {
  return win.webContents.executeJavaScript(`
    (() => {
      return window.__D3_PAGE_LIST__ ?? [];
    })();
  `);
};

const readPageSnapshot = async win => {
  return win.webContents.executeJavaScript(`
    (() => {
      const telemetry = window.__D3_SMOKE__ ?? null;
      const app = window.__D3_HARNESS_APP__ ?? null;
      const root = document.getElementById('root');
      const container = document.getElementById('container');
      const footer = document.getElementById('footer');
      const canvas = document.getElementById('main');

      const sampleCanvas = () => {
        if (!(canvas instanceof HTMLCanvasElement)) {
          return false;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return false;
        }

        const points = [];
        const columns = 8;
        const rows = 5;
        for (let x = 1; x <= columns; x++) {
          for (let y = 1; y <= rows; y++) {
            points.push([
              Math.floor((canvas.width * x) / (columns + 1)),
              Math.floor((canvas.height * y) / (rows + 1))
            ]);
          }
        }
        points.push([100, 100], [300, 100], [300, 300], [500, 300], [700, 500]);

        return points.some(([x, y]) => {
          if (x >= canvas.width || y >= canvas.height) {
            return false;
          }
          const data = ctx.getImageData(x, y, 1, 1).data;
          return data[0] !== 0 || data[1] !== 0 || data[2] !== 0 || data[3] !== 0;
        });
      };

      return {
        telemetry,
        rootChildren: root?.childElementCount ?? 0,
        containerChildren: container?.childElementCount ?? 0,
        footerChildren: footer?.childElementCount ?? 0,
        hasCanvas: canvas instanceof HTMLCanvasElement,
        hasVisibleCanvasSample: sampleCanvas(),
        hasStage: !!window.stage,
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
          : null
      };
    })();
  `);
};

const classifyFailure = (route, snapshot) => {
  if (historicalRoutes.has(route)) {
    return '历史页面本身失效或过时';
  }

  const messages = [
    snapshot.telemetry?.importError,
    snapshot.telemetry?.pageError,
    ...(snapshot.telemetry?.uncaughtErrors ?? []),
    ...(snapshot.telemetry?.unhandledRejections ?? []),
    ...(snapshot.telemetry?.consoleErrors ?? [])
  ]
    .filter(Boolean)
    .join('\n');

  if (/register|plugin|picker|renderer|load[a-z]+env|decodeReactDom|roughModule|module/i.test(messages)) {
    return '注册/装配问题';
  }

  if (/container|canvas|parentNode|appendChild|insertBefore|createStage|release|root/i.test(messages)) {
    return '入口初始化问题';
  }

  if (/state|animate|event|pointer|listener|hover|click|timeline|ticker/i.test(messages)) {
    return '状态/动画/事件问题';
  }

  if (/normalAttrs|attribute|baseAttributes|finalAttribute/i.test(messages)) {
    return '上层调用姿势与新 D3 语义不兼容';
  }

  return historicalRoutes.has(route) ? '历史页面本身失效或过时' : '入口初始化问题';
};

const classifyHandling = (route, hasFatalIssue, rootCauseCategory) => {
  if (baselineCandidates.has(route)) {
    return hasFatalIssue ? 'baseline blocker' : 'baseline candidate';
  }
  if (rootCauseCategory === '历史页面本身失效或过时') {
    return 'exclude from baseline';
  }
  return hasFatalIssue ? 'triage only' : 'retain, not baseline';
};

const waitForPageSettle = async win => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < LOAD_TIMEOUT_MS) {
    const snapshot = await readPageSnapshot(win);
    if (snapshot.telemetry?.importError || snapshot.telemetry?.pageInvoked) {
      await sleep(SETTLE_MS);
      return readPageSnapshot(win);
    }
    await sleep(100);
  }
  return readPageSnapshot(win);
};

const selectPages = pageList => {
  return pageList.filter(page => {
    if (ROUTE_FILTER && !ROUTE_FILTER.has(page.path)) {
      return false;
    }
    if (BASELINE_ONLY && !baselineCandidates.has(page.path)) {
      return false;
    }
    return true;
  });
};

const run = async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1600,
    height: 1000,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false
    }
  });

  await win.loadURL(withRoute('graphic'));
  const pageList = await readHarnessPageList(win);
  const selectedPages = selectPages(pageList);
  const results = [];

  for (const page of selectedPages) {
    await win.loadURL(withRoute(page.path));
    const snapshot = await waitForPageSettle(win);
    const telemetry = snapshot.telemetry ?? {
      canOpen: false,
      pageInvoked: false,
      importError: 'missing telemetry',
      pageError: null,
      uncaughtErrors: [],
      unhandledRejections: [],
      consoleErrors: []
    };

    const hasFatalIssue = Boolean(
      telemetry.importError ||
        telemetry.pageError ||
        telemetry.uncaughtErrors?.length ||
        telemetry.unhandledRejections?.length
    );
    const hasFirstFrame = Boolean(
      snapshot.hasVisibleCanvasSample || snapshot.rootChildren > 0 || (snapshot.hasStage && snapshot.hasCanvas)
    );
    const rootCauseCategory = hasFatalIssue ? classifyFailure(page.path, snapshot) : 'none';

    const result = {
      route: page.path,
      category: page.category,
      canOpen: !!telemetry.canOpen,
      hasFirstFrame,
      uncaughtErrorCount: telemetry.uncaughtErrors?.length ?? 0,
      unhandledRejectionCount: telemetry.unhandledRejections?.length ?? 0,
      consoleErrorCount: telemetry.consoleErrors?.length ?? 0,
      behaviorError: hasFatalIssue ? 'unknown until manual inspection' : 'none observed',
      baselineCandidate: baselineCandidates.has(page.path),
      rootCauseCategory,
      handling: classifyHandling(page.path, hasFatalIssue || !hasFirstFrame, rootCauseCategory),
      errors: {
        importError: telemetry.importError,
        pageError: telemetry.pageError,
        uncaughtErrors: telemetry.uncaughtErrors ?? [],
        unhandledRejections: telemetry.unhandledRejections ?? [],
        consoleErrors: telemetry.consoleErrors ?? []
      },
      ...(INCLUDE_SNAPSHOT ? { snapshot } : null)
    };

    results.push(result);
    writeSnapshot(results);
    console.log(
      `[smoke] ${results.length}/${selectedPages.length} ${page.path} :: ` +
        `open=${result.canOpen} firstFrame=${result.hasFirstFrame} ` +
        `errors=${result.uncaughtErrorCount + result.unhandledRejectionCount + result.consoleErrorCount}`
    );
  }

  await win.close();
  writeSnapshot(results);
};

app.whenReady()
  .then(run)
  .then(() => app.quit())
  .catch(error => {
    console.error(error);
    app.exit(1);
  });
