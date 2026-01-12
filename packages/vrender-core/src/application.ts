import type { ILayerService } from './interface/core';
import type { IGraphicUtil, ITransformUtil } from './interface/core';
import type { IGlobal, IGraphicService, IRenderService } from './interface';
import { RenderService } from './render/constants';
import { serviceRegistry, contributionRegistry } from './common/registry';
import type { ServiceRegistry, ContributionRegistry } from './common/registry';

export class Application {
  global: IGlobal;
  graphicUtil: IGraphicUtil;
  graphicService: IGraphicService;
  get renderService(): IRenderService {
    if (!this._renderService) {
      this._renderService = serviceRegistry.createInstance<IRenderService>(RenderService);
    }
    return this._renderService;
  }
  private _renderService: IRenderService;
  transformUtil: ITransformUtil;
  layerService: ILayerService;

  // 新的注册表系统
  readonly services: ServiceRegistry = serviceRegistry;
  readonly contributions: ContributionRegistry = contributionRegistry;
}

export const application = new Application();
