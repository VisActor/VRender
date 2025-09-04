import type { ILayerService } from './interface/core';
import type { IGraphicUtil, ITransformUtil } from './interface/core';
import type { IGlobal, IGraphicService, IRenderService } from './interface';
import { container } from './container';
import { RenderService } from './render/constants';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
  get renderService(): IRenderService {
    if (!this._renderService) {
      this._renderService = container.get<IRenderService>(RenderService);
    }
    return this._renderService;
  }
  private _renderService: IRenderService;
  transformUtil: ITransformUtil;
  layerService: ILayerService;
}

export const application = new Application();
