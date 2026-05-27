import {
  PickItemInterceptor,
  PickServiceInterceptor,
  DrawContribution,
  PickerService,
  application,
  configureRuntimeApplicationForApp,
  EnvContribution,
  getRuntimeInstallerBindingContext,
  getRuntimeInstallerGlobal,
  installRuntimePickersToApp,
  refreshRuntimeInstallerContributions,
  type IApp,
  type IContributionProvider,
  type IEnvParamsMap,
  type IGraphicPicker,
  type IPickItemInterceptorContribution,
  type IPickServiceInterceptorContribution
} from '@visactor/vrender-core';
import { bindBrowserCanvasModules } from '../canvas/contributions/browser/modules';
import { createContributionProvider, resolveContainerBinding } from '../common/explicit-binding';
import { BrowserEnvContribution } from '../env/contributions/browser-contribution';
import { bindArc3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc3d-module';
import { bindArcCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc-module';
import { bindAreaCanvasPickerContribution } from '../picker/contributions/canvas-picker/area-module';
import { bindCircleCanvasPickerContribution } from '../picker/contributions/canvas-picker/circle-module';
import { bindGlyphCanvasPickerContribution } from '../picker/contributions/canvas-picker/glyph-module';
import { bindImageCanvasPickerContribution } from '../picker/contributions/canvas-picker/image-module';
import { bindLineCanvasPickerContribution } from '../picker/contributions/canvas-picker/line-module';
import { bindPathCanvasPickerContribution } from '../picker/contributions/canvas-picker/path-module';
import { bindPolygonCanvasPickerContribution } from '../picker/contributions/canvas-picker/polygon-module';
import { bindPyramid3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/pyramid3d-module';
import { bindRect3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/rect3d-module';
import { bindRectCanvasPickerContribution } from '../picker/contributions/canvas-picker/rect-module';
import { bindRichtextCanvasPickerContribution } from '../picker/contributions/canvas-picker/richtext-module';
import { bindStarCanvasPickerContribution } from '../picker/contributions/canvas-picker/star-module';
import { bindSymbolCanvasPickerContribution } from '../picker/contributions/canvas-picker/symbol-module';
import { bindTextCanvasPickerContribution } from '../picker/contributions/canvas-picker/text-module';
import { CanvasPickerContribution } from '../picker/contributions/constants';
import { DefaultCanvasPickerService } from '../picker/canvas-picker-service';
import { bindBrowserWindowContribution } from '../window/contributions/browser-contribution';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;
type RuntimeEnvBindingStep = {
  bindEnv: (context: RuntimeBindingContext) => void;
  bindCanvasModules: (context: RuntimeBindingContext) => void;
  bindWindowContribution: (context: RuntimeBindingContext) => void;
};

const browserPickerInstallers = [
  bindArcCanvasPickerContribution,
  bindArc3dCanvasPickerContribution,
  bindAreaCanvasPickerContribution,
  bindCircleCanvasPickerContribution,
  bindGlyphCanvasPickerContribution,
  bindImageCanvasPickerContribution,
  bindLineCanvasPickerContribution,
  bindPathCanvasPickerContribution,
  bindPolygonCanvasPickerContribution,
  bindPyramid3dCanvasPickerContribution,
  bindRectCanvasPickerContribution,
  bindRect3dCanvasPickerContribution,
  bindRichtextCanvasPickerContribution,
  bindStarCanvasPickerContribution,
  bindSymbolCanvasPickerContribution,
  bindTextCanvasPickerContribution
];

function createRegistryContributionProvider<T>(entries: () => T[]): IContributionProvider<T> {
  return {
    getContributions: entries
  };
}

function bindBrowserEnv(container: RuntimeBindingContext): void {
  if (!(container as any).isBound?.(BrowserEnvContribution)) {
    container.bind(BrowserEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(BrowserEnvContribution);
  }
}

function bindBrowserCanvasPicker(container: RuntimeBindingContext): void {
  if (!container.isBound(DefaultCanvasPickerService)) {
    container
      .bind(DefaultCanvasPickerService)
      .toDynamicValue(
        () =>
          new DefaultCanvasPickerService(
            createContributionProvider(CanvasPickerContribution, container as any),
            resolveContainerBinding(container as any, DrawContribution),
            createContributionProvider(PickItemInterceptor, container as any),
            createContributionProvider(PickServiceInterceptor, container as any)
          )
      )
      .inSingletonScope();
  }

  if (container.isBound(PickerService)) {
    container.rebind(PickerService).toService(DefaultCanvasPickerService);
  } else {
    container.bind(PickerService).toService(DefaultCanvasPickerService);
  }
}

function createForcedEnvParams<TEnvParams>(envParams: TEnvParams | undefined): TEnvParams {
  if (envParams != null && (typeof envParams === 'object' || typeof envParams === 'function')) {
    const forcedEnvParams = Object.create(envParams as object);
    forcedEnvParams.force = true;
    return forcedEnvParams as TEnvParams;
  }

  return { force: true } as TEnvParams;
}

function activateBrowserRuntimeEnv(envParams?: IEnvParamsMap['browser']): void {
  getRuntimeInstallerGlobal().setEnv('browser', createForcedEnvParams(envParams));
}

function installBrowserRuntimeEnvToApp(
  app: IApp,
  { bindEnv, bindCanvasModules, bindWindowContribution }: RuntimeEnvBindingStep,
  envParams?: IEnvParamsMap['browser']
): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  bindEnv(bindingContext);
  bindCanvasModules(bindingContext);
  bindWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
  activateBrowserRuntimeEnv(envParams);
}

function configureBrowserPickerFactory(app: IApp): void {
  const bindingContext = getRuntimeInstallerBindingContext();
  const pickerContributions = createRegistryContributionProvider<IGraphicPicker>(
    () => app.registry.picker.getAll() as IGraphicPicker[]
  );
  const pickItemInterceptors = createRegistryContributionProvider<IPickItemInterceptorContribution>(() =>
    bindingContext.isBound(PickItemInterceptor)
      ? (bindingContext.getAll(PickItemInterceptor) as IPickItemInterceptorContribution[])
      : []
  );
  const pickServiceInterceptors = createRegistryContributionProvider<IPickServiceInterceptorContribution>(() =>
    bindingContext.isBound(PickServiceInterceptor)
      ? (bindingContext.getAll(PickServiceInterceptor) as IPickServiceInterceptorContribution[])
      : []
  );

  const global = getRuntimeInstallerGlobal();
  application.pickerServiceFactory = () =>
    new DefaultCanvasPickerService(pickerContributions, {} as any, pickItemInterceptors, pickServiceInterceptors);
  application.global = global;
}

export function installBrowserEnvToApp(app: IApp, envParams?: IEnvParamsMap['browser']): void {
  installBrowserRuntimeEnvToApp(
    app,
    {
      bindEnv: bindBrowserEnv,
      bindCanvasModules: bindBrowserCanvasModules,
      bindWindowContribution: bindBrowserWindowContribution
    },
    envParams
  );
}

export function installBrowserPickersToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  browserPickerInstallers.forEach(bindPicker => bindPicker(bindingContext));
  bindBrowserCanvasPicker(bindingContext);
  installRuntimePickersToApp(app, CanvasPickerContribution);
  configureBrowserPickerFactory(app);
}
