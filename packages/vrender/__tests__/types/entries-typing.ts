import type { IApp, IEntryOptions } from '@visactor/vrender-core';
import { createBrowserVRenderApp } from '../../src/entries/browser';
import { createNodeVRenderApp } from '../../src/entries/node';
import {
  acquireSharedVRenderApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppOptions
} from '../../src/entries/shared';

const browserFactory: (options?: IEntryOptions) => IApp = createBrowserVRenderApp;
const nodeFactory: (options?: IEntryOptions) => IApp = createNodeVRenderApp;
const browserSharedHandle: TVRenderSharedAppHandle<'browser'> = acquireSharedVRenderApp({ env: 'browser' });
const lynxSharedOptions: TVRenderSharedAppOptions<'lynx'> = {
  env: 'lynx',
  key: 'main',
  envParams: {
    pixelRatio: 2
  }
};

void browserFactory;
void nodeFactory;
void browserSharedHandle;
void lynxSharedOptions;
