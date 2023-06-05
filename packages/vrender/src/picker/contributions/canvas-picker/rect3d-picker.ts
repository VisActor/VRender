import { IPoint, AABBBounds } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { getTheme, RECT3D_NUMBER_TYPE } from '../../../graphic';
import { IGraphicAttribute, IContext2d, IMarkAttribute, IRect3d, IThemeAttribute } from '../../../interface';
import { graphicService, mat4Allocate } from '../../../modules';
import { IGraphicRender, Rect3DRender } from '../../../render';
import { IGraphicPicker, IPickParams } from '../../picker-service';
import { BasePicker } from './base-picker';

const _bounds = new AABBBounds();

@injectable()
export class DefaultCanvasRect3dPicker extends BasePicker<IRect3d> implements IGraphicPicker {
  type: string = 'rect3d';
  numberType: number = RECT3D_NUMBER_TYPE;

  constructor(@inject(Rect3DRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(rect: IRect3d, point: IPoint, params?: IPickParams): boolean {
    // if (!rect.AABBBounds.containsPoint(point)) {
    //   return false;
    // }
    // if (rect.attribute.pickMode === 'imprecise') {
    //   return true;
    // }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const { rectAttribute } = graphicService.themeService.getCurrentTheme();
    const rectAttribute = getTheme(rect).rect;

    pickContext.highPerformanceSave();
    const data = this.transform(rect, rectAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = rect.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    let picked = false;
    this.canvasRenderer.drawShape(
      rect,
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
      // (
      //   context: IContext2d,
      //   arc3dAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      //   themeAttribute: IThemeAttribute
      // ) => {
      //   // 选中后面就不需要再走逻辑了
      //   if (picked) {
      //     return true;
      //   }
      //   const lineWidth = arc3dAttribute.lineWidth || themeAttribute.lineWidth;
      //   pickContext.lineWidth = getScaledStroke(pickContext, lineWidth, pickContext.dpr);
      //   picked = context.isPointInStroke(point.x, point.y);
      //   return picked;
      // }
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
