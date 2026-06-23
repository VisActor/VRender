const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, contentTracing } = require('electron');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('js-flags', process.env.D3_MEMORY_JS_FLAGS || '--max-old-space-size=8192');

const BASE_URL = process.env.D3_MEMORY_BASE_URL || process.env.D3_SMOKE_BASE_URL || 'http://127.0.0.1:3012/';
const ROUTE = process.env.D3_MEMORY_ROUTE || 'memory';
const COUNTS = (process.env.D3_MEMORY_COUNTS || '100,1000')
  .split(',')
  .map(value => Number(value.trim()))
  .filter(value => Number.isFinite(value) && value > 0);
const TRACE_DIR =
  process.env.D3_MEMORY_TRACE_DIR || path.resolve(process.cwd(), 'packages/vrender/__tests__/browser/.memory-traces');
const OUT_FILE =
  process.env.D3_MEMORY_OUT || path.resolve(process.cwd(), 'packages/vrender/__tests__/browser/.memory-benchmark.json');
const LOAD_TIMEOUT_MS = Number(process.env.D3_MEMORY_LOAD_TIMEOUT_MS || 8000);
const POST_RUN_SETTLE_MS = Number(process.env.D3_MEMORY_SETTLE_MS || 1500);
const GRAPHICS_PER_RUN = Number(process.env.D3_MEMORY_GRAPHICS_PER_RUN || 10000);
const TRACE_ENABLED = process.env.D3_MEMORY_TRACE !== '0';
const READ_VTABLE_SEMANTICS = process.env.D3_MEMORY_READ_VTABLE_SEMANTICS === '1';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const withRoute = route => {
  const url = new URL(BASE_URL);
  url.searchParams.set('smoke', '1');
  url.searchParams.set('route', route);
  return url.toString();
};

const serializeMeasurementHarness = graphicsPerRun => `
  (() => {
    const buttonLabel = count => \`run \${count}\`;
    const createSummary = (items, key) => {
      const values = items
        .map(item => Number(item[key] ?? 0))
        .filter(value => Number.isFinite(value));
      const total = values.reduce((acc, value) => acc + value, 0);
      return {
        totalMs: total,
        avgMs: values.length ? total / values.length : 0,
        maxMs: values.length ? Math.max(...values) : 0
      };
    };

    const findButton = label => {
      return Array.from(document.querySelectorAll('button')).find(node => node.textContent?.trim() === label) ?? null;
    };

    const createMeasurement = label => ({
      label,
      clickStart: 0,
      clickEnd: 0,
      heapBefore: performance.memory?.usedJSHeapSize ?? null,
      heapAfter: null,
      iterations: [],
      currentIteration: null,
      lastIterationEnd: 0,
      pendingReleaseMs: 0
    });

    const app = window.__D3_HARNESS_APP__;
    const buttonsReady = !!findButton(buttonLabel(100));
    if (!app || !buttonsReady) {
      return {
        ready: false,
        reason: !app ? 'missing app' : 'missing memory buttons'
      };
    }

    if (!window.__D3_MEMORY_BENCH__) {
      const originalCreateStage = app.createStage.bind(app);
      const state = {
        currentMeasurement: null,
        supportedEntryTypes: Array.isArray(window.PerformanceObserver?.supportedEntryTypes)
          ? window.PerformanceObserver.supportedEntryTypes.slice()
          : [],
        longTaskEntries: []
      };

      if (state.supportedEntryTypes.includes('longtask') && typeof window.PerformanceObserver === 'function') {
        const observer = new window.PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            state.longTaskEntries.push({
              startTime: entry.startTime,
              duration: entry.duration,
              name: entry.name
            });
          });
        });
        observer.observe({ type: 'longtask', buffered: true });
      }

      app.createStage = (...args) => {
        const measurement = state.currentMeasurement;
        const createStageStart = performance.now();
        const stage = originalCreateStage(...args);
        const createStageEnd = performance.now();

        if (!measurement) {
          return stage;
        }

        const iterationStart = measurement.iterations.length === 0 ? measurement.clickStart : measurement.lastIterationEnd;
        const releaseMs = measurement.pendingReleaseMs || 0;
        const constructionMs = Math.max(0, createStageStart - iterationStart - releaseMs);
        const iteration = {
          index: measurement.iterations.length + 1,
          releaseMs,
          constructionMs,
          createStageMs: Math.max(0, createStageEnd - createStageStart),
          addCount: 0,
          addPhaseMs: 0,
          nonConstructionMs: 0
        };

        measurement.pendingReleaseMs = 0;
        measurement.currentIteration = iteration;
        measurement.iterations.push(iteration);

        if (typeof stage.release === 'function') {
          const originalRelease = stage.release.bind(stage);
          stage.release = (...releaseArgs) => {
            const releaseStart = performance.now();
            const result = originalRelease(...releaseArgs);
            const releaseEnd = performance.now();
            measurement.pendingReleaseMs = Math.max(0, releaseEnd - releaseStart);
            return result;
          };
        }

        const layer = stage.defaultLayer;
        if (layer && typeof layer.add === 'function') {
          const originalAdd = layer.add.bind(layer);
          let firstAddStart = null;
          layer.add = (...addArgs) => {
            const addStart = performance.now();
            if (firstAddStart == null) {
              firstAddStart = addStart;
            }
            const result = originalAdd(...addArgs);
            const addEnd = performance.now();
            iteration.addCount += 1;
            if (iteration.addCount === ${graphicsPerRun}) {
              iteration.addPhaseMs = Math.max(0, addEnd - (firstAddStart ?? createStageEnd));
              iteration.nonConstructionMs = Math.max(0, addEnd - createStageStart);
              measurement.lastIterationEnd = addEnd;
              measurement.currentIteration = null;
            }
            return result;
          };
        }

        return stage;
      };

      window.__D3_MEMORY_BENCH__ = {
        supportedEntryTypes: state.supportedEntryTypes,
        graphicsPerRun: ${graphicsPerRun},
        async measure(count) {
          const label = buttonLabel(count);
          const button = findButton(label);
          if (!button) {
            return {
              ok: false,
              reason: \`missing button: \${label}\`
            };
          }

          const measurement = createMeasurement(label);
          const longTaskOffset = state.longTaskEntries.length;
          state.currentMeasurement = measurement;
          measurement.clickStart = performance.now();
          button.click();
          measurement.clickEnd = performance.now();
          measurement.heapAfter = performance.memory?.usedJSHeapSize ?? null;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          await new Promise(resolve => setTimeout(resolve, 100));

          const iterations = measurement.iterations.map(iteration => ({ ...iteration }));
          const longTaskEntries = state.longTaskEntries
            .slice(longTaskOffset)
            .filter(entry => entry.startTime >= measurement.clickStart && entry.startTime <= performance.now());
          const construction = createSummary(iterations, 'constructionMs');
          const release = createSummary(iterations, 'releaseMs');
          const createStage = createSummary(iterations, 'createStageMs');
          const addPhase = createSummary(iterations, 'addPhaseMs');
          const nonConstruction = createSummary(iterations, 'nonConstructionMs');
          const longTask = createSummary(longTaskEntries, 'duration');
          const incompleteIterations = iterations.filter(iteration => iteration.addCount !== ${graphicsPerRun}).length;

          state.currentMeasurement = null;

          return {
            ok: true,
            count,
            label,
            clickTotalMs: Math.max(0, measurement.clickEnd - measurement.clickStart),
            heapLimit: performance.memory?.jsHeapSizeLimit ?? null,
            heapBefore: measurement.heapBefore,
            heapAfter: measurement.heapAfter,
            heapDelta: measurement.heapBefore != null && measurement.heapAfter != null
              ? measurement.heapAfter - measurement.heapBefore
              : null,
            iterationCount: iterations.length,
            incompleteIterations,
            construction,
            release,
            createStage,
            addPhase,
            nonConstruction,
            longTask: {
              ...longTask,
              thresholdMs: 50
            },
            supportedEntryTypes: state.supportedEntryTypes
          };
        }
      };
    }

    return {
      ready: true,
      supportedEntryTypes: window.__D3_MEMORY_BENCH__.supportedEntryTypes,
      graphicsPerRun: window.__D3_MEMORY_BENCH__.graphicsPerRun
    };
  })()
`;

const waitForMeasurementHarness = async win => {
  const deadline = Date.now() + LOAD_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await win.webContents.executeJavaScript(serializeMeasurementHarness(GRAPHICS_PER_RUN));
    if (status?.ready) {
      return status;
    }
    await sleep(100);
  }

  throw new Error(`memory harness did not become ready within ${LOAD_TIMEOUT_MS}ms`);
};

const readVTableLiteState = async win => {
  return win.webContents.executeJavaScript(`
    (() => {
      return window.__D3_VTABLE_LITE__ ?? null;
    })()
  `);
};

const summarizeDurations = events => {
  const durations = events
    .map(event => Number(event.dur || 0) / 1000)
    .filter(duration => Number.isFinite(duration));
  const totalMs = durations.reduce((acc, value) => acc + value, 0);
  return {
    count: durations.length,
    totalMs,
    avgMs: durations.length ? totalMs / durations.length : 0,
    maxMs: durations.length ? Math.max(...durations) : 0
  };
};

const extractNamedThreads = traceEvents => {
  const threadNames = new Map();
  const processNames = new Map();

  traceEvents.forEach(event => {
    if (event.ph !== 'M' || !event.args?.name) {
      return;
    }
    if (event.name === 'thread_name') {
      threadNames.set(`${event.pid}:${event.tid}`, event.args.name);
      return;
    }
    if (event.name === 'process_name') {
      processNames.set(event.pid, event.args.name);
    }
  });

  return { threadNames, processNames };
};

const analyzeTrace = tracePath => {
  const raw = fs.readFileSync(tracePath, 'utf8');
  const parsed = JSON.parse(raw);
  const traceEvents = Array.isArray(parsed) ? parsed : parsed.traceEvents || [];
  const { threadNames, processNames } = extractNamedThreads(traceEvents);

  const rendererMainThreads = new Set();
  threadNames.forEach((threadName, key) => {
    const [pid] = key.split(':');
    const processName = processNames.get(Number(pid)) || '';
    if (
      /renderer/i.test(processName) &&
      /(CrRendererMain|RendererMain|Chrome_ChildIOThread|CrGpuMain)/i.test(threadName) &&
      !/IOThread/i.test(threadName)
    ) {
      rendererMainThreads.add(key);
      return;
    }
    if (/(CrRendererMain|RendererMain)/i.test(threadName)) {
      rendererMainThreads.add(key);
    }
  });

  const runTaskEvents = traceEvents.filter(event => {
    return (
      event.ph === 'X' &&
      event.name === 'RunTask' &&
      rendererMainThreads.has(`${event.pid}:${event.tid}`) &&
      Number.isFinite(event.dur)
    );
  });
  const longTaskEvents = runTaskEvents.filter(event => Number(event.dur) / 1000 >= 50);

  const backgroundMarkingEvents = traceEvents.filter(
    event => event.ph === 'X' && event.name === 'V8.GC_MC_BACKGROUND_MARKING' && Number.isFinite(event.dur)
  );
  const minorGcEvents = traceEvents.filter(
    event => event.ph === 'X' && event.name === 'MinorGC' && Number.isFinite(event.dur)
  );
  const majorGcEvents = traceEvents.filter(
    event => event.ph === 'X' && event.name === 'MajorGC' && Number.isFinite(event.dur)
  );

  return {
    rendererMainThreadCount: rendererMainThreads.size,
    runTask: summarizeDurations(runTaskEvents),
    longTask: {
      ...summarizeDurations(longTaskEvents),
      thresholdMs: 50
    },
    gc: {
      backgroundMarking: summarizeDurations(backgroundMarkingEvents),
      minorGc: summarizeDurations(minorGcEvents),
      majorGc: summarizeDurations(majorGcEvents)
    }
  };
};

const recordMeasurement = async (win, count) => {
  const tracePath = path.join(TRACE_DIR, `${ROUTE}-${count}-${Date.now()}.trace.json`);
  if (TRACE_ENABLED) {
    await contentTracing.startRecording({
      included_categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-v8.gc']
    });
  }

  const pageMetrics = await win.webContents.executeJavaScript(`window.__D3_MEMORY_BENCH__.measure(${count})`);
  await sleep(POST_RUN_SETTLE_MS);
  if (TRACE_ENABLED) {
    await contentTracing.stopRecording(tracePath);
  }

  const semantics = READ_VTABLE_SEMANTICS ? await readVTableLiteState(win) : null;

  return {
    count,
    tracePath: TRACE_ENABLED ? tracePath : null,
    pageMetrics,
    traceMetrics: TRACE_ENABLED ? analyzeTrace(tracePath) : null,
    semantics
  };
};

const createWindow = () =>
  new BrowserWindow({
    show: false,
    width: 1600,
    height: 1000,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false
    }
  });

const writeSnapshot = results => {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        route: ROUTE,
        graphicsPerRun: GRAPHICS_PER_RUN,
        postRunSettleMs: POST_RUN_SETTLE_MS,
        traceEnabled: TRACE_ENABLED,
        results
      },
      null,
      2
    )
  );
};

const run = async () => {
  fs.mkdirSync(TRACE_DIR, { recursive: true });
  const results = [];

  for (const count of COUNTS) {
    const win = createWindow();
    await win.loadURL(withRoute(ROUTE));
    await waitForMeasurementHarness(win);
    results.push(await recordMeasurement(win, count));
    win.close();
  }

  writeSnapshot(results);
  console.log(JSON.stringify({ outFile: OUT_FILE, traceDir: TRACE_DIR, route: ROUTE, counts: COUNTS, results }, null, 2));
};

app.whenReady().then(run).catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  app.quit();
});
