import { injectable } from '../../../common/inversify-lite';
import type {
  IArea,
  IAreaGraphicAttribute,
  IAreaSegment,
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IDrawContext
} from '../../../interface';
import { AREA_NUMBER_TYPE } from '../../../graphic/constants';
import { getTheme } from '../../../graphic/theme';
import { fillVisible, runFill } from './utils';
import { DefaultCanvasAreaRender } from './area-render';
import { drawIncrementalAreaSegments } from '../../../common/render-curve';

/**
 * 默认的基于canvas的line渲染器
 * 单例
 */
@injectable()
export class DefaultIncrementalCanvasAreaRender extends DefaultCanvasAreaRender implements IGraphicRender {
  declare type: 'area';
  numberType: number = AREA_NUMBER_TYPE;

  drawShape(
    area: IArea,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    if (area.incremental && drawContext.multiGraphicOptions) {
      const { startAtIdx, length } = drawContext.multiGraphicOptions;
      const { segments = [] } = area.attribute;
      if (startAtIdx > segments.length) {
        return;
      }
      const areaAttribute = getTheme(area).area;
      const {
        fill = areaAttribute.fill,
        fillOpacity = areaAttribute.fillOpacity,
        opacity = areaAttribute.opacity,
        visible = areaAttribute.visible
      } = area.attribute;
      // 不绘制或者透明
      const fVisible = fillVisible(opacity, fillOpacity, fill);
      const doFill = runFill(fill);

      if (!(area.valid && visible)) {
        return;
      }

      if (!doFill) {
        return;
      }

      // 如果存在fillCb和strokeCb，那就不直接跳过
      if (!(fVisible || fillCb)) {
        return;
      }

      // 不支持clipRange，不支持pick，仅支持最基础的线段绘制
      for (let i = startAtIdx; i < startAtIdx + length; i++) {
        this.drawIncreaseSegment(
          area,
          context,
          segments[i - 1],
          segments[i],
          area.attribute.segments[i],
          [areaAttribute, area.attribute],
          x,
          y
        );
      }
    } else {
      super.drawShape(area, context, x, y, drawContext, params, fillCb);
    }
  }

  drawIncreaseSegment(
    area: IArea,
    context: IContext2d,
    lastSeg: IAreaSegment,
    seg: IAreaSegment,
    attribute: Partial<IAreaGraphicAttribute>,
    defaultAttribute: Required<IAreaGraphicAttribute> | Partial<IAreaGraphicAttribute>[],
    offsetX: number,
    offsetY: number
  ) {
    if (!seg) {
      return;
    }

    context.beginPath();
    drawIncrementalAreaSegments(context.camera ? context : context.nativeContext, lastSeg, seg, {
      offsetX,
      offsetY
    });

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(area, attribute, defaultAttribute);
    context.setCommonStyle(area, attribute, offsetX, offsetY, defaultAttribute);
    context.fill();
  }
}
