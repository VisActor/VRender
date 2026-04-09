/**
 * @deprecated Legacy global module bootstrap retained for compatibility.
 * Prefer `createBrowserApp()`, `createNodeApp()`, or `createMiniappApp()` from `./entries`
 * instead of relying on the shared global container/module initialization path.
 */
// import allocatorModule from './allocator/allocator-modules';
// import loadPickContributions from './picker/contributions/modules';
// import loadCanvasContributions from './canvas/contributions/modules';
// import { IMat4Allocate, IMatrixAllocate, Mat4Allocate, MatrixAllocate } from './allocator/matrix-allocate';
// import { GlobalPickerService } from './picker/constants';
import type { IGraphicService, IPluginService, IRenderService, IWindowHandlerContribution } from './interface';
import { application } from './application';
import type { IGraphicUtil, ILayerService, ITransformUtil } from './interface/core';
import { GraphicService } from './graphic/constants';
import {
  DynamicLayerHandlerContribution,
  GraphicUtil,
  LayerService,
  StaticLayerHandlerContribution,
  TransformUtil,
  VirtualLayerHandlerContribution
} from './core/constants';
import { RenderService } from './render/constants';
import { PluginService } from './plugins/constants';
import { PickerService } from './picker/constants';
import { CanvasFactory, Context2dFactory } from './canvas/constants';
import { IncrementalDrawContribution } from './render/contributions/render/symbol';
import { DefaultWindow, WindowHandlerContribution } from './core/window';
import { vglobal } from './global';
import { createLegacySingletonProxy, resolveLegacyNamed, resolveLegacySingleton } from './legacy/bootstrap';
// loadPickContributions(container);
// loadCanvasContributions(container);

export { vglobal } from './global';
export {
  preLoadAllModule,
  getLegacyBindingContext,
  type ILegacyBindContext,
  type ILegacyBindingContext
} from './legacy/bootstrap';
export const graphicUtil = createLegacySingletonProxy<IGraphicUtil>(() =>
  resolveLegacySingleton<IGraphicUtil>(GraphicUtil)
);
export const transformUtil = createLegacySingletonProxy<ITransformUtil>(() =>
  resolveLegacySingleton<ITransformUtil>(TransformUtil)
);
export const graphicService = createLegacySingletonProxy<IGraphicService>(() =>
  resolveLegacySingleton<IGraphicService>(GraphicService)
);
export const layerService = createLegacySingletonProxy<ILayerService>(() =>
  resolveLegacySingleton<ILayerService>(LayerService)
);

function resolveLegacyWindowHandler(env: string): IWindowHandlerContribution {
  const handler = resolveLegacyNamed<IWindowHandlerContribution>(WindowHandlerContribution, env);
  if (!handler) {
    throw new Error(`Window handler is not configured for env: ${env}`);
  }
  return handler;
}

export function configureLegacyApplication(): void {
  application.global = vglobal;
  application.graphicUtil = graphicUtil;
  application.transformUtil = transformUtil;
  application.graphicService = graphicService;
  application.layerService = layerService;
  application.canvasFactory = env => resolveLegacyNamed(CanvasFactory, env);
  application.context2dFactory = env => resolveLegacyNamed(Context2dFactory, env);
  application.windowFactory = () => new DefaultWindow(application.global);
  application.windowHandlerFactory = env => resolveLegacyWindowHandler(env);
  application.renderServiceFactory = () => resolveLegacySingleton<IRenderService>(RenderService);
  application.renderService = createLegacySingletonProxy<IRenderService>(() =>
    resolveLegacySingleton<IRenderService>(RenderService)
  );
  application.pluginServiceFactory = () => resolveLegacySingleton<IPluginService>(PluginService);
  application.pluginService = createLegacySingletonProxy<IPluginService>(() =>
    resolveLegacySingleton<IPluginService>(PluginService)
  );
  application.pickerServiceFactory = () => resolveLegacySingleton(PickerService);
  application.layerHandlerFactory = layerMode => {
    if (layerMode === 'static') {
      return resolveLegacySingleton(StaticLayerHandlerContribution);
    }
    if (layerMode === 'dynamic') {
      return resolveLegacySingleton(DynamicLayerHandlerContribution);
    }
    return resolveLegacySingleton(VirtualLayerHandlerContribution);
  };
  application.incrementalDrawContributionFactory = () => resolveLegacySingleton(IncrementalDrawContribution);
}

configureLegacyApplication();
// export const matrixAllocate = container.get<IMatrixAllocate>(MatrixAllocate);
// export const mat4Allocate = container.get<IMat4Allocate>(Mat4Allocate);
// export const canvasAllocate = container.get<ICanvasAllocate>(CanvasAllocate);
// export const arcAllocate = container.get<IArcAllocate>(ArcAllocate);
// export const areaAllocate = container.get<IAreaAllocate>(AreaAllocate);
// export const circleAllocate = container.get<ICircleAllocate>(CircleAllocate);
// export const lineAllocate = container.get<ILineAllocate>(LineAllocate);
// export const pathAllocate = container.get<IPathAllocate>(PathAllocate);
// export const rectAllocate = container.get<IRectAllocate>(RectAllocate);
// export const symbolAllocate = container.get<ISymbolAllocate>(SymbolAllocate);
// export const textAllocate = container.get<ITextAllocate>(TextAllocate);
// export const pickerService = container.get<IPickerService>(GlobalPickerService);
