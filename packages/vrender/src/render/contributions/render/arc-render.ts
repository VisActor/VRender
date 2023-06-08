import { abs, acos, atan2, cos, epsilon, min, pi, sin, sqrt, pi2 } from '@visactor/vutils';
import { inject, injectable, named } from 'inversify';
import { ARC_NUMBER_TYPE } from '../../../graphic/arc';
import { getTheme } from '../../../graphic/theme';
import { parseStroke } from '../../../common/utils';
import type { IContributionProvider } from '../../../common/contribution-provider';
import { ContributionProvider } from '../../../common/contribution-provider';
import type {
  IContext2d,
  IArc,
  IPath2D,
  IGraphicAttribute,
  IMarkAttribute,
  IThemeAttribute,
  IGradientColor
} from '../../../interface';
import type { IDrawContext, IRenderService } from '../../render-service';
import type { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { getConicGradientAt } from '../../../canvas';
import type { IArcRenderContribution } from './contributions/arc-contribution-render';
import { ArcRenderContribution } from './contributions/arc-contribution-render';
import { BaseRenderContributionTime } from './contributions/base-contribution-render';
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
function intersect(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
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
function cornerTangents(x0: number, y0: number, x1: number, y1: number, r1: number, rc: number, clockwise: number) {
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
    const cornerRadius = arc.getParsedCornerRadius();
    // Or is it a circular or annular sector?
    const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
      arc.getParsePadAngle(startAngle, endAngle);

    const outerCornerRadiusStart = cornerRadius;
    const outerCornerRadiusEnd = cornerRadius;
    const innerCornerRadiusEnd = cornerRadius;
    const innerCornerRadiusStart = cornerRadius;
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
        // context.moveTo(cx + outerRadius * cos(outerEndAngle), cy + yore);
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
    context.lineTo(cx + outerRadius * cos(endAngle), cy + outerRadius * cos(endAngle));
  }

  return collapsedToLine;
}

@injectable()
export class DefaultCanvasArcRender implements IGraphicRender {
  type: 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  protected _arcRenderContribitions: IArcRenderContribution[];
  constructor(
    @inject(ContributionProvider)
    @named(ArcRenderContribution)
    protected readonly arcRenderContribitions: IContributionProvider<IArcRenderContribution>
  ) {}

  // drawArcPath(
  //   arc: IArc,
  //   context: IContext2d | IPath2D,
  //   cx: number,
  //   cy: number,
  //   outerRadius: number,
  //   innerRadius: number,
  //   partStroke?: boolean[]
  // ) {
  //   const { startAngle, endAngle } = arc.getParsedAngle();

  //   const deltaAngle = abs(endAngle - startAngle);
  //   const clockwise: boolean = endAngle > startAngle;
  //   let collapsedToLine: boolean = false;
  //   // 规范化outerRadius和innerRadius
  //   if (outerRadius < innerRadius) {
  //     const temp = outerRadius;
  //     outerRadius = innerRadius;
  //     innerRadius = temp;
  //   }
  //   // Is it a point?
  //   if (outerRadius <= epsilon) {
  //     context.moveTo(cx, cy);
  //   } else if (deltaAngle >= pi2 - epsilon) {
  //     // 是个完整的圆环
  //     // Or is it a circle or annulus?
  //     context.moveTo(cx + outerRadius * cos(startAngle), cy + outerRadius * sin(startAngle));
  //     context.arc(cx, cy, outerRadius, startAngle, endAngle, !clockwise);
  //     if (innerRadius > epsilon) {
  //       context.moveTo(cx + innerRadius * cos(endAngle), cy + innerRadius * sin(endAngle));
  //       context.arc(cx, cy, innerRadius, endAngle, startAngle, clockwise);
  //     }
  //   } else {
  //     const cornerRadius = arc.getParsedCornerRadius();
  //     // Or is it a circular or annular sector?
  //     const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
  //       arc.getParsePadAngle(startAngle, endAngle);

  //     const outerCornerRadiusStart = cornerRadius;
  //     const outerCornerRadiusEnd = cornerRadius;
  //     const innerCornerRadiusEnd = cornerRadius;
  //     const innerCornerRadiusStart = cornerRadius;
  //     const maxOuterCornerRadius = Math.max(outerCornerRadiusEnd, outerCornerRadiusStart);
  //     const maxInnerCornerRadius = Math.max(innerCornerRadiusEnd, innerCornerRadiusStart);
  //     let limitedOcr = maxOuterCornerRadius;
  //     let limitedIcr = maxInnerCornerRadius;

  //     const xors = outerRadius * cos(outerStartAngle);
  //     const yors = outerRadius * sin(outerStartAngle);
  //     const xire = innerRadius * cos(innerEndAngle);
  //     const yire = innerRadius * sin(innerEndAngle);

  //     // Apply rounded corners?
  //     let xore: number;
  //     let yore: number;
  //     let xirs: number;
  //     let yirs: number;

  //     if (maxInnerCornerRadius > epsilon || maxOuterCornerRadius > epsilon) {
  //       xore = outerRadius * cos(outerEndAngle);
  //       yore = outerRadius * sin(outerEndAngle);
  //       xirs = innerRadius * cos(innerStartAngle);
  //       yirs = innerRadius * sin(innerStartAngle);

  //       // Restrict the corner radius according to the sector angle.
  //       if (deltaAngle < pi) {
  //         const oc = intersect(xors, yors, xirs, yirs, xore, yore, xire, yire);

  //         if (oc) {
  //           const ax = xors - oc[0];
  //           const ay = yors - oc[1];
  //           const bx = xore - oc[0];
  //           const by = yore - oc[1];
  //           const kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2);
  //           const lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);

  //           limitedIcr = min(maxInnerCornerRadius, (innerRadius - lc) / (kc - 1));
  //           limitedOcr = min(maxOuterCornerRadius, (outerRadius - lc) / (kc + 1));
  //         }
  //       }
  //     }

  //     // Is the sector collapsed to a line?
  //     // 角度过小，会将acr处理为圆心到半径的一条线
  //     if (outerDeltaAngle < 0.001) {
  //       // 如果有左右边的话
  //       if (partStroke && (partStroke[3] || partStroke[1])) {
  //         context.moveTo(cx + xors, cy + yors);
  //       }
  //       collapsedToLine = true;
  //     } else if (limitedOcr > epsilon) {
  //       const cornerRadiusStart = min(outerCornerRadiusStart, limitedOcr);
  //       const cornerRadiusEnd = min(outerCornerRadiusEnd, limitedOcr);
  //       // Does the sector’s outer ring have rounded corners?
  //       const t0 = cornerTangents(xirs, yirs, xors, yors, outerRadius, cornerRadiusStart, Number(clockwise));
  //       const t1 = cornerTangents(xore, yore, xire, yire, outerRadius, cornerRadiusEnd, Number(clockwise));

  //       // Have the corners merged?
  //       if (limitedOcr < maxOuterCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
  //         if (!partStroke || partStroke[0]) {
  //           context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
  //           context.arc(cx + t0.cx, cy + t0.cy, limitedOcr, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !clockwise);
  //         } else {
  //           context.moveTo(
  //             cx + t0.cx + limitedOcr * cos(atan2(t1.y01, t1.x01)),
  //             cy + t0.cy + limitedOcr * sin(atan2(t1.y01, t1.x01))
  //           );
  //         }
  //       } else {
  //         // Otherwise, draw the two corners and the ring.
  //         if (!partStroke || partStroke[0]) {
  //           context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
  //           cornerRadiusStart > 0 &&
  //             context.arc(
  //               cx + t0.cx,
  //               cy + t0.cy,
  //               cornerRadiusStart,
  //               atan2(t0.y01, t0.x01),
  //               atan2(t0.y11, t0.x11),
  //               !clockwise
  //             );
  //           context.arc(
  //             cx,
  //             cy,
  //             outerRadius,
  //             atan2(t0.cy + t0.y11, t0.cx + t0.x11),
  //             atan2(t1.cy + t1.y11, t1.cx + t1.x11),
  //             !clockwise
  //           );
  //           cornerRadiusEnd > 0 &&
  //             context.arc(
  //               cx + t1.cx,
  //               cy + t1.cy,
  //               cornerRadiusEnd,
  //               atan2(t1.y11, t1.x11),
  //               atan2(t1.y01, t1.x01),
  //               !clockwise
  //             );
  //         } else {
  //           if (cornerRadiusEnd > 0) {
  //             context.moveTo(
  //               cx + t1.cx + cornerRadiusEnd * cos(atan2(t1.y01, t1.x01)),
  //               cy + t1.cy + cornerRadiusEnd * sin(atan2(t1.y01, t1.x01))
  //             );
  //           } else {
  //             context.moveTo(cx + xore, cy + outerRadius * sin(outerEndAngle));
  //           }
  //         }
  //       }
  //     } else {
  //       // Or is the outer ring just a circular arc?
  //       if (!partStroke || partStroke[0]) {
  //         context.moveTo(cx + xors, cy + yors);
  //         context.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, !clockwise);
  //       } else {
  //         // context.moveTo(cx + outerRadius * cos(outerEndAngle), cy + yore);
  //       }
  //     }
  //     // Is there no inner ring, and it’s a circular sector?
  //     // Or perhaps it’s an annular sector collapsed due to padding?
  //     if (!(innerRadius > epsilon) || innerDeltaAngle < 0.001) {
  //       if (!partStroke || partStroke[1]) {
  //         context.lineTo(cx + xire, cy + yire);
  //       } else {
  //         context.moveTo(cx + xire, cy + yire);
  //       }
  //       collapsedToLine = true;
  //     } else if (limitedIcr > epsilon) {
  //       const cornerRadiusStart = min(innerCornerRadiusStart, limitedIcr);
  //       const cornerRadiusEnd = min(innerCornerRadiusEnd, limitedIcr);
  //       // Does the sector’s inner ring (or point) have rounded corners?
  //       const t0 = cornerTangents(xire, yire, xore, yore, innerRadius, -cornerRadiusEnd, Number(clockwise));
  //       const t1 = cornerTangents(xors, yors, xirs, yirs, innerRadius, -cornerRadiusStart, Number(clockwise));

  //       if (!partStroke || partStroke[1]) {
  //         context.lineTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
  //       } else {
  //         context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
  //       }

  //       // Have the corners merged?
  //       if (limitedIcr < maxInnerCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
  //         const arcEndAngle = atan2(t1.y01, t1.x01);
  //         if (!partStroke || partStroke[2]) {
  //           context.arc(cx + t0.cx, cy + t0.cy, limitedIcr, atan2(t0.y01, t0.x01), arcEndAngle, !clockwise);
  //         } else {
  //           context.moveTo(cx + t0.cx + cos(arcEndAngle), cy + t0.cy + sin(arcEndAngle));
  //         }
  //       } else {
  //         // Otherwise, draw the two corners and the ring.
  //         if (!partStroke || partStroke[2]) {
  //           cornerRadiusEnd > 0 &&
  //             context.arc(
  //               cx + t0.cx,
  //               cy + t0.cy,
  //               cornerRadiusEnd,
  //               atan2(t0.y01, t0.x01),
  //               atan2(t0.y11, t0.x11),
  //               !clockwise
  //             );
  //           context.arc(
  //             cx,
  //             cy,
  //             innerRadius,
  //             atan2(t0.cy + t0.y11, t0.cx + t0.x11),
  //             atan2(t1.cy + t1.y11, t1.cx + t1.x11),
  //             clockwise
  //           );
  //           cornerRadiusStart > 0 &&
  //             context.arc(
  //               cx + t1.cx,
  //               cy + t1.cy,
  //               cornerRadiusStart,
  //               atan2(t1.y11, t1.x11),
  //               atan2(t1.y01, t1.x01),
  //               !clockwise
  //             );
  //         } else {
  //           if (cornerRadiusStart > 0) {
  //             context.moveTo(
  //               cx + t1.cx + cornerRadiusStart * cos(atan2(t1.y01, t1.x01)),
  //               cy + t1.cy + cornerRadiusStart * sin(atan2(t1.y01, t1.x01))
  //             );
  //           } else {
  //             context.moveTo(cx + xirs, cy + yirs);
  //           }
  //         }
  //       }
  //     } else {
  //       // Or is the inner ring just a circular arc?
  //       if (!partStroke || partStroke[1]) {
  //         context.lineTo(cx + xire, cy + yire);
  //       } else {
  //         context.moveTo(cx + xire, cy + yire);
  //       }
  //       if (!partStroke || partStroke[2]) {
  //         context.arc(cx, cy, innerRadius, innerEndAngle, innerStartAngle, clockwise);
  //       } else {
  //         context.moveTo(cx + innerRadius * cos(innerStartAngle), cy + innerRadius * sin(innerStartAngle));
  //       }
  //     }
  //   }

  //   if (!partStroke) {
  //     context.closePath();
  //   } else if (partStroke[3]) {
  //     context.lineTo(cx + outerRadius * cos(endAngle), cy + outerRadius * cos(endAngle));
  //   }

  //   return collapsedToLine;
  // }

  // 绘制尾部cap
  drawArcTailCapPath(
    arc: IArc,
    context: IContext2d | IPath2D,
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    _sa: number,
    _ea: number
  ) {
    const capAngle = _ea - _sa;
    const data = arc.getParsedAngle();
    const startAngle = data.startAngle;
    let endAngle = data.endAngle;
    endAngle = _ea;
    const deltaAngle = abs(endAngle - startAngle);
    const clockwise: boolean = endAngle > startAngle;
    let collapsedToLine: boolean = false;
    // 规范化outerRadius和innerRadius
    if (outerRadius < innerRadius) {
      const temp = outerRadius;
      outerRadius = innerRadius;
      innerRadius = temp;
    }

    const cornerRadius = arc.getParsedCornerRadius();
    // Or is it a circular or annular sector?
    const { outerDeltaAngle, innerDeltaAngle, outerStartAngle, outerEndAngle, innerEndAngle, innerStartAngle } =
      arc.getParsePadAngle(startAngle, endAngle);

    const outerCornerRadiusStart = cornerRadius;
    const outerCornerRadiusEnd = cornerRadius;
    const innerCornerRadiusEnd = cornerRadius;
    const innerCornerRadiusStart = cornerRadius;
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

    if (limitedOcr > epsilon) {
      const cornerRadiusStart = min(outerCornerRadiusStart, limitedOcr);
      const cornerRadiusEnd = min(outerCornerRadiusEnd, limitedOcr);
      // Does the sector’s outer ring have rounded corners?
      const t0 = cornerTangents(xirs, yirs, xors, yors, outerRadius, cornerRadiusStart, Number(clockwise));
      const t1 = cornerTangents(xore, yore, xire, yire, outerRadius, cornerRadiusEnd, Number(clockwise));

      // Have the corners merged?
      if (limitedOcr < maxOuterCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
        context.moveTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);
        context.arc(cx + t0.cx, cy + t0.cy, limitedOcr, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !clockwise);
      } else {
        const a1 = endAngle - capAngle - 0.03;
        const a2 = atan2(t1.y11, t1.x11);
        context.arc(cx, cy, outerRadius, a1, a2, !clockwise);
        cornerRadiusEnd > 0 &&
          context.arc(
            cx + t1.cx,
            cy + t1.cy,
            cornerRadiusEnd,
            atan2(t1.y11, t1.x11),
            atan2(t1.y01, t1.x01),
            !clockwise
          );
      }
    } else {
      context.moveTo(cx + xors, cy + yors);
    }
    //   else {
    //     // Or is the outer ring just a circular arc?
    //     if (!partStroke || partStroke[0]) {
    //       context.moveTo(cx + xors, cy + yors);
    //       context.arc(cx, cy, outerRadius, outerStartAngle, outerEndAngle, !clockwise);
    //     } else {
    //       // context.moveTo(cx + outerRadius * cos(outerEndAngle), cy + yore);
    //     }
    //   }
    //   // Is there no inner ring, and it’s a circular sector?
    //   // Or perhaps it’s an annular sector collapsed due to padding?
    if (!(innerRadius > epsilon) || innerDeltaAngle < 0.001) {
      context.lineTo(cx + xire, cy + yire);
      collapsedToLine = true;
    } else if (limitedIcr > epsilon) {
      const cornerRadiusStart = min(innerCornerRadiusStart, limitedIcr);
      const cornerRadiusEnd = min(innerCornerRadiusEnd, limitedIcr);
      // Does the sector’s inner ring (or point) have rounded corners?
      const t0 = cornerTangents(xire, yire, xore, yore, innerRadius, -cornerRadiusEnd, Number(clockwise));
      const t1 = cornerTangents(xors, yors, xirs, yirs, innerRadius, -cornerRadiusStart, Number(clockwise));

      context.lineTo(cx + t0.cx + t0.x01, cy + t0.cy + t0.y01);

      // Have the corners merged?
      if (limitedIcr < maxInnerCornerRadius && cornerRadiusStart === cornerRadiusEnd) {
        const arcEndAngle = atan2(t1.y01, t1.x01);
        context.arc(cx + t0.cx, cy + t0.cy, limitedIcr, atan2(t0.y01, t0.x01), arcEndAngle, !clockwise);
      } else {
        cornerRadiusEnd > 0 &&
          context.arc(
            cx + t0.cx,
            cy + t0.cy,
            cornerRadiusEnd,
            atan2(t0.y01, t0.x01),
            atan2(t0.y11, t0.x11),
            !clockwise
          );
        const a1 = atan2(t0.cy + t0.y11, t0.cx + t0.x11);
        const a2 = endAngle - capAngle - 0.03;
        context.arc(cx, cy, innerRadius, a1, a2, clockwise);
      }
    } else {
      context.lineTo(cx + innerRadius * cos(innerStartAngle), cy + innerRadius * sin(innerStartAngle));
    }

    return collapsedToLine;
  }

  drawShape(
    arc: IArc,
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
    const fVisible = fillVisible(opacity, fillOpacity);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(arc.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || background)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb || background)) {
      return;
    }

    const {
      outerRadius = arcAttribute.outerRadius,
      innerRadius = arcAttribute.innerRadius,
      cap = arcAttribute.cap,
      forceShowCap = arcAttribute.forceShowCap
    } = arc.attribute;

    const { isFullStroke, stroke: arrayStroke } = parseStroke(stroke);
    if (doFill || isFullStroke) {
      context.beginPath();
      // if (arc.shouldUpdateShape()) {
      //   // 更新shape
      //   arc.cache = new Path2D(context);
      //   this.drawArcPath(arc, arc.cache, x, y, outerRadius, innerRadius);
      //   arc.clearUpdateShapeTag();
      // } else {
      //   if (arc.cache) {
      //     renderCommandList(arc.cache.commandList, context);
      //   }
      // }
      // 测试后，cache对于重绘性能提升不大，但是在首屏有一定性能损耗，因此arc不再使用cache
      drawArcPath(arc, context, x, y, outerRadius, innerRadius);

      if (!this._arcRenderContribitions) {
        this._arcRenderContribitions = this.arcRenderContribitions.getContributions() || [];
        this._arcRenderContribitions.sort((a, b) => b.order - a.order);
      }
      this._arcRenderContribitions.forEach(c => {
        if (c.time === BaseRenderContributionTime.beforeFillStroke) {
          // c.useStyle && context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
          c.drawShape(arc, context, x, y, doFill, doStroke, fVisible, sVisible, arcAttribute, fillCb, strokeCb);
        }
      });

      // shadow
      context.setShadowStyle && context.setShadowStyle(arc, arc.attribute, arcAttribute);

      if (doFill) {
        if (fillCb) {
          fillCb(context, arc.attribute, arcAttribute);
        } else if (fVisible) {
          context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
          context.fill();
        }
      }

      if (doStroke && isFullStroke) {
        if (strokeCb) {
          strokeCb(context, arc.attribute, arcAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
          context.stroke();
        }
      }
    }

    // 需要局部渲染描边的时候
    if (!isFullStroke && doStroke) {
      context.beginPath();
      const collapsedToLine = drawArcPath(arc, context, x, y, outerRadius, innerRadius, arrayStroke);

      if (strokeCb) {
        strokeCb(context, arc.attribute, arcAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
        context.stroke();
      }
    }

    // 绘制cap
    if (cap && forceShowCap) {
      const { startAngle: sa, endAngle: ea } = arc.getParsedAngle();
      const deltaAngle = abs(ea - sa);
      if (deltaAngle >= pi2 - epsilon) {
        context.beginPath();
        const capWidth = Math.abs(outerRadius - innerRadius) / 2;
        // 以外边界长度为准
        const capAngle = capWidth / outerRadius;
        const { endAngle = arcAttribute.endAngle, fill = arcAttribute.fill } = arc.attribute;
        const startAngle = endAngle;
        this.drawArcTailCapPath(arc, context, x, y, outerRadius, innerRadius, startAngle, startAngle + capAngle);
        if (doFill) {
          // 获取渐变色最后一个颜色
          const color = fill;
          if ((color as IGradientColor).gradient === 'conical') {
            const lastColor = getConicGradientAt(0, 0, endAngle, color as any);
            if (fillCb) {
              // fillCb(context, arc.attribute, arcAttribute);
            } else if (fillVisible) {
              // context.closePath();
              context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
              context.fillStyle = lastColor as string;
              context.fill();
            }
          }
        }
        if (doStroke) {
          if (strokeCb) {
            // fillCb(context, arc.attribute, arcAttribute);
          } else if (sVisible) {
            context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
            // context.strokeStyle = 'red';
            context.stroke();
          }
        }
      }
    }

    if (!this._arcRenderContribitions) {
      this._arcRenderContribitions = this.arcRenderContribitions.getContributions() || [];
    }
    this._arcRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        c.drawShape(arc, context, x, y, doFill, doStroke, fVisible, sVisible, arcAttribute, fillCb, strokeCb);
      }
    });
  }

  draw(arc: IArc, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    // const arcAttribute = graphicService.themeService.getCurrentTheme().arcAttribute;
    const arcAttribute = getTheme(arc, params?.theme).arc;

    context.highPerformanceSave();

    let { x = arcAttribute.x, y = arcAttribute.y } = arc.attribute;
    if (!arc.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(arc.transMatrix, true);
    } else {
      const point = arc.getOffsetXY(arcAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    if (drawPathProxy(arc, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(arc, context, x, y, drawContext, params);

    context.highPerformanceRestore();
  }
}
