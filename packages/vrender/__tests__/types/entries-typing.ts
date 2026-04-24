import type { IApp, IEntryOptions } from '@visactor/vrender-core';
import { createBrowserVRenderApp } from '../../src/entries/browser';
import { createNodeVRenderApp } from '../../src/entries/node';

const browserFactory: (options?: IEntryOptions) => IApp = createBrowserVRenderApp;
const nodeFactory: (options?: IEntryOptions) => IApp = createNodeVRenderApp;

void browserFactory;
void nodeFactory;
