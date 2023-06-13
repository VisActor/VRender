import { ILayerService } from './core/interface';
import { IGraphicUtil, ITransformUtil } from './core/interface';
import { IGlobal, IGraphicService } from './interface';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
  transformUtil: ITransformUtil;
  layerService: ILayerService;
}

export const application = new Application();
