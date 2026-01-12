/**
 * 服务工厂模块 - 创建不依赖装饰器的服务实例
 *
 * 这些工厂函数显式传递依赖，替代 @inject/@multiInject/@named 装饰器
 */
import type { application } from '../application';
import { serviceRegistry, contributionRegistry } from './registry';

// ============ 类型定义 ============

export interface IServiceContext {
  services: typeof serviceRegistry;
  contributions: typeof contributionRegistry;
  application: typeof application;
}

// ============ 服务工厂 ============

/**
 * 创建 RenderService 实例
 * 替代 @inject(DrawContribution) 装饰器
 */
declare let require: any;
export function createRenderService() {
  const { DefaultRenderService } = require('../render/render-service');
  const { DrawContribution } = require('../render/contributions/render/symbol');

  // 获取 DrawContribution 实例
  const drawContribution = createDrawContribution();

  return new DefaultRenderService(drawContribution);
}

/**
 * 创建 DrawContribution 实例
 * 替代 @multiInject(GraphicRender) 和 @inject(ContributionProvider) @named(DrawItemInterceptor) 装饰器
 */
export function createDrawContribution() {
  const { DefaultDrawContribution } = require('../render/contributions/render/draw-contribution');
  const { GraphicRender } = require('../render/contributions/render/symbol');
  const { DrawItemInterceptor } = require('../render/contributions/render/draw-interceptor');

  // 获取所有 GraphicRender 贡献
  const graphicRenders = contributionRegistry.get(GraphicRender);

  // 创建 DrawItemInterceptor 的 ContributionProvider 兼容对象
  const drawItemInterceptorProvider = {
    getContributions: () => contributionRegistry.get(DrawItemInterceptor)
  };

  return new DefaultDrawContribution(graphicRenders, drawItemInterceptorProvider);
}

/**
 * 创建 IncrementalDrawContribution 实例
 */
export function createIncrementalDrawContribution() {
  const {
    DefaultIncrementalDrawContribution
  } = require('../render/contributions/render/incremental-draw-contribution');
  const { GraphicRender } = require('../render/contributions/render/symbol');
  const { DrawItemInterceptor } = require('../render/contributions/render/draw-interceptor');
  const { DefaultIncrementalCanvasLineRender } = require('../render/contributions/render/incremental-line-render');
  const { DefaultIncrementalCanvasAreaRender } = require('../render/contributions/render/incremental-area-render');

  // 获取所有 GraphicRender 贡献
  const graphicRenders = contributionRegistry.get(GraphicRender);

  // 获取特定的 line/area render
  const lineRender =
    serviceRegistry.get(DefaultIncrementalCanvasLineRender) || new DefaultIncrementalCanvasLineRender();
  const areaRender =
    serviceRegistry.get(DefaultIncrementalCanvasAreaRender) || new DefaultIncrementalCanvasAreaRender();

  // 创建 DrawItemInterceptor 的 ContributionProvider 兼容对象
  const drawItemInterceptorProvider = {
    getContributions: () => contributionRegistry.get(DrawItemInterceptor)
  };

  return new DefaultIncrementalDrawContribution(graphicRenders, lineRender, areaRender, drawItemInterceptorProvider);
}

/**
 * 创建 PluginService 实例
 * 替代 @inject(ContributionProvider) @named(AutoEnablePlugins) 装饰器
 */
export function createPluginService() {
  const { DefaultPluginService } = require('../plugins/plugin-service');
  const { AutoEnablePlugins } = require('../plugins/constants');

  // 创建 AutoEnablePlugins 的 ContributionProvider 兼容对象
  const autoEnablePluginsProvider = {
    getContributions: () => contributionRegistry.get(AutoEnablePlugins)
  };

  return new DefaultPluginService(autoEnablePluginsProvider);
}

/**
 * 创建 PickerService 实例
 */
export function createPickerService() {
  const { DefaultGlobalPickerService } = require('../picker/global-picker-service');
  return new DefaultGlobalPickerService();
}

/**
 * 创建 Global 实例
 * 替代 @inject(ContributionProvider) @named(EnvContribution) 装饰器
 */
export function createGlobal() {
  const { DefaultGlobal } = require('../core/global');
  return new DefaultGlobal();
}

/**
 * 创建 GraphicUtil 实例
 * 替代 @inject(ContributionProvider) @named(TextMeasureContribution) 装饰器
 */
export function createGraphicUtil() {
  const { DefaultGraphicUtil } = require('../core/graphic-utils');
  const { TextMeasureContribution } = require('../core/contributions/textMeasure/textMeasure-contribution');

  // 创建 TextMeasureContribution 的 ContributionProvider 兼容对象
  const textMeasureProvider = {
    getContributions: () => contributionRegistry.get(TextMeasureContribution)
  };

  return new DefaultGraphicUtil(textMeasureProvider);
}

/**
 * 创建 LayerService 实例
 */
export function createLayerService() {
  const { DefaultLayerService } = require('../core/layer-service');
  return new DefaultLayerService();
}

/**
 * 创建 TransformUtil 实例
 */
export function createTransformUtil() {
  const { DefaultTransformUtil } = require('../core/graphic-utils');
  return new DefaultTransformUtil();
}

/**
 * 创建 GraphicService 实例
 */
export function createGraphicService() {
  const { DefaultGraphicService } = require('../graphic/graphic-service/graphic-service');
  return new DefaultGraphicService();
}

/**
 * 创建 Window 实例
 */
export function createWindow() {
  const { DefaultWindow } = require('../core/window');
  return new DefaultWindow();
}
