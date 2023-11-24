import { injectable, inject, postConstruct, named, multiInject } from '../../../common/inversify-lite';
import type {
  IContext2d,
  MaybePromise,
  IGraphic,
  IGroup,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IContributionProvider,
  IDrawItemInterceptorContribution,
  IDrawContribution,
  IRenderSelector,
  IGlobal
} from '../../../interface';
import { findNextGraphic, foreach } from '../../../common/sort';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { DefaultAttribute } from '../../../graphic';
import type { IAABBBounds, IBounds } from '@visactor/vutils';
import { Bounds, getRectIntersect, isRectIntersect, last } from '@visactor/vutils';
import { LayerService } from '../../../core/constants';
import { container } from '../../../container';
import { GraphicRender, IncrementalDrawContribution, RenderSelector } from './symbol';
import { DrawItemInterceptor } from './draw-interceptor';
import { createColor } from '../../../common/canvas-utils';
import type { ILayerService } from '../../../interface/core';
import { VGlobal } from '../../../constants';

/**
 * 默认的渲染contribution，基于树状结构针对图元的渲染
 */
@injectable()
export class DefaultDrawContribution implements IDrawContribution {
  declare currentRenderMap: Map<number, IGraphicRender>;
  declare defaultRenderMap: Map<number, IGraphicRender>;
  declare styleRenderMap: Map<string, Map<number, IGraphicRender>>;
  declare dirtyBounds: IBounds;
  declare backupDirtyBounds: IBounds;
  declare currentRenderService: IRenderService;
  declare InterceptorContributions: IDrawItemInterceptorContribution[];

  @inject(VGlobal) global: IGlobal;

  constructor(
    // @inject(ContributionProvider)
    // @named(GraphicRender)
    // protected readonly contributions: ContributionProvider<IGraphicRender>,
    @multiInject(GraphicRender) protected readonly contributions: IGraphicRender[],
    @inject(RenderSelector) protected readonly renderSelector: IRenderSelector, // 根据图元类型选择对应的renderItem进行渲染
    @inject(LayerService) protected readonly layerService: ILayerService, // 默认的polygonRender
    // 拦截器
    @inject(ContributionProvider)
    @named(DrawItemInterceptor)
    protected readonly drawItemInterceptorContributions: IContributionProvider<IDrawItemInterceptorContribution>
  ) {
    this.currentRenderMap = new Map();
    this.defaultRenderMap = new Map();
    this.styleRenderMap = new Map();
    this.dirtyBounds = new Bounds();
    this.backupDirtyBounds = new Bounds();
  }

  @postConstruct()
  init() {
    this.contributions.forEach(item => {
      if (item.style) {
        const map = this.styleRenderMap.get(item.style) || new Map();
        map.set(item.numberType, item);
        this.styleRenderMap.set(item.style, map);
      } else {
        this.defaultRenderMap.set(item.numberType, item);
      }
    });
    this.InterceptorContributions = this.drawItemInterceptorContributions
      .getContributions()
      .sort((a, b) => a.order - b.order);
  }

  draw(renderService: IRenderService, drawContext: IDrawContext): MaybePromise<void> {
    drawContext.drawContribution = this;
    this.currentRenderMap = this.styleRenderMap.get(drawContext.renderStyle) || this.defaultRenderMap;
    // this.startAtId = drawParams.startAtId;
    this.currentRenderService = renderService;
    // this.drawParams = drawParams;
    const { context, stage, x = 0, y = 0, width, height } = drawContext;

    if (!context) {
      return;
    }
    // if (context.drawPromise) {
    //   return;
    // }
    const dirtyBounds: IBounds | undefined = this.dirtyBounds.setValue(0, 0, width, height);
    if (stage.dirtyBounds && !stage.dirtyBounds.empty()) {
      const b = getRectIntersect(dirtyBounds, stage.dirtyBounds, false);
      dirtyBounds.x1 = Math.floor(b.x1);
      dirtyBounds.y1 = Math.floor(b.y1);
      dirtyBounds.x2 = Math.ceil(b.x2);
      dirtyBounds.y2 = Math.ceil(b.y2);
    }
    // 如果dpr不是整数或者.5的小数，需要格式化dirtyBounds
    const d = context.dpr % 1;
    if (d || d !== 0.5) {
      dirtyBounds.x1 = Math.floor(dirtyBounds.x1 * context.dpr) / context.dpr;
      dirtyBounds.y1 = Math.floor(dirtyBounds.y1 * context.dpr) / context.dpr;
      dirtyBounds.x2 = Math.ceil(dirtyBounds.x2 * context.dpr) / context.dpr;
      dirtyBounds.y2 = Math.ceil(dirtyBounds.y2 * context.dpr) / context.dpr;
    }
    this.backupDirtyBounds.copy(dirtyBounds);
    context.inuse = true;
    // 初始化context
    context.clearMatrix();
    context.setTransformForCurrent(true);

    const drawInArea =
      dirtyBounds.width() * context.dpr !== context.canvas.width ||
      dirtyBounds.height() * context.dpr !== context.canvas.height;
    context.save();

    // 设置translate
    context.translate(x, y, true);
    if (drawInArea) {
      context.beginPath();
      context.rect(dirtyBounds.x1, dirtyBounds.y1, dirtyBounds.width(), dirtyBounds.height());
      context.clip();
    }

    // 如果存在3d视角，那么不使用dirtyBounds
    if (stage.camera) {
      this.dirtyBounds.setValue(-Infinity, -Infinity, Infinity, Infinity);
      this.backupDirtyBounds.setValue(-Infinity, -Infinity, Infinity, Infinity);
    }

    this.clearScreen(renderService, context, drawContext);
    // // 渲染的时候图元的起始位置就是x，y
    // this.backupDirtyBounds.translate(-x, -y);
    // this.dirtyBounds.translate(-x, -y);

    // // 设置translate
    // context.translate(x, y, true);

    context.save();
    renderService.renderTreeRoots
      .sort((a, b) => {
        return (a.attribute.zIndex ?? DefaultAttribute.zIndex) - (b.attribute.zIndex ?? DefaultAttribute.zIndex);
      })
      .forEach(group => {
        this.renderGroup(group as IGroup, drawContext);
      });

    context.restore();
    context.restore();
    context.draw();
    // this.break = false;
    context.inuse = false;
  }

  doRegister() {
    throw new Error('暂不支持');
  }

  // 找到下一个graphic
  protected _findNextGraphic(group: IGroup): IGraphic | null {
    let parent = group.parent;
    let id = group._uid;
    while (parent) {
      const g = findNextGraphic(parent, id, DefaultAttribute.zIndex);
      if (g) {
        return g;
      }
      id = parent._uid;
      parent = parent.parent;
    }
    return null;
  }

  renderGroup(group: IGroup, drawContext: IDrawContext, skipSort?: boolean) {
    if (drawContext.break || group.attribute.visibleAll === false) {
      return;
    }
    if (group.incremental && (drawContext.startAtId == null || drawContext.startAtId === group._uid)) {
      drawContext.break = true;
      this._increaseRender(group, drawContext);
      return;
    }

    if (!isRectIntersect(group.AABBBounds, this.dirtyBounds, false)) {
      return;
    }

    const tempBounds = this.dirtyBounds.clone();

    // 变换dirtyBounds
    const m = group.globalTransMatrix.getInverse();
    this.dirtyBounds.copy(this.backupDirtyBounds).transformWithMatrix(m);

    this.renderItem(group, drawContext, {
      drawingCb: () => {
        skipSort
          ? group.forEachChildren((item: IGraphic) => {
              if (drawContext.break) {
                return;
              }
              if (item.isContainer) {
                this.renderGroup(item as IGroup, drawContext);
              } else {
                this.renderItem(item, drawContext);
              }
            })
          : foreach(
              group,
              DefaultAttribute.zIndex,
              (item: IGraphic) => {
                if (drawContext.break) {
                  return;
                }
                if (item.isContainer) {
                  this.renderGroup(item as IGroup, drawContext);
                } else {
                  this.renderItem(item, drawContext);
                }
              },
              false,
              !!drawContext.context?.camera
            );
      }
    });

    this.dirtyBounds.copy(tempBounds);
  }

  protected _increaseRender(group: IGroup, drawContext: IDrawContext) {
    const { layer, stage } = drawContext;
    const { subLayers } = layer;
    // 获取渐进渲染层
    let incrementalLayer = subLayers.get(group._uid);
    if (!incrementalLayer) {
      incrementalLayer = {
        layer: this.layerService.createLayer(stage),
        zIndex: subLayers.size,
        group
      };
      subLayers.set(group._uid, incrementalLayer);
    }
    // 渲染
    const incrementalContext = incrementalLayer.layer.getNativeHandler().getContext();
    const idc = incrementalLayer.drawContribution || container.get(IncrementalDrawContribution);
    idc.dirtyBounds.setValue(-Infinity, -Infinity, Infinity, Infinity);
    idc.backupDirtyBounds.setValue(-Infinity, -Infinity, Infinity, Infinity);
    (idc as any).draw(this.currentRenderService, {
      ...drawContext,
      drawContribution: idc,
      clear: 'transparent',
      layer: incrementalLayer.layer,
      context: incrementalContext,
      startAtId: group._uid,
      break: false
    });
    incrementalLayer.drawContribution = idc;
    // this.draw(this.currentRenderService, {...this.drawParams, startAtId: group._uid})
    // this.draw(this.currentRenderService, {...this.drawParams, clear: 'transparent', layer: incrementalContext.layer, context: incrementalContext, startAtId: group._uid})
    const nextGraphic = this._findNextGraphic(group);
    if (nextGraphic) {
      // 如果是下一个渐进渲染层，那就再来一次
      if (nextGraphic.isContainer && nextGraphic.incremental) {
        this._increaseRender(nextGraphic as IGroup, drawContext);
      } else {
        // 如果不是渐进渲染层，那就默认图层渲染
        let afterLayer = subLayers.get(nextGraphic._uid);
        if (!afterLayer) {
          afterLayer = {
            layer: this.layerService.createLayer(stage),
            zIndex: subLayers.size
          };
          subLayers.set(nextGraphic._uid, afterLayer);
        }
        const afterContext = afterLayer.layer.getNativeHandler().getContext();
        this.draw(this.currentRenderService, {
          ...drawContext,
          drawContribution: idc,
          clear: 'transparent',
          layer: afterLayer.layer,
          context: afterContext,
          startAtId: nextGraphic._uid,
          break: false
        });
      }
    }
  }

  getRenderContribution(graphic: IGraphic): IGraphicRender | null {
    let renderer = this.renderSelector.selector(graphic);
    if (!renderer) {
      renderer = this.selectRenderByNumberType(graphic.numberType);
    }
    if (!renderer) {
      renderer = this.selectRenderByType(graphic.type);
    }
    return renderer;
  }

  renderItem(graphic: IGraphic, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.beforeDrawItem) {
          if (drawContribution.beforeDrawItem(graphic, this.currentRenderService, drawContext, this, params)) {
            return;
          }
        }
      }
    }

    const renderer = this.getRenderContribution(graphic);
    if (!renderer) {
      return;
    }

    let retrans: boolean = false;
    let tempBounds: IAABBBounds;

    if (graphic.parent) {
      const { scrollX = 0, scrollY = 0 } = graphic.parent.attribute;
      retrans = !!(scrollX || scrollY);
      if (retrans) {
        tempBounds = this.dirtyBounds.clone();
        // 变换dirtyBounds
        const m = graphic.globalTransMatrix.getInverse();
        this.dirtyBounds.copy(this.backupDirtyBounds).transformWithMatrix(m);
        this.dirtyBounds.translate(-scrollX, -scrollY);
      }
    }

    if (!(graphic.isContainer || isRectIntersect(graphic.AABBBounds, this.dirtyBounds, false))) {
      retrans && this.dirtyBounds.copy(tempBounds);
      return;
    }

    const skipDraw = drawContext.startAtId != null && graphic._uid !== drawContext.startAtId;
    if (graphic._uid === drawContext.startAtId) {
      drawContext.startAtId = null;
    }
    params && (params.skipDraw = skipDraw);
    if (skipDraw) {
      graphic.isContainer && renderer.draw(graphic, this.currentRenderService, drawContext, params);
    } else {
      renderer.draw(graphic, this.currentRenderService, drawContext, params);
    }

    retrans && this.dirtyBounds.copy(tempBounds);

    // 添加拦截器
    if (this.InterceptorContributions.length) {
      for (let i = 0; i < this.InterceptorContributions.length; i++) {
        const drawContribution = this.InterceptorContributions[i];
        if (drawContribution.afterDrawItem) {
          if (drawContribution.afterDrawItem(graphic, this.currentRenderService, drawContext, this)) {
            return;
          }
        }
      }
    }
  }
  // 根据type选择对应的render
  protected selectRenderByType(type?: string): IGraphicRender | null {
    console.warn('未知错误，不应该走到这里');
    return null;
  }
  // 根据type选择对应的render
  protected selectRenderByNumberType(type?: number): IGraphicRender | null {
    return this.currentRenderMap.get(type) || this.defaultRenderMap.get(type);
  }

  protected clearScreen(renderService: IRenderService, context: IContext2d, drawContext: IDrawContext) {
    const { clear } = drawContext;
    if (clear) {
      const canvas = context.getCanvas();
      const { width = canvas.width, height = canvas.height } = drawContext;
      const x = 0;
      const y = 0;
      context.clearRect(x, y, width, height);
      const stage = renderService.drawParams?.stage;
      if (stage && (stage as any).backgroundImg && (stage as any).resources) {
        const res = (stage as any).resources.get(clear);
        if (res && res.state === 'success' && res.data) {
          context.drawImage(res.data, x, y, width, height);
        }
      } else {
        context.fillStyle = createColor(
          context,
          clear,
          {
            AABBBounds: { x1: x, y1: y, x2: x + width, y2: y + height }
          },
          0,
          0
        );
        context.fillRect(x, y, width, height);
      }
    }
  }

  afterDraw(renderService: IRenderService, drawParams: IDrawContext) {
    return;
  }
}
