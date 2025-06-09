import type { ILayerService } from './interface/core';
import type { IGraphicUtil, ITransformUtil } from './interface/core';
import type { IGlobal, IGraphicService, IRenderService } from './interface';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
  renderService: IRenderService;
  transformUtil: ITransformUtil;
  layerService: ILayerService;
}

export const application = new Application();
