import { IPoint, AABBBounds } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import { IGraphicAttribute, IContext2d, IMarkAttribute, IPyramid3d, IThemeAttribute } from '../../../interface';
import { IGraphicRender, Pyramid3dRender } from '../../../render';
import { IGraphicPicker, IPickParams } from '../../picker-service';
import { mat4Allocate } from '../../../modules';
import { BasePicker } from './base-picker';
import { PYRAMID3D_NUMBER_TYPE } from '../../../graphic/constants';

const _bounds = new AABBBounds();

@injectable()
export class DefaultCanvasPyramid3dPicker extends BasePicker<IPyramid3d> implements IGraphicPicker {
  type: string = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;

  constructor(@inject(Pyramid3dRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(pyramid3d: IPyramid3d, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }
    const pyramid3dAttribute = getTheme(pyramid3d).polygon;

    pickContext.highPerformanceSave();
    const data = this.transform(pyramid3d, pyramid3dAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = pyramid3d.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      pyramid3d,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        pyramid3dAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
        return picked;
      },
      (
        context: IContext2d,
        pyramid3dAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // // 选中后面就不需要再走逻辑了
        // if (picked) {
        //   return true;
        // }
        // const lineWidth = pyramid3dAttribute.lineWidth || themeAttribute.lineWidth;
        // pickContext.lineWidth = getScaledStroke(pickContext, lineWidth, pickContext.dpr);
        // picked = context.isPointInStroke(point.x, point.y);
        // return picked;
        return false;
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
