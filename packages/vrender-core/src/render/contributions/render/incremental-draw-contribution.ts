import { injectable, inject, named, multiInject } from '../../../common/inversify-lite';
import type {
  IGraphic,
  IGroup,
  IRenderService,
  IDrawContext,
  IDrawContribution,
  IGraphicRender,
  IDrawItemInterceptorContribution,
  IContributionProvider
} from '../../../interface';
import { DefaultAttribute } from '../../../graphic/config';
import { DefaultDrawContribution } from './draw-contribution';
import { SyncHook } from '../../../tapable';
import { GraphicRender } from './symbol';
import { DefaultIncrementalCanvasLineRender } from './incremental-line-render';
import { DefaultIncrementalCanvasAreaRender } from './incremental-area-render';
import { DrawItemInterceptor } from './draw-interceptor';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { foreachAsync } from '../../../common/sort';

enum STATUS {
  NORMAL = 0,
  STOP = 1
}

/**
 * 增量渲染的contribution，基于树状结构针对图元的渲染
 * 不是单例模式
 */
@injectable()
export class DefaultIncrementalDrawContribution extends DefaultDrawContribution implements IDrawContribution {
  rendering: boolean = false;
  protected currFrameStartAt: number = 0;
  protected currentIdx: number = 0;
  protected status: STATUS = STATUS.NORMAL;
  protected checkingForDrawPromise: Promise<any> | null = null;
  hooks = {
    completeDraw: new SyncHook<[]>([])
  };
  protected lastRenderService: IRenderService;
  protected lastDrawContext: IDrawContext;
  protected count: number;

  constructor(
    // @inject(ContributionProvider)
    // @named(GraphicRender)
    // protected readonly contributions: ContributionProvider<IGraphicRender>,
    @multiInject(GraphicRender) protected readonly contributions: IGraphicRender[],
    // @inject(RenderSelector) protected readonly renderSelector: IRenderSelector, // 根据图元类型选择对应的renderItem进行渲染
    @inject(DefaultIncrementalCanvasLineRender) protected readonly lineRender: IGraphicRender, // 默认的lineRender
    @inject(DefaultIncrementalCanvasAreaRender) protected readonly areaRender: IGraphicRender, // 默认的lineRender
    // 拦截器
    @inject(ContributionProvider)
    @named(DrawItemInterceptor)
    protected readonly drawItemInterceptorContributions: IContributionProvider<IDrawItemInterceptorContribution>
  ) {
    super(contributions, drawItemInterceptorContributions);
    this.defaultRenderMap.set(this.lineRender.numberType, this.lineRender);
    this.defaultRenderMap.set(this.areaRender.numberType, this.areaRender);
  }

  /**
   *
   * @param renderService
   * @param drawContext restartIncremental为true表示重新执行增量渲染，为false表示不执行增量渲染
   * @returns
   */
  async draw(renderService: IRenderService, drawContext: IDrawContext): Promise<void> {
    // 入口检查是否需要重新绘制
    if (this.checkingForDrawPromise) {
      return;
    }
    this.lastRenderService = renderService;
    this.lastDrawContext = drawContext;

    this.checkingForDrawPromise = this.checkForDraw(drawContext);
    const skipDraw = await this.checkingForDrawPromise;
    this.checkingForDrawPromise = null;
    if (skipDraw) {
      return;
    }

    this.currentRenderService = renderService;
    const { context, viewBox } = drawContext;

    if (!context) {
      return;
    }
    // 增量渲染不需要dirtyBounds
    // const dirtyBounds: IBounds | undefined = this.dirtyBounds.setValue(x, y, x + width, y + height);
    // if (stage.dirtyBounds) {
    //   const b = getRectIntersect(dirtyBounds, stage.dirtyBounds, false);
    //   dirtyBounds.x1 = Math.floor(b.x1);
    //   dirtyBounds.y1 = Math.floor(b.y1);
    //   dirtyBounds.x2 = Math.ceil(b.x2);
    //   dirtyBounds.y2 = Math.ceil(b.y2);
    // }
    context.inuse = true;
    // 初始化context
    context.clearMatrix();
    context.setTransformForCurrent(true);

    // const drawInArea =
    //   dirtyBounds.width() * context.dpr !== context.canvas.width ||
    //   dirtyBounds.height() * context.dpr !== context.canvas.height;
    context.save();

    // if (drawInArea) {
    //   context.beginPath();
    //   context.rect(dirtyBounds.x1, dirtyBounds.y1, dirtyBounds.width(), dirtyBounds.height());
    //   context.clip();
    // }

    // this.clearScreen(renderService, context, drawContext);

    // 绘制之前需要清空画布
    drawContext.restartIncremental && this.clearScreen(this.currentRenderService, context, drawContext);
    // 设置translate
    context.translate(viewBox.x1, viewBox.y1, true);

    context.save();
    renderService.renderTreeRoots
      .sort((a, b) => {
        return (a.attribute.zIndex ?? DefaultAttribute.zIndex) - (b.attribute.zIndex ?? DefaultAttribute.zIndex);
      })
      .forEach(group => {
        this.renderGroup(group as IGroup, drawContext);
      });

    this.hooks.completeDraw.tap('top-draw', () => {
      context.restore();
      context.restore();
      context.draw();
      context.inuse = false;
      this.rendering = false;
    });
  }

  protected async _increaseRender(group: IGroup, drawContext: IDrawContext) {
    this.rendering = true;
    await this._renderIncrementalGroup(group, drawContext);
    return;
  }

  // 默认group后只有一层节点，也就是group是叶子结点的父节点
  protected async _renderIncrementalGroup(group: IGroup, drawContext: IDrawContext) {
    this.count = group.count;
    await new Promise(resolve => {
      this.renderItem(group, drawContext, {
        drawingCb: async () => {
          // 增量图元只支持一个，线段和面积图
          if (group.count === 2) {
            const graphic = group.getChildAt(0) as IGraphic;
            if (graphic.incremental && (graphic.attribute as any).segments) {
              if (!graphic.incrementalAt) {
                graphic.incrementalAt = 0;
              }
              while (graphic.incrementalAt < (graphic.attribute as any).segments.length) {
                drawContext.multiGraphicOptions = {
                  startAtIdx: graphic.incrementalAt,
                  length: graphic.incremental
                };
                this.renderItem(graphic, drawContext);
                graphic.incrementalAt += graphic.incremental;
                await this.waitToNextFrame();
              }
            } else {
              this.renderItem(graphic, drawContext);
            }
            resolve(false);
            return;
          }
          await foreachAsync(group, DefaultAttribute.zIndex, (item: IGraphic, i: number) => {
            if (this.status === STATUS.STOP) {
              return true;
            }
            if (item.isContainer) {
              // 增量渲染group下不应该有其他的group节点
              return false;
            }
            // 如果小于currentIdx，说明还没到当前的位置，那就直接跳过
            if (i < this.currentIdx) {
              return false;
            }
            const frameTail = this.currFrameStartAt + group.incremental;
            // 绘制 currentIdx到this.lastFrameIdx + group.incremental的内容
            if (i < frameTail) {
              this.currentIdx = i + 1;
              this.renderItem(item, drawContext);
            }
            // 下一帧
            if (i === frameTail - 1) {
              this.currFrameStartAt = this.currentIdx;
              // this.lastFrameIdx = this.currentIdx;
              return this.waitToNextFrame();
            }

            return false;
          });
          resolve(false);
        }
      });
    });
    this.hooks.completeDraw.call();
  }

  protected async waitToNextFrame(): Promise<boolean> {
    return new Promise(resolve => {
      this.global.getRequestAnimationFrame()(() => {
        resolve(false);
      });
    });
  }

  /**
   * 检查这次绘制是否跳过，以及执行一些准备
   * 增量渲染有自己的绘制逻辑流程，外部每次触发draw，该图层不一定会执行
   * @returns 返回true代表跳过绘制，false代表进行绘制
   */
  protected async checkForDraw(drawContext: IDrawContext): Promise<boolean> {
    let skip = this.rendering;
    if (drawContext.restartIncremental) {
      skip = false;
      await this.forceStop();
      this.resetToInit();
    }
    return skip;
  }

  protected async forceStop() {
    if (this.rendering) {
      this.status = STATUS.STOP;
      await new Promise(resolve => {
        this.hooks.completeDraw.tap('stopCb', () => {
          this.status = STATUS.NORMAL;
          this.hooks.completeDraw.taps = this.hooks.completeDraw.taps.filter(item => {
            return item.name !== 'stopCb';
          });
          resolve(false);
        });
      });
    }
  }

  protected resetToInit() {
    this.currFrameStartAt = 0;
    this.currentIdx = 0;
  }

  async renderGroup(group: IGroup, drawContext: IDrawContext) {
    if (drawContext.break || group.attribute.visibleAll === false) {
      return;
    }
    if (group.incremental && drawContext.startAtId === group._uid) {
      await this._increaseRender(group, drawContext);
      drawContext.break = true;
      return;
    }

    await new Promise(resolve => {
      this.renderItem(group, drawContext, {
        drawingCb: async () => {
          await foreachAsync(group, DefaultAttribute.zIndex, async (item: IGraphic) => {
            if (drawContext.break) {
              return;
            }
            if (item.isContainer) {
              await this.renderGroup(item as IGroup, drawContext);
            } else {
              // 增量渲染不管非_increaseRender的内容
              return;
            }
          });
          resolve(false);
        }
      });
    });
  }

  // /**
  //  * 一个每一帧都执行的脚本，用于检查和触发执行draw
  //  */
  // protected autoRunner() {

  // }
}
