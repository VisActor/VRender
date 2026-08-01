import { AABBBounds, Matrix } from '@visactor/vutils';
import { mat3Tomat4, multiplyMat4Mat4 } from '../../../common/matrix';
import { createGraphic } from '../../../graphic/graphic-creator';
import type {
  IContext2d,
  IDrawContext,
  IDrawContribution,
  IDrawItemInterceptorContribution,
  IGraphic,
  IGraphicRenderDrawParams,
  IGroup,
  ILayer,
  IRenderService
} from '../../../interface';
import { mat4Allocate, matrixAllocate } from '../../../allocator/matrix-allocate';
import { draw3dItem } from '../../../common/3d-interceptor';

// 拦截器
export const DrawItemInterceptor = Symbol.for('DrawItemInterceptor');

/** 挂在交互层克隆上的 postMatrix 缓存，避免每帧重新分配 */
const INTERACTIVE_POST_MATRIX = '_interactivePostMatrix';

// export class DefaultDrawItemInterceptor implements IDrawItemInterceptor {
//   drawItem(graphic: IGraphic, renderService: IRenderService, params?: IGraphicRenderDrawParams): boolean {
//     return false;
//   }
// }

const tempDirtyBounds = new AABBBounds();
const tempBackupDirtyBounds = new AABBBounds();
/**
 * 影子节点拦截器，用于渲染影子节点
 */
export class ShadowRootDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
  order: number = 1;
  afterDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    // 如果graphic没设置shadowRootIdx，shadowRoot设置了，那就使用shadowRoot的shadowRootIdx
    if (
      graphic.attribute.shadowRootIdx == null &&
      graphic.shadowRoot &&
      graphic.shadowRoot.attribute.shadowRootIdx < 0
    ) {
      return false;
    }
    if (
      graphic.attribute.shadowRootIdx > 0 ||
      !graphic.attribute.shadowRootIdx ||
      (graphic.shadowRoot && graphic.shadowRoot.attribute.shadowRootIdx > 0)
    ) {
      this.drawItem(graphic, renderService, drawContext, drawContribution, params);
    }
    return false;
  }

  beforeDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    // 如果graphic没设置shadowRootIdx，shadowRoot设置了，那就使用shadowRoot的shadowRootIdx
    if (
      graphic.attribute.shadowRootIdx == null &&
      graphic.shadowRoot &&
      graphic.shadowRoot.attribute.shadowRootIdx > 0
    ) {
      return false;
    }
    if (graphic.attribute.shadowRootIdx < 0 || (graphic.shadowRoot && graphic.shadowRoot.attribute.shadowRootIdx < 0)) {
      this.drawItem(graphic, renderService, drawContext, drawContribution, params);
    }
    return false;
  }

  protected drawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    if (!graphic.shadowRoot) {
      return false;
    }

    const { context } = drawContext;
    context.highPerformanceSave();
    // 直接transform
    context.transformFromMatrix(graphic.transMatrix, true);

    // 变换dirtyBounds
    if (drawContribution.dirtyBounds && drawContribution.backupDirtyBounds) {
      tempDirtyBounds.copy(drawContribution.dirtyBounds);
      tempBackupDirtyBounds.copy(drawContribution.backupDirtyBounds);
      const m = graphic.globalTransMatrix.getInverse();
      drawContribution.dirtyBounds.copy(drawContribution.backupDirtyBounds).transformWithMatrix(m);
      drawContribution.backupDirtyBounds.copy(drawContribution.dirtyBounds);
    }

    // 设置context的transform到上一个节点
    drawContribution.renderGroup(graphic.shadowRoot, drawContext, matrixAllocate.allocate(1, 0, 0, 1, 0, 0));

    context.highPerformanceRestore();

    if (drawContribution.dirtyBounds && drawContribution.backupDirtyBounds) {
      drawContribution.dirtyBounds.copy(tempDirtyBounds);
      drawContribution.backupDirtyBounds.copy(tempBackupDirtyBounds);
    }

    return true;
  }
}

export class DebugDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
  order: number = 1;

  afterDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    if (graphic.attribute._debug_bounds) {
      this.drawItem(graphic, renderService, drawContext, drawContribution, params);
    }
    return false;
  }

  protected drawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    if (!graphic.attribute._debug_bounds) {
      return false;
    }

    const { context } = drawContext;
    context.highPerformanceSave();
    // 直接transform
    graphic.parent && context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
    graphic.glyphHost &&
      graphic.glyphHost.parent &&
      context.setTransformFromMatrix(graphic.glyphHost.parent.globalTransMatrix, true);

    const b = graphic.AABBBounds;

    if (graphic.attribute._debug_bounds !== true) {
      graphic.attribute._debug_bounds(context, graphic);
    }
    context.strokeRect(b.x1, b.y1, b.width(), b.height());

    context.highPerformanceRestore();

    return true;
  }
}

export class CommonDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
  order: number = 1;
  interceptors: IDrawItemInterceptorContribution[];
  constructor() {
    this.interceptors = [
      new ShadowRootDrawItemInterceptorContribution(),
      new Canvas3DDrawItemInterceptor(),
      new InteractiveDrawItemInterceptorContribution(),
      new DebugDrawItemInterceptorContribution()
    ];
  }
  afterDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    // 【性能方案】判定写在外层,减少遍历判断耗时，10000条数据减少1ms
    if (
      (!graphic.in3dMode || drawContext.in3dInterceptor) &&
      !graphic.shadowRoot &&
      !graphic.attribute._debug_bounds &&
      !(graphic.baseGraphic || graphic.attribute.globalZIndex || graphic.interactiveGraphic)
    ) {
      return false;
    }

    for (let i = 0; i < this.interceptors.length; i++) {
      if (
        this.interceptors[i].afterDrawItem &&
        this.interceptors[i].afterDrawItem(graphic, renderService, drawContext, drawContribution, params)
      ) {
        return true;
      }
    }
    return false;
  }

  beforeDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    // 【性能方案】判定写在外层,减少遍历判断耗时，10000条数据减少1ms
    if (
      (!graphic.in3dMode || drawContext.in3dInterceptor) &&
      !graphic.shadowRoot &&
      !graphic.attribute._debug_bounds &&
      !(graphic.baseGraphic || graphic.attribute.globalZIndex || graphic.interactiveGraphic)
    ) {
      return false;
    }

    for (let i = 0; i < this.interceptors.length; i++) {
      if (
        this.interceptors[i].beforeDrawItem &&
        this.interceptors[i].beforeDrawItem(graphic, renderService, drawContext, drawContribution, params)
      ) {
        return true;
      }
    }
    return false;
  }
}

/**
 * 交互层节点拦截器，用于支持交互层图元
 */
export class InteractiveDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
  order: number = 1;
  processing: boolean;
  // afterDrawItem(
  //   graphic: IGraphic,
  //   renderService: IRenderService,
  //   drawContext: IDrawContext,
  //   drawContribution: IDrawContribution,
  //   params?: IGraphicRenderDrawParams
  // ): boolean {

  //   if (graphic.attribute.shadowRootIdx > 0 || !graphic.attribute.shadowRootIdx) {
  //     this.drawItem(graphic, renderService, drawContext, drawContribution, params);
  //   }
  //   return false;
  // }

  beforeDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    if (this.processing) {
      return false;
    }
    // 判断是否在交互层
    if (graphic.baseGraphic) {
      return this.beforeDrawInteractive(graphic, renderService, drawContext, drawContribution, params);
    }
    return this.beforeSetInteractive(graphic, renderService, drawContext, drawContribution, params);
  }

  /**
   * 用于提升interactive
   * @param graphic
   * @param renderService
   * @param drawContext
   * @param drawContribution
   * @param params
   */
  /**
   * 算出克隆的 postMatrix，让它落在原图元所在的位置上。
   *
   * 目标是 clone.globalTransMatrix === graphic.globalTransMatrix。克隆和原图元的属性一致，局部矩阵
   * `L`（不含 postMatrix）相同，于是：
   *   graphic.globalTransMatrix = P × (ownPost × L) × T(scroll)      —— 见 doUpdateGlobalMatrix
   *   clone.globalTransMatrix   = clonePost × L
   * 把中间的 scroll 平移左移出来（T 为纯平移，`own × T(s) × own⁻¹` 仍是平移，位移量即 own 的线性部分
   * 作用在 s 上），两边约掉 L 即得：
   *   clonePost = P × T(own · scroll) × ownPost
   * 每帧复用挂在克隆上的同一个 Matrix，避免反复分配。
   */
  protected resolveInteractivePostMatrix(graphic: IGraphic, interactiveGraphic: IGraphic): Matrix | undefined {
    const parent = graphic.parent;
    // 没有祖先时克隆自身的 postMatrix 就已经是完整变换，保持原样
    if (!parent) {
      return graphic.attribute.postMatrix;
    }
    let matrix: Matrix = (interactiveGraphic as any)[INTERACTIVE_POST_MATRIX];
    if (!matrix) {
      matrix = new Matrix();
      (interactiveGraphic as any)[INTERACTIVE_POST_MATRIX] = matrix;
    }
    const ancestorMatrix = (parent as IGroup).globalTransMatrix;
    matrix.setValue(
      ancestorMatrix.a,
      ancestorMatrix.b,
      ancestorMatrix.c,
      ancestorMatrix.d,
      ancestorMatrix.e,
      ancestorMatrix.f
    );
    const { scrollX = 0, scrollY = 0 } = parent.attribute;
    if (scrollX || scrollY) {
      const ownMatrix = graphic.transMatrix;
      matrix.translate(
        ownMatrix.a * scrollX + ownMatrix.c * scrollY,
        ownMatrix.b * scrollX + ownMatrix.d * scrollY
      );
    }
    // 克隆是从原图元 clone 来的，自带原图元的 postMatrix，不能被祖先变换顶掉
    const ownPostMatrix = graphic.attribute.postMatrix;
    if (ownPostMatrix) {
      matrix.multiply(
        ownPostMatrix.a,
        ownPostMatrix.b,
        ownPostMatrix.c,
        ownPostMatrix.d,
        ownPostMatrix.e,
        ownPostMatrix.f
      );
    }
    return matrix;
  }

  beforeSetInteractive(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    let interactiveGraphic: IGraphic = graphic.interactiveGraphic;
    if (graphic.attribute.globalZIndex) {
      if (!interactiveGraphic) {
        interactiveGraphic = graphic.clone();
        graphic.interactiveGraphic = interactiveGraphic;
        interactiveGraphic.baseGraphic = graphic;
      }
      // 设置位置
      // 克隆挂进交互层后就脱离了原图元的祖先链，只剩自身的局部变换。绘制由 beforeDrawInteractive 用
      // baseGraphic.parent.globalTransMatrix 手动补偿，但克隆自身的包围盒补不到，会整体少一个祖先变换；
      // pickGroup 的 insideGroup 预筛读的正是这个包围盒，落在偏移框外的图元会被整层跳过而拾取不到。
      interactiveGraphic.setAttributes(
        {
          globalZIndex: 0,
          zIndex: graphic.attribute.globalZIndex,
          postMatrix: this.resolveInteractivePostMatrix(graphic, interactiveGraphic)
        },
        false,
        { skipUpdateCallback: true }
      );
      // 添加到交互层中
      drawContext.stage.tryInitInteractiveLayer();
      const interactiveLayer = drawContext.stage.getLayer('_builtin_interactive');
      if (interactiveLayer) {
        const shadowRoot = this.getShadowRoot(interactiveLayer);
        shadowRoot.add(interactiveGraphic);
      }
      return true;
    } else if (interactiveGraphic) {
      // 从交互层中删除
      drawContext.stage.tryInitInteractiveLayer();
      const interactiveLayer = drawContext.stage.getLayer('_builtin_interactive');
      if (interactiveLayer) {
        const shadowRoot = this.getShadowRoot(interactiveLayer);
        shadowRoot.removeChild(interactiveGraphic);
      }
      graphic.interactiveGraphic = null;
      interactiveGraphic.baseGraphic = null;
    }
    return false;
  }

  /**
   * 用于绘制interactive
   * @param graphic
   * @param renderService
   * @param drawContext
   * @param drawContribution
   * @param params
   */
  beforeDrawInteractive(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ): boolean {
    // 默认使用原始的图元
    const baseGraphic = graphic.baseGraphic as IGraphic;
    // 如果主图元被删除了，那把交互图元这个也删除
    // 一直往上找
    let intree = !!baseGraphic.stage;
    let _g = baseGraphic.parent;
    while (intree && _g) {
      if ((_g as any).stage === _g) {
        break;
      }
      intree = !!_g.stage;
      _g = _g.parent;
    }
    if (!intree) {
      const interactiveLayer = drawContext.stage.getLayer('_builtin_interactive');
      if (interactiveLayer) {
        const shadowRoot = this.getShadowRoot(interactiveLayer);
        shadowRoot.removeChild(graphic);
      }
      return true;
    }
    if (baseGraphic) {
      this.processing = true;
      const { context } = drawContext;
      context.highPerformanceSave();
      // 直接transform
      context.setTransformFromMatrix(baseGraphic.parent.globalTransMatrix, true);
      // context.fillRect(0, 0, 100, 100);
      // 设置context的transform到上一个节点
      baseGraphic.isContainer
        ? drawContribution.renderGroup(baseGraphic as IGroup, drawContext, baseGraphic.parent.globalTransMatrix)
        : drawContribution.renderItem(baseGraphic, drawContext);

      context.highPerformanceRestore();
      this.processing = false;

      return true;
    }
    return false;
  }
  getShadowRoot(interactiveLayer: ILayer) {
    // 获取绑定影子节点的group
    let group = interactiveLayer.getElementById('_interactive_group') as IGroup;
    if (!group) {
      group = createGraphic('group', {});
      group.id = '_interactive_group';
      interactiveLayer.add(group);
    }
    return group.shadowRoot ?? group.attachShadow();
  }
}

/**
 * 3d拦截器，用于渲染3d视角
 */
export class Canvas3DDrawItemInterceptor implements IDrawItemInterceptorContribution {
  // canvas?: ICanvas;
  order: number = 1;

  beforeDrawItem(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    drawContribution: IDrawContribution,
    params?: IGraphicRenderDrawParams
  ) {
    if (!graphic.in3dMode || drawContext.in3dInterceptor) {
      return false;
    }

    drawContext.in3dInterceptor = true;
    const { context, stage } = renderService.drawParams;

    // 使用3d模式渲染
    context.save();
    this.initCanvasCtx(context);
    context.camera = stage.camera;

    // 将三维矩阵换成四维矩阵
    const m = context.currentMatrix;
    m.a /= context.dpr;
    m.b /= context.dpr;
    m.c /= context.dpr;
    m.d /= context.dpr;
    m.e /= context.dpr;
    m.f /= context.dpr;
    const matrix = mat4Allocate.allocate();
    mat3Tomat4(matrix, m);
    const lastModelMatrix = context.modelMatrix;
    if (lastModelMatrix) {
      if (matrix) {
        const m = mat4Allocate.allocate();
        context.modelMatrix = multiplyMat4Mat4(m, lastModelMatrix, matrix);
      }
    } else {
      context.modelMatrix = matrix;
    }
    context.setTransform(1, 0, 0, 1, 0, 0, true);

    // 设置context的transform到上一个节点
    if (graphic.isContainer) {
      draw3dItem(
        context,
        graphic,
        (isPie: boolean, is3d: boolean) => {
          return drawContribution.renderGroup(
            graphic as IGroup,
            drawContext,
            graphic.parent.globalTransMatrix,
            !isPie && is3d
          );
        },
        drawContext
      );
    } else {
      drawContribution.renderItem(graphic, drawContext);
    }
    context.camera = null;
    context.restore();

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    drawContext.in3dInterceptor = false;
    return true;
  }

  initCanvasCtx(context: IContext2d) {
    context.setTransformForCurrent();
  }
}
