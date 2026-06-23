import type { IGraphicUtil, ILayerService, ITransformUtil } from './interface/core';
import type {
  ICanvasFactory,
  IContext2dFactory,
  IGlobal,
  IGraphicService,
  ILayerHandlerContribution,
  IPickerService,
  IPluginService,
  IRenderService,
  IWindow,
  IWindowHandlerContribution,
  LayerMode
} from './interface';
import type { IDrawContribution } from './interface/render';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
  renderService: IRenderService;
  renderServiceFactory?: () => IRenderService;
  pluginService?: IPluginService;
  pluginServiceFactory?: () => IPluginService;
  pickerServiceFactory?: () => IPickerService;
  windowFactory?: () => IWindow;
  windowHandlerFactory?: (env: string) => IWindowHandlerContribution;
  layerHandlerFactory?: (layerMode: LayerMode) => ILayerHandlerContribution;
  incrementalDrawContributionFactory?: () => IDrawContribution;
  canvasFactory?: (env: string) => ICanvasFactory | undefined;
  context2dFactory?: (env: string) => IContext2dFactory | undefined;
  transformUtil: ITransformUtil;
  layerService: ILayerService;
}

export const application = new Application();
