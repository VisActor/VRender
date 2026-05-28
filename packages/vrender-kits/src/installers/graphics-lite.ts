import {
  configureRuntimeApplicationForApp,
  getRuntimeInstallerBindingContext,
  installRuntimeDrawContributionsToApp,
  installRuntimeGraphicRenderersToApp,
  refreshRuntimeInstallerContributions
} from '@visactor/vrender-core/entries/runtime-installer';
import {
  registerAreaGraphic,
  registerCircleGraphic,
  registerGlyphGraphic,
  registerGroupGraphic,
  registerLineGraphic,
  registerRectGraphic,
  registerShadowRootGraphic,
  registerSymbolGraphic,
  registerTextGraphic,
  registerWrapTextGraphic
} from '@visactor/vrender-core/register/graphic';
import {
  areaModule,
  circleModule,
  glyphModule,
  lineModule,
  rectModule,
  symbolModule,
  textModule
} from '@visactor/vrender-core/graphic/modules';
import type { IApp } from '@visactor/vrender-core';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;
type RuntimeGraphicInstallStep = {
  register: () => void;
  bindModule?: (context: { bind: RuntimeBindingContext['bind'] }) => void;
};

const liteGraphicInstallSteps: RuntimeGraphicInstallStep[] = [
  { register: registerAreaGraphic, bindModule: areaModule as any },
  { register: registerCircleGraphic, bindModule: circleModule as any },
  { register: registerGlyphGraphic, bindModule: glyphModule as any },
  { register: registerGroupGraphic },
  { register: registerLineGraphic, bindModule: lineModule as any },
  { register: registerRectGraphic, bindModule: rectModule as any },
  { register: registerShadowRootGraphic },
  { register: registerSymbolGraphic, bindModule: symbolModule as any },
  { register: registerTextGraphic, bindModule: textModule as any },
  { register: registerWrapTextGraphic }
];

let liteGraphicsInstalled = false;

function ensureLiteGraphicsInstalled(): void {
  if (liteGraphicsInstalled) {
    return;
  }

  const bindingContext = getRuntimeInstallerBindingContext();
  liteGraphicsInstalled = true;
  liteGraphicInstallSteps.forEach(({ register, bindModule }) => {
    register();
    bindModule?.({ bind: bindingContext.bind });
  });
  refreshRuntimeInstallerContributions();
}

export function installLiteGraphicsToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  ensureLiteGraphicsInstalled();
  installRuntimeDrawContributionsToApp(app);
  installRuntimeGraphicRenderersToApp(app);
}
