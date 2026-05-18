import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { bootstrapVRenderMiniApp } from './bootstrap';

type TAppScopedMiniEnv = 'taro' | 'feishu' | 'tt' | 'wx' | 'lynx' | 'harmony';

export type TVRenderMiniAppEntryOptions<TEnv extends TAppScopedMiniEnv> = IEntryOptions & {
  envParams?: IEnvParamsMap[TEnv];
};

const { createMiniappApp } = VRenderCore as typeof VRenderCore & {
  createMiniappApp: (options?: IEntryOptions) => IApp;
};

function createMiniEnvVRenderApp<TEnv extends TAppScopedMiniEnv>(
  env: TEnv,
  options: TVRenderMiniAppEntryOptions<TEnv> = {}
): IApp {
  const { envParams, ...entryOptions } = options;

  return bootstrapVRenderMiniApp(createMiniappApp(entryOptions), env, envParams);
}

export function createTaroVRenderApp(options: TVRenderMiniAppEntryOptions<'taro'> = {}): IApp {
  return createMiniEnvVRenderApp('taro', options);
}

export function createFeishuVRenderApp(options: TVRenderMiniAppEntryOptions<'feishu'> = {}): IApp {
  return createMiniEnvVRenderApp('feishu', options);
}

export function createTTVRenderApp(options: TVRenderMiniAppEntryOptions<'tt'> = {}): IApp {
  return createMiniEnvVRenderApp('tt', options);
}

export function createWxVRenderApp(options: TVRenderMiniAppEntryOptions<'wx'> = {}): IApp {
  return createMiniEnvVRenderApp('wx', options);
}

export function createLynxVRenderApp(options: TVRenderMiniAppEntryOptions<'lynx'> = {}): IApp {
  return createMiniEnvVRenderApp('lynx', options);
}

export function createHarmonyVRenderApp(options: TVRenderMiniAppEntryOptions<'harmony'> = {}): IApp {
  return createMiniEnvVRenderApp('harmony', options);
}
