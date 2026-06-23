import type { IApp } from '@visactor/vrender-core';
import { createBrowserVRenderApp, type TVRenderBrowserAppEntryOptions } from './browser';
import {
  createFeishuVRenderApp,
  createHarmonyVRenderApp,
  createLynxVRenderApp,
  createTaroVRenderApp,
  createTTVRenderApp,
  createWxVRenderApp,
  type TVRenderMiniAppEntryOptions
} from './miniapp';
import { createNodeVRenderApp, type TVRenderNodeAppEntryOptions } from './node';
import {
  acquireSharedApp,
  DEFAULT_SHARED_APP_KEY,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle as TSharedAppHandle,
  type TVRenderSharedAppKey as TSharedAppKey
} from './shared-registry';

export type TVRenderSharedAppEnv = 'browser' | 'node' | 'taro' | 'feishu' | 'tt' | 'wx' | 'lynx' | 'harmony';
export type TVRenderSharedAppKey = TSharedAppKey;

type TVRenderSharedAppEntryOptionsMap = {
  browser: TVRenderBrowserAppEntryOptions;
  node: TVRenderNodeAppEntryOptions;
  taro: TVRenderMiniAppEntryOptions<'taro'>;
  feishu: TVRenderMiniAppEntryOptions<'feishu'>;
  tt: TVRenderMiniAppEntryOptions<'tt'>;
  wx: TVRenderMiniAppEntryOptions<'wx'>;
  lynx: TVRenderMiniAppEntryOptions<'lynx'>;
  harmony: TVRenderMiniAppEntryOptions<'harmony'>;
};

export type TVRenderSharedAppOptions<TEnv extends TVRenderSharedAppEnv = TVRenderSharedAppEnv> =
  TVRenderSharedAppEntryOptionsMap[TEnv] & {
    env: TEnv;
    /**
     * Shared identity inside the current JS runtime. Use a stable app/page/container key
     * when multiple products, such as VChart and VTable, should share one VRender app.
     */
    key?: TVRenderSharedAppKey;
  };

export type TVRenderSharedAppHandle<TEnv extends TVRenderSharedAppEnv = TVRenderSharedAppEnv> = TSharedAppHandle<TEnv>;

function createAppForSharedEnv<TEnv extends TVRenderSharedAppEnv>(options: TVRenderSharedAppOptions<TEnv>): IApp {
  const { env } = options;
  const entryOptions = { ...options } as Record<string, unknown>;
  delete entryOptions.env;
  delete entryOptions.key;

  if (env === 'browser') {
    return createBrowserVRenderApp(entryOptions as TVRenderBrowserAppEntryOptions);
  }
  if (env === 'node') {
    return createNodeVRenderApp(entryOptions as TVRenderNodeAppEntryOptions);
  }
  if (env === 'taro') {
    return createTaroVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'taro'>);
  }
  if (env === 'feishu') {
    return createFeishuVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'feishu'>);
  }
  if (env === 'tt') {
    return createTTVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'tt'>);
  }
  if (env === 'wx') {
    return createWxVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'wx'>);
  }
  if (env === 'lynx') {
    return createLynxVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'lynx'>);
  }
  return createHarmonyVRenderApp(entryOptions as TVRenderMiniAppEntryOptions<'harmony'>);
}

export function acquireSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  options: TVRenderSharedAppOptions<TEnv>
): TVRenderSharedAppHandle<TEnv> {
  return acquireSharedApp(options.env, options, createAppForSharedEnv, options.env);
}

export function getSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): IApp | null {
  return getSharedApp(env, key);
}

export function releaseSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): void {
  releaseSharedApp(env, key);
}
