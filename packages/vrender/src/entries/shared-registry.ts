import type { IApp } from '@visactor/vrender-core';

export type TVRenderSharedAppKey = string | symbol;

export type TVRenderSharedAppHandle<TEnv extends string = string> = {
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

type TSharedAppRegistry<TEnv extends string = string> = Map<TEnv, Map<TVRenderSharedAppKey, TSharedAppRecord>>;
type TGlobalSharedAppRegistry = typeof globalThis & Record<symbol, TSharedAppRegistry | undefined>;

export const DEFAULT_SHARED_APP_KEY = 'default';

const SHARED_APP_REGISTRY_KEY = Symbol.for('visactor.vrender.sharedAppRegistry');

function getSharedAppRegistry<TEnv extends string>(): TSharedAppRegistry<TEnv> {
  const target = globalThis as TGlobalSharedAppRegistry;
  const registry = target[SHARED_APP_REGISTRY_KEY] ?? new Map();
  target[SHARED_APP_REGISTRY_KEY] = registry;
  return registry as TSharedAppRegistry<TEnv>;
}

function getSharedAppEnvRegistry<TEnv extends string>(
  env: TEnv,
  create: boolean
): Map<TVRenderSharedAppKey, TSharedAppRecord> | undefined {
  const registry = getSharedAppRegistry<TEnv>();
  const envRegistry = registry.get(env);

  if (envRegistry || !create) {
    return envRegistry;
  }

  const nextEnvRegistry = new Map<TVRenderSharedAppKey, TSharedAppRecord>();
  registry.set(env, nextEnvRegistry);
  return nextEnvRegistry;
}

function getOrCreateSharedAppEnvRegistry<TEnv extends string>(env: TEnv): Map<TVRenderSharedAppKey, TSharedAppRecord> {
  return getSharedAppEnvRegistry(env, true) as Map<TVRenderSharedAppKey, TSharedAppRecord>;
}

function removeSharedAppRecord<TEnv extends string>(env: TEnv, key: TVRenderSharedAppKey, record: TSharedAppRecord) {
  const registry = getSharedAppRegistry<TEnv>();
  const envRegistry = registry.get(env);

  if (envRegistry?.get(key) === record) {
    envRegistry.delete(key);
    if (!envRegistry.size) {
      registry.delete(env);
    }
  }
}

function releaseSharedAppRecord<TEnv extends string>(env: TEnv, key: TVRenderSharedAppKey, record: TSharedAppRecord) {
  if (record.released) {
    return;
  }

  record.released = true;
  record.refCount = 0;
  removeSharedAppRecord(env, key, record);
  record.releaseApp();
}

function createSharedAppRecord<TEnv extends string, TOptions>(
  env: TEnv,
  key: TVRenderSharedAppKey,
  options: TOptions,
  createApp: (options: TOptions) => IApp
): TSharedAppRecord {
  const app = createApp(options);
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

function createSharedAppHandle<TEnv extends string>(
  registryEnv: string,
  handleEnv: TEnv,
  key: TVRenderSharedAppKey,
  record: TSharedAppRecord
): TVRenderSharedAppHandle<TEnv> {
  let released = false;

  return {
    app: record.app,
    env: handleEnv,
    key,
    release() {
      if (released) {
        return;
      }
      released = true;

      const envRegistry = getSharedAppEnvRegistry(registryEnv, false);
      if (envRegistry?.get(key) !== record || record.released) {
        return;
      }

      record.refCount -= 1;
      if (record.refCount <= 0) {
        releaseSharedAppRecord(registryEnv, key, record);
      }
    }
  };
}

export function acquireSharedApp<
  TRegistryEnv extends string,
  THandleEnv extends string = TRegistryEnv,
  TOptions extends { key?: TVRenderSharedAppKey } = { key?: TVRenderSharedAppKey }
>(
  registryEnv: TRegistryEnv,
  options: TOptions,
  createApp: (options: TOptions) => IApp,
  handleEnv: THandleEnv = registryEnv as unknown as THandleEnv
): TVRenderSharedAppHandle<THandleEnv> {
  const key = options.key ?? DEFAULT_SHARED_APP_KEY;
  const envRegistry = getOrCreateSharedAppEnvRegistry(registryEnv);
  let record = envRegistry.get(key);

  if (record?.app.released) {
    releaseSharedAppRecord(registryEnv, key, record);
    record = undefined;
  }

  if (!record) {
    record = createSharedAppRecord(registryEnv, key, options, createApp);
    envRegistry.set(key, record);
  }

  record.refCount += 1;
  return createSharedAppHandle(registryEnv, handleEnv, key, record);
}

export function getSharedApp<TEnv extends string>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): IApp | null {
  const record = getSharedAppEnvRegistry(env, false)?.get(key);
  if (!record || record.released || record.app.released) {
    return null;
  }
  return record.app;
}

export function releaseSharedApp<TEnv extends string>(
  env: TEnv,
  key: TVRenderSharedAppKey = DEFAULT_SHARED_APP_KEY
): void {
  const record = getSharedAppEnvRegistry(env, false)?.get(key);
  if (record) {
    releaseSharedAppRecord(env, key, record);
  }
}
