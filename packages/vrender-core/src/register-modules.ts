/**
 * 新的模块注册系统 - 替代 ContainerModule 模式
 *
 * 这个文件将所有服务注册到 serviceRegistry 和 contributionRegistry
 */
import { serviceRegistry, contributionRegistry } from './common/registry';
import { VGlobal } from './constants';
import {
  GraphicUtil,
  LayerService,
  TransformUtil,
  StaticLayerHandlerContribution,
  DynamicLayerHandlerContribution,
  VirtualLayerHandlerContribution
} from './core/constants';
import { DefaultWindow, VWindow } from './core/window';
import { GraphicService, GraphicCreator } from './graphic/constants';
import { RenderService } from './render/constants';
import type { IDrawContribution } from './interface/render';
import {
  DrawContribution,
  GraphicRender,
  IncrementalDrawContribution,
  GroupRender
} from './render/contributions/render/symbol';
import {
  CommonDrawItemInterceptorContribution,
  DrawItemInterceptor
} from './render/contributions/render/draw-interceptor';
import { PickerService, GlobalPickerService, PickItemInterceptor, PickServiceInterceptor } from './picker/constants';
import { PluginService } from './plugins/constants';
import { DefaultGlobal } from './core/global';
import { DefaultGraphicUtil, DefaultTransformUtil } from './core/graphic-utils';
import { DefaultLayerService } from './core/layer-service';
import { DefaultGraphicService } from './graphic/graphic-service/graphic-service';
import { graphicCreator } from './graphic/graphic-creator';
import { DefaultDrawContribution } from './render/contributions/render/draw-contribution';
import { DefaultIncrementalDrawContribution } from './render/contributions/render/incremental-draw-contribution';
import { DefaultRenderService } from './render/render-service';
import { DefaultCanvasGroupRender } from './render/contributions/render/group-render';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseInteractiveRenderContribution
} from './render/contributions/render/contributions/base-contribution-render';
import { DefaultBaseTextureRenderContribution } from './render/contributions/render/contributions/base-texture-contribution-render';
import { DefaultGlobalPickerService } from './picker/global-picker-service';
import {
  Canvas3DPickItemInterceptor,
  InteractivePickItemInterceptorContribution,
  ShadowRootPickItemInterceptorContribution
} from './picker/pick-interceptor';
import { DefaultPluginService } from './plugins/plugin-service';
import { CanvasLayerHandlerContribution } from './core/contributions/layerHandler/canvas2d-contribution';
import { OffscreenLayerHandlerContribution } from './core/contributions/layerHandler/offscreen2d-contribution';
import { EmptyLayerHandlerContribution } from './core/contributions/layerHandler/empty-contribution';
import {
  TextMeasureContribution,
  DefaultTextMeasureContribution
} from './core/contributions/textMeasure/textMeasure-contribution';

// ============ Core 模块注册 ============

export function registerCoreModule() {
  // 单例服务
  serviceRegistry.registerSingletonFactory(VGlobal, () => new DefaultGlobal());
  serviceRegistry.registerSingletonFactory(GraphicUtil, () => new DefaultGraphicUtil());
  serviceRegistry.registerSingletonFactory(TransformUtil, () => new DefaultTransformUtil());
  serviceRegistry.registerSingletonFactory(LayerService, () => new DefaultLayerService());

  // LayerHandler 工厂 - 每个 Layer 一个实例
  serviceRegistry.registerFactory(StaticLayerHandlerContribution, () => new CanvasLayerHandlerContribution());
  serviceRegistry.registerFactory(DynamicLayerHandlerContribution, () => new OffscreenLayerHandlerContribution());
  serviceRegistry.registerFactory(VirtualLayerHandlerContribution, () => new EmptyLayerHandlerContribution());

  // TextMeasure 贡献
  contributionRegistry.register(TextMeasureContribution, new DefaultTextMeasureContribution());

  // 工厂服务 - Window 每次创建新实例
  serviceRegistry.registerFactory(VWindow, () => new DefaultWindow());
}

// ============ Graphic 模块注册 ============

export function registerGraphicModule() {
  serviceRegistry.registerSingletonFactory(GraphicService, () => new DefaultGraphicService());
  serviceRegistry.registerSingleton(GraphicCreator, graphicCreator);
}

// ============ Render 模块注册 ============

export function registerRenderModule() {
  // DrawContribution 单例
  serviceRegistry.registerSingletonFactory(DrawContribution, () => new DefaultDrawContribution());

  // IncrementalDrawContribution 单例
  serviceRegistry.registerSingletonFactory(IncrementalDrawContribution, () => new DefaultIncrementalDrawContribution());

  // RenderService 工厂 - 每个 Stage 一个实例
  serviceRegistry.registerFactory(RenderService, () => {
    const drawContribution = serviceRegistry.get(DrawContribution) as IDrawContribution;
    return new DefaultRenderService(drawContribution);
  });
}

// ============ Render Contributions 注册 ============

export function registerRenderContributions() {
  // Group 渲染器
  const groupRender = new DefaultCanvasGroupRender();
  serviceRegistry.registerSingleton(GroupRender, groupRender);
  contributionRegistry.register(GraphicRender, groupRender);

  // DrawItemInterceptor
  const commonInterceptor = new CommonDrawItemInterceptorContribution();
  contributionRegistry.register(DrawItemInterceptor, commonInterceptor);

  // 基础贡献 - 单例
  serviceRegistry.registerSingleton(
    DefaultBaseBackgroundRenderContribution,
    new DefaultBaseBackgroundRenderContribution()
  );
  serviceRegistry.registerSingleton(DefaultBaseTextureRenderContribution, new DefaultBaseTextureRenderContribution());
  serviceRegistry.registerSingleton(
    DefaultBaseInteractiveRenderContribution,
    new DefaultBaseInteractiveRenderContribution()
  );
}

// ============ Picker 模块注册 ============

export function registerPickerModule() {
  // GlobalPickerService 单例
  serviceRegistry.registerSingletonFactory(GlobalPickerService, () => new DefaultGlobalPickerService());
  serviceRegistry.registerSingletonFactory(PickerService, () => serviceRegistry.get(GlobalPickerService));

  // PickItemInterceptor 贡献
  contributionRegistry.register(PickItemInterceptor, new Canvas3DPickItemInterceptor());
  contributionRegistry.register(PickItemInterceptor, new ShadowRootPickItemInterceptorContribution());
  contributionRegistry.register(PickItemInterceptor, new InteractivePickItemInterceptorContribution());

  // PickServiceInterceptor 贡献
  contributionRegistry.register(PickServiceInterceptor, new ShadowRootPickItemInterceptorContribution());
}

// ============ Plugin 模块注册 ============

export function registerPluginModule() {
  // PluginService 工厂 - 每个 Stage 一个实例
  serviceRegistry.registerFactory(PluginService, () => new DefaultPluginService());
}

// ============ 内置 Contributions 注册 ============

export function registerBuiltinContributions() {
  // 这里将加载 env、textMeasure、layerHandler 等贡献
  // 暂时保持空实现，后续需要根据实际情况注册
}

// ============ 统一注册入口 ============

let _registered = false;

export function registerAllModules() {
  if (_registered) {
    return;
  }
  _registered = true;

  registerCoreModule();
  registerGraphicModule();
  registerRenderModule();
  registerRenderContributions();
  registerPickerModule();
  registerPluginModule();
  registerBuiltinContributions();
}

/**
 * 重置注册状态（用于测试）
 */
export function resetModuleRegistration() {
  _registered = false;
  serviceRegistry.clear();
  contributionRegistry.clearAll();
}
