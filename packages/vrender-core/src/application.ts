/**
 * @deprecated 使用 application-helpers.ts 中的函数替代
 * 保留此文件仅为向后兼容
 */
import type { ILayerService } from './interface/core';
import type { IGraphicUtil, ITransformUtil } from './interface/core';
import type { IGlobal, IGraphicService, IRenderService } from './interface';
import { serviceRegistry, contributionRegistry } from './common/registry';
import type { ServiceRegistry, ContributionRegistry } from './common/registry';
import { VGlobal } from './constants';
import { GraphicUtil, TransformUtil, LayerService } from './core/constants';
import { GraphicService } from './graphic/constants';
import { RenderService } from './render/constants';

/**
 * @deprecated 使用 serviceRegistry 和 contributionRegistry 直接访问
 */
export class Application {
  get global(): IGlobal {
    return serviceRegistry.get(VGlobal);
  }
  set global(value: IGlobal) {
    // 向后兼容，但不做任何事
  }

  get graphicUtil(): IGraphicUtil {
    return serviceRegistry.get(GraphicUtil);
  }
  set graphicUtil(value: IGraphicUtil) {
    // 向后兼容，但不做任何事
  }

  get graphicService(): IGraphicService {
    return serviceRegistry.get(GraphicService);
  }
  set graphicService(value: IGraphicService) {
    // 向后兼容，但不做任何事
  }

  get renderService(): IRenderService {
    if (!this._renderService) {
      this._renderService = serviceRegistry.createInstance<IRenderService>(RenderService);
    }
    return this._renderService;
  }
  private _renderService: IRenderService;

  get transformUtil(): ITransformUtil {
    return serviceRegistry.get(TransformUtil);
  }
  set transformUtil(value: ITransformUtil) {
    // 向后兼容，但不做任何事
  }

  get layerService(): ILayerService {
    return serviceRegistry.get(LayerService);
  }
  set layerService(value: ILayerService) {
    // 向后兼容，但不做任何事
  }

  // 新的注册表系统
  readonly services: ServiceRegistry = serviceRegistry;
  readonly contributions: ContributionRegistry = contributionRegistry;
}

/**
 * @deprecated 使用 serviceRegistry 和 contributionRegistry 直接访问，或使用 application-helpers 中的函数
 */
export const application = new Application();
