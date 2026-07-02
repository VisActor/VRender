import type {
  IContributionProvider,
  IAreaRenderContribution,
  IDrawItemInterceptorContribution,
  IEnvContribution,
  IGlobal,
  IGraphicPicker,
  IPlugin
} from '../interface';
import type { IApp } from './types';
import { application } from '../application';
import { CanvasFactory, Context2dFactory } from '../canvas/constants';
import { ContributionStore, createContributionProvider } from '../common/contribution-provider';
import type { ServiceIdentifier } from '../common/explicit-binding';
import { EnvContribution } from '../constants';
import loadBuiltinContributions from '../core/contributions/modules';
import { DefaultGlobal } from '../core/global';
import { WindowHandlerContribution, DefaultWindow } from '../core/window';
import coreModule from '../core/core-modules';
import graphicModule from '../graphic/graphic-service/graphic-module';
import type { ILegacyBindingContext } from '../legacy/binding-context';
import { getLegacyBindingContext, preLoadAllModule } from '../legacy/bootstrap';
import pickModule from '../picker/pick-modules';
import { AreaRenderContribution } from '../render/contributions/render/contributions/constants';
import { DrawItemInterceptor } from '../render/contributions/render/draw-interceptor';
import { DefaultIncrementalCanvasAreaRender } from '../render/contributions/render/incremental-area-render';
import { DefaultIncrementalDrawContribution } from '../render/contributions/render/incremental-draw-contribution';
import { DefaultIncrementalCanvasLineRender } from '../render/contributions/render/incremental-line-render';
import renderModule from '../render/render-modules';
import { GraphicRender } from '../render/contributions/render/symbol';
import loadRenderContributions from '../render/contributions/modules';
import { AutoEnablePlugins } from '../plugins/constants';
import { DefaultPluginService } from '../plugins/plugin-service';
import { getRuntimeInstallerState } from './runtime-installer-state';

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

const runtimeInstallerState = getRuntimeInstallerState();
const runtimeInstallerContext = runtimeInstallerState.runtimeInstallerContext;
const RUNTIME_RENDERER_NAMESPACE = 'vrender:runtime-renderer';
const RUNTIME_PICKER_NAMESPACE = 'vrender:runtime-picker';
const runtimeEntryKeys = runtimeInstallerState.runtimeEntryKeys;
const runtimeDrawContributions = runtimeInstallerState.runtimeDrawContributions;
const loadedRuntimeContributionModules = runtimeInstallerState.loadedRuntimeContributionModules;
const DEFAULT_RUNTIME_CONTRIBUTION_TARGETS: TRuntimeContributionInstallTarget[] = ['graphic-renderer'];
const noopUnbindRuntimeContributionService = (): void => undefined;

function ensureRuntimeInstallerPreloaded(): void {
  if (runtimeInstallerState.preloaded) {
    return;
  }

  runtimeInstallerState.preloaded = true;
  coreModule({ bind: runtimeInstallerContext.bind });
  graphicModule({ bind: runtimeInstallerContext.bind });
  renderModule({ bind: runtimeInstallerContext.bind });
  pickModule({ bind: runtimeInstallerContext.bind, isBound: runtimeInstallerContext.isBound });
  loadBuiltinContributions(runtimeInstallerContext);
  loadRenderContributions(runtimeInstallerContext);
}

function resolveRuntimeNamed<T>(serviceIdentifier: ServiceIdentifier<T>, name: string): T {
  const bindingContext = getRuntimeInstallerBindingContext();
  const instance = bindingContext.getNamed(serviceIdentifier, name);

  if (instance == null) {
    throw new Error(`${String(serviceIdentifier)} is not configured for ${name}`);
  }

  return instance;
}

function registerRuntimeEntries<T extends { type?: string }>(
  register: (key: string, value: T) => void,
  entries: T[],
  prefix: string
): void {
  entries.forEach((entry, index) => {
    const name = entry?.type ?? entry?.constructor?.name ?? `${prefix}-entry`;
    register(`${prefix}:${String(name)}:${index}`, entry);
  });
}

function getTrackedEntryKeys(registry: object, namespace: string): Set<string> {
  let namespaces = runtimeEntryKeys.get(registry);
  if (!namespaces) {
    namespaces = new Map();
    runtimeEntryKeys.set(registry, namespaces);
  }

  let keys = namespaces.get(namespace);
  if (!keys) {
    keys = new Set();
    namespaces.set(namespace, keys);
  }

  return keys;
}

function clearTrackedEntryKeys(registry: object, namespace: string, unregister?: (key: string) => void): void {
  const keys = getTrackedEntryKeys(registry, namespace);
  if (unregister) {
    keys.forEach(key => unregister(key));
  }
  keys.clear();
}

function createAppRegistryContributionProvider<T>(app: IApp, key: ServiceIdentifier<T>): IContributionProvider<T> {
  return {
    getContributions: () => app.context.registry.contribution.get(key as any) as T[]
  };
}

export function getRuntimeInstallerBindingContext(): ILegacyBindingContext {
  ensureRuntimeInstallerPreloaded();
  return runtimeInstallerContext;
}

export function refreshRuntimeInstallerContributions(): void {
  ContributionStore.refreshAllContributions();
}

export function getRuntimeInstallerGlobal(): IGlobal {
  ensureRuntimeInstallerPreloaded();
  runtimeInstallerState.runtimeGlobal ??= new DefaultGlobal(
    createContributionProvider<IEnvContribution>(EnvContribution, runtimeInstallerContext)
  );
  return runtimeInstallerState.runtimeGlobal;
}

export function configureRuntimeApplicationForApp(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  const global = getRuntimeInstallerGlobal();

  application.global = global;
  application.canvasFactory = env => bindingContext.getNamed(CanvasFactory, env);
  application.context2dFactory = env => bindingContext.getNamed(Context2dFactory, env);
  application.windowHandlerFactory = env => resolveRuntimeNamed(WindowHandlerContribution, env);
  application.windowFactory = () =>
    new DefaultWindow(global, env => resolveRuntimeNamed(WindowHandlerContribution, env));
  application.pluginServiceFactory = () =>
    new DefaultPluginService(createContributionProvider<IPlugin>(AutoEnablePlugins, bindingContext), {
      pluginRegistry: app.context.registry.plugin as any
    });
  application.incrementalDrawContributionFactory = () =>
    new DefaultIncrementalDrawContribution(
      [],
      new DefaultIncrementalCanvasLineRender(),
      new DefaultIncrementalCanvasAreaRender(
        createContributionProvider<IAreaRenderContribution>(AreaRenderContribution, bindingContext)
      ),
      createAppRegistryContributionProvider<IDrawItemInterceptorContribution>(app, DrawItemInterceptor)
    );
}

export { RUNTIME_INSTALLER_STATE_SYMBOL, getRuntimeInstallerState } from './runtime-installer-state';
export type { IRuntimeInstallerState } from './runtime-installer-state';

export function installRuntimeGraphicRenderersToApp(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const renderers = bindingContext.getAll(GraphicRender);
  const registeredKeys = getTrackedEntryKeys(app.registry.renderer as object, RUNTIME_RENDERER_NAMESPACE);

  clearTrackedEntryKeys(
    app.registry.renderer as object,
    RUNTIME_RENDERER_NAMESPACE,
    app.registry.renderer.unregister?.bind(app.registry.renderer)
  );

  registerRuntimeEntries(
    (key, renderer) => {
      renderer?.reInit?.();
      app.registry.renderer.register(key, renderer);
      registeredKeys.add(key);
    },
    renderers as any[],
    RUNTIME_RENDERER_NAMESPACE
  );
}

export function installRuntimeDrawContributionsToApp(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const contributions = bindingContext.getAll(DrawItemInterceptor) as IDrawItemInterceptorContribution[];
  const tracked =
    runtimeDrawContributions.get(app.context.registry.contribution as object) ??
    new Set<IDrawItemInterceptorContribution>();
  tracked.forEach(contribution => {
    app.context.registry.contribution.unregister?.(DrawItemInterceptor, contribution);
  });
  tracked.clear();
  runtimeDrawContributions.set(app.context.registry.contribution as object, tracked);
  const registered = new Set(app.context.registry.contribution.get(DrawItemInterceptor));

  contributions.forEach(contribution => {
    if (!registered.has(contribution)) {
      app.context.registry.contribution.register(DrawItemInterceptor, contribution);
      registered.add(contribution);
    }
    tracked.add(contribution);
  });
}

export function installRuntimePickersToApp<T extends IGraphicPicker>(
  app: IApp,
  serviceIdentifier: ServiceIdentifier<T>
): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const pickers = bindingContext.getAll(serviceIdentifier);
  const registeredKeys = getTrackedEntryKeys(app.registry.picker as object, RUNTIME_PICKER_NAMESPACE);

  clearTrackedEntryKeys(
    app.registry.picker as object,
    RUNTIME_PICKER_NAMESPACE,
    app.registry.picker.unregister?.bind(app.registry.picker)
  );

  registerRuntimeEntries(
    (key, picker) => {
      app.registry.picker.register(key, picker);
      registeredKeys.add(key);
    },
    pickers as any[],
    RUNTIME_PICKER_NAMESPACE
  );
}

function getRuntimeContributionModuleIdentity(module: TRuntimeContributionModule): object {
  return module as object;
}

function hasLoadedRuntimeContributionModule(
  context: ILegacyBindingContext,
  module: TRuntimeContributionModule
): boolean {
  return loadedRuntimeContributionModules.get(context)?.has(getRuntimeContributionModuleIdentity(module)) ?? false;
}

function markRuntimeContributionModuleLoaded(context: ILegacyBindingContext, module: TRuntimeContributionModule): void {
  let modules = loadedRuntimeContributionModules.get(context);
  if (!modules) {
    modules = new WeakSet<object>();
    loadedRuntimeContributionModules.set(context, modules);
  }
  modules.add(getRuntimeContributionModuleIdentity(module));
}

function loadRuntimeContributionModuleToContext(
  context: ILegacyBindingContext,
  module: TRuntimeContributionModule
): void {
  if (hasLoadedRuntimeContributionModule(context, module)) {
    return;
  }

  if (typeof module === 'function') {
    module(context);
  } else {
    module.registry(context.bind, noopUnbindRuntimeContributionService, context.isBound, context.rebind);
  }

  markRuntimeContributionModuleLoaded(context, module);
}

function isRuntimePickerTarget(
  target: TRuntimeContributionInstallTarget
): target is { picker: ServiceIdentifier<IGraphicPicker> } {
  return typeof target === 'object' && target !== null && 'picker' in target;
}

function installRuntimeContributionTargetsToApp(
  app: IApp,
  targets: TRuntimeContributionInstallTarget[] | undefined
): void {
  const resolvedTargets = targets ?? DEFAULT_RUNTIME_CONTRIBUTION_TARGETS;
  let installGraphicRenderers = false;
  let installDrawContributions = false;
  const pickerTargets = new Set<ServiceIdentifier<IGraphicPicker>>();

  resolvedTargets.forEach(target => {
    if (target === 'graphic-renderer') {
      installGraphicRenderers = true;
    } else if (target === 'draw-contribution') {
      installDrawContributions = true;
    } else if (isRuntimePickerTarget(target)) {
      pickerTargets.add(target.picker);
    }
  });

  if (installDrawContributions) {
    installRuntimeDrawContributionsToApp(app);
  }
  if (installGraphicRenderers) {
    installRuntimeGraphicRenderersToApp(app);
  }
  pickerTargets.forEach(serviceIdentifier => {
    installRuntimePickersToApp(app, serviceIdentifier);
  });
}

export function installRuntimeContributionModule(
  module: TRuntimeContributionModule,
  { app, legacy = true, targets }: IRuntimeContributionModuleInstallOptions = {}
): void {
  const runtimeContext = getRuntimeInstallerBindingContext();
  loadRuntimeContributionModuleToContext(runtimeContext, module);

  if (legacy) {
    preLoadAllModule();
    loadRuntimeContributionModuleToContext(getLegacyBindingContext(), module);
  }

  refreshRuntimeInstallerContributions();

  if (app) {
    installRuntimeContributionTargetsToApp(app, targets);
  }
}
