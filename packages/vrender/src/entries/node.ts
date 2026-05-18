import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { bootstrapVRenderNodeApp } from './bootstrap';

export type TVRenderNodeAppEntryOptions = IEntryOptions & {
  /**
   * Node runtime parameters. In normal Node rendering this should be the
   * node-canvas package object, matching `vglobal.setEnv('node', CanvasPkg)`.
   */
  envParams?: IEnvParamsMap['node'];
};

const { createNodeApp } = VRenderCore as typeof VRenderCore & {
  createNodeApp: (options?: IEntryOptions) => IApp;
};

export function createNodeVRenderApp(options: TVRenderNodeAppEntryOptions = {}): IApp {
  const { envParams, ...entryOptions } = options;

  return bootstrapVRenderNodeApp(createNodeApp(entryOptions), envParams);
}
