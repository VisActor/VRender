import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions } from '@visactor/vrender-core';
import { bootstrapVRenderNodeApp } from './bootstrap';

type TVRenderAppEntryOptions = IEntryOptions;

const { createNodeApp } = VRenderCore as typeof VRenderCore & {
  createNodeApp: (options?: TVRenderAppEntryOptions) => IApp;
};

export function createNodeVRenderApp(options: TVRenderAppEntryOptions = {}): IApp {
  return bootstrapVRenderNodeApp(createNodeApp(options));
}
