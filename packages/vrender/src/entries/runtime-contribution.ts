import type { IApp, IGraphicPicker, ILegacyBindingContext, ServiceIdentifier } from '@visactor/vrender-core';
import * as runtimeInstaller from '@visactor/vrender-core/entries/runtime-installer';
import { getAllSharedApps } from './shared-registry';

export type TRuntimeContributionModuleRegistry = (
  bind: ILegacyBindingContext['bind'],
  unbind: (serviceIdentifier: ServiceIdentifier) => void,
  isBound: ILegacyBindingContext['isBound'],
  rebind: ILegacyBindingContext['rebind']
) => void;

export type TRuntimeContributionModule =
  | ((context: ILegacyBindingContext) => void)
  | {
      registry: TRuntimeContributionModuleRegistry;
    };

export type TRuntimeContributionInstallTarget =
  | 'graphic-renderer'
  | 'draw-contribution'
  | {
      picker: ServiceIdentifier<IGraphicPicker>;
    };

export interface IRuntimeContributionModuleInstallOptions {
  app?: IApp;
  legacy?: boolean;
  targets?: TRuntimeContributionInstallTarget[];
}

export interface ISharedRuntimeContributionModuleInstallOptions
  extends Omit<IRuntimeContributionModuleInstallOptions, 'app'> {
  app?: IApp;
  installExistingSharedApps?: boolean;
}

type TCoreRuntimeContributionModuleInstaller = (
  module: TRuntimeContributionModule,
  options?: IRuntimeContributionModuleInstallOptions
) => void;

type TPendingRuntimeContributionModule = {
  module: TRuntimeContributionModule;
  options: Omit<IRuntimeContributionModuleInstallOptions, 'app'>;
};

const installCoreRuntimeContributionModule = (
  runtimeInstaller as unknown as {
    installRuntimeContributionModule: TCoreRuntimeContributionModuleInstaller;
  }
).installRuntimeContributionModule;
const pendingRuntimeContributionModules: TPendingRuntimeContributionModule[] = [];
const pendingRuntimeContributionModuleMap = new WeakMap<object, TPendingRuntimeContributionModule>();

function getRuntimeContributionModuleIdentity(module: TRuntimeContributionModule): object {
  return module as object;
}

function addPendingRuntimeContributionModule(
  module: TRuntimeContributionModule,
  options: Omit<IRuntimeContributionModuleInstallOptions, 'app'>
): void {
  const identity = getRuntimeContributionModuleIdentity(module);
  const existing = pendingRuntimeContributionModuleMap.get(identity);

  if (existing) {
    existing.options = options;
    return;
  }

  const entry = { module, options };
  pendingRuntimeContributionModuleMap.set(identity, entry);
  pendingRuntimeContributionModules.push(entry);
}

export function installPendingRuntimeContributionModulesToApp(app: IApp): void {
  pendingRuntimeContributionModules.forEach(({ module, options }) => {
    installCoreRuntimeContributionModule(module, {
      ...options,
      app
    });
  });
}

export function installRuntimeContributionModule(
  module: TRuntimeContributionModule,
  { app, installExistingSharedApps = true, ...runtimeOptions }: ISharedRuntimeContributionModuleInstallOptions = {}
): void {
  if (app) {
    installCoreRuntimeContributionModule(module, {
      ...runtimeOptions,
      app
    });
    return;
  }

  addPendingRuntimeContributionModule(module, runtimeOptions);

  if (installExistingSharedApps) {
    getAllSharedApps().forEach(targetApp => {
      installCoreRuntimeContributionModule(module, {
        ...runtimeOptions,
        app: targetApp
      });
    });
  }
}
