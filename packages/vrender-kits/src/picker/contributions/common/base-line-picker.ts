import { BaseRender, getScaledStroke, getTheme, mat4Allocate } from '@visactor/vrender-core';
import type {
  IGraphicAttribute,
  IGraphic,
  IPickParams,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicRender
} from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';

export abstract class BaseLinePicker<T extends IGraphic<Partial<IGraphicAttribute>>> extends BaseRender<T> {
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

    // const lineAttribute = graphicService.themeService.getCurrentTheme().lineAttribute;
    pickContext.highPerformanceSave();
    const lineAttribute = graphic.getGraphicTheme();

    const data = this.transform(graphic, lineAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = graphic.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      graphic,
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
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
        return picked;
      },
      (
        context: IContext2d,
        lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = lineAttribute.lineWidth || themeAttribute.lineWidth;
        const pickStrokeBuffer = lineAttribute.pickStrokeBuffer || themeAttribute.pickStrokeBuffer;
        const keepStrokeScale = lineAttribute.keepStrokeScale || themeAttribute.keepStrokeScale;
        pickContext.lineWidth = keepStrokeScale
          ? lineWidth + pickStrokeBuffer
          : getScaledStroke(pickContext, lineWidth + pickStrokeBuffer, pickContext.dpr);
        picked = context.isPointInStroke(pickPoint.x, pickPoint.y);
        return picked;
      }
    );
    this.canvasRenderer.z = 0;

    if (pickContext.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(pickContext.modelMatrix);
    }
    pickContext.modelMatrix = lastModelMatrix;
    pickContext.highPerformanceRestore();
    return picked;
  }
}
