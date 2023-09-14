import type { vec3 } from '@visactor/vutils';
import { abs, cos, epsilon, sin, pi2, pi } from '@visactor/vutils';
import { injectable } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import type {
  IContext2d,
  IArc,
  IPath2D,
  IGraphicAttribute,
  IMarkAttribute,
  IThemeAttribute,
  IArc3d,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams
} from '../../../interface';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { BaseRender } from './base-render';
import { ARC3D_NUMBER_TYPE } from '../../../graphic/constants';
import { ColorStore, ColorType } from '../../../color-string';

/**
 * 部分源码参考 https://github.com/d3/d3-shape/
 * Copyright 2010-2022 Mike Bostock

  Permission to use, copy, modify, and/or distribute this software for any purpose
  with or without fee is hereby granted, provided that the above copyright notice
  and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
  TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
  THIS SOFTWARE.
 */

// 基于d3-shape
// https://github.com/d3/d3-shape/blob/main/src/arc.js
function drawArcPath(
  arc: IArc,
  context: IContext2d | IPath2D,
  cx: number,
  cy: number,
  z: number,
  outerRadius: number,
  innerRadius: number
) {
  const { startAngle, endAngle } = arc.getParsedAngle();

  const deltaAngle = abs(endAngle - startAngle);
  const clockwise: boolean = endAngle > startAngle;
  let collapsedToLine: boolean = false;
  // 规范化outerRadius和innerRadius
  if (outerRadius < innerRadius) {
    const temp = outerRadius;
    outerRadius = innerRadius;
    innerRadius = temp;
  }
  // Is it a point?
  if (outerRadius <= epsilon) {
    context.moveTo(cx, cy, z);
  } else if (deltaAngle >= pi2 - epsilon) {
    // 是个完整的圆环
    // Or is it a circle or annulus?
    context.moveTo(cx + outerRadius * cos(startAngle), cy + outerRadius * sin(startAngle), z);
    context.arc(cx, cy, outerRadius, startAngle, endAngle, !clockwise, z);
    if (innerRadius > epsilon) {
      context.moveTo(cx + innerRadius * cos(endAngle), cy + innerRadius * sin(endAngle), z);
      context.arc(cx, cy, innerRadius, endAngle, startAngle, clockwise, z);
    }
  } else {
    // Or is it a circular or annular sector?
    const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
      arc.getParsePadAngle(startAngle, endAngle);

    const xors = outerRadius * cos(outerStartAngle);
    const yors = outerRadius * sin(outerStartAngle);
    const xire = innerRadius * cos(innerEndAngle);
    const yire = innerRadius * sin(innerEndAngle);

    // Is the sector collapsed to a line?
    // 角度过小，会将acr处理为圆心到半径的一条线
    if (outerDeltaAngle < 0.001) {
      // 如果有左右边的话
      collapsedToLine = true;
    } else {
      context.moveTo(cx + xors, cy + yors, z);
      context.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, !clockwise, z);
    }
    // Is there no inner ring, and it’s a circular sector?
    // Or perhaps it’s an annular sector collapsed due to padding?
    if (!(innerRadius > epsilon) || innerDeltaAngle < 0.001) {
      context.lineTo(cx + xire, cy + yire, z);
      collapsedToLine = true;
    } else {
      // Or is the inner ring just a circular arc?
      context.lineTo(cx + xire, cy + yire, z);
      context.arc(cx, cy, innerRadius, innerEndAngle, innerStartAngle, clockwise, z);
    }
  }

  context.closePath();

  return collapsedToLine;
}

function drawInnerOuterArcPath(
  arc: IArc,
  context: IContext2d | IPath2D,
  cx: number,
  cy: number,
  z1: number,
  z2: number,
  radius: number,
  getParsePadAngle: (
    startAngle: number,
    endAngle: number
  ) => {
    innerouterDeltaAngle: number;
    innerouterStartAngle: number;
    innerouterEndAngle: number;
  }
) {
  const { startAngle, endAngle } = arc.getParsedAngle();

  const deltaAngle = abs(endAngle - startAngle);
  const clockwise: boolean = endAngle > startAngle;
  let collapsedToLine: boolean = false;
  // Is it a point?
  if (radius <= epsilon) {
    context.moveTo(cx, cy, z1);
  } else if (deltaAngle >= pi2 - epsilon) {
    // 是个完整的圆环
    // Or is it a circle or annulus?
    context.moveTo(cx + radius * cos(startAngle), cy + radius * sin(startAngle), z1);
    context.arc(cx, cy, radius, startAngle, endAngle, !clockwise, z1);
    context.lineTo(cx + radius * cos(endAngle), cy + radius * sin(endAngle), z2);
    context.arc(cx, cy, radius, endAngle, startAngle, clockwise, z2);
  } else {
    // Or is it a circular or annular sector?
    const { innerouterDeltaAngle, innerouterStartAngle, innerouterEndAngle } = getParsePadAngle(startAngle, endAngle);

    const xors = radius * cos(innerouterStartAngle);
    const yors = radius * sin(innerouterStartAngle);
    const xore = radius * cos(innerouterEndAngle);
    const yore = radius * sin(innerouterEndAngle);

    // Is the sector collapsed to a line?
    // 角度过小，会将acr处理为圆心到半径的一条线
    if (innerouterDeltaAngle < 0.001) {
      collapsedToLine = true;
    } else {
      context.moveTo(cx + xors, cy + yors, z1);
      context.arc(cx, cy, radius, innerouterStartAngle, innerouterEndAngle, !clockwise, z1);
      context.lineTo(cx + xore, cy + yore, z2);
      context.arc(cx, cy, radius, innerouterEndAngle, innerouterStartAngle, clockwise, z2);
    }
  }

  context.closePath();

  return collapsedToLine;
}

@injectable()
export class DefaultCanvasArc3DRender extends BaseRender<IArc3d> implements IGraphicRender {
  type: 'arc3d';
  numberType: number = ARC3D_NUMBER_TYPE;
  declare z: number;

  drawShape(
    arc: IArc3d,
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
    // const arcAttribute = graphicService.themeService.getCurrentTheme().arcAttribute;
    const arcAttribute = getTheme(arc, params?.theme).arc;

    const {
      fill = arcAttribute.fill,
      background,
      stroke = arcAttribute.stroke,
      opacity = arcAttribute.opacity,
      fillOpacity = arcAttribute.fillOpacity,
      lineWidth = arcAttribute.lineWidth,
      strokeOpacity = arcAttribute.strokeOpacity,
      visible = arcAttribute.visible
    } = arc.attribute;
    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity, fill);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill, background);
    const doStroke = runStroke(stroke, lineWidth);

    const z = this.z ?? 0;

    if (!(arc.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

    const {
      outerRadius = arcAttribute.outerRadius,
      innerRadius = arcAttribute.innerRadius,
      // TODO 3d视角下直接硬编码，避免theme消耗性能
      height = 10
    } = arc.attribute;

    const rgbArray = ColorStore.Get(fill as string, ColorType.Color255);
    const { light } = drawContext.stage || {};
    const face = drawContext.hack_pieFace;

    const z_face = {
      top: z,
      bottom: z + height
    };

    const n_face: Record<string, vec3> = {
      top: [0, 1, 0],
      bottom: [0, -1, 0],
      outside: [1, 0, -1],
      inside: [1, 0, -1]
    };

    if (face === 'bottom' || face === 'top') {
      context.beginPath();
      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此arc不再使用cache
      drawArcPath(arc, context, x, y, z_face[face], outerRadius, innerRadius);

      // shadow
      context.setShadowStyle && context.setShadowStyle(arc, arc.attribute, arcAttribute);

      if (doFill) {
        if (fillCb) {
          fillCb(context, arc.attribute, arcAttribute);
        } else if (fVisible) {
          context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
          context.fillStyle = light ? light.computeColor(n_face[face], rgbArray as any) : (fill as string);
          context.fill();
        }
      }

      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, arc.attribute, arcAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
          context.stroke();
        }
      }
    } else if (face === 'outside' || face === 'inside') {
      // 需要clip，避免绘制到外面
      if (face === 'inside') {
        context.save();
        context.beginPath();
        context.arc(x, y, innerRadius, 0, pi2, true, z_face.top);
        context.clip();
      }
      context.beginPath();
      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此arc不再使用cache
      drawInnerOuterArcPath(
        arc,
        context,
        x,
        y,
        z_face.top,
        z_face.bottom,
        face === 'outside' ? outerRadius : innerRadius,
        (startAngle, endAngle) => {
          const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
            arc.getParsePadAngle(startAngle, endAngle);
          if (face === 'outside') {
            return {
              innerouterDeltaAngle: outerDeltaAngle,
              innerouterEndAngle: outerEndAngle,
              innerouterStartAngle: outerStartAngle
            };
          }
          return {
            innerouterDeltaAngle: innerDeltaAngle,
            innerouterEndAngle: innerEndAngle,
            innerouterStartAngle: innerStartAngle
          };
        }
      );

      // shadow
      context.setShadowStyle && context.setShadowStyle(arc, arc.attribute, arcAttribute);

      if (doFill) {
        if (fillCb) {
          fillCb(context, arc.attribute, arcAttribute);
        } else if (fVisible) {
          context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
          context.fillStyle = light ? light.computeColor(n_face[face], rgbArray as any) : (fill as string);
          context.fill();
        }
      }

      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, arc.attribute, arcAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
          context.stroke();
        }
      }

      if (face === 'inside') {
        context.restore();
      }
    }
  }

  draw(arc: IArc3d, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    // const arcAttribute = graphicService.themeService.getCurrentTheme().arcAttribute;
    const arcAttribute = getTheme(arc, params?.theme).arc;

    context.save();

    const data = this.transform(arc, arcAttribute, context);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;
    if (drawPathProxy(arc, context, x, y, drawContext, params)) {
      context.restore();
      return;
    }

    this.drawShape(arc, context, x, y, drawContext, params);

    this.z = 0;

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.restore();
  }
}
