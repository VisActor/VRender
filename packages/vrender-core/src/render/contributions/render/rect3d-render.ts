import { injectable } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import type {
  IGraphicAttribute,
  IContext2d,
  IFace3d,
  IMarkAttribute,
  IRect3d,
  IThemeAttribute,
  IGraphicRender,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '../../../interface';
import { rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { RECT3D_NUMBER_TYPE } from '../../../graphic/constants';
import { Base3dRender } from './base-3d-render';
@injectable()
export class DefaultCanvasRect3dRender extends Base3dRender<IRect3d> implements IGraphicRender {
  type = 'rect3d';
  numberType: number = RECT3D_NUMBER_TYPE;
  declare z: number;

  drawShape(
    rect: IRect3d,
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
    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const rectAttribute = getTheme(rect, params?.theme).rect;
    const {
      fill = rectAttribute.fill,
      stroke = rectAttribute.stroke,
      x1,
      y1,
      x: originX,
      y: originY,
      opacity = rectAttribute.opacity,
      fillOpacity = rectAttribute.fillOpacity,
      lineWidth = rectAttribute.lineWidth,
      strokeOpacity = rectAttribute.strokeOpacity,
      visible = rectAttribute.visible
    } = rect.attribute;
    let { width, height } = rect.attribute;

    width = (width ?? x1 - originX) || 0;
    height = (height ?? y1 - originY) || 0;

    const z = this.z ?? 0;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height, fill);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(rect.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb)) {
      return;
    }

    const { light } = drawContext.stage || {};
    const face3d = rect.findFace();

    if (fill !== false) {
      context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
      let fc = fill;
      if (typeof fc !== 'string') {
        fc = 'black';
      }
      this.fill(x, y, z, face3d, null, fc, context, light, null, null, fillCb);
    }
    if (stroke !== false) {
      context.setStrokeStyle(rect, rect.attribute, x, y, rectAttribute);
      this.stroke(x, y, z, face3d, context);
    }
  }

  draw(rect: IRect3d, renderService: IRenderService, drawContext: IDrawContext) {
    const rectAttribute = getTheme(rect).rect;
    this._draw(rect, rectAttribute, false, drawContext);
  }
}
