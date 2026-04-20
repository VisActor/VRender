import { createBrowserVRenderApp, type IStage, type IStageParams } from '@visactor/vrender';

type TManagedApp = {
  createStage(params: Partial<IStageParams>): IStage;
  release(): void;
};

export function createBrowserAppStage(params: Partial<IStageParams>): IStage {
  const app = createBrowserVRenderApp() as unknown as TManagedApp;
  const stage = app.createStage(params);
  const release = stage.release.bind(stage);
  let released = false;
  const noop = () => undefined;

  stage.release = () => {
    if (released) {
      return;
    }
    released = true;

    // Restore the original stage release before delegating to app.release().
    // AppContext.release() releases tracked stage resources; leaving the wrapper
    // in place would recurse back into app.release().
    stage.release = release;
    try {
      app.release();
    } finally {
      stage.release = noop as typeof stage.release;
    }
  };

  return stage;
}
