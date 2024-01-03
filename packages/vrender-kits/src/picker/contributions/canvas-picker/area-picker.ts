import { inject, injectable, getTheme, AreaRender, AREA_NUMBER_TYPE, getScaledStroke } from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';
import type {
  IArea,
  IContext2d,
  IGraphicAttribute,
  IGraphicPicker,
  IGraphicRender,
  IMarkAttribute,
  IPickParams,
  IThemeAttribute
} from '@visactor/vrender-core';

@injectable()
export class DefaultCanvasAreaPicker implements IGraphicPicker {
  type: string = 'area';
  numberType: number = AREA_NUMBER_TYPE;

  constructor(@inject(AreaRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(area: IArea, point: IPoint, params?: IPickParams): boolean {
    if (!area.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (area.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const areaAttribute = graphicService.themeService.getCurrentTheme().areaAttribute;
    const areaAttribute = getTheme(area).area;
    let { x = areaAttribute.x, y = areaAttribute.y } = area.attribute;
    const { fillPickable = areaAttribute.fillPickable, strokePickable = areaAttribute.strokePickable } = area.attribute;

    pickContext.highPerformanceSave();
    if (!area.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(area.transMatrix, true);
    } else {
      const point = area.getOffsetXY(areaAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      area,
      pickContext,
      x,
      y,
      {} as any,
      null,
      context => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        if (!fillPickable) {
          return false;
        }
        picked = context.isPointInPath(point.x, point.y);
        return picked;
      },
      (
        context: IContext2d,
        areaAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        if (!strokePickable) {
          return false;
        }
        const lineWidth = areaAttribute.lineWidth || themeAttribute.lineWidth;
        const pickStrokeBuffer = areaAttribute.pickStrokeBuffer || themeAttribute.pickStrokeBuffer;
        pickContext.lineWidth = getScaledStroke(pickContext, lineWidth + pickStrokeBuffer, pickContext.dpr);
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();
    // area没有stroke pick
    return picked;
  }
}
