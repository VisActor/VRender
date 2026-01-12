/**
 * 模块预加载入口（Registry-only）
 */
import { LayerService } from './core/constants';
import type { IGlobal, IGraphicService } from './interface';
import { application } from './application';
import type { IGraphicUtil, ILayerService, ITransformUtil } from './interface/core';
import { GraphicService } from './graphic/constants';
import { GraphicUtil, TransformUtil } from './core/constants';
import { VGlobal } from './constants';
import { serviceRegistry } from './common/registry';
import { registerAllModules } from './register-modules';

export function preLoadAllModule() {
  if (preLoadAllModule.__loaded) {
    return;
  }
  preLoadAllModule.__loaded = true;

  // Registry-only
  registerAllModules();
}

preLoadAllModule.__loaded = false;

preLoadAllModule();

// 全局变量 - 从 serviceRegistry 获取
export const vglobal = serviceRegistry.get<IGlobal>(VGlobal);
application.global = vglobal;

export const graphicUtil = serviceRegistry.get<IGraphicUtil>(GraphicUtil);
application.graphicUtil = graphicUtil;

export const transformUtil = serviceRegistry.get<ITransformUtil>(TransformUtil);
application.transformUtil = transformUtil;

export const graphicService = serviceRegistry.get<IGraphicService>(GraphicService);
application.graphicService = graphicService;

export const layerService = serviceRegistry.get<ILayerService>(LayerService);
application.layerService = layerService;
