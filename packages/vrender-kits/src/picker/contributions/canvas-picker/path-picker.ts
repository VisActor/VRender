import {
  inject,
  injectable,
  getTheme,
  PathRender,
  mat4Allocate,
  getScaledStroke,
  PATH_NUMBER_TYPE
} from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';
import type {
  IContext2d,
  IPath,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IGraphicRender,
  IGraphicPicker,
  IPickParams
} from '@visactor/vrender-core';
import { BasePicker } from './base-picker';

@injectable()
export class DefaultCanvasPathPicker extends BasePicker<IPath> implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(@inject(PathRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(path: IPath, point: IPoint, params?: IPickParams): boolean {
    if (!path.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (path.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const pathAttribute = graphicService.themeService.getCurrentTheme().pathAttribute;
    const pathAttribute = getTheme(path).path;

    pickContext.highPerformanceSave();
    const data = this.transform(path, pathAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = path.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      path,
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
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
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
