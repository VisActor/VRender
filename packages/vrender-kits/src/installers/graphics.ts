import {
  configureRuntimeApplicationForApp,
  getRuntimeInstallerBindingContext,
  installRuntimeDrawContributionsToApp,
  installRuntimeGraphicRenderersToApp,
  refreshRuntimeInstallerContributions
} from '@visactor/vrender-core/entries/runtime-installer';
import {
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
  registerWrapTextGraphic
} from '@visactor/vrender-core/register/graphic';
import {
  arc3dModule,
  arcModule,
  areaModule,
  circleModule,
  glyphModule,
  imageModule,
  lineModule,
  pathModule,
  polygonModule,
  pyramid3dModule,
  rect3dModule,
  rectModule,
  richtextModule,
  starModule,
  symbolModule,
  textModule
} from '@visactor/vrender-core/graphic/modules';
import type { IApp } from '@visactor/vrender-core';

type RuntimeBindingContext = ReturnType<typeof getRuntimeInstallerBindingContext>;
type RuntimeGraphicInstallStep = {
  register: () => void;
  bindModule?: (context: { bind: RuntimeBindingContext['bind'] }) => void;
};

const standardGraphicInstallSteps: RuntimeGraphicInstallStep[] = [
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
  { register: registerWrapTextGraphic }
];

let standardGraphicsInstalled = false;

function ensureStandardGraphicsInstalled(): void {
  if (standardGraphicsInstalled) {
    return;
  }

  const bindingContext = getRuntimeInstallerBindingContext();
  standardGraphicsInstalled = true;
  standardGraphicInstallSteps.forEach(({ register, bindModule }) => {
    register();
    bindModule?.({ bind: bindingContext.bind });
  });
  refreshRuntimeInstallerContributions();
}

export function installStandardGraphicsToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  ensureStandardGraphicsInstalled();
  installRuntimeDrawContributionsToApp(app);
  installRuntimeGraphicRenderersToApp(app);
}
