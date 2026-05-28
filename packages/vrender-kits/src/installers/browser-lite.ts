import {
  configureRuntimeApplicationForApp,
  getRuntimeInstallerBindingContext,
  getRuntimeInstallerGlobal,
  installRuntimePickersToApp,
  refreshRuntimeInstallerContributions
} from '@visactor/vrender-core/entries/runtime-installer';
import type {
  IApp,
  IContributionProvider,
  IEnvParamsMap,
  IGraphicPicker,
  IPickItemInterceptorContribution,
  IPickServiceInterceptorContribution
} from '@visactor/vrender-core';
import { application } from '@visactor/vrender-core/application';
import { EnvContribution } from '@visactor/vrender-core/constants';
import { PickItemInterceptor, PickerService, PickServiceInterceptor } from '@visactor/vrender-core/picker/constants';
import { DrawContribution } from '@visactor/vrender-core/render/symbol';
import { bindBrowserCanvasModules } from '../canvas/contributions/browser/modules';
import { createContributionProvider, resolveContainerBinding } from '../common/explicit-binding';
import { BrowserEnvContribution } from '../env/contributions/browser-contribution';
import { DefaultCanvasPickerService } from '../picker/canvas-picker-service';
import { bindAreaCanvasPickerContribution } from '../picker/contributions/canvas-picker/area-module';
import { bindCircleCanvasPickerContribution } from '../picker/contributions/canvas-picker/circle-module';
import { bindGlyphCanvasPickerContribution } from '../picker/contributions/canvas-picker/glyph-module';
import { bindLineCanvasPickerContribution } from '../picker/contributions/canvas-picker/line-module';
import { bindRectCanvasPickerContribution } from '../picker/contributions/canvas-picker/rect-module';
import { bindSymbolCanvasPickerContribution } from '../picker/contributions/canvas-picker/symbol-module';
import { bindTextCanvasPickerContribution } from '../picker/contributions/canvas-picker/text-module';
import { CanvasPickerContribution } from '../picker/contributions/constants';
import { bindBrowserWindowContribution } from '../window/contributions/browser-contribution';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;

const browserLitePickerInstallers = [
  bindAreaCanvasPickerContribution,
  bindCircleCanvasPickerContribution,
  bindGlyphCanvasPickerContribution,
  bindLineCanvasPickerContribution,
  bindRectCanvasPickerContribution,
  bindSymbolCanvasPickerContribution,
  bindTextCanvasPickerContribution
];

function createRegistryContributionProvider<T>(entries: () => T[]): IContributionProvider<T> {
  return {
    getContributions: entries
  };
}

function bindBrowserLiteEnv(container: RuntimeBindingContext): void {
  if (!(container as any).isBound?.(BrowserEnvContribution)) {
    container.bind(BrowserEnvContribution).toSelf().inSingletonScope();
    container.bind(EnvContribution).toService(BrowserEnvContribution);
  }
}

function bindBrowserLiteCanvasPicker(container: RuntimeBindingContext): void {
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

function configureBrowserLitePickerFactory(app: IApp): void {
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

  application.pickerServiceFactory = () =>
    new DefaultCanvasPickerService(pickerContributions, {} as any, pickItemInterceptors, pickServiceInterceptors);
  application.global = getRuntimeInstallerGlobal();
}

export function installBrowserLiteEnvToApp(app: IApp, envParams?: IEnvParamsMap['browser']): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();

  bindBrowserLiteEnv(bindingContext);
  bindBrowserCanvasModules(bindingContext);
  bindBrowserWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
  getRuntimeInstallerGlobal().setEnv('browser', createForcedEnvParams(envParams));
}

export function installBrowserLitePickersToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();

  browserLitePickerInstallers.forEach(bindPicker => bindPicker(bindingContext));
  bindBrowserLiteCanvasPicker(bindingContext);
  installRuntimePickersToApp(app, CanvasPickerContribution);
  configureBrowserLitePickerFactory(app);
}
