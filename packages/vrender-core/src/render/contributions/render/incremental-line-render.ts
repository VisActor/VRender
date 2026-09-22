import type {
  IContext2d,
  ILine,
  ILineGraphicAttribute,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  ISegment,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IDrawContext
} from '../../../interface';
import { getTheme } from '../../../graphic/theme';
import { LINE_NUMBER_TYPE } from '../../../graphic/constants';
import { fillVisible, runFill, runStroke, strokeVisible } from './utils';
import type { ILineRenderVisibility } from './line-render';
import { DefaultCanvasLineRender } from './line-render';
import { drawIncrementalSegments } from '../../../common/render-curve';

/**
 * 默认的基于canvas的line渲染器
 * 单例
 */
export class DefaultIncrementalCanvasLineRender extends DefaultCanvasLineRender implements IGraphicRender {
  declare type: 'line';
  numberType: number = LINE_NUMBER_TYPE;

  drawShape(
    line: ILine,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    // console.log(drawContext.multiGraphicOptions)
    if (line.incremental && drawContext.multiGraphicOptions) {
      const { startAtIdx, length } = drawContext.multiGraphicOptions;
      const { segments = [] } = line.attribute;
      if (startAtIdx > segments.length) {
        return;
      }

      const lineAttribute = getTheme(line).line;

      const {
        fill = lineAttribute.fill,
        stroke = lineAttribute.stroke,
        opacity = lineAttribute.opacity,
        fillOpacity = lineAttribute.fillOpacity,
        strokeOpacity = lineAttribute.strokeOpacity,
        lineWidth = lineAttribute.lineWidth,
        visible = lineAttribute.visible
      } = line.attribute;

      // 不绘制或者透明
      const fVisible = fillVisible(opacity, fillOpacity, fill);
      const sVisible = strokeVisible(opacity, strokeOpacity);
      const doFill = runFill(fill);
      const doStroke = runStroke(stroke, lineWidth);

      if (!(line.valid && visible)) {
        return;
      }

      if (!(doFill || doStroke)) {
        return;
      }

      // 如果存在fillCb和strokeCb，那就不直接跳过
      if (!(fVisible || sVisible || fillCb || strokeCb)) {
        return;
      }

      const { context } = drawContext;
      const visibility: ILineRenderVisibility = { doFill, doStroke, fVisible, sVisible };
      // 不支持clipRange，不支持pick，仅支持最基础的线段绘制
      for (let i = startAtIdx; i < startAtIdx + length; i++) {
        this.drawIncreaseSegment(
          line,
          context,
          segments[i - 1],
          segments[i],
          line.attribute.segments[i],
          [lineAttribute, line.attribute],
          x,
          y,
          drawContext,
          visibility
        );
      }
    } else {
      super.drawShape(line, context, x, y, drawContext, params, fillCb, strokeCb);
    }
  }

  drawIncreaseSegment(
    line: ILine,
    context: IContext2d,
    lastSeg: ISegment,
    seg: ISegment,
    attribute: Partial<ILineGraphicAttribute>,
    defaultAttribute: Required<ILineGraphicAttribute> | Partial<ILineGraphicAttribute>[],
    offsetX: number,
    offsetY: number,
    drawContext: IDrawContext,
    visibility: ILineRenderVisibility
  ) {
    if (!seg) {
      return;
    }

    // 内置裁剪贡献在 beforeFillStroke 里 beginPath 建裁剪路径，会冲掉这里建好的折线路径，故要能重建
    const buildPath = () => {
      context.beginPath();
      drawIncrementalSegments(context.nativeContext, lastSeg, seg, { offsetX, offsetY });
    };

    buildPath();

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(line, attribute, defaultAttribute);

    const { doFill, doStroke, fVisible, sVisible } = visibility;

    this.beforeRenderStep(
      line,
      context,
      offsetX,
      offsetY,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      defaultAttribute as Required<ILineGraphicAttribute>,
      drawContext,
      null,
      null,
      { attribute }
    );

    // 有裁剪配置时上面的贡献点已经 beginPath 建了裁剪路径，重建折线路径，否则 stroke 画的是裁剪形状
    if (line.attribute.clipConfig) {
      buildPath();
    }

    context.setStrokeStyle(line, attribute, offsetX, offsetY, defaultAttribute);
    context.stroke();

    this.afterRenderStep(
      line,
      context,
      offsetX,
      offsetY,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      defaultAttribute as Required<ILineGraphicAttribute>,
      drawContext,
      null,
      null,
      { attribute }
    );
  }
}
