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
import { PickItemInterceptor, PickServiceInterceptor } from '@visactor/vrender-core/picker/constants';
import { bindLynxCanvasModules } from '../canvas/contributions/lynx/modules';
import { bindLynxEnv } from '../env/lynx';
import { loadMathPicker } from '../picker/math-module';
import { DefaultMathPickerService } from '../picker/math-picker-service';
import { MathPickerContribution } from '../picker/contributions/constants';
import { bindLynxWindowContribution } from '../window/contributions/lynx-contribution';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;

function createRegistryContributionProvider<T>(entries: () => T[]): IContributionProvider<T> {
  return { getContributions: entries };
}

function createForcedEnvParams(envParams?: IEnvParamsMap['lynx']): IEnvParamsMap['lynx'] {
  if (envParams != null && (typeof envParams === 'object' || typeof envParams === 'function')) {
    const forcedEnvParams = Object.create(envParams as object);
    forcedEnvParams.force = true;
    return forcedEnvParams as IEnvParamsMap['lynx'];
  }

  return { force: true } as IEnvParamsMap['lynx'];
}

function configureMathPickerFactory(app: IApp): void {
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
    new DefaultMathPickerService(pickerContributions, pickItemInterceptors, pickServiceInterceptors);
}

export function installLynxEnvToApp(app: IApp, envParams?: IEnvParamsMap['lynx']): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();

  bindLynxEnv(bindingContext);
  bindLynxCanvasModules(bindingContext);
  bindLynxWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
  getRuntimeInstallerGlobal().setEnv('lynx', createForcedEnvParams(envParams));
}

export function installLynxPickersToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();

  loadMathPicker(bindingContext);
  installRuntimePickersToApp(app, MathPickerContribution);
  configureMathPickerFactory(app);
}
