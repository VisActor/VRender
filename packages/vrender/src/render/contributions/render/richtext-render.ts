import { injectable } from 'inversify';
import { createRectPath } from '../../../common/shape/rect';
import { getTheme } from '../../../graphic/theme';
import { RICHTEXT_NUMBER_TYPE } from '../../../graphic/constants';
import { IContext2d, IRichText, IRichTextIcon } from '../../../interface';
import { IDrawContext, IRenderService } from '../../render-service';
import { IGraphicRender } from './graphic-render';
import { fillVisible } from './utils';

@injectable()
export class DefaultCanvasRichTextRender implements IGraphicRender {
  type: 'richtext';
  numberType: number = RICHTEXT_NUMBER_TYPE;

  drawShape(richtext: IRichText, context: IContext2d, x: number, y: number, drawContext: IDrawContext) {
    const richtextAttribute = getTheme(richtext).richtext;
    const {
      width = richtextAttribute.width,
      height = richtextAttribute.height,
      opacity = richtextAttribute.opacity,
      fillOpacity = richtextAttribute.fillOpacity,
      visible = richtextAttribute.visible
    } = richtext.attribute;

    if (!(richtext.valid && visible)) {
      return;
    }

    const fVisible = fillVisible(opacity, fillOpacity);
    if (!fVisible) {
      return;
    }

    context.translate(x, y);
    const frame = richtext.getFrameCache();
    frame.draw(context, this.drawIcon);
  }

  drawIcon(icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number) {
    const richtextIconAttribute = getTheme(icon).richtextIcon;

    const {
      width = richtextIconAttribute.width,
      height = richtextIconAttribute.height,
      opacity = richtextIconAttribute.opacity,
      image: url,
      backgroundFill = richtextIconAttribute.backgroundFill,
      // backgroundFillColor = richtextIconAttribute.backgroundFillColor,
      backgroundFillOpacity = richtextIconAttribute.backgroundFillOpacity,
      backgroundStroke = richtextIconAttribute.backgroundStroke,
      // backgroundStrokeColor = richtextIconAttribute.backgroundStrokeColor,
      backgroundStrokeOpacity = richtextIconAttribute.backgroundStrokeOpacity,
      backgroundRadius = richtextIconAttribute.backgroundRadius,
      margin
    } = icon.attribute;

    const { backgroundWidth = width, backgroundHeight = height } = icon.attribute;

    if (margin) {
      x += icon._marginArray[3];
      y += icon._marginArray[0];
    }

    // y -= height / 2 - baseline;

    // 绘制background
    if (icon._hovered) {
      const expandX = (backgroundWidth - width) / 2;
      const expandY = (backgroundHeight - height) / 2;

      if (backgroundRadius === 0) {
        // 不需要处理圆角
        context.beginPath();
        context.rect(x - expandX, y - expandY, backgroundWidth, backgroundHeight);
      } else {
        context.beginPath();
        createRectPath(context, x - expandX, y - expandY, backgroundWidth, backgroundHeight, backgroundRadius);
      }
      if (backgroundFill) {
        // context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
        context.globalAlpha = backgroundFillOpacity;
        context.fillStyle = backgroundFill as string;
        context.fill();
      }
      if (backgroundStroke) {
        // context.setStrokeStyle(rect, rect.attribute, x, y, rectAttribute);
        context.globalAlpha = backgroundStrokeOpacity;
        context.strokeStyle = backgroundStroke as string;
        context.stroke();
      }
    }

    // 绘制图标
    const res = url && icon?.resources?.get(url);
    if (!res || res.state !== 'success') {
      return;
    }
    // context.setCommonStyle(icon, icon.attribute, x, y, iconAttribute);
    context.globalAlpha = opacity;
    context.drawImage(res.data, x, y, width, height);
  }

  draw(richtext: IRichText, renderService: IRenderService, drawContext: IDrawContext) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();

    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const richtextAttribute = getTheme(richtext).richtext;
    let { x = richtextAttribute.x, y = richtextAttribute.y } = richtext.attribute;

    if (!richtext.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(richtext.transMatrix, true);
    } else {
      const point = richtext.getOffsetXY(richtextAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    this.drawShape(richtext, context, x, y, drawContext);

    context.highPerformanceRestore();
  }
}
