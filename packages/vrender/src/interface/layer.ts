import { IAABBBounds, IBounds } from '@visactor/vutils';
import { IGraphic } from './graphic';
import { IGroup } from './graphic/group';
import { IDrawContext, IDrawContribution, IRenderService } from '../render/render-service';
import { IColor } from './color';
import { ILayerHandlerContribution, ILayerHandlerDrawParams, IWindow } from '../core';

export interface ILayerDrawParams {
  renderService: IRenderService;
  background?: string | IColor;
  updateBounds: boolean;
}

export interface IDrawToParams {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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
  combineTo: (target: IWindow, params: IDrawToParams) => void;
  // 考虑操作回放
}
