import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createBrowserApp } from '@visactor/vrender-core/entries/browser';
import { bootstrapVRenderSharedBrowserApp } from './bootstrap-browser';
import { createLynxVRenderApp } from './miniapp';
import { installPendingRuntimeContributionModulesToApp } from './runtime-contribution';
import {
  acquireSharedApp,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppKey
} from './shared-registry';

export type TVRenderSharedBrowserAppEnv = 'browser' | 'lynx';

export type TVRenderSharedBrowserAppOptions<TEnv extends TVRenderSharedBrowserAppEnv = 'browser'> = IEntryOptions & {
  env?: TEnv;
  envParams?: IEnvParamsMap[TEnv];
  /**
   * Shared identity inside the current JS runtime. Use a stable app/page/container key
   * when multiple products, such as VChart and VTable, should share one VRender app.
   */
  key?: TVRenderSharedAppKey;
};

export type TVRenderSharedBrowserAppHandle<TEnv extends TVRenderSharedBrowserAppEnv = 'browser'> =
  TVRenderSharedAppHandle<TEnv>;

type TVRenderSharedBrowserAppArgument =
  | TVRenderSharedBrowserAppOptions<TVRenderSharedBrowserAppEnv>
  | IEnvParamsMap[TVRenderSharedBrowserAppEnv];

function isSharedBrowserAppOptions(
  options: TVRenderSharedBrowserAppArgument
): options is TVRenderSharedBrowserAppOptions<TVRenderSharedBrowserAppEnv> {
  return 'context' in options || 'env' in options || 'envParams' in options || 'key' in options;
}

function resolveSharedBrowserAppOptions(
  optionsOrEnvParams?: TVRenderSharedBrowserAppArgument,
  env?: TVRenderSharedBrowserAppEnv
): TVRenderSharedBrowserAppOptions<TVRenderSharedBrowserAppEnv> {
  if (env !== undefined) {
    return {
      env,
      envParams: optionsOrEnvParams as IEnvParamsMap[TVRenderSharedBrowserAppEnv] | undefined
    };
  }

  if (optionsOrEnvParams === undefined) {
    return { env: 'browser' };
  }

  if (isSharedBrowserAppOptions(optionsOrEnvParams)) {
    return {
      ...optionsOrEnvParams,
      env: optionsOrEnvParams.env ?? 'browser'
    };
  }

  return {
    env: 'browser',
    envParams: optionsOrEnvParams
  };
}

function createSharedBrowserApp(options: TVRenderSharedBrowserAppOptions<TVRenderSharedBrowserAppEnv>): IApp {
  const { env, envParams } = options;
  const entryOptions = { ...options };
  delete entryOptions.env;
  delete entryOptions.envParams;
  delete entryOptions.key;

  if (env === 'lynx') {
    return createLynxVRenderApp({
      ...(entryOptions as IEntryOptions),
      envParams: envParams as IEnvParamsMap['lynx']
    });
  }

  const app = bootstrapVRenderSharedBrowserApp(
    createBrowserApp(entryOptions as any) as unknown as IApp,
    envParams as IEnvParamsMap['browser']
  );

  installPendingRuntimeContributionModulesToApp(app);
  return app;
}

export function acquireSharedBrowserVRenderApp(
  options?: TVRenderSharedBrowserAppOptions<'browser'>
): TVRenderSharedBrowserAppHandle<'browser'>;
export function acquireSharedBrowserVRenderApp(
  envParams?: IEnvParamsMap['browser'],
  env?: 'browser'
): TVRenderSharedBrowserAppHandle<'browser'>;
export function acquireSharedBrowserVRenderApp(
  optionsOrEnvParams?: TVRenderSharedBrowserAppOptions<'browser'> | IEnvParamsMap['browser'],
  env?: 'browser'
): TVRenderSharedBrowserAppHandle<'browser'> {
  const options = resolveSharedBrowserAppOptions(optionsOrEnvParams, env) as TVRenderSharedBrowserAppOptions<'browser'>;
  return acquireSharedApp('browser-shared', options, createSharedBrowserApp, 'browser');
}

export function getSharedBrowserVRenderApp(key?: TVRenderSharedAppKey): IApp | null {
  return getSharedApp('browser-shared', key);
}

export function releaseSharedBrowserVRenderApp(key?: TVRenderSharedAppKey): void {
  releaseSharedApp('browser-shared', key);
}

export function acquireSharedVRenderApp<TEnv extends TVRenderSharedBrowserAppEnv>(
  options?: TVRenderSharedBrowserAppOptions<TEnv>
): TVRenderSharedBrowserAppHandle<TEnv>;
export function acquireSharedVRenderApp<TEnv extends TVRenderSharedBrowserAppEnv>(
  envParams?: IEnvParamsMap[TEnv],
  env?: TEnv
): TVRenderSharedBrowserAppHandle<TEnv>;
export function acquireSharedVRenderApp(
  optionsOrEnvParams?: TVRenderSharedBrowserAppArgument,
  env?: TVRenderSharedBrowserAppEnv
): TVRenderSharedBrowserAppHandle<TVRenderSharedBrowserAppEnv> {
  const options = resolveSharedBrowserAppOptions(optionsOrEnvParams, env);
  return acquireSharedApp(`${options.env}-shared`, options, createSharedBrowserApp, options.env);
}

export { getSharedBrowserVRenderApp as getSharedVRenderApp, releaseSharedBrowserVRenderApp as releaseSharedVRenderApp };
