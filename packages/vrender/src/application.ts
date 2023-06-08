import { IGraphicUtil } from './core/interface';
import { IGlobal } from './interface';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
}

export const application = new Application();
