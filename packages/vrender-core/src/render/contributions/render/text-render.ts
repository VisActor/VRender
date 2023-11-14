import { inject, injectable, named } from '../../../common/inversify-lite';
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
import { BaseRender } from './base-render';
import { ContributionProvider } from '../../../common/contribution-provider';
import { TextRenderContribution } from './contributions/constants';
import { matrixAllocate } from '../../../allocator/matrix-allocate';
import { max } from '@visactor/vutils';
import { calculateLineHeight } from '../../../common/utils';

@injectable()
export class DefaultCanvasTextRender extends BaseRender<IText> implements IGraphicRender {
  type: 'text';
  numberType: number = TEXT_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(TextRenderContribution)
    protected readonly textRenderContribitions: IContributionProvider<ITextRenderContribution>
  ) {
    super();
    this.init(textRenderContribitions);
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
      underline = textAttribute.underline,
      lineThrough = textAttribute.lineThrough,
      keepDirIn3d = textAttribute.keepDirIn3d,
      direction = textAttribute.direction,
      // lineHeight = textAttribute.lineHeight,
      fontSize = textAttribute.fontSize,
      verticalMode = textAttribute.verticalMode,
      x: originX = textAttribute.x,
      y: originY = textAttribute.y
    } = text.attribute;

    let { textAlign = textAttribute.textAlign, textBaseline = textAttribute.textBaseline } = text.attribute;
    if (!verticalMode && direction === 'vertical') {
      const t = textAlign;
      textAlign = text.getBaselineMapAlign()[textBaseline] ?? ('left' as any);
      textBaseline = text.getAlignMapBaseline()[t] ?? ('top' as any);
    }
    const lineHeight = calculateLineHeight(text.attribute.lineHeight, fontSize) ?? fontSize;

    const data = this.valid(text, textAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    // 文字如果需要变换，那就需要将3dmatrix转成context的2dmatrix
    const transform3dMatrixToContextMatrix = !keepDirIn3d;

    const z = this.z || 0;

    context.beginPath();

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(text, text.attribute, textAttribute);

    this.beforeRenderStep(
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

    transform3dMatrixToContextMatrix && this.transformUseContext2d(text, textAttribute, z, context);

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
    if (Array.isArray(str)) {
      context.setTextStyleWithoutAlignBaseline(text.attribute, textAttribute, z);
      if (direction === 'horizontal') {
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
              context.strokeText(
                line.str,
                (line.leftOffset || 0) + xOffset + x,
                (line.topOffset || 0) + yOffset + y,
                z
              );
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
        text.tryUpdateAABBBounds(); // 更新cache
        const cache = text.cache;
        const { verticalList } = cache;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        const totalHeight = lineHeight * verticalList.length;
        let totalW = 0;
        verticalList.forEach(verticalData => {
          const _w = verticalData.reduce((a, b) => a + (b.width || 0), 0);
          totalW = max(_w, totalW);
        });
        let offsetY = 0;
        let offsetX = 0;
        if (textBaseline === 'bottom') {
          offsetX = -totalHeight;
        } else if (textBaseline === 'middle') {
          offsetX = -totalHeight / 2;
        }
        if (textAlign === 'center') {
          offsetY -= totalW / 2;
        } else if (textAlign === 'right') {
          offsetY -= totalW;
        }
        verticalList.forEach((verticalData, i) => {
          const currentW = verticalData.reduce((a, b) => a + (b.width || 0), 0);
          const dw = totalW - currentW;
          let currentOffsetY = offsetY;
          if (textAlign === 'center') {
            currentOffsetY += dw / 2;
          } else if (textAlign === 'right') {
            currentOffsetY += dw;
          }
          verticalData.forEach(item => {
            const { text, width, direction } = item;
            drawText(text, totalHeight - (i + 1) * lineHeight + offsetX, currentOffsetY, direction);
            currentOffsetY += width;
          });
        });
      }
    } else {
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
      } else {
        text.tryUpdateAABBBounds(); // 更新cache
        const cache = text.cache;
        if (cache) {
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
    }
    transform3dMatrixToContextMatrix && this.restoreTransformUseContext2d(text, textAttribute, z, context);

    this.afterRenderStep(
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
  }

  draw(text: IText, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const textAttribute = getTheme(text, params?.theme).text;
    const { keepDirIn3d = textAttribute.keepDirIn3d } = text.attribute;
    // 文字如果需要变换，那就一定要计算3d矩阵
    const computed3dMatrix = !keepDirIn3d;
    this._draw(text, textAttribute, computed3dMatrix, drawContext, params);
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
