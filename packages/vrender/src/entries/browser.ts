import * as VRenderCore from '@visactor/vrender-core';
import { bootstrapVRenderBrowserApp } from './bootstrap';

type TVRenderAppEntryOptions = {
  context?: Record<string, unknown>;
};

const { createBrowserApp } = VRenderCore as typeof VRenderCore & {
  createBrowserApp: (options?: TVRenderAppEntryOptions) => object;
};

export function createBrowserVRenderApp(options: TVRenderAppEntryOptions = {}) {
  return bootstrapVRenderBrowserApp(createBrowserApp(options));
}
