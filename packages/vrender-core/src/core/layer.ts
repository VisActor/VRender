import type { AABBBounds, IBoundsLike } from '@visactor/vutils';
import { application } from '../application';
import { container } from '../container';
import type {
  IDrawToParams,
  IGraphic,
  IGroup,
  ILayer,
  ILayerDrawParams,
  IStage,
  IGlobal,
  ILayerHandlerContribution,
  IDrawContext,
  ILayerHandlerDrawParams,
  IDrawContribution,
  IWindow,
  ILayerParams,
  LayerMode
} from '../interface';
import { Theme } from '../graphic/theme';
import { Group } from '../graphic/group';

type BlendMode = 'normal';

// layer需要有多个，对于Canvas来说，layer可以绑定一个canvas或一个ImageData
// 对于WebGL来说，layer对应一个FrameBuffer
// 对于Native来说，layer保留一个FrameBufferHandler
export class Layer extends Group implements ILayer {
  declare parent: any;

  declare _dpr: number;
  declare main: boolean;
  declare renderCount: number;

  declare afterDrawCbs: ((l: this) => void)[];

  declare imageData?: ImageData;
  // 混合模式，用于多图层混合
  declare blendMode: BlendMode;

  declare background: string;
  declare opacity: number;

  declare layer: this;
  declare subLayers: Map<
    number,
    { layer: ILayer; group?: IGroup; zIndex: number; drawContribution?: IDrawContribution }
  >;

  get offscreen(): boolean {
    return this.layerHandler.offscreen;
  }

  get layerMode(): LayerMode {
    return this.layerHandler.type;
  }

  // stage控制
  // width: number;
  // height: number;
  get width(): number {
    if (!this.stage) {
      return 0;
    }
    return this.stage.width;
  }
  get height(): number {
    if (!this.stage) {
      return 0;
    }
    return this.stage.height;
  }
  get viewWidth(): number {
    if (!this.stage) {
      return 0;
    }
    return this.stage.viewWidth;
  }
  get viewHeight(): number {
    if (!this.stage) {
      return 0;
    }
    return this.stage.viewHeight;
  }
  declare pickable: boolean;

  get dirtyBound(): AABBBounds {
    // this.getRootNode<any>();
    throw new Error('暂不支持');
  }

  get dpr(): number {
    return this._dpr;
  }

  declare stage?: IStage;
  protected declare global: IGlobal;
  protected declare window: IWindow;
  protected declare layerHandler: ILayerHandlerContribution;

  constructor(stage: IStage, global: IGlobal, window: IWindow, params: ILayerParams) {
    super({});
    this.stage = stage;
    this.global = global;
    this.window = window;
    this.main = params.main;
    this.layerHandler = params.layerHandler;
    // this.layerHandler = container.get<ILayerHandlerContribution>(LayerHandlerContribution);
    this.layerHandler.init(this, window, {
      main: params.main,
      canvasId: params.canvasId,
      width: this.viewWidth,
      height: this.viewHeight,
      zIndex: params.zIndex ?? 0
    });
    this.layer = this;
    this.subLayers = new Map();
    this.theme = new Theme();
    this.background = 'rgba(0, 0, 0, 0)';
    this.afterDrawCbs = [];
  }

  combineSubLayer(removeIncrementalKey: boolean = true) {
    const subLayers = Array.from(this.subLayers.values()).sort((a, b) => {
      return a.zIndex - b.zIndex;
    });
    this.layerHandler.merge(
      subLayers.map(l => {
        if (l.layer.subLayers.size) {
          l.layer.combineSubLayer(removeIncrementalKey);
        }
        return l.layer.getNativeHandler();
      })
    );
    if (removeIncrementalKey) {
      subLayers.forEach(l => {
        l.group && (l.group.incremental = 0);
      });
    }
    subLayers.forEach(l => {
      // l.layer.release();
      application.layerService.releaseLayer(this.stage, l.layer);
    });
    this.subLayers.clear();
  }

  getNativeHandler(): ILayerHandlerContribution {
    return this.layerHandler;
  }

  setStage(stage?: IStage, layer?: ILayer) {
    super.setStage(stage, this);
  }

  // 选中图层中的节点
  pick(x: number, y: number): { graphic?: IGraphic; group?: IGroup } | false {
    throw new Error('暂不支持');
  }
  // 绘制依赖的副layer
  protected tryRenderSecondaryLayer(params: ILayerDrawParams, userParams?: Partial<IDrawContext>) {
    if (this.layerHandler.secondaryHandlers && this.layerHandler.secondaryHandlers.length) {
      this.layerHandler.secondaryHandlers.forEach(h => {
        h.layer.renderCount = this.renderCount;
        h.layer.render(params, userParams);
      });
    }
  }
  // 绘制图层
  render(params: ILayerDrawParams, userParams?: Partial<IDrawContext>) {
    const stage = this.stage;
    this.layerHandler.render(
      [this],
      {
        renderService: params.renderService,
        x: stage.x,
        y: stage.y,
        width: this.viewWidth,
        height: this.viewHeight,
        stage: this.stage,
        layer: this,
        // TODO: 多图层时不应该再用默认background
        background: params.background ?? this.background,
        updateBounds: params.updateBounds
      },
      userParams
    );
    this.afterDrawCbs.forEach(c => c(this));
    this.tryRenderSecondaryLayer(params, userParams);
  }
  resize(w: number, h: number) {
    this.layerHandler.resize(w, h);
  }
  resizeView(w: number, h: number) {
    this.layerHandler.resizeView(w, h);
  }
  setDpr(dpr: number) {
    this.layerHandler.setDpr(dpr);
  }
  afterDraw(cb: (l: this) => void) {
    this.afterDrawCbs.push(cb);
  }

  // 动画相关
  startAnimate(t: number) {
    throw new Error('暂不支持');
  }

  setToFrame(t: number) {
    throw new Error('暂不支持');
  }

  prepare(dirtyBounds: IBoundsLike, params: ILayerHandlerDrawParams) {
    return;
  }

  // 合并到某个target上
  combineTo(target: IWindow, params: IDrawToParams) {
    if (this.offscreen) {
      this.layerHandler.drawTo(target, [this], {
        // TODO: 多图层时不应该再用默认background
        background: params.background ?? this.background,
        renderService: params.renderService,
        x: params.x ?? this.stage.x,
        y: params.y ?? this.stage.y,
        width: this.viewWidth,
        height: this.viewHeight,
        stage: this.stage,
        layer: this,
        ...params
      });
      this.afterDrawCbs.forEach(c => c(this));
    }
  }

  release(): void {
    super.release();
    this.layerHandler.release();
    if (this.subLayers) {
      this.subLayers.forEach(l => {
        // l.layer.release();
        application.layerService.releaseLayer(this.stage, l.layer);
      });
    }
  }

  drawTo(target: IWindow, params: IDrawToParams) {
    this.layerHandler.drawTo(target, [this], {
      // TODO: 多图层时不应该再用默认background
      background: params.background ?? this.background,
      renderService: params.renderService,
      x: params.x ?? this.stage.x,
      y: params.y ?? this.stage.y,
      width: this.viewWidth,
      height: this.viewHeight,
      stage: this.stage,
      layer: this,
      ...params
    });
    this.afterDrawCbs.forEach(c => c(this));
  }
}
