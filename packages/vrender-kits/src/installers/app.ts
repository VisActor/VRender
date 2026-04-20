import type {
  IContributionProvider,
  IGraphicPicker,
  IPickItemInterceptorContribution,
  IPickServiceInterceptorContribution
} from '@visactor/vrender-core';
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
  type IApp
} from '@visactor/vrender-core';
import { bindBrowserCanvasModules } from '../canvas/contributions/browser/modules';
import { bindNodeCanvasModules } from '../canvas/contributions/node/modules';
import { bindBrowserEnv } from '../env/browser';
import { bindNodeEnv } from '../env/node';
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
import { bindNodeWindowContribution } from '../window/contributions/node-contribution';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;

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

export function installBrowserEnvToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  bindBrowserEnv(bindingContext);
  bindBrowserCanvasModules(bindingContext);
  bindBrowserWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
  getRuntimeInstallerGlobal().setEnv('browser', { force: true } as any);
}

export function installNodeEnvToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  const bindingContext = getRuntimeInstallerBindingContext();
  bindNodeEnv(bindingContext);
  bindNodeCanvasModules(bindingContext);
  bindNodeWindowContribution(bindingContext);
  refreshRuntimeInstallerContributions();
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
