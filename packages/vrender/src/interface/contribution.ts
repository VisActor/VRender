import type { MaybePromise, Releaseable } from './common';
import type { IContext2d } from './context';
import type { IThemeAttribute, IMarkAttribute } from './graphic/creator';
import type { IGraphicAttribute } from './graphic';
import type { ISymbol, ISymbolGraphicAttribute } from './graphic/symbol';
import type { BaseRenderContributionTime } from '../common/enums';
import type { IArc, IArcGraphicAttribute } from './graphic/arc';
import type { IArea, IAreaGraphicAttribute } from './graphic/area';
import type { ICircle, ICircleGraphicAttribute } from './graphic/circle';
import type { IGroup, IGroupGraphicAttribute } from './graphic/group';
import type { IImage, IImageGraphicAttribute } from './graphic/image';
import type { IPath, IPathGraphicAttribute } from './graphic/path';
import type { IPolygon, IPolygonGraphicAttribute } from './graphic/polygon';
import type { IRect, IRectGraphicAttribute } from './graphic/rect';
import type { IStage } from './stage';
import type { ICanvasLike } from './canvas';

export interface IContribution<T> extends Releaseable {
  configure: (service: T, ...data: any) => void;
}

export interface IBaseRenderContribution {
  time: BaseRenderContributionTime;
  useStyle: boolean;
  order: number;
}

export interface ISymbolRenderContribution extends IBaseRenderContribution {
  drawShape: (
    symbol: ISymbol,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    symbolAttribute: Required<ISymbolGraphicAttribute>,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IArcRenderContribution extends IBaseRenderContribution {
  drawShape: (
    arc: IArc,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    arcAttribute: Required<IArcGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IAreaRenderContribution extends IBaseRenderContribution {
  drawShape: (
    area: IArea,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    areaAttribute: Required<IAreaGraphicAttribute>,
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
    options?: {
      attribute?: Partial<IAreaGraphicAttribute>;
    }
  ) => void;
}

export interface ICircleRenderContribution extends IBaseRenderContribution {
  drawShape: (
    circle: ICircle,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    circleAttribute: Required<ICircleGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IGroupRenderContribution extends IBaseRenderContribution {
  drawShape: (
    group: IGroup,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    groupAttribute: Required<IGroupGraphicAttribute>,

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
    doFillOrStroke?: { doFill: boolean; doStroke: boolean }
  ) => void;
}

export interface IImageRenderContribution extends IBaseRenderContribution {
  drawShape: (
    image: IImage,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    imageAttribute: Required<IImageGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IPathRenderContribution extends IBaseRenderContribution {
  drawShape: (
    Path: IPath,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    PathAttribute: Required<IPathGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IPolygonRenderContribution extends IBaseRenderContribution {
  drawShape: (
    Polygon: IPolygon,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    PolygonAttribute: Required<IPolygonGraphicAttribute>,

    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

export interface IRectRenderContribution extends IBaseRenderContribution {
  drawShape: (
    rect: IRect,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    rectAttribute: Required<IRectGraphicAttribute>,
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
    doFillOrStroke?: { doFill: boolean; doStroke: boolean }
  ) => void;
}

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
