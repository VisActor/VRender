import { createBrowserVRenderApp, createNodeVRenderApp, type IStage, type IStageParams } from '../src';

export function createDiv(container: HTMLElement = document.body): HTMLElement {
  const div = document.createElement('div');

  container.appendChild(div);

  return div;
}

export function createCanvas(container: HTMLElement = document.body): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  container.appendChild(canvas);

  return canvas;
}

export function removeDom(dom: HTMLElement) {
  const parent = dom.parentNode;

  if (parent) {
    parent.removeChild(dom);
  }
}

type TManagedApp = {
  createStage: (params: Partial<IStageParams>) => IStage;
  release: () => void;
};

function attachAppRelease<TStage extends IStage>(stage: TStage, app: TManagedApp): TStage {
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

export function createBrowserStage(params: Partial<IStageParams>): IStage {
  const app = createBrowserVRenderApp() as unknown as TManagedApp;
  return attachAppRelease(app.createStage(params), app);
}

export function createNodeStage(params: Partial<IStageParams>): IStage {
  const app = createNodeVRenderApp() as unknown as TManagedApp;
  return attachAppRelease(app.createStage(params), app);
}
