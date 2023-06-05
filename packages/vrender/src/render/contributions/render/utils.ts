import { isArray } from '@visactor/vutils';
import { renderCommandList } from '../../../common';
import { IDrawContext } from '../../../render/render-service';
import { getTheme } from '../../../graphic/theme';
import { IGraphicAttribute, IContext2d, IGraphic, IMarkAttribute, IThemeAttribute } from '../../../interface';
import { IGraphicRenderDrawParams } from './graphic-render';

/**
 * 是否需要执行fill逻辑
 * @param fill
 * @returns
 */
export function runFill(fill: boolean) {
  return fill;
}

/**
 * 是否需要执行stroke逻辑
 * @param stroke
 * @returns
 */
export function runStroke(stroke: number | boolean | boolean[], lineWidth: number) {
  let s: boolean | number;
  if (isArray(stroke)) {
    s = stroke.some(item => item);
  } else {
    s = stroke;
  }
  return s && lineWidth > 0;
}

/**
 * 是否fill部分可见
 * @param opacity
 * @param fillOpacity
 * @returns
 */
export function fillVisible(opacity: number, fillOpacity: number) {
  return opacity * fillOpacity > 0;
}

export function rectFillVisible(opacity: number, fillOpacity: number, width: number, height: number) {
  return opacity * fillOpacity > 0 && width > 0 && height > 0;
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
  return opacity * strokeOpacity > 0 && width > 0 && height > 0;
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

  const themeAttributes = getTheme(graphic, params?.theme)[graphic.type];

  const {
    fill = themeAttributes.fill == null ? !!graphic.attribute.fillColor : themeAttributes.fill,
    stroke = themeAttributes.stroke == null ? !!graphic.attribute.strokeColor : themeAttributes.stroke,
    opacity = themeAttributes.opacity,
    fillOpacity = themeAttributes.fillOpacity,
    lineWidth = themeAttributes.lineWidth,
    strokeOpacity = themeAttributes.strokeOpacity,
    visible = themeAttributes.visible
  } = graphic.attribute;
  // 不绘制或者透明
  const fVisible = fillVisible(opacity, fillOpacity);
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
  context.setShadowStyle && context.setShadowStyle(graphic, graphic.attribute, themeAttributes);

  if (doStroke) {
    if (strokeCb) {
      strokeCb(context, graphic.attribute, themeAttributes);
    } else if (sVisible) {
      context.setStrokeStyle(graphic, graphic.attribute, x, y, themeAttributes);
      context.stroke();
    }
  }
  if (doFill) {
    if (fillCb) {
      fillCb(context, graphic.attribute, themeAttributes);
    } else if (fVisible) {
      context.setCommonStyle(graphic, graphic.attribute, x, y, themeAttributes);
      context.fill();
    }
  }
  return true;
}
