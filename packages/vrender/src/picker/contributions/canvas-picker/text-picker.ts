import { inject, injectable } from 'inversify';
import type { IPoint } from '@visactor/vutils';
import { getTheme } from '../../../graphic/theme';
import { TEXT_NUMBER_TYPE } from '../../../graphic/text';
import type { IGraphicAttribute, IContext2d, IMarkAttribute, IText, IThemeAttribute } from '../../../interface';
import type { IGraphicPicker, IPickParams } from '../../picker-service';
import { BasePicker } from './base-picker';
import type { IGraphicRender } from '../../../render';
import { TextRender } from '../../../render';
import { textDrawOffsetX, textLayoutOffsetY } from '../../../common/text';
import { mat4Allocate } from '../../../modules';

@injectable()
export class DefaultCanvasTextPicker extends BasePicker<IText> implements IGraphicPicker {
  type: string = 'text';
  numberType: number = TEXT_NUMBER_TYPE;

  constructor(@inject(TextRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(text: IText, point: IPoint, params?: IPickParams): boolean {
    // const { textAttribute } = graphicService.themeService.getCurrentTheme();
    // const {
    //   x = textAttribute.x,
    //   y = textAttribute.y,
    // } = text.attribute;
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const bounds = text.AABBBounds;

    if (!pickContext.camera) {
      if (!bounds.containsPoint(point)) {
        return false;
      }
      return true;
    }

    // const symbolAttribute = graphicService.themeService.getCurrentTheme().symbolAttribute;
    pickContext.highPerformanceSave();
    const textAttribute = getTheme(text).text;

    const { keepDirIn3d = textAttribute.keepDirIn3d } = text.attribute;
    // 文字如果需要变换，那就一定要计算3d矩阵
    const computed3dMatrix = !keepDirIn3d;

    const data = this.transform(text, textAttribute, pickContext, computed3dMatrix);
    const { x, y, z, lastModelMatrix } = data;

    this.canvasRenderer.z = z;
    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = text.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      text,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        symbolAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const { textBaseline = textAttribute.textBaseline, textAlign = textAttribute.textAlign } = text.attribute;
        // 拾取基于xy的rect
        const bounds = text.AABBBounds;
        const height = bounds.height();
        const width = bounds.width();
        const offsetY = textLayoutOffsetY(textBaseline, height);
        const offsetX = textDrawOffsetX(textAlign, width);
        context.rect(offsetX + x, offsetY + y, width, height, z);
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
        return picked;
      },
      (
        context: IContext2d,
        symbolAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        // if (picked) {
        //   return true;
        // }
        // const lineWidth = symbolAttribute.lineWidth || themeAttribute.lineWidth;
        // pickContext.lineWidth = getScaledStroke(pickContext, lineWidth, pickContext.dpr);
        // picked = context.isPointInStroke(pickPoint.x, pickPoint.y);
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
