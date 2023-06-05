import { injectable, inject } from 'inversify';
import { IAABBBounds, IBounds } from '@visactor/vutils';
import { IGroup, IGraphic, IContext2d, MaybePromise, IColor, IStage, ILayer } from '../interface';
import { DrawContribution, IGraphicRender, IGraphicRenderDrawParams } from './contributions/render';
import { SyncHook } from '../tapable';

// 用于绘制的参数，提供context
// TODO: 考虑是否可以隐藏上下文类型
export interface IRenderServiceDrawParams {
  context?: IContext2d;

  // 绘制的区域以及是否需要清屏
  clear?: string | IColor;
  width: number;
  height: number;
  x: number;
  y: number;
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
    completeDraw: SyncHook<[]>;
  };
  dirtyBounds?: IAABBBounds;
  backupDirtyBounds?: IAABBBounds;
  rendering?: boolean;
  currentRenderMap: Map<number, IGraphicRender>;
  defaultRenderMap: Map<number, IGraphicRender>;
  styleRenderMap: Map<string, Map<number, IGraphicRender>>;
  draw: (renderService: IRenderService, drawParams: IDrawContext) => MaybePromise<void>;
  getRenderContribution: (graphic: IGraphic) => IGraphicRender | null;
  renderGroup: (group: IGroup, drawContext: IDrawContext) => void;
  renderItem: (graphic: IGraphic, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) => void;
}

export const RenderService = Symbol.for('RenderService');
export const BeforeRenderConstribution = Symbol.for('BeforeRenderConstribution');

interface IBeforeRenderConstribution {
  apply: (renderService: IRenderService) => MaybePromise<void>;
}

/**
 * 渲染用的service，通常和stage一一绑定，
 * 并不是单例模式，所以会绑定此次渲染的一些数据
 */
@injectable()
export class DefaultRenderService implements IRenderService {
  // 每次render都会变的数据
  dirtyBounds: IBounds;
  renderTreeRoots: IGraphic[]; // 此次render的数组
  renderLists: IGraphic[];
  drawParams: IRenderServiceDrawParams;

  constructor(
    @inject(DrawContribution)
    private readonly drawContribution: IDrawContribution
  ) {}

  // 渲染前准备工作，计算bounds等逻辑
  prepare(updateBounds: boolean): void {
    this.renderTreeRoots.forEach(g => {
      this._prepare(g, updateBounds);
    });
    return;
  }
  protected _prepare(g: IGraphic, updateBounds: boolean) {
    g.forEachChildren(g => {
      this._prepare(g as IGraphic, updateBounds);
    });
    g.update({ bounds: updateBounds, trans: true });
  }
  // 获取要渲染的list，可能存在一些不用渲染的内容，以及外描边
  prepareRenderList(): void {
    return;
  }
  // 渲染前流程
  beforeDraw(params: IRenderServiceDrawParams): void {
    return;
  }
  // 具体渲染
  draw(params: IRenderServiceDrawParams): void {
    this.drawContribution.draw(this, { ...this.drawParams });
  }
  // 渲染后流程
  afterDraw(params: IRenderServiceDrawParams): void {
    return;
  }
  // 对外暴露的绘制方法
  render(groups: IGroup[], params: IRenderServiceDrawParams): void {
    this.renderTreeRoots = groups;
    this.drawParams = params;
    const updateBounds = params.updateBounds;
    this.prepare(updateBounds);
    this.prepareRenderList();
    this.beforeDraw(params);
    this.draw(params);
    this.afterDraw(params);
  }
}
