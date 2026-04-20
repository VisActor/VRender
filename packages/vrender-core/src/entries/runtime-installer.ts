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
import { createLegacyBindingContext, type ILegacyBindingContext } from '../legacy/binding-context';
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

const runtimeInstallerContext = createLegacyBindingContext();
let runtimeInstallerPreloaded = false;
let runtimeGlobal: IGlobal | undefined;

function ensureRuntimeInstallerPreloaded(): void {
  if (runtimeInstallerPreloaded) {
    return;
  }

  runtimeInstallerPreloaded = true;
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
  runtimeGlobal ??= new DefaultGlobal(
    createContributionProvider<IEnvContribution>(EnvContribution, runtimeInstallerContext)
  );
  return runtimeGlobal;
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

export function installRuntimeGraphicRenderersToApp(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const renderers = bindingContext.getAll(GraphicRender);

  app.registry.renderer.clear();
  registerRuntimeEntries(
    (key, renderer) => {
      renderer?.reInit?.();
      app.registry.renderer.register(key, renderer);
    },
    renderers as any[],
    'runtime-renderer'
  );
}

export function installRuntimeDrawContributionsToApp(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const contributions = bindingContext.getAll(DrawItemInterceptor) as IDrawItemInterceptorContribution[];

  app.context.registry.contribution.clear(DrawItemInterceptor);
  contributions.forEach(contribution => {
    app.context.registry.contribution.register(DrawItemInterceptor, contribution);
  });
}

export function installRuntimePickersToApp<T extends IGraphicPicker>(
  app: IApp,
  serviceIdentifier: ServiceIdentifier<T>
): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  refreshRuntimeInstallerContributions();
  const pickers = bindingContext.getAll(serviceIdentifier);

  app.registry.picker.clear();
  registerRuntimeEntries(
    (key, picker) => app.registry.picker.register(key, picker),
    pickers as any[],
    'runtime-picker'
  );
}
