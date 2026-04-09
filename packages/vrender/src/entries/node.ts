import * as VRenderCore from '@visactor/vrender-core';
import { bootstrapVRenderNodeApp } from './bootstrap';

type TVRenderAppEntryOptions = {
  context?: Record<string, unknown>;
};

const { createNodeApp } = VRenderCore as typeof VRenderCore & {
  createNodeApp: (options?: TVRenderAppEntryOptions) => object;
};

export function createNodeVRenderApp(options: TVRenderAppEntryOptions = {}) {
  return bootstrapVRenderNodeApp(createNodeApp(options));
}
