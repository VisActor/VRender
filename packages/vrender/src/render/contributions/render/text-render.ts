import { inject, injectable, named } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import { TEXT_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  ITextRenderContribution,
  IContributionProvider
} from '../../../interface';
import { textDrawOffsetX, textLayoutOffsetY } from '../../../common/text';
import type { IText, ITextGraphicAttribute } from '../../../interface/graphic/text';
import { fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { BaseRender } from './base-render';
import { ContributionProvider } from '../../../common/contribution-provider';
import { TextRenderContribution } from './contributions/constants';
import { BaseRenderContributionTime } from '../../../common/enums';
import { matrixAllocate } from '../../../allocator/matrix-allocate';

@injectable()
export class DefaultCanvasTextRender extends BaseRender<IText> implements IGraphicRender {
  type: 'text';
  numberType: number = TEXT_NUMBER_TYPE;
  z: number;

  protected _textBeforeRenderContribitions: ITextRenderContribution[];
  protected _textAfterRenderContribitions: ITextRenderContribution[];
  constructor(
    @inject(ContributionProvider)
    @named(TextRenderContribution)
    protected readonly textRenderContribitions: IContributionProvider<ITextRenderContribution>
  ) {
    super();
  }

  drawShape(
    text: IText,
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
    const textAttribute = getTheme(text, params?.theme).text;
    const {
      text: str,
      fill = textAttribute.fill,
      stroke = textAttribute.stroke,
      fillOpacity = textAttribute.fillOpacity,
      strokeOpacity = textAttribute.strokeOpacity,
      opacity = textAttribute.opacity,
      lineWidth = textAttribute.lineWidth,
      visible = textAttribute.visible,
      underline = textAttribute.underline,
      lineThrough = textAttribute.lineThrough,
      keepDirIn3d = textAttribute.keepDirIn3d,
      direction = textAttribute.direction,
      // lineHeight = textAttribute.lineHeight,
      fontSize = textAttribute.fontSize,
      textBaseline = textAttribute.textBaseline,
      textAlign = textAttribute.textAlign,
      x: originX = textAttribute.x,
      y: originY = textAttribute.y
    } = text.attribute;

    const lineHeight = text.attribute.lineHeight ?? fontSize;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity, fill);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(text.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke || fVisible || sVisible)) {
      return;
    }
    // 文字如果需要变换，那就需要将3dmatrix转成context的2dmatrix
    const transform3dMatrixToContextMatrix = !keepDirIn3d;

    const z = this.z || 0;

    context.beginPath();

    if (!this._textBeforeRenderContribitions) {
      const contributions = this.textRenderContribitions.getContributions() || [];
      contributions.sort((a, b) => b.order - a.order);
      this._textBeforeRenderContribitions = [];
      this._textAfterRenderContribitions = [];
      contributions.forEach(c => {
        if (c.time === BaseRenderContributionTime.beforeFillStroke) {
          this._textBeforeRenderContribitions.push(c);
        } else {
          this._textAfterRenderContribitions.push(c);
        }
      });
    }
    this._textBeforeRenderContribitions.forEach(c => {
      c.drawShape(
        text,
        context,
        x,
        y,
        doFill,
        doStroke,
        fVisible,
        sVisible,
        textAttribute,
        drawContext,
        fillCb,
        strokeCb
      );
    });

    // shadow
    context.setShadowStyle && context.setShadowStyle(text, text.attribute, textAttribute);

    transform3dMatrixToContextMatrix && this.transformUseContext2d(text, textAttribute, z, context);
    if (Array.isArray(str)) {
      context.setTextStyleWithoutAlignBaseline(text.attribute, textAttribute, z);
      const { multilineLayout } = text;
      if (!multilineLayout) {
        context.highPerformanceRestore();
        return;
      } // 如果不存在的话，需要render层自行布局
      const { xOffset, yOffset } = multilineLayout.bbox;
      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, text.attribute, textAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(text, text.attribute, originX - x, originY - y, textAttribute);
          multilineLayout.lines.forEach(line => {
            context.strokeText(line.str, (line.leftOffset || 0) + xOffset + x, (line.topOffset || 0) + yOffset + y, z);
          });
        }
      }
      if (doFill) {
        if (fillCb) {
          fillCb(context, text.attribute, textAttribute);
        } else if (fVisible) {
          context.setCommonStyle(text, text.attribute, originX - x, originY - y, textAttribute);
          multilineLayout.lines.forEach(line => {
            context.fillText(line.str, (line.leftOffset || 0) + xOffset + x, (line.topOffset || 0) + yOffset + y, z);
            this.drawMultiUnderLine(
              underline,
              lineThrough,
              text,
              (line.leftOffset || 0) + x, // 中下划线都是从文字左侧开始，因此不需要+xOffset
              (line.topOffset || 0) + yOffset + y,
              z,
              line.width,
              textAttribute,
              context
            );
          });
        }
      }
    } else {
      const cache = text.cache;
      const drawText = (t: string, offsetX: number, offsetY: number, direction: number) => {
        let _x = x + offsetX;
        const _y = y + offsetY;
        if (direction) {
          context.highPerformanceSave();
          _x += fontSize;
          const matrix = matrixAllocate.allocate(1, 0, 0, 1, 0, 0);
          // matrix.translate(fontSize, 0);
          matrix.rotateByCenter(Math.PI / 2, _x, _y);
          context.transformFromMatrix(matrix, true);
          matrixAllocate.free(matrix);
        }

        if (doStroke) {
          if (strokeCb) {
            strokeCb(context, text.attribute, textAttribute);
          } else if (sVisible) {
            context.setStrokeStyle(text, text.attribute, originX - x, originY - y, textAttribute);
            context.strokeText(t, _x, _y, z);
          }
        }
        if (doFill) {
          if (fillCb) {
            fillCb(context, text.attribute, textAttribute);
          } else if (fVisible) {
            context.setCommonStyle(text, text.attribute, originX - x, originY - y, textAttribute);
            context.fillText(t, _x, _y, z);
            this.drawUnderLine(underline, lineThrough, text, _x, _y, z, textAttribute, context);
          }
        }

        if (direction) {
          context.highPerformanceRestore();
          context.setTransformForCurrent();
        }
      };
      if (direction === 'horizontal') {
        context.setTextStyle(text.attribute, textAttribute, z);
        const t = text.clipedText as string;
        let dy = 0;
        if (lineHeight !== fontSize) {
          if (textBaseline === 'top') {
            dy = (lineHeight - fontSize) / 2;
          } else if (textBaseline === 'middle') {
            // middle do nothing
          } else if (textBaseline === 'bottom') {
            dy = -(lineHeight - fontSize) / 2;
          } else {
            // alphabetic do nothing
            // dy = (lineHeight - fontSize) / 2 - fontSize * 0.79;
          }
        }
        drawText(t, 0, dy, 0);
      } else if (cache) {
        context.setTextStyleWithoutAlignBaseline(text.attribute, textAttribute, z);
        const { verticalList } = cache;
        let offsetY = 0;
        const totalW = verticalList[0].reduce((a, b) => a + (b.width || 0), 0);
        let offsetX = 0;
        if (textBaseline === 'bottom') {
          offsetX = -lineHeight;
        } else if (textBaseline === 'middle') {
          offsetX = -lineHeight / 2;
        }
        if (textAlign === 'center') {
          offsetY -= totalW / 2;
        } else if (textAlign === 'right') {
          offsetY -= totalW;
        }
        context.textAlign = 'left';
        context.textBaseline = 'top';
        verticalList[0].forEach(item => {
          const { text, width, direction } = item;
          drawText(text, offsetX, offsetY, direction);
          offsetY += width;
        });
      }
    }
    transform3dMatrixToContextMatrix && this.restoreTransformUseContext2d(text, textAttribute, z, context);

    this._textAfterRenderContribitions.forEach(c => {
      c.drawShape(
        text,
        context,
        x,
        y,
        doFill,
        doStroke,
        fVisible,
        sVisible,
        textAttribute,
        drawContext,
        fillCb,
        strokeCb
      );
    });
  }

  draw(text: IText, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    const textAttribute = getTheme(text, params?.theme).text;

    const { keepDirIn3d = textAttribute.keepDirIn3d } = text.attribute;
    // 文字如果需要变换，那就一定要计算3d矩阵
    const computed3dMatrix = !keepDirIn3d;
    const data = this.transform(text, textAttribute, context, computed3dMatrix);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;
    this.drawShape(text, context, x, y, drawContext, params);
    this.z = 0;

    context.modelMatrix = lastModelMatrix;

    context.highPerformanceRestore();
  }

  drawUnderLine(
    underline: number,
    lineThrough: number,
    text: IText,
    x: number,
    y: number,
    z: number,
    textAttribute: Required<ITextGraphicAttribute>,
    context: IContext2d
  ) {
    if (lineThrough + underline <= 0) {
      return;
    }

    const {
      textAlign = textAttribute.textAlign,
      textBaseline = textAttribute.textBaseline,
      fontSize = textAttribute.fontSize,
      fill = textAttribute.fill,
      opacity = textAttribute.opacity,
      fillOpacity = textAttribute.fillOpacity
    } = text.attribute;
    const w = text.clipedWidth;
    const offsetX = textDrawOffsetX(textAlign, w);
    const offsetY = textLayoutOffsetY(textBaseline, fontSize, fontSize);
    const attribute = { lineWidth: 0, stroke: fill, opacity, strokeOpacity: fillOpacity };
    if (underline) {
      attribute.lineWidth = underline;
      context.setStrokeStyle(text, attribute, x, y, textAttribute);
      context.beginPath();
      const dy = y + offsetY + fontSize;
      context.moveTo(x + offsetX, dy, z);
      context.lineTo(x + offsetX + w, dy, z);
      context.stroke();
    }
    if (lineThrough) {
      attribute.lineWidth = lineThrough;
      context.setStrokeStyle(text, attribute, x, y, textAttribute);
      context.beginPath();
      const dy = y + offsetY + fontSize / 2;
      context.moveTo(x + offsetX, dy, z);
      context.lineTo(x + offsetX + w, dy, z);
      context.stroke();
    }
  }

  drawMultiUnderLine(
    underline: number,
    lineThrough: number,
    text: IText,
    x: number,
    y: number,
    z: number,
    w: number,
    textAttribute: Required<ITextGraphicAttribute>,
    context: IContext2d
  ) {
    if (lineThrough + underline <= 0) {
      return;
    }

    const {
      textAlign = textAttribute.textAlign,
      fontSize = textAttribute.fontSize,
      fill = textAttribute.fill,
      opacity = textAttribute.opacity,
      fillOpacity = textAttribute.fillOpacity
    } = text.attribute;

    const offsetX = textDrawOffsetX(textAlign, w);
    const offsetY = textLayoutOffsetY('alphabetic', fontSize, fontSize);
    const attribute = { lineWidth: 0, stroke: fill, opacity, strokeOpacity: fillOpacity };
    let deltaY = -3;
    if (underline) {
      attribute.lineWidth = underline;
      context.setStrokeStyle(text, attribute, x, y, textAttribute);
      context.beginPath();
      const dy = y + offsetY + fontSize + deltaY;
      context.moveTo(x + offsetX, dy, z);
      context.lineTo(x + offsetX + w, dy, z);
      context.stroke();
    }
    deltaY = -1;
    if (lineThrough) {
      attribute.lineWidth = lineThrough;
      context.setStrokeStyle(text, attribute, x, y, textAttribute);
      context.beginPath();
      const dy = y + offsetY + fontSize / 2 + deltaY;
      context.moveTo(x + offsetX, dy, z);
      context.lineTo(x + offsetX + w, dy, z);
      context.stroke();
    }
  }
}
