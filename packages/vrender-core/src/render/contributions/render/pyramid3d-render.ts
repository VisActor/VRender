import { injectable } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { PYRAMID3D_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IPyramid3d,
  IThemeAttribute,
  IGraphicRender,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '../../../interface';
import { Base3dRender } from './base-3d-render';

@injectable()
export class DefaultCanvasPyramid3dRender extends Base3dRender<IPyramid3d> implements IGraphicRender {
  type = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;
  declare z: number;

  drawShape(
    pyramid3d: IPyramid3d,
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
    const pyramidAttribute = getTheme(pyramid3d, params?.theme).polygon;
    const {
      fill = pyramidAttribute.fill,
      stroke = pyramidAttribute.stroke,
      face = [true, true, true, true, true, true]
    } = pyramid3d.attribute;

    const z = this.z ?? 0;

    const data = this.valid(pyramid3d, pyramidAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    // const { fVisible, sVisible, doFill, doStroke } = data;

    const { light } = drawContext.stage || {};

    const face3d = pyramid3d.findFace();

    if (fill !== false) {
      context.setCommonStyle(pyramid3d, pyramid3d.attribute, x, y, pyramidAttribute);
      let fc = fill;
      if (typeof fc !== 'string') {
        fc = 'black';
      }
      this.fill(x, y, z, face3d, face, fc, context, light, pyramid3d, pyramidAttribute, fillCb);
    }
    if (stroke !== false) {
      context.setStrokeStyle(pyramid3d, pyramid3d.attribute, x, y, pyramidAttribute);
      this.stroke(x, y, z, face3d, context);
    }
  }

  draw(pyramid3d: IPyramid3d, renderService: IRenderService, drawContext: IDrawContext) {
    const pyramid3dAttribute = getTheme(pyramid3d).polygon;
    this._draw(pyramid3d, pyramid3dAttribute, false, drawContext);
  }
}
