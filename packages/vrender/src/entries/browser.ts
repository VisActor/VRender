import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createBrowserApp } from '@visactor/vrender-core/entries/browser';
import { bootstrapVRenderBrowserApp } from './bootstrap';

export type TVRenderBrowserAppEntryOptions = IEntryOptions & {
  envParams?: IEnvParamsMap['browser'];
};

export function createBrowserVRenderApp(options: TVRenderBrowserAppEntryOptions = {}): IApp {
  const { envParams, ...entryOptions } = options;

  return bootstrapVRenderBrowserApp(createBrowserApp(entryOptions as any) as unknown as IApp, envParams);
}
