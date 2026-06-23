import type { IStageParams, Stage } from '@visactor/vrender-core';
import { createBrowserVRenderApp } from '../../../vrender/src/entries';

type TManagedApp = {
  createStage: (params: Partial<IStageParams>) => unknown;
  release: () => void;
};

function createTestApp(): TManagedApp {
  return createBrowserVRenderApp() as unknown as TManagedApp;
}

function attachAppRelease(stage: Stage, app: TManagedApp): Stage {
  const originalRelease = stage.release.bind(stage);
  let released = false;

  stage.release = ((...args: []) => {
    if (released) {
      return;
    }
    released = true;
    try {
      originalRelease(...args);
    } finally {
      app.release();
    }
  }) as typeof stage.release;

  return stage;
}

export function createTestStage(canvasId: string, width = 600, height = 600): Stage {
  const app = createTestApp();
  const stage = app.createStage({
    canvas: canvasId,
    width,
    height,
    autoRender: true,
    background: '#eee'
  }) as Stage;

  return attachAppRelease(stage, app);
}
