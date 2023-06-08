import { inject, injectable, named } from 'inversify';
import { IGraphicAttribute, IContext2d, IGroup, IMarkAttribute, IThemeAttribute, mat4 } from '../../../interface';
import { getModelMatrix, getTheme, GROUP_NUMBER_TYPE, multiplyMat4Mat4 } from '../../../graphic';
import { IDrawContext, IRenderService } from '../../render-service';
import { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { isArray } from '@visactor/vutils';
import { ContributionProvider } from '../../../common/contribution-provider';
import { createRectPath } from '../../../common/shape/rect';
import { rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { GroupRenderContribution, IGroupRenderContribution } from './contributions/group-contribution-render';
import { BaseRenderContributionTime } from './contributions/base-contribution-render';
import { mat4Allocate } from '../../../modules';

@injectable()
export class DefaultCanvasGroupRender implements IGraphicRender {
  type: 'group';
  numberType: number = GROUP_NUMBER_TYPE;

  _groupRenderContribitions: IGroupRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(GroupRenderContribution)
    protected readonly groupRenderContribitions: ContributionProvider<IGroupRenderContribution>
  ) {}

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
    ) => boolean
  ) {
    // const groupAttribute = graphicService.themeService.getCurrentTheme().groupAttribute;
    const groupAttribute = getTheme(group, params?.theme).group;
    const {
      fill = groupAttribute.fill,
      background,
      stroke = groupAttribute.stroke,
      opacity = groupAttribute.opacity,
      width = groupAttribute.width,
      height = groupAttribute.height,
      clip = groupAttribute.clip,
      fillOpacity = groupAttribute.fillOpacity,
      strokeOpacity = groupAttribute.strokeOpacity,
      borderRadius = groupAttribute.borderRadius,
      path = groupAttribute.path,
      lineWidth = groupAttribute.lineWidth,
      visible = groupAttribute.visible
    } = group.attribute;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(group.valid && visible)) {
      return;
    }

    if (!clip) {
      if (!(doFill || doStroke || background)) {
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
    } else if (borderRadius === 0 || (isArray(borderRadius) && (<number[]>borderRadius).every(num => num === 0))) {
      // 不需要处理圆角
      context.beginPath();
      context.rect(x, y, width, height);
    } else {
      context.beginPath();
      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此rect不再使用cache
      createRectPath(context, x, y, width, height, borderRadius);
    }

    if (!this._groupRenderContribitions) {
      this._groupRenderContribitions = this.groupRenderContribitions.getContributions() || [];
    }

    const doFillOrStroke = {
      doFill,
      doStroke
    };

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

    // shadow
    context.setShadowStyle && context.setShadowStyle(group, group.attribute, groupAttribute);

    if (doFillOrStroke.doFill) {
      if (fillCb) {
        fillCb(context, group.attribute, groupAttribute);
      } else if (fVisible) {
        context.setCommonStyle(group, group.attribute, x, y, groupAttribute);
        context.fill();
      }
    }
    if (doFillOrStroke.doStroke) {
      if (strokeCb) {
        strokeCb(context, group.attribute, groupAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(group, group.attribute, x, y, groupAttribute);
        context.stroke();
      }
    }

    this._groupRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(group, group.attribute, x, y, groupAttribute);
        c.drawShape(group, context, x, y, doFill, doStroke, fVisible, sVisible, groupAttribute, fillCb, strokeCb);
      }
    });
  }

  draw(group: IGroup, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }
    // debugger;
    const { clip } = group.attribute;
    if (clip) {
      context.save();
    } else {
      context.highPerformanceSave();
    }

    const groupAttribute = getTheme(group, params?.theme).group;

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
      this.drawShape(group, context, 0, 0, drawContext);
    }

    // 绘制子元素的时候要添加scroll
    const { scrollX = groupAttribute.scrollX, scrollY = groupAttribute.scrollY } = group.attribute;
    if (scrollX || scrollY) {
      context.translate(scrollX, scrollY);
    }
    let p: any;
    if (params && params.drawingCb) {
      p = params.drawingCb();
    }

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

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
