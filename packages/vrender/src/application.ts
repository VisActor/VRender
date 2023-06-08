import { IGraphicUtil } from './core/interface';
import { IGlobal, IGraphicService } from './interface';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
}

export const application = new Application();
