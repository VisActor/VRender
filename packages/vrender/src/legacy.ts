import { isBrowserEnv, isNodeEnv, type IStageParams } from '@visactor/vrender-core';
import { createBrowserVRenderApp, createNodeVRenderApp } from './entries';

type TLegacyVRenderApp = {
  createStage: (params: Partial<IStageParams>) => unknown;
};

let browserApp: TLegacyVRenderApp | undefined;
let nodeApp: TLegacyVRenderApp | undefined;

function resolveLegacyApp(): TLegacyVRenderApp {
  if (isNodeEnv() && !isBrowserEnv()) {
    nodeApp ??= createNodeVRenderApp() as unknown as TLegacyVRenderApp;
    return nodeApp;
  }

  browserApp ??= createBrowserVRenderApp() as unknown as TLegacyVRenderApp;
  return browserApp;
}

/**
 * @deprecated Prefer `createBrowserVRenderApp()` / `createNodeVRenderApp()` and `app.createStage()`.
 */
export function createStage(params: Partial<IStageParams>) {
  return resolveLegacyApp().createStage(params);
}
