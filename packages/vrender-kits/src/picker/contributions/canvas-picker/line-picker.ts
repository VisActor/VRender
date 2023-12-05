import {
  inject,
  injectable,
  LineRender,
  getTheme,
  mat4Allocate,
  getScaledStroke,
  LINE_NUMBER_TYPE
} from '@visactor/vrender-core';
import type { IPoint } from '@visactor/vutils';
import type {
  ILine,
  IContext2d,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IGraphicPicker,
  IGraphicRender,
  IPickParams
} from '@visactor/vrender-core';
import { BasePicker } from './base-picker';

@injectable()
export class DefaultCanvasLinePicker extends BasePicker<ILine> implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(@inject(LineRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
  // numberType?: number = LINE_NUMBER_TYPE;

  contains(line: ILine, point: IPoint, params?: IPickParams): boolean {
    if (!line.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (line.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const lineAttribute = graphicService.themeService.getCurrentTheme().lineAttribute;
    pickContext.highPerformanceSave();
    const lineAttribute = getTheme(line).line;

    const data = this.transform(line, lineAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = line.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      line,
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
