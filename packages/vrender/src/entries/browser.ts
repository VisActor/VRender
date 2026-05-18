import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { bootstrapVRenderBrowserApp } from './bootstrap';

export type TVRenderBrowserAppEntryOptions = IEntryOptions & {
  envParams?: IEnvParamsMap['browser'];
};

const { createBrowserApp } = VRenderCore as typeof VRenderCore & {
  createBrowserApp: (options?: IEntryOptions) => IApp;
};

export function createBrowserVRenderApp(options: TVRenderBrowserAppEntryOptions = {}): IApp {
  const { envParams, ...entryOptions } = options;

  return bootstrapVRenderBrowserApp(createBrowserApp(entryOptions), envParams);
}
