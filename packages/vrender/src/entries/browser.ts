import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions } from '@visactor/vrender-core';
import { bootstrapVRenderBrowserApp } from './bootstrap';

type TVRenderAppEntryOptions = IEntryOptions;

const { createBrowserApp } = VRenderCore as typeof VRenderCore & {
  createBrowserApp: (options?: TVRenderAppEntryOptions) => IApp;
};

export function createBrowserVRenderApp(options: TVRenderAppEntryOptions = {}): IApp {
  return bootstrapVRenderBrowserApp(createBrowserApp(options));
}
