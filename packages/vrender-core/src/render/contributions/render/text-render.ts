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
import { textDrawOffsetX, textDrawOffsetY, textLayoutOffsetY } from '../../../common/text';
import type { IText, ITextGraphicAttribute } from '../../../interface/graphic/text';
import { BaseRender } from './base-render';
import { ContributionProvider } from '../../../common/contribution-provider';
import { TextRenderContribution } from './contributions/constants';
import { matrixAllocate } from '../../../allocator/matrix-allocate';
import { isNil, max } from '@visactor/vutils';
import { calculateLineHeight } from '../../../common/utils';
import { defaultTextBackgroundRenderContribution } from './contributions/text-contribution-render';

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
    this.builtinContributions = [defaultTextBackgroundRenderContribution as any];
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
      // whiteSpace = textAttribute.whiteSpace,
      fontSize = textAttribute.fontSize,
      verticalMode = textAttribute.verticalMode,
      x: originX = textAttribute.x,
      y: originY = textAttribute.y
    } = text.attribute;

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
          // 垂直布局的情况下不支持下划线和中划线
          // this.drawUnderLine(underline, lineThrough, text, _x, _y, 0, 0, z, textAttribute, context);
        }
      }

      if (direction) {
        context.highPerformanceRestore();
        context.setTransformForCurrent();
      }
    };
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
            this.drawUnderLine(
              underline,
              lineThrough,
              text,
              (line.leftOffset || 0) + xOffset + x,
              (line.topOffset || 0) + yOffset + y,
              line.descent,
              (line.descent - line.ascent) / 2,
              z,
              textAttribute,
              context,
              {
                width: line.width
              }
            );
          });
        }
      }
    } else {
      let { textAlign = textAttribute.textAlign, textBaseline = textAttribute.textBaseline } = text.attribute;
      if (!verticalMode) {
        const t = textAlign;
        textAlign = text.getBaselineMapAlign()[textBaseline] ?? ('left' as any);
        textBaseline = text.getAlignMapBaseline()[t] ?? ('top' as any);
      }
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
    anchorX: number,
    anchorY: number,
    offsetUnderLineY: number,
    offsetThroughLineY: number,
    z: number,
    textAttribute: Required<ITextGraphicAttribute>,
    context: IContext2d,
    multiOption?: {
      width: number;
    }
  ) {
    if (lineThrough + underline <= 0) {
      return;
    }

    const {
      textAlign = textAttribute.textAlign,
      // textBaseline = textAttribute.textBaseline,
      // fontSize = textAttribute.fontSize,
      fill = textAttribute.fill,
      opacity = textAttribute.opacity,
      underlineOffset = textAttribute.underlineOffset,
      underlineDash = textAttribute.underlineDash,
      fillOpacity = textAttribute.fillOpacity
    } = text.attribute;
    const isMulti = !isNil(multiOption);
    const w = isMulti ? multiOption!.width : text.clipedWidth;
    const offsetX = isMulti ? 0 : textDrawOffsetX(textAlign, w);
    // const offsetY = textLayoutOffsetY(isMulti ? 'alphabetic' : textBaseline, fontSize, fontSize);
    const attribute = { lineWidth: 0, stroke: fill, opacity, strokeOpacity: fillOpacity };
    // let deltaY = isMulti ? -3 : 0;
    if (underline) {
      attribute.lineWidth = underline;
      context.setStrokeStyle(text, attribute, anchorX, anchorY, textAttribute);
      underlineDash && context.setLineDash(underlineDash);
      context.beginPath();
      // const dy = y + offsetY + fontSize + underlineOffset + deltaY;
      const dy = anchorY + offsetUnderLineY + underlineOffset;
      context.moveTo(anchorX + offsetX, dy, z);
      context.lineTo(anchorX + offsetX + w, dy, z);
      context.stroke();
    }
    // if (isMulti) {
    //   deltaY = -1;
    // }
    if (lineThrough) {
      attribute.lineWidth = lineThrough;
      context.setStrokeStyle(text, attribute, anchorX, anchorY, textAttribute);
      context.beginPath();
      // const dy = y + offsetY + fontSize / 2 + deltaY;
      const dy = anchorY + offsetThroughLineY;
      context.moveTo(anchorX + offsetX, dy, z);
      context.lineTo(anchorX + offsetX + w, dy, z);
      context.stroke();
    }
  }
}
