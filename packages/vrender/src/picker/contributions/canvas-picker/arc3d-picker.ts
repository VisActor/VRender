import { IPoint, AABBBounds } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { getTheme, ARC3D_NUMBER_TYPE, getExtraModelMatrix, multiplyMat4Mat3, multiplyMat4Mat4 } from '../../../graphic';
import { IGraphicAttribute, IContext2d, IMarkAttribute, IArc3d, IThemeAttribute } from '../../../interface';
import { IGraphicRender, Arc3dRender } from '../../../render';
import { IGraphicPicker, IPickParams } from '../../picker-service';
import { mat4Allocate } from '../../../modules';
import { BasePicker } from './base-picker';

const _bounds = new AABBBounds();

@injectable()
export class DefaultCanvasArc3dPicker extends BasePicker<IArc3d> implements IGraphicPicker {
  type: string = 'arc3d';
  numberType: number = ARC3D_NUMBER_TYPE;

  constructor(@inject(Arc3dRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(arc3d: IArc3d, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }
    const arc3dAttribute = getTheme(arc3d).arc;

    pickContext.highPerformanceSave();
    const data = this.transform(arc3d, arc3dAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = arc3d.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      arc3d,
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

    // mat4Allocate.free(pickContext.modelMatrix);
    if (pickContext.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(pickContext.modelMatrix);
    }
    pickContext.modelMatrix = lastModelMatrix;

    pickContext.highPerformanceRestore();
    return picked;
  }
}
