/**
 * 新的模块注册系统 - 替代 ContainerModule 模式
 *
 * 这个文件将所有服务注册到 serviceRegistry 和 contributionRegistry
 */
declare let require: any;
import { serviceRegistry, contributionRegistry } from './common/registry';
import { VGlobal, EnvContribution } from './constants';
import { GraphicUtil, LayerService, TransformUtil } from './core/constants';
import { VWindow } from './core/window';
import { GraphicService, GraphicCreator } from './graphic/constants';
import { RenderService } from './render/constants';
import {
  DrawContribution,
  GraphicRender,
  IncrementalDrawContribution,
  GroupRender
} from './render/contributions/render/symbol';
import { DrawItemInterceptor } from './render/contributions/render/draw-interceptor';
import { PickerService, GlobalPickerService, PickItemInterceptor, PickServiceInterceptor } from './picker/constants';
import { PluginService, AutoEnablePlugins } from './plugins/constants';
import {
  DynamicLayerHandlerContribution,
  StaticLayerHandlerContribution,
  VirtualLayerHandlerContribution
} from './core/constants';
import {
  GroupRenderContribution,
  InteractiveSubRenderContribution
} from './render/contributions/render/contributions/constants';

// ============ Core 模块注册 ============

export function registerCoreModule() {
  const { DefaultGlobal } = require('./core/global');
  const { DefaultGraphicUtil, DefaultTransformUtil } = require('./core/graphic-utils');
  const { DefaultLayerService } = require('./core/layer-service');
  const { DefaultWindow } = require('./core/window');

  // 单例服务
  serviceRegistry.registerSingletonFactory(VGlobal, () => new DefaultGlobal());
  serviceRegistry.registerSingletonFactory(GraphicUtil, () => new DefaultGraphicUtil());
  serviceRegistry.registerSingletonFactory(TransformUtil, () => new DefaultTransformUtil());
  serviceRegistry.registerSingletonFactory(LayerService, () => new DefaultLayerService());

  // 工厂服务 - Window 每次创建新实例
  serviceRegistry.registerFactory(VWindow, () => new DefaultWindow());
}

// ============ Graphic 模块注册 ============

export function registerGraphicModule() {
  const { DefaultGraphicService } = require('./graphic/graphic-service/graphic-service');
  const { graphicCreator } = require('./graphic/graphic-creator');

  serviceRegistry.registerSingletonFactory(GraphicService, () => new DefaultGraphicService());
  serviceRegistry.registerSingleton(GraphicCreator, graphicCreator);
}

// ============ Render 模块注册 ============

export function registerRenderModule() {
  const { DefaultRenderService } = require('./render/render-service');
  const { DefaultDrawContribution } = require('./render/contributions/render/draw-contribution');
  const { DefaultIncrementalDrawContribution } = require('./render/contributions/render/incremental-draw-contribution');

  // DrawContribution 单例
  serviceRegistry.registerSingletonFactory(DrawContribution, () => new DefaultDrawContribution());

  // IncrementalDrawContribution 单例
  serviceRegistry.registerSingletonFactory(IncrementalDrawContribution, () => new DefaultIncrementalDrawContribution());

  // RenderService 工厂 - 每个 Stage 一个实例
  serviceRegistry.registerFactory(RenderService, () => {
    const drawContribution = serviceRegistry.get(DrawContribution);
    return new DefaultRenderService(drawContribution);
  });
}

// ============ Render Contributions 注册 ============

export function registerRenderContributions() {
  const { DefaultCanvasGroupRender } = require('./render/contributions/render/group-render');
  const { CommonDrawItemInterceptorContribution } = require('./render/contributions/render/draw-interceptor');
  const {
    DefaultBaseBackgroundRenderContribution,
    DefaultBaseInteractiveRenderContribution,
    DefaultBaseTextureRenderContribution
  } = require('./render/contributions/render/contributions');

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
  const { DefaultGlobalPickerService } = require('./picker/global-picker-service');
  const {
    Canvas3DPickItemInterceptor,
    InteractivePickItemInterceptorContribution,
    ShadowPickServiceInterceptorContribution,
    ShadowRootPickItemInterceptorContribution
  } = require('./picker/pick-interceptor');

  // GlobalPickerService 单例
  serviceRegistry.registerSingletonFactory(GlobalPickerService, () => new DefaultGlobalPickerService());
  serviceRegistry.registerSingletonFactory(PickerService, () => serviceRegistry.get(GlobalPickerService));

  // PickItemInterceptor 贡献
  contributionRegistry.register(PickItemInterceptor, new Canvas3DPickItemInterceptor());
  contributionRegistry.register(PickItemInterceptor, new ShadowRootPickItemInterceptorContribution());
  contributionRegistry.register(PickItemInterceptor, new InteractivePickItemInterceptorContribution());

  // PickServiceInterceptor 贡献
  contributionRegistry.register(PickServiceInterceptor, new ShadowPickServiceInterceptorContribution());
}

// ============ Plugin 模块注册 ============

export function registerPluginModule() {
  const { DefaultPluginService } = require('./plugins/plugin-service');

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
