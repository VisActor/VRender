import type { MaybePromise, Releaseable } from './common';
import type { IContext2d } from './context';
import type { IThemeAttribute, IMarkAttribute } from './graphic/creator';
import type { IGraphicAttribute } from './graphic';
import type { ISymbol, ISymbolGraphicAttribute } from './graphic/symbol';
import type { BaseRenderContributionTime } from '../common/enums';
import type { IArc, IArcGraphicAttribute } from './graphic/arc';
import type { IArea, IAreaGraphicAttribute } from './graphic/area';
import type { IText, ITextGraphicAttribute } from './graphic/text';
import type { ICircle, ICircleGraphicAttribute } from './graphic/circle';
import type { IGroup, IGroupGraphicAttribute } from './graphic/group';
import type { IImage, IImageGraphicAttribute } from './graphic/image';
import type { IPath, IPathGraphicAttribute } from './graphic/path';
import type { IPolygon, IPolygonGraphicAttribute } from './graphic/polygon';
import type { IRect, IRectGraphicAttribute } from './graphic/rect';
import type { IStage } from './stage';
import type { ICanvasLike } from './canvas';
import type { IDrawContext } from './render';

export interface IContribution<T> extends Releaseable {
  configure: (service: T, ...data: any) => void;
}

export interface IBaseRenderContribution<GraphicType, AttributeType> {
  time: BaseRenderContributionTime;
  useStyle: boolean;
  order: number;

  drawShape: (
    graphic: GraphicType,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<AttributeType>,
    drawContext: IDrawContext,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    params?: any
  ) => void;
}

export type ISymbolRenderContribution = IBaseRenderContribution<ISymbol, ISymbolGraphicAttribute>;

export type IArcRenderContribution = IBaseRenderContribution<IArc, IArcGraphicAttribute>;

export type ITextRenderContribution = IBaseRenderContribution<IText, ITextGraphicAttribute>;

export type IAreaRenderContribution = IBaseRenderContribution<IArea, IAreaGraphicAttribute>;

export type ICircleRenderContribution = IBaseRenderContribution<ICircle, ICircleGraphicAttribute>;

export type IGroupRenderContribution = IBaseRenderContribution<IGroup, IGroupGraphicAttribute>;

export type IImageRenderContribution = IBaseRenderContribution<IImage, IImageGraphicAttribute>;

export type IPathRenderContribution = IBaseRenderContribution<IPath, IPathGraphicAttribute>;

export type IPolygonRenderContribution = IBaseRenderContribution<IPolygon, IPolygonGraphicAttribute>;

export type IRectRenderContribution = IBaseRenderContribution<IRect, IRectGraphicAttribute>;

export interface IContributionProvider<T> {
  getContributions: () => T[];
}

export interface IApplicationContribution {
  // 调用初始化函数
  initialize?: () => void;

  configure?: (stage: IStage) => MaybePromise<void>;

  onDestroy?: (stage: IStage) => MaybePromise<void>;
}

export interface ITTCanvas extends ICanvasLike {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
  getContext: () => any;
  // 构造 getBoundingClientRect 方法
  getBoundingClientRect: () => { width: number; height: number };
  id: string;
}

export interface ILynxCanvas extends ICanvasLike {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
  getContext: () => any;
  // 构造 getBoundingClientRect 方法
  getBoundingClientRect: () => { width: number; height: number };
  id: string;
}

export interface IDomRef {
  id: string;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  x: number;
  y: number;

  requestAnimationFrame?: any;
  cancelAnimationFrame?: any;
  getBoundingClientRect?: () => { height: number; width: number };
}
