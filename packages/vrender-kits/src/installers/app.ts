import {
  PickItemInterceptor,
  PickServiceInterceptor,
  application,
  arc3dModule,
  arcModule,
  areaModule,
  circleModule,
  configureRuntimeApplicationForApp,
  getRuntimeInstallerBindingContext,
  getRuntimeInstallerGlobal,
  glyphModule,
  imageModule,
  installRuntimeDrawContributionsToApp,
  installRuntimeGraphicRenderersToApp,
  installRuntimePickersToApp,
  lineModule,
  pathModule,
  polygonModule,
  pyramid3dModule,
  rect3dModule,
  rectModule,
  refreshRuntimeInstallerContributions,
  registerArc3dGraphic,
  registerArcGraphic,
  registerAreaGraphic,
  registerCircleGraphic,
  registerGlyphGraphic,
  registerGroupGraphic,
  registerImageGraphic,
  registerLineGraphic,
  registerPathGraphic,
  registerPolygonGraphic,
  registerPyramid3dGraphic,
  registerRect3dGraphic,
  registerRectGraphic,
  registerRichtextGraphic,
  registerShadowRootGraphic,
  registerStarGraphic,
  registerSymbolGraphic,
  registerTextGraphic,
  registerWrapTextGraphic,
  richtextModule,
  starModule,
  symbolModule,
  textModule,
  type EnvType,
  type IContributionProvider,
  type IEnvParamsMap,
  type IGraphicPicker,
  type IPickItemInterceptorContribution,
  type IPickServiceInterceptorContribution,
  type IApp
} from '@visactor/vrender-core';
import { bindBrowserCanvasModules } from '../canvas/contributions/browser/modules';
import { bindFeishuCanvasModules } from '../canvas/contributions/feishu/modules';
import { bindHarmonyCanvasModules } from '../canvas/contributions/harmony/modules';
import { bindLynxCanvasModules } from '../canvas/contributions/lynx/modules';
import { bindNodeCanvasModules } from '../canvas/contributions/node/modules';
import { bindTaroCanvasModules } from '../canvas/contributions/taro/modules';
import { bindTTCanvasModules } from '../canvas/contributions/tt/modules';
import { bindWxCanvasModules } from '../canvas/contributions/wx/modules';
import { bindBrowserEnv } from '../env/browser';
import { bindFeishuEnv } from '../env/feishu';
import { bindHarmonyEnv } from '../env/harmony';
import { bindLynxEnv } from '../env/lynx';
import { bindNodeEnv } from '../env/node';
import { bindTaroEnv } from '../env/taro';
import { bindTTEnv } from '../env/tt';
import { bindWxEnv } from '../env/wx';
import { bindArc3dCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc3d-module';
import { bindArcCanvasPickerContribution } from '../picker/contributions/canvas-picker/arc-module';
import { bindAreaCanvasPickerContribution } from '../picker/contributions/canvas-picker/area-module';
import { bindCircleCanvasPickerContribution } from '../picker/contributions/canvas-picker/circle-module';
import { bindGifImageCanvasPickerContribution } from '../picker/contributions/canvas-picker/gif-image-module';
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
import { CanvasPickerContribution, MathPickerContribution } from '../picker/contributions/constants';
import { bindCanvasPicker } from '../picker/canvas-module';
import { DefaultCanvasPickerService } from '../picker/canvas-picker-service';
import { loadMathPicker } from '../picker/math-module';
import { DefaultMathPickerService } from '../picker/math-picker-service';
import { registerGifGraphic } from '../register/register-gif';
import { bindGifImageRenderContribution } from '../render/contributions/canvas/gif-image-module';
import { bindBrowserWindowContribution } from '../window/contributions/browser-contribution';
import { bindFeishuWindowContribution } from '../window/contributions/feishu-contribution';
import { bindHarmonyWindowContribution } from '../window/contributions/harmony-contribution';
import { bindLynxWindowContribution } from '../window/contributions/lynx-contribution';
import { bindNodeWindowContribution } from '../window/contributions/node-contribution';
import { bindTaroWindowContribution } from '../window/contributions/taro-contribution';
import { bindTTWindowContribution } from '../window/contributions/tt-contribution';
import { bindWxWindowContribution } from '../window/contributions/wx-contribution';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;
type RuntimeEnvInstallOptions<TEnv extends EnvType> = {
  envParams?: IEnvParamsMap[TEnv];
  force?: boolean;
};
type RuntimeEnvBindingStep = {
  bindEnv: (context: RuntimeBindingContext) => void;
  bindCanvasModules: (context: RuntimeBindingContext) => void;
  bindWindowContribution: (context: RuntimeBindingContext) => void;
};

type RuntimeGraphicInstallStep = {
  register: () => void;
  bindModule?: (context: { bind: RuntimeBindingContext['bind'] }) => void;
};

const defaultGraphicInstallSteps: RuntimeGraphicInstallStep[] = [
  { register: registerArcGraphic, bindModule: arcModule as any },
  { register: registerArc3dGraphic, bindModule: arc3dModule as any },
  { register: registerAreaGraphic, bindModule: areaModule as any },
  { register: registerCircleGraphic, bindModule: circleModule as any },
  { register: registerGlyphGraphic, bindModule: glyphModule as any },
  { register: registerGroupGraphic },
  { register: registerImageGraphic, bindModule: imageModule as any },
  { register: registerLineGraphic, bindModule: lineModule as any },
  { register: registerPathGraphic, bindModule: pathModule as any },
  { register: registerPolygonGraphic, bindModule: polygonModule as any },
  { register: registerPyramid3dGraphic, bindModule: pyramid3dModule as any },
  { register: registerRectGraphic, bindModule: rectModule as any },
  { register: registerRect3dGraphic, bindModule: rect3dModule as any },
  { register: registerRichtextGraphic, bindModule: richtextModule as any },
  { register: registerShadowRootGraphic },
  { register: registerStarGraphic, bindModule: starModule as any },
  { register: registerSymbolGraphic, bindModule: symbolModule as any },
  { register: registerTextGraphic, bindModule: textModule as any },
  { register: registerWrapTextGraphic },
  { register: registerGifGraphic }
];

let defaultGraphicsInstalled = false;

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
  bindTextCanvasPickerContribution,
  bindGifImageCanvasPickerContribution
];

function createRegistryContributionProvider<T>(entries: () => T[]): IContributionProvider<T> {
  return {
    getContributions: entries
  };
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

function configureNodePickerFactory(app: IApp): void {
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

function ensureDefaultGraphicsInstalled(): void {
  if (defaultGraphicsInstalled) {
    return;
  }

  const bindingContext = getRuntimeInstallerBindingContext();
  defaultGraphicsInstalled = true;
  defaultGraphicInstallSteps.forEach(({ register, bindModule }) => {
    register();
    bindModule?.({ bind: bindingContext.bind });
  });
  bindGifImageRenderContribution(bindingContext);
  refreshRuntimeInstallerContributions();
}

function createForcedEnvParams<TEnv extends EnvType>(envParams: IEnvParamsMap[TEnv] | undefined): IEnvParamsMap[TEnv] {
  if (envParams != null && (typeof envParams === 'object' || typeof envParams === 'function')) {
    const forcedEnvParams = Object.create(envParams as object);
    forcedEnvParams.force = true;
    return forcedEnvParams as IEnvParamsMap[TEnv];
  }

  return { force: true } as IEnvParamsMap[TEnv];
}

function activateRuntimeEnv<TEnv extends EnvType>(
  env: TEnv,
  { envParams, force = false }: RuntimeEnvInstallOptions<TEnv> = {}
): void {
  getRuntimeInstallerGlobal().setEnv(env, force ? createForcedEnvParams(envParams) : envParams);
}

function installRuntimeEnvToApp<TEnv extends EnvType>(
  app: IApp,
  env: TEnv,
  { bindEnv, bindCanvasModules, bindWindowContribution }: RuntimeEnvBindingStep,
  envParams?: IEnvParamsMap[TEnv]
): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  bindEnv(bindingContext);
  bindCanvasModules(bindingContext);
  bindWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
  activateRuntimeEnv(env, { envParams, force: true });
}

export function installBrowserEnvToApp(app: IApp, envParams?: IEnvParamsMap['browser']): void {
  installRuntimeEnvToApp(
    app,
    'browser',
    {
      bindEnv: bindBrowserEnv,
      bindCanvasModules: bindBrowserCanvasModules,
      bindWindowContribution: bindBrowserWindowContribution
    },
    envParams
  );
}

export function installNodeEnvToApp(app: IApp, envParams?: IEnvParamsMap['node']): void {
  installRuntimeEnvToApp(
    app,
    'node',
    {
      bindEnv: bindNodeEnv,
      bindCanvasModules: bindNodeCanvasModules,
      bindWindowContribution: bindNodeWindowContribution
    },
    envParams
  );
}

export function installTaroEnvToApp(app: IApp, envParams?: IEnvParamsMap['taro']): void {
  installRuntimeEnvToApp(
    app,
    'taro',
    {
      bindEnv: bindTaroEnv,
      bindCanvasModules: bindTaroCanvasModules,
      bindWindowContribution: bindTaroWindowContribution
    },
    envParams
  );
}

export function installFeishuEnvToApp(app: IApp, envParams?: IEnvParamsMap['feishu']): void {
  installRuntimeEnvToApp(
    app,
    'feishu',
    {
      bindEnv: bindFeishuEnv,
      bindCanvasModules: bindFeishuCanvasModules,
      bindWindowContribution: bindFeishuWindowContribution
    },
    envParams
  );
}

export function installTTEnvToApp(app: IApp, envParams?: IEnvParamsMap['tt']): void {
  installRuntimeEnvToApp(
    app,
    'tt',
    {
      bindEnv: bindTTEnv,
      bindCanvasModules: bindTTCanvasModules,
      bindWindowContribution: bindTTWindowContribution
    },
    envParams
  );
}

export function installWxEnvToApp(app: IApp, envParams?: IEnvParamsMap['wx']): void {
  installRuntimeEnvToApp(
    app,
    'wx',
    {
      bindEnv: bindWxEnv,
      bindCanvasModules: bindWxCanvasModules,
      bindWindowContribution: bindWxWindowContribution
    },
    envParams
  );
}

export function installLynxEnvToApp(app: IApp, envParams?: IEnvParamsMap['lynx']): void {
  installRuntimeEnvToApp(
    app,
    'lynx',
    {
      bindEnv: bindLynxEnv,
      bindCanvasModules: bindLynxCanvasModules,
      bindWindowContribution: bindLynxWindowContribution
    },
    envParams
  );
}

export function installHarmonyEnvToApp(app: IApp, envParams?: IEnvParamsMap['harmony']): void {
  installRuntimeEnvToApp(
    app,
    'harmony',
    {
      bindEnv: bindHarmonyEnv,
      bindCanvasModules: bindHarmonyCanvasModules,
      bindWindowContribution: bindHarmonyWindowContribution
    },
    envParams
  );
}

export function installDefaultGraphicsToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  ensureDefaultGraphicsInstalled();
  installRuntimeDrawContributionsToApp(app);
  installRuntimeGraphicRenderersToApp(app);
}

export function installBrowserPickersToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  browserPickerInstallers.forEach(bindPicker => bindPicker(bindingContext));
  bindCanvasPicker(bindingContext);
  installRuntimePickersToApp(app, CanvasPickerContribution);
  configureBrowserPickerFactory(app);
}

export function installNodePickersToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  loadMathPicker(bindingContext);
  installRuntimePickersToApp(app, MathPickerContribution);
  configureNodePickerFactory(app);
}

export function installMathPickersToApp(app: IApp): void {
  installNodePickersToApp(app);
}
