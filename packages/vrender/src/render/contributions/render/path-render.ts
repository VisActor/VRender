import { inject, injectable, named } from 'inversify';
import { ContributionProvider, renderCommandList } from '../../../common';
import {
  IPath,
  ICustomPath2D,
  IContext2d,
  IThemeAttribute,
  IGraphicAttribute,
  IMarkAttribute
} from '../../../interface';
import { IDrawContext, IRenderService } from '../../render-service';
import { getModelMatrix, getTheme, multiplyMat4Mat4, PATH_NUMBER_TYPE, shouldUseMat4 } from '../../../graphic';
import { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { IPathRenderContribution, PathRenderContribution } from './contributions/path-contribution-render';
import { BaseRenderContributionTime } from './contributions/base-contribution-render';
import { BaseRender } from './base-render';
import { mat4Allocate } from '../../../modules';

@injectable()
export class DefaultCanvasPathRender extends BaseRender<IPath> implements IGraphicRender {
  type: 'path';
  numberType: number = PATH_NUMBER_TYPE;
  declare z: number;

  protected _pathRenderContribitions: IPathRenderContribution[];

  constructor(
    @inject(ContributionProvider)
    @named(PathRenderContribution)
    protected readonly pathRenderContribitions: ContributionProvider<IPathRenderContribution>
  ) {
    super();
  }

  drawShape(
    path: IPath,
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
    // const pathAttribute = graphicService.themeService.getCurrentTheme().pathAttribute;
    const pathAttribute = getTheme(path, params?.theme).path;
    const {
      fill = pathAttribute.fill == null ? !!path.attribute.fillColor : pathAttribute.fill,
      stroke = pathAttribute.stroke == null ? !!path.attribute.strokeColor : pathAttribute.stroke,
      fillOpacity = pathAttribute.fillOpacity,
      strokeOpacity = pathAttribute.strokeOpacity,
      opacity = pathAttribute.opacity,
      background,
      lineWidth = pathAttribute.lineWidth,
      visible = pathAttribute.visible
    } = path.attribute;

    const z = this.z ?? 0;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(path.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || background)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

    context.beginPath();
    if (path.pathShape) {
      renderCommandList((path.pathShape as ICustomPath2D).commandList, context, x, y, 1, 1, z);
    } else {
      const path2D = path.attribute.path ?? pathAttribute.path;
      renderCommandList((path2D as ICustomPath2D).commandList, context, x, y, 1, 1, z);
    }

    if (!this._pathRenderContribitions) {
      this._pathRenderContribitions = this.pathRenderContribitions.getContributions() || [];
      this._pathRenderContribitions.sort((a, b) => b.order - a.order);
    }
    this._pathRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
        c.drawShape(path, context, x, y, doFill, doStroke, fVisible, sVisible, pathAttribute, fillCb, strokeCb);
      }
    });

    // shadow
    context.setShadowStyle && context.setShadowStyle(path, path.attribute, pathAttribute);

    if (doStroke) {
      if (strokeCb) {
        strokeCb(context, path.attribute, pathAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(path, path.attribute, x, y, pathAttribute);
        context.stroke();
      }
    }
    if (doFill) {
      if (fillCb) {
        fillCb(context, path.attribute, pathAttribute);
      } else if (fVisible) {
        context.setCommonStyle(path, path.attribute, x, y, pathAttribute);
        context.fill();
      }
    }

    this._pathRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        // c.useStyle && context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
        c.drawShape(path, context, x, y, doFill, doStroke, fVisible, sVisible, pathAttribute, fillCb, strokeCb);
      }
    });
  }

  draw(path: IPath, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    // const pathAttribute = graphicService.themeService.getCurrentTheme().pathAttribute;
    const pathAttribute = getTheme(path, params?.theme).path;

    const data = this.transform(path, pathAttribute, context);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;
    if (drawPathProxy(path, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(path, context, x, y, drawContext, params);
    this.z = 0;

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.highPerformanceRestore();
  }
}
