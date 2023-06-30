import type { IPointLike } from '@visactor/vutils';
import { injectable } from 'inversify';
import type { IGraphicAttribute, ICamera, IContext2d, IGraphic, mat4 } from '../../../interface';
import { getModelMatrix, multiplyMat4Mat4, shouldUseMat4 } from '../../../graphic';
import { mat4Allocate } from '../../../allocator/matrix-allocate';

@injectable()
export abstract class BaseRender<T extends IGraphic> {
  camera: ICamera;

  /**
   * 进行2d或3d变换
   * @param graphic
   * @param graphicAttribute
   * @param context
   * @param use3dMatrixIn3dMode 是否在3d模式使用3d矩阵
   * @returns
   */
  transform(
    graphic: IGraphic,
    graphicAttribute: IGraphicAttribute,
    context: IContext2d,
    use3dMatrixIn3dMode: boolean = false
  ): IPointLike & { z: number; lastModelMatrix: mat4 } {
    const transMatrix = graphic.transMatrix;
    const {
      x = graphicAttribute.x,
      y = graphicAttribute.y,
      z = graphicAttribute.z,
      scaleX = graphicAttribute.scaleX,
      scaleY = graphicAttribute.scaleY,
      angle = graphicAttribute.angle,
      postMatrix
    } = graphic.attribute;
    const onlyTranslate = transMatrix.onlyTranslate() && !postMatrix;

    // 存在3d变换的时候，需要计算3d矩阵
    const lastModelMatrix = context.modelMatrix;
    const camera = context.camera;
    const result: IPointLike & { z: number; lastModelMatrix: mat4 } = { x, y, z, lastModelMatrix };
    // 是否应该进行3d变换
    const shouldTransform3d = camera && (use3dMatrixIn3dMode || shouldUseMat4(graphic));
    if (shouldTransform3d) {
      const nextModelMatrix = mat4Allocate.allocate();
      // 计算模型矩阵
      const modelMatrix = mat4Allocate.allocate();
      getModelMatrix(modelMatrix, graphic, graphicAttribute);
      // 合并模型矩阵
      if (lastModelMatrix) {
        multiplyMat4Mat4(nextModelMatrix, lastModelMatrix, modelMatrix);
      } else {
        multiplyMat4Mat4(nextModelMatrix, nextModelMatrix, modelMatrix);
      }
      result.x = 0;
      result.y = 0;
      result.z = 0;
      context.modelMatrix = nextModelMatrix;
      context.setTransform(1, 0, 0, 1, 0, 0, true);
      mat4Allocate.free(modelMatrix);
      // 有旋转的情况下需要手动计算模型矩阵
      // TODO: 这里暂时都使用模型矩阵，因为视角旋转的时候如果当不固定角度那也需要用到模型矩阵
    }

    // 如果只有位移，且没计算3d变换矩阵，那么不设置context的2d矩阵
    if (onlyTranslate && !lastModelMatrix) {
      const point = graphic.getOffsetXY(graphicAttribute);
      result.x += point.x;
      result.y += point.y;
      result.z = z;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    } else if (shouldTransform3d) {
      // 如果计算了3d矩阵，那么就不需要2d矩阵计算了
      result.x = 0;
      result.y = 0;
      result.z = 0;
      context.setTransform(1, 0, 0, 1, 0, 0, true);
    } else {
      if (camera && context.project) {
        const point = graphic.getOffsetXY(graphicAttribute);
        result.x += point.x;
        result.y += point.y;
        // result.x = 0;
        // result.y = 0;
        // 位置直接通过project设置，而2d变换通过变换矩阵完成
        this.transformWithoutTranslate(context, result.x, result.y, result.z, scaleX, scaleY, angle);
      } else {
        // 如果是纯2d的情况，那么直接设置context的2d矩阵
        // 性能较差
        context.transformFromMatrix(graphic.transMatrix, true);
        result.x = 0;
        result.y = 0;
        result.z = 0;
      }
    }

    return result;
  }

  /**
   * 将3d的transform转成context2d的transform
   * @param graphic
   * @param graphicAttribute
   * @param z
   * @param context
   */
  transformUseContext2d(graphic: IGraphic, graphicAttribute: IGraphicAttribute, z: number, context: IContext2d) {
    const camera = context.camera;
    this.camera = camera;
    if (camera) {
      const bounds = graphic.AABBBounds;
      const width = bounds.x2 - bounds.x1;
      const height = bounds.y2 - bounds.y1;
      const p1 = context.project(0, 0, z);
      const p2 = context.project(width, 0, z);
      const p3 = context.project(width, height, z);
      const _p1 = { x: 0, y: 0 };
      const _p2 = { x: width, y: 0 };
      const _p3 = { x: width, y: height };

      context.camera = null;

      // 生成3维矩阵
      /* Adapted from phoria.js by ecomfe
      * https://github.com/kevinroast/phoria.js
      * Licensed under the BSD-3-Clause

      * url: https://github.com/kevinroast/phoria.js/blob/736c6b854a679df180f8a6e689aeb218efa6dc01/scripts/phoria-renderer.js
      * License: https://github.com/kevinroast/phoria.js/blob/master/LICENSE
      * @license
      */
      const denom = 1.0 / (_p1.x * (_p3.y - _p2.y) - _p2.x * _p3.y + _p3.x * _p2.y + (_p2.x - _p3.x) * _p1.y);
      // calculate context transformation matrix
      const m11 = -(_p1.y * (p3.x - p2.x) - _p2.y * p3.x + _p3.y * p2.x + (_p2.y - _p3.y) * p1.x) * denom;
      const m12 = (_p2.y * p3.y + _p1.y * (p2.y - p3.y) - _p3.y * p2.y + (_p3.y - _p2.y) * p1.y) * denom;
      const m21 = (_p1.x * (p3.x - p2.x) - _p2.x * p3.x + _p3.x * p2.x + (_p2.x - _p3.x) * p1.x) * denom;
      const m22 = -(_p2.x * p3.y + _p1.x * (p2.y - p3.y) - _p3.x * p2.y + (_p3.x - _p2.x) * p1.y) * denom;
      const dx =
        (_p1.x * (_p3.y * p2.x - _p2.y * p3.x) +
          _p1.y * (_p2.x * p3.x - _p3.x * p2.x) +
          (_p3.x * _p2.y - _p2.x * _p3.y) * p1.x) *
        denom;
      const dy =
        (_p1.x * (_p3.y * p2.y - _p2.y * p3.y) +
          _p1.y * (_p2.x * p3.y - _p3.x * p2.y) +
          (_p3.x * _p2.y - _p2.x * _p3.y) * p1.y) *
        denom;

      context.setTransform(m11, m12, m21, m22, dx, dy, true);
    }
  }

  /**
   * transformUseContext2d的后处理
   * @param graphic
   * @param graphicAttribute
   * @param z
   * @param context
   */
  restoreTransformUseContext2d(graphic: IGraphic, graphicAttribute: IGraphicAttribute, z: number, context: IContext2d) {
    if (this.camera) {
      context.camera = this.camera;
    }
  }

  protected transformWithoutTranslate(
    context: IContext2d,
    x: number,
    y: number,
    z: number,
    scaleX: number,
    scaleY: number,
    angle: number
  ) {
    const p = context.project(x, y, z);
    context.translate(p.x, p.y, false);
    context.scale(scaleX, scaleY, false);
    context.rotate(angle, false);
    context.translate(-p.x, -p.y, false);
    context.setTransformForCurrent();
  }

  // draw(graphic: T, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
  //   const { context } = drawContext;
  //   if (!context) {
  //     return;
  //   }

  //   const themeAttribute = getTheme(graphic)[graphic.type];

  //   context.highPerformanceSave();

  //   let { x = themeAttribute.x, y = themeAttribute.y } = graphic.attribute;
  //   if (!graphic.transMatrix.onlyTranslate()) {
  //     // 性能较差
  //     x = 0;
  //     y = 0;
  //     context.transformFromMatrix(graphic.transMatrix, true);
  //   } else {
  //     const point = graphic.getOffsetXY(themeAttribute);
  //     x += point.x;
  //     y += point.y;
  //     // 当前context有rotate/scale，重置matrix
  //     context.setTransformForCurrent();
  //   }

  //   if (this.drawPathProxy(graphic, context, x, y, drawContext, params)) {
  //     context.highPerformanceRestore();
  //     return;
  //   }

  //   this.drawShape(graphic, context, x, y, drawContext, params);

  //   context.highPerformanceRestore();
  // }

  // abstract drawShape(
  //   graphic: T,
  //   context: IContext2d,
  //   x: number,
  //   y: number,
  //   drawContext: IDrawContext,
  //   params?: IGraphicRenderDrawParams,
  //   fillCb?: (
  //     ctx: IContext2d,
  //     markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
  //     themeAttribute: IThemeAttribute
  //   ) => boolean,
  //   strokeCb?: (
  //     ctx: IContext2d,
  //     markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
  //     themeAttribute: IThemeAttribute
  //   ) => boolean
  // ): void;

  // drawPathProxy(
  //   graphic: T,
  //   context: IContext2d,
  //   x: number,
  //   y: number,
  //   drawContext: IDrawContext,
  //   params?: IGraphicRenderDrawParams,
  //   fillCb?: (
  //     ctx: IContext2d,
  //     markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
  //     themeAttribute: IThemeAttribute
  //   ) => boolean,
  //   strokeCb?: (
  //     ctx: IContext2d,
  //     markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
  //     themeAttribute: IThemeAttribute
  //   ) => boolean
  // ) {
  //   if (!graphic.pathProxy) {
  //     return false;
  //   }

  //   const themeAttributes = getTheme(graphic)[graphic.type];

  //   const {
  //     fill = themeAttributes.fill == null ? !!graphic.attribute.fillColor : themeAttributes.fill,
  //     stroke = themeAttributes.stroke == null ? !!graphic.attribute.strokeColor : themeAttributes.stroke,
  //     opacity = themeAttributes.opacity,
  //     fillOpacity = themeAttributes.fillOpacity,
  //     lineWidth = themeAttributes.lineWidth,
  //     strokeOpacity = themeAttributes.strokeOpacity,
  //     visible = themeAttributes.visible
  //   } = graphic.attribute;
  //   // 不绘制或者透明
  //   const fVisible = fillVisible(opacity, fillOpacity);
  //   const sVisible = strokeVisible(opacity, strokeOpacity);
  //   const doFill = runFill(fill);
  //   const doStroke = runStroke(stroke, lineWidth);

  //   if (!visible) {
  //     return true;
  //   }

  //   if (!(doFill || doStroke)) {
  //     return true;
  //   }

  //   // 如果存在fillCb和strokeCb，那就不直接跳过
  //   if (!(fVisible || sVisible || fillCb || strokeCb)) {
  //     return true;
  //   }

  //   context.beginPath();

  //   const path = typeof graphic.pathProxy === 'function' ? graphic.pathProxy(graphic.attribute) : graphic.pathProxy;
  //   renderCommandList(path.commandList, context, x, y);

  //   // shadow
  //   context.setShadowStyle && context.setShadowStyle(graphic, graphic.attribute, themeAttributes);

  //   if (doStroke) {
  //     if (strokeCb) {
  //       strokeCb(context, graphic.attribute, themeAttributes);
  //     } else if (sVisible) {
  //       context.setStrokeStyle(graphic, graphic.attribute, 0, 0, themeAttributes);
  //       context.stroke();
  //     }
  //   }
  //   if (doFill) {
  //     if (fillCb) {
  //       fillCb(context, graphic.attribute, themeAttributes);
  //     } else if (fVisible) {
  //       context.setCommonStyle(graphic, graphic.attribute, 0, 0, themeAttributes);
  //       context.fill();
  //     }
  //   }
  //   return true;
  // }
}
