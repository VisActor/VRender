import { createBrowserVRenderApp } from '@visactor/vrender';
import type { IStage, IStageParams } from '@visactor/vrender';
import { setHarnessApp, setHarnessCleanup, setHarnessStage } from './harness';

type IManagedBrowserPageApp = ReturnType<typeof createBrowserVRenderApp>;

export function createBrowserPageApp(): IManagedBrowserPageApp {
  const app = createBrowserVRenderApp();

  setHarnessApp(app);
  setHarnessCleanup(() => {
    setHarnessApp(null);
    app.release();
  });

  return app;
}

export function createBrowserPageStage(params: Partial<IStageParams>): IStage {
  const app = createBrowserPageApp();
  const stage = app.createStage(params);

  setHarnessStage(stage);

  return stage;
}
