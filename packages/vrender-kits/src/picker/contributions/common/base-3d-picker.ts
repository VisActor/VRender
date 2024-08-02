import { BaseRender, getTheme, mat4Allocate } from '@visactor/vrender-core';
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

export abstract class Base3dPicker<T extends IGraphic<Partial<IGraphicAttribute>>> extends BaseRender<T> {
  canvasRenderer!: IGraphicRender;

  declare themeType: string;

  contains(graphic: IGraphic, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const attribute = graphic.getGraphicTheme();

    pickContext.highPerformanceSave();
    const data = this.transform(graphic, attribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = graphic.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    let picked = false;
    this.canvasRenderer.drawShape(
      graphic,
      pickContext,
      x,
      y,
      params as any,
      null,
      (
        context: IContext2d,
        arc3dAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
        return picked;
      }
    );
    this.canvasRenderer.z = 0;

    if (pickContext.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(pickContext.modelMatrix);
    }
    pickContext.modelMatrix = lastModelMatrix;
    pickContext.highPerformanceRestore();
    return picked; // 无圆角形状判断通过
  }
}
