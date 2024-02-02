import type { IAABBBounds, IBounds, IBoundsLike, IMatrixLike } from '@visactor/vutils';
import type { IColor } from './color';
import type { IContext2d } from './context';
import type { IGraphic, IGraphicAttribute } from './graphic';
import type { IMarkAttribute, IThemeAttribute } from './graphic/creator';
import type { IFullThemeSpec } from './graphic/theme';
import type { ILayer } from './layer';
import type { IStage } from './stage';
import type { IGroup } from './graphic/group';
import type { MaybePromise } from './common';
import type { ISyncHook } from './sync-hook';

// 用于绘制的参数，提供context
// TODO: 考虑是否可以隐藏上下文类型
export interface IRenderServiceDrawParams {
  context?: IContext2d;

  // 绘制的区域以及是否需要清屏
  clear?: string | IColor | boolean;
  viewBox: IBounds;
  transMatrix?: IMatrixLike;
  stage: IStage;
  layer: ILayer;
  renderService: IRenderService;
  updateBounds: boolean;
  renderStyle?: string;
}

export interface IRenderService {
  dirtyBounds: IBounds;
  renderTreeRoots: IGraphic[]; // 此次render的数组
  renderLists: IGraphic[];
  drawParams: IRenderServiceDrawParams;

  prepare: (updateBounds: boolean) => void;
  prepareRenderList: () => void;
  beforeDraw: (params: IRenderServiceDrawParams) => void;
  draw: (params: IRenderServiceDrawParams) => void;
  afterDraw: (params: IRenderServiceDrawParams) => void;
  render: (groups: IGroup[], params: IRenderServiceDrawParams) => MaybePromise<void>;
}

export interface IDrawContext extends IRenderServiceDrawParams {
  startAtId?: number;
  break?: boolean;
  restartIncremental?: boolean;
  // multi图元开始的位置
  multiGraphicOptions?: {
    startAtIdx: number;
    length: number;
  };
  in3dInterceptor?: boolean;
  drawContribution?: IDrawContribution;
  // hack内容
  hack_pieFace?: 'inside' | 'bottom' | 'top' | 'outside';
}

export interface IDrawContribution {
  hooks?: {
    completeDraw: ISyncHook<[]>;
  };
  dirtyBounds?: IAABBBounds;
  backupDirtyBounds?: IAABBBounds;
  rendering?: boolean;
  currentRenderMap: Map<number, IGraphicRender>;
  defaultRenderMap: Map<number, IGraphicRender>;
  styleRenderMap: Map<string, Map<number, IGraphicRender>>;
  draw: (renderService: IRenderService, drawParams: IDrawContext) => MaybePromise<void>;
  afterDraw?: (renderService: IRenderService, drawParams: IDrawContext) => MaybePromise<void>;
  getRenderContribution: (graphic: IGraphic) => IGraphicRender | null;
  renderGroup: (group: IGroup, drawContext: IDrawContext, matrix: IMatrixLike, skipSort?: boolean) => void;
  renderItem: (graphic: IGraphic, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) => void;
}

export interface IGraphicRenderDrawParams {
  beforeDrawCb?: () => void;
  afterDrawCb?: () => void;
  drawingCb?: () => void;
  skipDraw?: boolean;
  theme?: IFullThemeSpec;
}

export interface IGraphicRender {
  type: string; // 图元类型
  numberType: number;
  style?: string;
  z?: number;
  draw: (
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ) => void;
  drawShape?: (
    graphic: IGraphic,
    ctx: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
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

export interface IBeforeRenderConstribution {
  apply: (renderService: IRenderService) => MaybePromise<void>;
}

export interface IRenderSelector {
  selector: (graphic: IGraphic) => IGraphicRender | null;
}

export interface IDrawItemInterceptorContribution {
  order: number;
  beforeDrawItem?: (
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ) => boolean;
  afterDrawItem?: (
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ) => boolean;
}
