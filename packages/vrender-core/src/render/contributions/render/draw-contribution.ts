import { injectable, inject, named, multiInject } from '../../../common/inversify-lite';
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
  IGlobal
} from '../../../interface';
import { findNextGraphic, foreach } from '../../../common/sort';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { DefaultAttribute } from '../../../graphic/config';
import type { IAABBBounds, IBounds, IMatrix } from '@visactor/vutils';
import { Bounds, Logger, getRectIntersect, isRectIntersect } from '@visactor/vutils';
import { container } from '../../../container';
import { GraphicRender, IncrementalDrawContribution } from './symbol';
import { DrawItemInterceptor } from './draw-interceptor';
import { createColor } from '../../../common/canvas-utils';
import type { ILayerService } from '../../../interface/core';
import { boundsAllocate } from '../../../allocator/bounds-allocate';
import { matrixAllocate } from '../../../allocator/matrix-allocate';
import { application } from '../../../application';

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
  // 是否使用dirtyBounds
  declare useDirtyBounds: boolean;
  declare currentRenderService: IRenderService;
  declare InterceptorContributions: IDrawItemInterceptorContribution[];

  declare global: IGlobal;
  declare layerService: ILayerService;

  declare scrollMatrix?: IMatrix;

  constructor(
    // @inject(ContributionProvider)
    // @named(GraphicRender)
    // protected readonly contributions: ContributionProvider<IGraphicRender>,
    @multiInject(GraphicRender) protected readonly contributions: IGraphicRender[],
    // @inject(RenderSelector) protected readonly renderSelector: IRenderSelector, // 根据图元类型选择对应的renderItem进行渲染
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
    this.global = application.global;
    this.layerService = application.layerService;
    this.init();
  }

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

  prepareForDraw(renderService: IRenderService, drawContext: IDrawContext) {
    // 有dirtyBounds用dirtyBounds
    if (drawContext.updateBounds) {
      this.useDirtyBounds = true;
    } else {
      // 没有的话，看看是否需要跳过outRange的渲染
      this.useDirtyBounds = !drawContext.stage.params.optimize.disableCheckGraphicWidthOutRange;
    }
  }

  draw(renderService: IRenderService, drawContext: IDrawContext): MaybePromise<void> {
    this.prepareForDraw(renderService, drawContext);
    drawContext.drawContribution = this;
    this.currentRenderMap = this.styleRenderMap.get(drawContext.renderStyle) || this.defaultRenderMap;
    // this.startAtId = drawParams.startAtId;
    this.currentRenderService = renderService;
    // this.drawParams = drawParams;
    const { context, stage, viewBox, transMatrix } = drawContext;

    if (!context) {
      return;
    }
    // if (context.drawPromise) {
    //   return;
    // }
    const dirtyBounds: IBounds | undefined = this.dirtyBounds.setValue(0, 0, viewBox.width(), viewBox.height());
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
    context.setClearMatrix(transMatrix.a, transMatrix.b, transMatrix.c, transMatrix.d, transMatrix.e, transMatrix.f);
    // 初始化context
    context.clearMatrix();
    context.setTransformForCurrent(true);

    // const drawInArea =
    //   dirtyBounds.width() * context.dpr < context.canvas.width ||
    //   dirtyBounds.height() * context.dpr < context.canvas.height;
    // context.save();

    // 设置translate
    context.translate(viewBox.x1, viewBox.y1, true);
    context.beginPath();
    context.rect(dirtyBounds.x1, dirtyBounds.y1, dirtyBounds.width(), dirtyBounds.height());
    context.clip();

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
        group.isContainer
          ? this.renderGroup(group as IGroup, drawContext, matrixAllocate.allocate(1, 0, 0, 1, 0, 0))
          : this.renderItem(group as IGraphic, drawContext);
      });

    // context.restore();
    context.restore();
    context.setClearMatrix(1, 0, 0, 1, 0, 0);
    // this.break = false;
    context.inuse = false;
    context.draw();
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

  renderGroup(group: IGroup, drawContext: IDrawContext, parentMatrix: IMatrix, skipSort?: boolean) {
    if (drawContext.break || group.attribute.visibleAll === false) {
      return;
    }
    if (group.incremental && (drawContext.startAtId == null || drawContext.startAtId === group._uid)) {
      drawContext.break = true;
      this._increaseRender(group, drawContext);
      return;
    }

    if (this.useDirtyBounds && !isRectIntersect(group.AABBBounds, this.dirtyBounds, false)) {
      return;
    }

    let nextM: IMatrix = parentMatrix;
    let tempBounds: IBounds;

    if (this.useDirtyBounds) {
      tempBounds = boundsAllocate.allocateByObj(this.dirtyBounds);
      // 变换dirtyBounds
      const gm = group.transMatrix;
      nextM = matrixAllocate.allocateByObj(parentMatrix).multiply(gm.a, gm.b, gm.c, gm.d, gm.e, gm.f);
      // const m = group.globalTransMatrix.getInverse();
      this.dirtyBounds.copy(this.backupDirtyBounds).transformWithMatrix(nextM.getInverse());
    }

    this.renderItem(group, drawContext, {
      drawingCb: () => {
        skipSort
          ? group.forEachChildren((item: IGraphic) => {
              if (drawContext.break) {
                return;
              }
              if (item.isContainer) {
                this.renderGroup(item as IGroup, drawContext, nextM);
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
                  this.renderGroup(item as IGroup, drawContext, nextM);
                } else {
                  this.renderItem(item, drawContext);
                }
              },
              false,
              !!drawContext.context?.camera
            );
      }
    });

    if (this.useDirtyBounds) {
      this.dirtyBounds.copy(tempBounds);
      boundsAllocate.free(tempBounds);
      matrixAllocate.free(nextM);
    }
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
    let renderer;
    if (!renderer) {
      renderer = this.selectRenderByNumberType(graphic.numberType, graphic);
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
        if (
          drawContribution.beforeDrawItem &&
          drawContribution.beforeDrawItem(graphic, this.currentRenderService, drawContext, this, params)
        ) {
          return;
        }
      }
    }

    const renderer = this.getRenderContribution(graphic);
    if (!renderer) {
      return;
    }

    let retrans: boolean = this.scrollMatrix && (this.scrollMatrix.e !== 0 || this.scrollMatrix.f !== 0);
    let tempBounds: IBounds;

    if (graphic.parent) {
      const { scrollX = 0, scrollY = 0 } = graphic.parent.attribute;
      if (!!(scrollX || scrollY)) {
        retrans = true;
        if (!this.scrollMatrix) {
          this.scrollMatrix = matrixAllocate.allocate(1, 0, 0, 1, 0, 0);
        }
        this.scrollMatrix.translate(-scrollX, -scrollY);
      }
    }
    // 需要二次变化，那就重新算一个变换后的Bounds
    if (retrans) {
      tempBounds = this.dirtyBounds.clone().transformWithMatrix(this.scrollMatrix);
    }

    if (
      this.useDirtyBounds &&
      !(graphic.isContainer || isRectIntersect(graphic.AABBBounds, tempBounds ?? this.dirtyBounds, false))
    ) {
      if (retrans && graphic.parent) {
        const { scrollX = 0, scrollY = 0 } = graphic.parent.attribute;
        this.scrollMatrix && this.scrollMatrix.translate(scrollX, scrollY);
      }
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

    // retrans && this.dirtyBounds.copy(tempBounds);
    if (retrans && graphic.parent) {
      const { scrollX = 0, scrollY = 0 } = graphic.parent.attribute;
      this.scrollMatrix && this.scrollMatrix.translate(scrollX, scrollY);
    }

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
    Logger.getInstance().warn('未知错误，不应该走到这里');
    return null;
  }
  // 根据type选择对应的render
  protected selectRenderByNumberType(type: number, graphic: IGraphic): IGraphicRender | null {
    let data;
    if (graphic.attribute.renderStyle) {
      const currentRenderMap = this.styleRenderMap.get(graphic.attribute.renderStyle);
      data = currentRenderMap && currentRenderMap.get(type);
    }
    return data || this.currentRenderMap.get(type) || this.defaultRenderMap.get(type);
  }

  protected clearScreen(renderService: IRenderService, context: IContext2d, drawContext: IDrawContext) {
    const { clear, viewBox } = drawContext;
    // 已经translate过了
    const x = 0;
    const y = 0;
    const width = viewBox.width();
    const height = viewBox.height();
    if (clear) {
      context.clearRect(x, y, width, height);
      const stage = renderService.drawParams?.stage;
      stage && (context.globalAlpha = (stage as any).attribute.opacity ?? 1);
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
