import type { IApp, IEntryOptions } from '@visactor/vrender-core';
import { createBrowserVRenderApp } from '../../src/entries/browser';
import { createNodeVRenderApp } from '../../src/entries/node';
import {
  acquireSharedVRenderApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppOptions
} from '../../src/entries/shared';
import {
  acquireSharedVRenderApp as acquireBrowserConditionSharedVRenderApp,
  type TVRenderSharedBrowserAppHandle
} from '../../src/entries/shared-browser';

const browserFactory: (options?: IEntryOptions) => IApp = createBrowserVRenderApp;
const nodeFactory: (options?: IEntryOptions) => IApp = createNodeVRenderApp;
const browserSharedHandle: TVRenderSharedAppHandle<'browser'> = acquireSharedVRenderApp({ env: 'browser' });
const positionalLynxSharedHandle: TVRenderSharedAppHandle<'lynx'> = acquireSharedVRenderApp(undefined, 'lynx');
const browserConditionDefaultHandle: TVRenderSharedBrowserAppHandle<'browser'> =
  acquireBrowserConditionSharedVRenderApp();
const browserConditionLynxHandle: TVRenderSharedBrowserAppHandle<'lynx'> = acquireBrowserConditionSharedVRenderApp(
  undefined,
  'lynx'
);
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
void positionalLynxSharedHandle;
void browserConditionDefaultHandle;
void browserConditionLynxHandle;
void lynxSharedOptions;
