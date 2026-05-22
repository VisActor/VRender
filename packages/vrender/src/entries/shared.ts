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

export type TVRenderSharedAppEnv = 'browser' | 'node' | 'taro' | 'feishu' | 'tt' | 'wx' | 'lynx' | 'harmony';
export type TVRenderSharedAppKey = string | symbol;

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

export type TVRenderSharedAppHandle<TEnv extends TVRenderSharedAppEnv = TVRenderSharedAppEnv> = {
  readonly app: IApp;
  readonly env: TEnv;
  readonly key: TVRenderSharedAppKey;
  release: () => void;
};

type TSharedAppRecord = {
  app: IApp;
  refCount: number;
  released: boolean;
  releaseApp: () => void;
};

type TSharedAppRegistry = Map<TVRenderSharedAppEnv, Map<TVRenderSharedAppKey, TSharedAppRecord>>;
type TGlobalSharedAppRegistry = typeof globalThis & Record<symbol, TSharedAppRegistry | undefined>;

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');
const DEFAULT_SHARED_APP_KEY = 'default';

function getSharedAppRegistry(): TSharedAppRegistry {
  const target = globalThis as TGlobalSharedAppRegistry;
  const registry = target[SHARED_APP_REGISTRY_KEY] ?? new Map();
  target[SHARED_APP_REGISTRY_KEY] = registry;
  return registry;
}

function getSharedAppEnvRegistry<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  create: boolean
): Map<TVRenderSharedAppKey, TSharedAppRecord> | undefined {
  const registry = getSharedAppRegistry();
  const envRegistry = registry.get(env);

  if (envRegistry || !create) {
    return envRegistry;
  }

  const nextEnvRegistry = new Map<TVRenderSharedAppKey, TSharedAppRecord>();
  registry.set(env, nextEnvRegistry);
  return nextEnvRegistry;
}

function getOrCreateSharedAppEnvRegistry<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv
): Map<TVRenderSharedAppKey, TSharedAppRecord> {
  return getSharedAppEnvRegistry(env, true) as Map<TVRenderSharedAppKey, TSharedAppRecord>;
}

function removeSharedAppRecord<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey,
  record: TSharedAppRecord
) {
  const registry = getSharedAppRegistry();
  const envRegistry = registry.get(env);

  if (envRegistry?.get(key) === record) {
    envRegistry.delete(key);
    if (!envRegistry.size) {
      registry.delete(env);
    }
  }
}

function releaseSharedAppRecord<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey,
  record: TSharedAppRecord
) {
  if (record.released) {
    return;
  }

  record.released = true;
  record.refCount = 0;
  removeSharedAppRecord(env, key, record);
  record.releaseApp();
}

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

function createSharedAppRecord<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey,
  options: TVRenderSharedAppOptions<TEnv>
): TSharedAppRecord {
  const app = createAppForSharedEnv(options);
  const originalRelease = app.release.bind(app);
  const record: TSharedAppRecord = {
    app,
    refCount: 0,
    released: false,
    releaseApp: originalRelease
  };

  app.release = () => releaseSharedAppRecord(env, key, record);
  return record;
}

function createSharedAppHandle<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey,
  record: TSharedAppRecord
): TVRenderSharedAppHandle<TEnv> {
  let released = false;

  return {
    app: record.app,
    env,
    key,
    release() {
      if (released) {
        return;
      }
      released = true;

      const envRegistry = getSharedAppEnvRegistry(env, false);
      if (envRegistry?.get(key) !== record || record.released) {
        return;
      }

      record.refCount -= 1;
      if (record.refCount <= 0) {
        releaseSharedAppRecord(env, key, record);
      }
    }
  };
}

export function acquireSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  options: TVRenderSharedAppOptions<TEnv>
): TVRenderSharedAppHandle<TEnv> {
  const key = options.key ?? DEFAULT_SHARED_APP_KEY;
  const envRegistry = getOrCreateSharedAppEnvRegistry(options.env);
  let record = envRegistry.get(key);

  if (record?.app.released) {
    releaseSharedAppRecord(options.env, key, record);
    record = undefined;
  }

  if (!record) {
    record = createSharedAppRecord(options.env, key, options);
    envRegistry.set(key, record);
  }

  record.refCount += 1;
  return createSharedAppHandle(options.env, key, record);
}

export function getSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): IApp | null {
  const record = getSharedAppEnvRegistry(env, false)?.get(key);
  if (!record || record.released || record.app.released) {
    return null;
  }
  return record.app;
}

export function releaseSharedVRenderApp<TEnv extends TVRenderSharedAppEnv>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): void {
  const record = getSharedAppEnvRegistry(env, false)?.get(key);
  if (record) {
    releaseSharedAppRecord(env, key, record);
  }
}
