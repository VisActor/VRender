import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createLynxVRenderApp } from './lynx';
import {
  acquireSharedApp,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppKey
} from './shared-registry';

const SHARED_LYNX_REGISTRY_ENV = 'lynx-shared';

export type TVRenderSharedLynxAppOptions = IEntryOptions & {
  env?: 'lynx';
  envParams?: IEnvParamsMap['lynx'];
  /**
   * Shared identity inside the current JS runtime. Use a stable app/page/container key
   * when multiple products, such as VChart and VTable, should share one VRender app.
   */
  key?: TVRenderSharedAppKey;
};

export type TVRenderSharedLynxAppHandle = TVRenderSharedAppHandle<'lynx'>;

type TVRenderSharedLynxAppArgument = TVRenderSharedLynxAppOptions | IEnvParamsMap['lynx'];

function isSharedLynxAppOptions(options: TVRenderSharedLynxAppArgument): options is TVRenderSharedLynxAppOptions {
  return 'context' in options || 'env' in options || 'envParams' in options || 'key' in options;
}

function assertLynxEnv(env: unknown): asserts env is 'lynx' | undefined {
  if (env !== undefined && env !== 'lynx') {
    throw new Error(`The Lynx condition only supports env "lynx"; received "${String(env)}".`);
  }
}

function resolveSharedLynxAppOptions(
  optionsOrEnvParams?: TVRenderSharedLynxAppArgument,
  env?: 'lynx'
): TVRenderSharedLynxAppOptions {
  assertLynxEnv(env);
  if (env !== undefined) {
    return { env, envParams: optionsOrEnvParams as IEnvParamsMap['lynx'] | undefined };
  }

  if (optionsOrEnvParams === undefined) {
    return { env: 'lynx' };
  }

  if (isSharedLynxAppOptions(optionsOrEnvParams)) {
    assertLynxEnv((optionsOrEnvParams as { env?: unknown }).env);
    return { ...optionsOrEnvParams, env: 'lynx' };
  }

  return { env: 'lynx', envParams: optionsOrEnvParams };
}

function createSharedLynxApp(options: TVRenderSharedLynxAppOptions): IApp {
  const { envParams } = options;
  const entryOptions = { ...options };
  delete entryOptions.env;
  delete entryOptions.envParams;
  delete entryOptions.key;
  return createLynxVRenderApp({ ...entryOptions, envParams });
}

export function acquireSharedLynxVRenderApp(options?: TVRenderSharedLynxAppOptions): TVRenderSharedLynxAppHandle;
export function acquireSharedLynxVRenderApp(
  envParams?: IEnvParamsMap['lynx'],
  env?: 'lynx'
): TVRenderSharedLynxAppHandle;
export function acquireSharedLynxVRenderApp(
  optionsOrEnvParams?: TVRenderSharedLynxAppArgument,
  env?: 'lynx'
): TVRenderSharedLynxAppHandle {
  const options = resolveSharedLynxAppOptions(optionsOrEnvParams, env);
  return acquireSharedApp(SHARED_LYNX_REGISTRY_ENV, options, createSharedLynxApp, 'lynx');
}

export function getSharedLynxVRenderApp(key?: TVRenderSharedAppKey): IApp | null {
  return getSharedApp(SHARED_LYNX_REGISTRY_ENV, key);
}

export function releaseSharedLynxVRenderApp(key?: TVRenderSharedAppKey): void {
  releaseSharedApp(SHARED_LYNX_REGISTRY_ENV, key);
}

export {
  acquireSharedLynxVRenderApp as acquireSharedVRenderApp,
  getSharedLynxVRenderApp as getSharedVRenderApp,
  releaseSharedLynxVRenderApp as releaseSharedVRenderApp
};
