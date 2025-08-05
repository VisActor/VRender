import { inject, injectable, named } from '../../../common/inversify-lite';
import type {
  IGraphicAttribute,
  IContext2d,
  IGroup,
  IMarkAttribute,
  IThemeAttribute,
  IGroupRenderContribution,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IContributionProvider,
  IGroupGraphicAttribute
} from '../../../interface';
import { getTheme } from '../../../graphic/theme';
import { getModelMatrix } from '../../../graphic/graphic-service/graphic-service';
import { isArray } from '@visactor/vutils';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { createRectPath } from '../../../common/shape/rect';
import { rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { GroupRenderContribution } from './contributions/constants';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { GROUP_NUMBER_TYPE } from '../../../graphic/constants';
import { BaseRenderContributionTime } from '../../../common/enums';
import { defaultGroupBackgroundRenderContribution } from './contributions';
import { multiplyMat4Mat4 } from '../../../common/matrix';
import { application } from '../../../application';

@injectable()
export class DefaultCanvasGroupRender implements IGraphicRender {
  type: 'group';
  numberType: number = GROUP_NUMBER_TYPE;

  _groupRenderContribitions: IGroupRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(GroupRenderContribution)
    protected readonly groupRenderContribitions: IContributionProvider<IGroupRenderContribution>
  ) {}

  reInit() {
    this._groupRenderContribitions = this.groupRenderContribitions.getContributions() || [];
    this._groupRenderContribitions.push(defaultGroupBackgroundRenderContribution);
  }

  drawShape(
    group: IGroup,
    context: IContext2d,
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
    ) => boolean,
    groupAttribute?: Required<IGroupGraphicAttribute>
  ) {
    // 提前判定，否则每次都要获取一堆属性
    const { clip, fill, stroke, background } = group.attribute;

    if (!(clip || fill || stroke || background)) {
      return;
    }

    groupAttribute = groupAttribute ?? getTheme(group, params?.theme).group;

    const {
      opacity = groupAttribute.opacity,
      width = groupAttribute.width,
      height = groupAttribute.height,
      fillOpacity = groupAttribute.fillOpacity,
      strokeOpacity = groupAttribute.strokeOpacity,
      cornerRadius = groupAttribute.cornerRadius,
      path = groupAttribute.path,
      lineWidth = groupAttribute.lineWidth,
      visible = groupAttribute.visible,
      fillStrokeOrder = groupAttribute.fillStrokeOrder,
      cornerType = groupAttribute.cornerType,
      x: originX = groupAttribute.x,
      y: originY = groupAttribute.y
    } = group.attribute;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height, fill);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height, false);
    const doFill = runFill(fill, background);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(group.valid && visible)) {
      return;
    }

    if (!clip) {
      if (!(doFill || doStroke)) {
        return;
      }

      // 如果存在fillCb和strokeCb，那就不直接跳过
      if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
        return;
      }
    }

    if (path && path.length && drawContext.drawContribution) {
      // 禁用fill和stroke
      const disableFill = context.disableFill;
      const disableStroke = context.disableStroke;
      const disableBeginPath = context.disableBeginPath;
      context.disableFill = true;
      context.disableStroke = true;
      context.disableBeginPath = true;
      path.forEach(g => {
        const rc = drawContext.drawContribution.getRenderContribution(g);
        rc.draw(g, drawContext.renderService, drawContext, params);
      });
      context.disableFill = disableFill;
      context.disableStroke = disableStroke;
      context.disableBeginPath = disableBeginPath;
    } else if (cornerRadius === 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
      // 不需要处理圆角
      context.beginPath();
      context.rect(x, y, width, height);
    } else {
      context.beginPath();
      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此rect不再使用cache
      createRectPath(context, x, y, width, height, cornerRadius, cornerType !== 'bevel');
    }

    if (!this._groupRenderContribitions) {
      this._groupRenderContribitions = this.groupRenderContribitions.getContributions() || [];
      this._groupRenderContribitions.push(defaultGroupBackgroundRenderContribution);
    }

    const doFillOrStroke = {
      doFill,
      doStroke
    };

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(group, group.attribute, groupAttribute);

    this._groupRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(group, group.attribute, x, y, groupAttribute);
        c.drawShape(
          group,
          context,
          x,
          y,
          doFill,
          doStroke,
          fVisible,
          sVisible,
          groupAttribute,
          drawContext,
          fillCb,
          strokeCb,
          doFillOrStroke
        );
      }
    });

    // beforeFillStroke contribition可以操作clip范围
    if (clip) {
      context.clip();
    }

    const _runFill = () => {
      if ((doFillOrStroke as any).doFill) {
        if (fillCb) {
          fillCb(context, group.attribute, groupAttribute);
        } else if (fVisible) {
          context.setCommonStyle(group, group.attribute, originX - x, originY - y, groupAttribute);
          context.fill();
        }
      }
    };

    const _runStroke = () => {
      if ((doFillOrStroke as any).doStroke) {
        if (strokeCb) {
          strokeCb(context, group.attribute, groupAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(group, group.attribute, originX - x, originY - y, groupAttribute);
          context.stroke();
        }
      }
    };

    if (!fillStrokeOrder) {
      _runFill();
      _runStroke();
    } else {
      _runStroke();
      _runFill();
    }

    this._groupRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(group, group.attribute, x, y, groupAttribute);
        c.drawShape(
          group,
          context,
          x,
          y,
          doFill,
          doStroke,
          fVisible,
          sVisible,
          groupAttribute,
          drawContext,
          fillCb,
          strokeCb
        );
      }
    });
  }

  draw(group: IGroup, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    const { clip, baseOpacity = 1, drawMode } = group.attribute;
    const lastNativeContext = context.nativeContext;
    const lastNativeCanvas = context.canvas.nativeCanvas;

    if (drawMode > 0) {
      const { x, y, width, height } = group.attribute;
      // 绘制到新的Canvas上，然后再绘制回来
      const canvas = context.canvas;
      const newCanvas = application.global.createCanvas({ width: canvas.width, height: canvas.height, dpr: 1 });
      const newContext = newCanvas.getContext('2d');
      const transform = context.nativeContext.getTransform();
      // 首先应用transform
      newContext.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      // 然后将背景绘制到新的canvas上，只绘制group的Bounds区域
      // 如果drawMode === 1，则需要背景
      // 如果drawMode === 2，则不需要背景，只需要group即可
      if (drawMode === 1) {
        newContext.save();
        newContext.clearRect(0, 0, canvas.width, canvas.height);
        newContext.beginPath();

        newContext.rect(x, y, width, height);
        newContext.clip();
        newContext.drawImage(
          canvas.nativeCanvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.displayWidth,
          canvas.displayHeight
        );
        newContext.restore();
      }
      // 狸猫换太子，把新的context赋值给context
      context.nativeContext = newContext;
      canvas.nativeCanvas = newCanvas;
    }
    if (clip) {
      context.save();
    } else {
      context.highPerformanceSave();
    }
    const baseGlobalAlpha = context.baseGlobalAlpha;
    context.baseGlobalAlpha *= baseOpacity;

    // const lastMatrix = context.modelMatrix;
    // if (context.camera) {
    //   const m = group.transMatrix;
    //   const matrix = createMat4();
    //   mat3Tomat4(matrix, m);
    //   const lastModelMatrix = context.modelMatrix;
    //   if (lastModelMatrix) {
    //     if (matrix) {
    //       const m = createMat4();
    //       context.modelMatrix = multiplyMat4Mat4(m, lastModelMatrix, matrix);
    //     }
    //   } else {
    //     context.modelMatrix = matrix;
    //   }
    // } else {
    //   // group直接transform
    //   context.transformFromMatrix(group.transMatrix, true);
    // }
    const lastModelMatrix = context.modelMatrix;
    const camera = context.camera;
    if (camera) {
      const groupAttribute = getTheme(group, params?.theme).group;
      const nextModelMatrix = mat4Allocate.allocate();
      // 计算模型矩阵
      const modelMatrix = mat4Allocate.allocate();
      getModelMatrix(modelMatrix, group, groupAttribute);
      if (lastModelMatrix) {
        multiplyMat4Mat4(nextModelMatrix, lastModelMatrix, modelMatrix);
      } else {
        multiplyMat4Mat4(nextModelMatrix, nextModelMatrix, modelMatrix);
      }
      context.modelMatrix = nextModelMatrix;
      mat4Allocate.free(modelMatrix);
      context.setTransform(1, 0, 0, 1, 0, 0, true);
    } else {
      // group直接transform
      context.transformFromMatrix(group.transMatrix, true);
    }

    context.beginPath();
    // 如果跳过绘制，那就不绘制
    if (params.skipDraw) {
      this.drawShape(
        group,
        context,
        0,
        0,
        drawContext,
        params,
        () => false,
        () => false
      );
    } else {
      this.drawShape(group, context, 0, 0, drawContext, null, null, null);
    }

    // 绘制子元素的时候要添加scroll
    const { scrollX, scrollY } = group.attribute;
    if (scrollX || scrollY) {
      context.translate(scrollX, scrollY);
    }
    let p: any;
    if (params && params.renderInGroup) {
      p = params.renderInGroup(
        params.renderInGroupParams?.skipSort,
        group,
        drawContext,
        params.renderInGroupParams?.nextM
      );
    }

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.baseGlobalAlpha = baseGlobalAlpha;

    if (drawMode > 0) {
      const { x, y, width, height } = group.attribute;
      // 将原始的context和canvas恢复，另外将newCanvas上的内容绘制到lastCanvas上
      const newContext = context.nativeContext;
      const newCanvas = context.canvas.nativeCanvas;
      lastNativeContext.save();
      lastNativeContext.setTransform(context.dpr, 0, 0, context.dpr, 0, 0, true);
      // 如果drawMode === 1，则需要清一下之前的背景，否则背景就重复绘制了一次
      if (drawMode === 1) {
        newContext.rect(x, y, width, height);
      }
      lastNativeContext.drawImage(
        newCanvas,
        0,
        0,
        newCanvas.width,
        newCanvas.height,
        0,
        0,
        context.canvas.displayWidth,
        context.canvas.displayHeight
      );
      const transform = newContext.getTransform();
      lastNativeContext.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      context.nativeContext = lastNativeContext;
      context.canvas.nativeCanvas = lastNativeCanvas;
      lastNativeContext.restore();
    }

    if (p && p.then) {
      p.then(() => {
        if (clip) {
          context.restore();
        } else {
          context.highPerformanceRestore();
        }
      });
    } else {
      if (clip) {
        context.restore();
      } else {
        context.highPerformanceRestore();
      }
    }
  }
}
