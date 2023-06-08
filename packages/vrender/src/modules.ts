import { Container } from 'inversify';
import coreModule from './core/core-modules';
import renderModule from './render/render-modules';
import pickModule from './picker/pick-modules';
import allocatorModule from './allocator/allocator-modules';
import graphicModule from './graphic/graphic-service/graphic-module';
import pluginModule from './plugins/plugin-modules';
import loadBuiltinContributions from './core/contributions/modules';
import loadRenderContributions from './render/contributions/modules';
import loadPickContributions from './picker/contributions/modules';
import loadCanvasContributions from './canvas/contributions/modules';
import { GraphicUtil, IGraphicUtil, ILayerService, ITransformUtil, LayerService, TransformUtil } from './core';
import { GraphicService, IGraphicService } from './graphic';
import { IMat4Allocate, IMatrixAllocate, Mat4Allocate, MatrixAllocate } from './allocator/matrix-allocate';
import { GlobalPickerService } from './picker/global-picker-service';
import { IPickerService } from './picker';
import {
  ArcAllocate,
  AreaAllocate,
  CircleAllocate,
  LineAllocate,
  PathAllocate,
  RectAllocate,
  SymbolAllocate,
  TextAllocate,
  CanvasAllocate
} from './allocator/constants';
import {
  ILineAllocate,
  IPathAllocate,
  IRectAllocate,
  ISymbolAllocate,
  ITextAllocate,
  IArcAllocate,
  IAreaAllocate,
  ICircleAllocate,
  ICanvasAllocate
} from './allocator/interface';
import { Global, IGlobal } from './interface';

export const container = new Container();
container.load(coreModule);
container.load(graphicModule);
container.load(renderModule);
container.load(pickModule);
container.load(allocatorModule);
container.load(pluginModule);
loadBuiltinContributions(container);
loadRenderContributions(container);
loadPickContributions(container);
loadCanvasContributions(container);

// 全局变量
export const global = container.get<IGlobal>(Global);
export const graphicUtil = container.get<IGraphicUtil>(GraphicUtil);
export const transformUtil = container.get<ITransformUtil>(TransformUtil);
export const graphicService = container.get<IGraphicService>(GraphicService);
export const matrixAllocate = container.get<IMatrixAllocate>(MatrixAllocate);
export const mat4Allocate = container.get<IMat4Allocate>(Mat4Allocate);
export const canvasAllocate = container.get<ICanvasAllocate>(CanvasAllocate);
export const arcAllocate = container.get<IArcAllocate>(ArcAllocate);
export const areaAllocate = container.get<IAreaAllocate>(AreaAllocate);
export const circleAllocate = container.get<ICircleAllocate>(CircleAllocate);
export const lineAllocate = container.get<ILineAllocate>(LineAllocate);
export const pathAllocate = container.get<IPathAllocate>(PathAllocate);
export const rectAllocate = container.get<IRectAllocate>(RectAllocate);
export const symbolAllocate = container.get<ISymbolAllocate>(SymbolAllocate);
export const textAllocate = container.get<ITextAllocate>(TextAllocate);
export const pickerService = container.get<IPickerService>(GlobalPickerService);
export const layerService = container.get<ILayerService>(LayerService);
