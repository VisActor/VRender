import type { IAABBBounds, IBounds, IBoundsLike, IMatrix } from '@visactor/vutils';
import type { IGraphic } from './graphic';
import type { IGroup } from './graphic/group';
import type { IColor } from './color';
import type { IDrawContext, IDrawContribution, IRenderService, IRenderServiceDrawParams } from './render';
import type { IStage } from './stage';
import type { Releaseable } from './common';
import type { IContext2d } from './context';
import type { IWindow } from './window';
import { ICanvasLike } from './canvas';

export type LayerMode = 'static' | 'dynamic' | 'virtual';
export interface ILayerParams {
  main: boolean;
  zIndex?: number;
  layerMode: LayerMode;
  layerHandler: ILayerHandlerContribution;
  canvasId?: string;
}

export interface ILayerDrawParams {
  renderService: IRenderService;
  background?: string | IColor;
  updateBounds: boolean;
  viewBox: IAABBBounds;
  transMatrix: IMatrix;
}

export interface IDrawToParams {
  viewBox: IAABBBounds;
  transMatrix: IMatrix;
  clear?: boolean;
  renderService: IRenderService;
  background?: string | IColor;
  updateBounds: boolean;
}

// 不建议用户操作layer，尽量都通过stage实现
export interface ILayer extends IGroup {
  parent: any;
  // rootNode: IStage;
  main: boolean;
  width: number;
  height: number;
  viewWidth: number;
  viewHeight: number;

  readonly layerMode: LayerMode;
  renderCount: number;

  offscreen: boolean;
  subLayers: Map<number, { layer: ILayer; group?: IGroup; zIndex: number; drawContribution?: IDrawContribution }>;

  // mode: 'dynamic' | 'static';
  readonly dirtyBound: IAABBBounds;
  background: string;
  dpr: number;
  opacity: number;
  canvasId?: string;
  imageData?: ImageData;
  blendMode?: string;
  // TODO: getElementById
  pickable: boolean;
  pick: (x: number, y: number) => { graphic?: IGraphic; group?: IGroup } | false;
  render: (params: ILayerDrawParams, userParams?: Partial<IDrawContext>) => void;
  afterDraw: (cb: (l: this) => void) => void;

  resize: (w: number, h: number) => void;
  resizeView: (w: number, h: number) => void;
  setDpr: (dpr: number) => void;
  getNativeHandler: () => ILayerHandlerContribution;
  combineSubLayer: (removeIncrementalKey?: boolean) => void;

  // 动画相关
  startAnimate: (t: number) => void;
  setToFrame: (t: number) => void;
  prepare: (dirtyBounds: IBounds, params: ILayerHandlerDrawParams) => void;
  drawTo: (target: IWindow, params: IDrawToParams) => void;
  // combineTo: (target: IWindow, params: IDrawToParams) => void;
  // 考虑操作回放
}

export interface ILayerHandlerDrawParams extends ILayerDrawParams {
  layer: ILayer;
  stage: IStage;
  updateBounds: boolean;
}

export interface ILayerHandlerInitParams {
  main: boolean;
  canvasId?: string;
  width: number;
  height: number;
  zIndex: number;
  dpr?: number;
}

// TODO: layer在resize的时候需要判断是否需要resize window对应的canvas

// 具体的Layer实现
// Canvas2d的Layer可以对应一个Canvas或者ImageData
export interface ILayerHandlerContribution extends Releaseable {
  // 所绑定的副layer handler
  secondaryHandlers?: ILayerHandlerContribution[];
  // 所依赖的主layer handler
  mainHandler?: ILayerHandlerContribution;
  type: LayerMode;
  init: (layer: ILayer, window: IWindow, params: ILayerHandlerInitParams) => void;
  resize: (w: number, h: number) => void;
  resizeView: (w: number, h: number) => void;
  setDpr: (dpr: number) => void;
  render: (group: IGroup[], params: ILayerHandlerDrawParams, userParams?: Partial<IDrawContext>) => void;
  prepare: (dirtyBounds: IBoundsLike, params: IRenderServiceDrawParams) => void;
  drawTo: (target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams) => void;
  merge: (layerHandlers: ILayerHandlerContribution[]) => void;
  getContext: () => IContext2d;
  offscreen: boolean;
  layer: ILayer;
}
