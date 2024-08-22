import { isArray, abs, acos, atan2, cos, epsilon, min, pi, sin, sqrt, pi2 } from '@visactor/vutils';
import { renderCommandList } from '../../../common/render-command-list';
import { getTheme } from '../../../graphic/theme';
import type {
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IMarkAttribute,
  IThemeAttribute,
  IFillType,
  IStrokeType,
  IArc,
  IPath2D,
  IGraphicRenderDrawParams,
  IDrawContext,
  IBackgroundConfig
} from '../../../interface';
/**
 * 是否需要执行fill逻辑
 * @param fill
 * @returns
 */
export function runFill(
  fill: IFillType,
  background?: string | any | HTMLImageElement | HTMLCanvasElement | IBackgroundConfig
) {
  return !!(fill || background);
}
/**
 * 是否需要执行stroke逻辑
 * @param stroke
 * @returns
 */
export function runStroke(stroke: IStrokeType | IStrokeType[], lineWidth: number) {
  let s: boolean | number;
  if (isArray(stroke)) {
    s = stroke.some(item => item || item === undefined);
  } else {
    s = !!stroke;
  }
  return s && lineWidth > 0;
}

/**
 * 是否fill部分可见
 * @param opacity
 * @param fillOpacity
 * @returns
 */
export function fillVisible(opacity: number, fillOpacity: number, fill: IFillType) {
  return fill && opacity * fillOpacity > 0;
}

export function rectFillVisible(opacity: number, fillOpacity: number, width: number, height: number, fill: IFillType) {
  return fill && opacity * fillOpacity > 0 && width !== 0 && height !== 0;
}

/**
 * 是否stroke部分可见
 * @param opacity
 * @param strokeOpacity
 * @param lineWidth
 * @returns
 */
export function strokeVisible(opacity: number, strokeOpacity: number) {
  return opacity * strokeOpacity > 0;
}

export function rectStrokeVisible(opacity: number, strokeOpacity: number, width: number, height: number) {
  return opacity * strokeOpacity > 0 && width !== 0 && height !== 0;
}

export function drawPathProxy(
  graphic: IGraphic,
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
  if (!graphic.pathProxy) {
    return false;
  }

  const themeAttributes = (getTheme(graphic, params?.theme) as any)[graphic.type.replace('3d', '')];

  const {
    fill = themeAttributes.fill,
    stroke = themeAttributes.stroke,
    opacity = themeAttributes.opacity,
    fillOpacity = themeAttributes.fillOpacity,
    lineWidth = themeAttributes.lineWidth,
    strokeOpacity = themeAttributes.strokeOpacity,
    visible = themeAttributes.visible,
    x: originX = themeAttributes.x,
    y: originY = themeAttributes.y
  } = graphic.attribute;
  // 不绘制或者透明
  const fVisible = fillVisible(opacity, fillOpacity, fill);
  const sVisible = strokeVisible(opacity, strokeOpacity);
  const doFill = runFill(fill);
  const doStroke = runStroke(stroke, lineWidth);

  if (!visible) {
    return true;
  }

  if (!(doFill || doStroke)) {
    return true;
  }

  // 如果存在fillCb和strokeCb，那就不直接跳过
  if (!(fVisible || sVisible || fillCb || strokeCb)) {
    return true;
  }

  context.beginPath();
  const path = typeof graphic.pathProxy === 'function' ? graphic.pathProxy(graphic.attribute) : graphic.pathProxy;
  renderCommandList(path.commandList, context, x, y);

  // shadow
  context.setShadowBlendStyle && context.setShadowBlendStyle(graphic, graphic.attribute, themeAttributes);

  if (doStroke) {
    if (strokeCb) {
      strokeCb(context, graphic.attribute, themeAttributes);
    } else if (sVisible) {
      context.setStrokeStyle(graphic, graphic.attribute, x - originX, y - originY, themeAttributes);
      context.stroke();
    }
  }
  if (doFill) {
    if (fillCb) {
      fillCb(context, graphic.attribute, themeAttributes);
    } else if (fVisible) {
      context.setCommonStyle(graphic, graphic.attribute, x - originX, y - originY, themeAttributes);
      context.fill();
    }
  }
  return true;
}

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
export function intersect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) {
  const x10 = x1 - x0;
  const y10 = y1 - y0;
  const x32 = x3 - x2;
  const y32 = y3 - y2;
  let t = y32 * x10 - x32 * y10;
  if (t * t < epsilon) {
    return [];
  }
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;

  return [x0 + t * x10, y0 + t * y10];
}

// 基于d3-shape
// https://github.com/d3/d3-shape/blob/main/src/arc.js
// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
export function cornerTangents(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r1: number,
  rc: number,
  clockwise: number
) {
  const x01 = x0 - x1;
  const y01 = y0 - y1;
  const lo = (clockwise ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01);
  const ox = lo * y01;
  const oy = -lo * x01;
  const x11 = x0 + ox;
  const y11 = y0 + oy;
  const x10 = x1 + ox;
  const y10 = y1 + oy;
  const x00 = (x11 + x10) / 2;
  const y00 = (y11 + y10) / 2;
  const dx = x10 - x11;
  const dy = y10 - y11;
  const d2 = dx * dx + dy * dy;
  const r = r1 - rc;
  const D = x11 * y10 - x10 * y11;
  const d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D));
  let cx0 = (D * dy - dx * d) / d2;
  let cy0 = (-D * dx - dy * d) / d2;
  const cx1 = (D * dy + dx * d) / d2;
  const cy1 = (-D * dx + dy * d) / d2;
  const dx0 = cx0 - x00;
  const dy0 = cy0 - y00;
  const dx1 = cx1 - x00;
  const dy1 = cy1 - y00;

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) {
    (cx0 = cx1), (cy0 = cy1);
  }

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}

export function calculateArcCornerRadius(
  arc: IArc,
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number
) {
  const deltaAngle = abs(endAngle - startAngle);
  const cornerRadius = arc.getParsedCornerRadius();
  const cornerRadiusIsArray = isArray(cornerRadius);
  // Or is it a circular or annular sector?
  const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
    arc.getParsePadAngle(startAngle, endAngle);

  const outerCornerRadiusStart = cornerRadiusIsArray ? cornerRadius[0] : cornerRadius;
  const outerCornerRadiusEnd = cornerRadiusIsArray ? cornerRadius[1] : cornerRadius;
  const innerCornerRadiusEnd = cornerRadiusIsArray ? cornerRadius[2] : cornerRadius;
  const innerCornerRadiusStart = cornerRadiusIsArray ? cornerRadius[3] : cornerRadius;
  const maxOuterCornerRadius = Math.max(outerCornerRadiusEnd, outerCornerRadiusStart);
  const maxInnerCornerRadius = Math.max(innerCornerRadiusEnd, innerCornerRadiusStart);
  let limitedOcr = maxOuterCornerRadius;
  let limitedIcr = maxInnerCornerRadius;

  const xors = outerRadius * cos(outerStartAngle);
  const yors = outerRadius * sin(outerStartAngle);
  const xire = innerRadius * cos(innerEndAngle);
  const yire = innerRadius * sin(innerEndAngle);

  // Apply rounded corners?
  let xore: number;
  let yore: number;
  let xirs: number;
  let yirs: number;
  if (maxInnerCornerRadius > epsilon || maxOuterCornerRadius > epsilon) {
    xore = outerRadius * cos(outerEndAngle);
    yore = outerRadius * sin(outerEndAngle);
    xirs = innerRadius * cos(innerStartAngle);
    yirs = innerRadius * sin(innerStartAngle);

    // Restrict the corner radius according to the sector angle.
    if (deltaAngle < pi) {
      const oc = intersect(xors, yors, xirs, yirs, xore, yore, xire, yire);

      if (oc) {
        const ax = xors - oc[0];
        const ay = yors - oc[1];
        const bx = xore - oc[0];
        const by = yore - oc[1];
        const kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2);
        const lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);

        limitedIcr = min(maxInnerCornerRadius, (innerRadius - lc) / (kc - 1));
        limitedOcr = min(maxOuterCornerRadius, (outerRadius - lc) / (kc + 1));
      }
    }
  }

  return {
    outerDeltaAngle,
    xors,
    yors,
    xirs,
    yirs,
    xore,
    yore,
    xire,
    yire,
    limitedOcr,
    limitedIcr,
    outerCornerRadiusStart,
    outerCornerRadiusEnd,
    maxOuterCornerRadius,
    maxInnerCornerRadius,
    outerStartAngle,
    outerEndAngle,
    innerDeltaAngle,
    innerEndAngle,
    innerStartAngle,
    innerCornerRadiusStart,
    innerCornerRadiusEnd
  };
}

// 基于d3-shape
// https://github.com/d3/d3-shape/blob/main/src/arc.js
export function drawArcPath(
  arc: IArc,
  context: IContext2d | IPath2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  partStroke?: (boolean | string)[]
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
    context.moveTo(cx, cy);
  } else if (deltaAngle >= pi2 - epsilon) {
    // 是个完整的圆环
    // Or is it a circle or annulus?
    context.moveTo(cx + outerRadius * cos(startAngle), cy + outerRadius * sin(startAngle));
    context.arc(cx, cy, outerRadius, startAngle, endAngle, !clockwise);
    if (innerRadius > epsilon) {
      context.moveTo(cx + innerRadius * cos(endAngle), cy + innerRadius * sin(endAngle));
      context.arc(cx, cy, innerRadius, endAngle, startAngle, clockwise);
    }
  } else {
    const {
      outerDeltaAngle,
      xors,
      yors,
      xirs,
      yirs,
      limitedOcr,
      outerCornerRadiusStart,
      outerCornerRadiusEnd,
      maxOuterCornerRadius,
      xore,
      yore,
      xire,
      yire,
      outerStartAngle,
      outerEndAngle,
      limitedIcr,
      innerDeltaAngle,
      innerEndAngle,
      innerStartAngle,
      innerCornerRadiusStart,
      innerCornerRadiusEnd,
      maxInnerCornerRadius
    } = calculateArcCornerRadius(arc, startAngle, endAngle, innerRadius, outerRadius);
    // Is the sector collapsed to a line?
    // 角度过小，会将acr处理为圆心到半径的一条线
    if (outerDeltaAngle < 0.001) {
      // 如果有左右边的话
      if (partStroke && (partStroke[3] || partStroke[1])) {
        context.moveTo(cx + xors, cy + yors);
      }
      collapsedToLine = true;
    } else if (limitedOcr > epsilon) {
      const cornerRadiusStart = min(outerCornerRadiusStart, limitedOcr);
      const cornerRadiusEnd = min(outerCornerRadiusEnd, limitedOcr);
      // Does the sector’s outer ring have rounded corners?
      const t0 = cornerTangents(xirs, yirs, xors, yors, outerRadius, cornerRadiusStart, Number(clockwise));
      const t1 = cornerTangents(xore, yore, xire, yire, outerRadius, cornerRadiusEnd, Number(clockwise));

      // Have the corners merged?
      if (limitedOcr < maxOuterCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
        if (!partStroke || partStroke[0]) {
          context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
          context.arc(cx + t0.cx, cy + t0.cy, limitedOcr, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !clockwise);
        } else {
          context.moveTo(
            cx + t0.cx + limitedOcr * cos(atan2(t1.y01, t1.x01)),
            cy + t0.cy + limitedOcr * sin(atan2(t1.y01, t1.x01))
          );
        }
      } else {
        // Otherwise, draw the two corners and the ring.
        if (!partStroke || partStroke[0]) {
          context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
          cornerRadiusStart > 0 &&
            context.arc(
              cx + t0.cx,
              cy + t0.cy,
              cornerRadiusStart,
              atan2(t0.y01, t0.x01),
              atan2(t0.y11, t0.x11),
              !clockwise
            );
          context.arc(
            cx,
            cy,
            outerRadius,
            atan2(t0.cy + t0.y11, t0.cx + t0.x11),
            atan2(t1.cy + t1.y11, t1.cx + t1.x11),
            !clockwise
          );
          cornerRadiusEnd > 0 &&
            context.arc(
              cx + t1.cx,
              cy + t1.cy,
              cornerRadiusEnd,
              atan2(t1.y11, t1.x11),
              atan2(t1.y01, t1.x01),
              !clockwise
            );
        } else {
          if (cornerRadiusEnd > 0) {
            context.moveTo(
              cx + t1.cx + cornerRadiusEnd * cos(atan2(t1.y01, t1.x01)),
              cy + t1.cy + cornerRadiusEnd * sin(atan2(t1.y01, t1.x01))
            );
          } else {
            context.moveTo(cx + xore, cy + outerRadius * sin(outerEndAngle));
          }
        }
      }
    } else {
      // Or is the outer ring just a circular arc?
      if (!partStroke || partStroke[0]) {
        context.moveTo(cx + xors, cy + yors);
        context.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, !clockwise);
      } else {
        context.moveTo(cx + outerRadius * cos(outerEndAngle), cy + outerRadius * sin(outerEndAngle));
      }
    }
    // Is there no inner ring, and it’s a circular sector?
    // Or perhaps it’s an annular sector collapsed due to padding?
    if (!(innerRadius > epsilon) || innerDeltaAngle < 0.001) {
      if (!partStroke || partStroke[1]) {
        context.lineTo(cx + xire, cy + yire);
      } else {
        context.moveTo(cx + xire, cy + yire);
      }
      collapsedToLine = true;
    } else if (limitedIcr > epsilon) {
      const cornerRadiusStart = min(innerCornerRadiusStart, limitedIcr);
      const cornerRadiusEnd = min(innerCornerRadiusEnd, limitedIcr);
      // Does the sector’s inner ring (or point) have rounded corners?
      const t0 = cornerTangents(xire, yire, xore, yore, innerRadius, -cornerRadiusEnd, Number(clockwise));
      const t1 = cornerTangents(xors, yors, xirs, yirs, innerRadius, -cornerRadiusStart, Number(clockwise));

      if (!partStroke || partStroke[1]) {
        context.lineTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
      } else {
        context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
      }

      // Have the corners merged?
      if (limitedIcr < maxInnerCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
        const arcEndAngle = atan2(t1.y01, t1.x01);
        if (!partStroke || partStroke[2]) {
          context.arc(cx + t0.cx, cy + t0.cy, limitedIcr, atan2(t0.y01, t0.x01), arcEndAngle, !clockwise);
        } else {
          context.moveTo(cx + t0.cx + cos(arcEndAngle), cy + t0.cy + sin(arcEndAngle));
        }
      } else {
        // Otherwise, draw the two corners and the ring.
        if (!partStroke || partStroke[2]) {
          cornerRadiusEnd > 0 &&
            context.arc(
              cx + t0.cx,
              cy + t0.cy,
              cornerRadiusEnd,
              atan2(t0.y01, t0.x01),
              atan2(t0.y11, t0.x11),
              !clockwise
            );
          context.arc(
            cx,
            cy,
            innerRadius,
            atan2(t0.cy + t0.y11, t0.cx + t0.x11),
            atan2(t1.cy + t1.y11, t1.cx + t1.x11),
            clockwise
          );
          cornerRadiusStart > 0 &&
            context.arc(
              cx + t1.cx,
              cy + t1.cy,
              cornerRadiusStart,
              atan2(t1.y11, t1.x11),
              atan2(t1.y01, t1.x01),
              !clockwise
            );
        } else {
          if (cornerRadiusStart > 0) {
            context.moveTo(
              cx + t1.cx + cornerRadiusStart * cos(atan2(t1.y01, t1.x01)),
              cy + t1.cy + cornerRadiusStart * sin(atan2(t1.y01, t1.x01))
            );
          } else {
            context.moveTo(cx + xirs, cy + yirs);
          }
        }
      }
    } else {
      // Or is the inner ring just a circular arc?
      if (!partStroke || partStroke[1]) {
        context.lineTo(cx + xire, cy + yire);
      } else {
        context.moveTo(cx + xire, cy + yire);
      }
      if (!partStroke || partStroke[2]) {
        context.arc(cx, cy, innerRadius, innerEndAngle, innerStartAngle, clockwise);
      } else {
        context.moveTo(cx + innerRadius * cos(innerStartAngle), cy + innerRadius * sin(innerStartAngle));
      }
    }
  }

  if (!partStroke) {
    context.closePath();
  } else if (partStroke[3]) {
    context.lineTo(cx + outerRadius * cos(startAngle), cy + outerRadius * sin(startAngle));
  }

  return collapsedToLine;
}
