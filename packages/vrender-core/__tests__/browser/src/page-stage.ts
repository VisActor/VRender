import { createBrowserVRenderApp, type IStage, type IStageParams } from '@visactor/vrender';

type TManagedApp = {
  createStage(params: Partial<IStageParams>): IStage;
  release(): void;
};

export function createBrowserPageApp(): TManagedApp {
  return createBrowserVRenderApp() as unknown as TManagedApp;
}

export function createBrowserPageStage(params: Partial<IStageParams>): IStage {
  const app = createBrowserPageApp();
  const stage = app.createStage(params);
  const release = stage.release.bind(stage);

  stage.release = () => {
    release();
    app.release();
  };

  return stage;
}
