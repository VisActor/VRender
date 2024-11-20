import { getScaledStroke } from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IPickParams,
  IGraphicRender,
  IGraphic,
  ITransform
} from '@visactor/vrender-core';

export abstract class PickerBase {
  canvasRenderer!: IGraphicRender;

  contains(graphic: IGraphic, point: IPoint, params?: IPickParams): boolean {
    if (!graphic.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (graphic.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const attribute = graphic.getGraphicTheme();
    pickContext.highPerformanceSave();
    let { x = attribute.x, y = attribute.y } = graphic.attribute;
    if (!graphic.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(graphic.transMatrix, true);
    } else {
      const point = graphic.getOffsetXY(attribute as ITransform);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      graphic,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        arcAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
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
        arcAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = arcAttribute.lineWidth || themeAttribute.lineWidth;
        const pickStrokeBuffer = arcAttribute.pickStrokeBuffer || themeAttribute.pickStrokeBuffer;
        const keepStrokeScale = arcAttribute.keepStrokeScale || themeAttribute.keepStrokeScale;
        pickContext.lineWidth = keepStrokeScale
          ? lineWidth + pickStrokeBuffer
          : getScaledStroke(pickContext, lineWidth + pickStrokeBuffer, pickContext.dpr);
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();
    return picked;
  }
}
