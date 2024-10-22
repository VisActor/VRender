import { abs, atan2, cos, epsilon, min, sin, pi2, isBoolean } from '@visactor/vutils';
import { inject, injectable, named } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { parseStroke } from '../../../common/utils';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { calculateArcCornerRadius } from '../render/utils';
import type {
  IContext2d,
  IArc,
  IPath2D,
  IGraphicAttribute,
  IMarkAttribute,
  IThemeAttribute,
  IGradientColor,
  IArcRenderContribution,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IContributionProvider,
  IConicalGradient
} from '../../../interface';
import { cornerTangents, drawArcPath, fillVisible } from './utils';
import { getConicGradientAt } from '../../../canvas/conical-gradient';
import { ArcRenderContribution } from './contributions/constants';
import { ARC_NUMBER_TYPE } from '../../../graphic/constants';
import { BaseRender } from './base-render';
import {
  defaultArcBackgroundRenderContribution,
  defaultArcRenderContribution,
  defaultArcTextureRenderContribution
} from './contributions';
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

@injectable()
export class DefaultCanvasArcRender extends BaseRender<IArc> implements IGraphicRender {
  type: 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(ArcRenderContribution)
    protected readonly arcRenderContribitions: IContributionProvider<IArcRenderContribution>
  ) {
    super();
    this.builtinContributions = [
      defaultArcRenderContribution,
      defaultArcBackgroundRenderContribution,
      defaultArcTextureRenderContribution
    ];
    this.init(arcRenderContribitions);
  }

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
      limitedIcr,
      innerDeltaAngle,
      innerStartAngle,
      innerCornerRadiusStart,
      innerCornerRadiusEnd,
      maxInnerCornerRadius
    } = calculateArcCornerRadius(arc, startAngle, endAngle, innerRadius, outerRadius);

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
      stroke = arcAttribute.stroke,
      x: originX = arcAttribute.x,
      y: originY = arcAttribute.y,
      fillStrokeOrder = arcAttribute.fillStrokeOrder
    } = arc.attribute;
    const data = this.valid(arc, arcAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    const {
      outerPadding = arcAttribute.outerPadding,
      innerPadding = arcAttribute.innerPadding,
      cap = arcAttribute.cap,
      forceShowCap = arcAttribute.forceShowCap
    } = arc.attribute;
    let { outerRadius = arcAttribute.outerRadius, innerRadius = arcAttribute.innerRadius } = arc.attribute;
    outerRadius += outerPadding;
    innerRadius -= innerPadding;
    // 判断是否是环形渐变，且有头部cap，那就偏移渐变色角度
    let conicalOffset = 0;
    const tempChangeConicalColor =
      ((isBoolean(cap) && cap) || (cap as boolean[])[0]) && (fill as IGradientColor).gradient === 'conical';
    if (tempChangeConicalColor) {
      const { sc, startAngle, endAngle } = arc.getParsedAngle();
      if (abs(endAngle - startAngle) < pi2 - epsilon) {
        conicalOffset = sc || 0;
        (fill as IConicalGradient).startAngle -= conicalOffset;
        (fill as IConicalGradient).endAngle -= conicalOffset;
      }
    }

    let beforeRenderContribitionsRuned = false;
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

      beforeRenderContribitionsRuned = true;
      // shadow
      context.setShadowBlendStyle && context.setShadowBlendStyle(arc, arc.attribute, arcAttribute);
      this.beforeRenderStep(
        arc,
        context,
        x,
        y,
        doFill,
        doStroke,
        fVisible,
        sVisible,
        arcAttribute,
        drawContext,
        fillCb,
        strokeCb
      );

      const _runFill = () => {
        if (doFill) {
          if (fillCb) {
            fillCb(context, arc.attribute, arcAttribute);
          } else if (fVisible) {
            context.setCommonStyle(arc, arc.attribute, originX - x, originY - y, arcAttribute);
            context.fill();
          }
        }
      };

      const _runStroke = () => {
        if (doStroke && isFullStroke) {
          if (strokeCb) {
            strokeCb(context, arc.attribute, arcAttribute);
          } else if (sVisible) {
            context.setStrokeStyle(arc, arc.attribute, originX - x, originY - y, arcAttribute);
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
    }

    // 需要局部渲染描边的时候
    if (!isFullStroke && doStroke) {
      context.beginPath();
      const collapsedToLine = drawArcPath(arc, context, x, y, outerRadius, innerRadius, arrayStroke);

      if (!beforeRenderContribitionsRuned) {
        this.beforeRenderStep(
          arc,
          context,
          x,
          y,
          doFill,
          doStroke,
          fVisible,
          sVisible,
          arcAttribute,
          drawContext,
          fillCb,
          strokeCb
        );
      }

      if (strokeCb) {
        strokeCb(context, arc.attribute, arcAttribute);
      } else if (sVisible) {
        context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
        context.stroke();
      }
    }

    // 绘制cap
    if (((isBoolean(cap) && cap) || (cap as boolean[])[1]) && forceShowCap) {
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

        if (!beforeRenderContribitionsRuned) {
          this.beforeRenderStep(
            arc,
            context,
            x,
            y,
            doFill,
            doStroke,
            fVisible,
            sVisible,
            arcAttribute,
            drawContext,
            fillCb,
            strokeCb
          );
        }

        const _runFill = () => {
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
        };

        const _runStroke = () => {
          if (doStroke) {
            if (strokeCb) {
              // fillCb(context, arc.attribute, arcAttribute);
            } else if (sVisible) {
              context.setStrokeStyle(arc, arc.attribute, x, y, arcAttribute);
              // context.strokeStyle = 'red';
              context.stroke();
            }
          }
        };

        if (!fillStrokeOrder) {
          _runFill();
          _runStroke();
        } else {
          _runFill();
          _runStroke();
        }
      }
    }

    this.afterRenderStep(
      arc,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      arcAttribute,
      drawContext,
      fillCb,
      strokeCb
    );

    if (tempChangeConicalColor) {
      (fill as IConicalGradient).startAngle += conicalOffset;
      (fill as IConicalGradient).endAngle += conicalOffset;
    }
  }

  draw(arc: IArc, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const arcAttribute = getTheme(arc, params?.theme).arc;
    this._draw(arc, arcAttribute, false, drawContext, params);
  }
}
