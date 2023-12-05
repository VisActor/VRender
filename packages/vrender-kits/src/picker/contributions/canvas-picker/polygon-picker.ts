import {
  inject,
  injectable,
  getTheme,
  PolygonRender,
  POLYGON_NUMBER_TYPE,
  getScaledStroke
} from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';
import type {
  IContext2d,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IPolygon,
  IGraphicPicker,
  IGraphicRender,
  IPickParams
} from '@visactor/vrender-core';

@injectable()
export class DefaultCanvasPolygonPicker implements IGraphicPicker {
  type: string = 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor(@inject(PolygonRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(polygon: IPolygon, point: IPoint, params?: IPickParams): boolean {
    if (!polygon.AABBBounds.contains(point.x, point.y)) {
      return false;
    }

    if (polygon.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const polygonAttribute = graphicService.themeService.getCurrentTheme().pathAttribute;
    const polygonAttribute = getTheme(polygon).polygon;
    let { x = polygonAttribute.x, y = polygonAttribute.y } = polygon.attribute;

    pickContext.highPerformanceSave();
    if (!polygon.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(polygon.transMatrix, true);
    } else {
      const point = polygon.getOffsetXY(polygonAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      polygon,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        pathAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        picked = context.isPointInPath(point.x, point.y);
        return picked;
      },
      (
        context: IContext2d,
        pathAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = pathAttribute.lineWidth || themeAttribute.lineWidth;
        const pickStrokeBuffer = pathAttribute.pickStrokeBuffer || themeAttribute.pickStrokeBuffer;
        pickContext.lineWidth = getScaledStroke(pickContext, lineWidth + pickStrokeBuffer, pickContext.dpr);
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();

    return picked;
  }
}
