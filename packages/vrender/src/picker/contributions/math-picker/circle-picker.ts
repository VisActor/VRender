import { IPoint } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import { IGraphicAttribute, ICircle, IContext2d, IMarkAttribute, IThemeAttribute } from '../../../interface';
import { CircleRender, IGraphicRender } from '../../../render';
import { IGraphicPicker, IPickParams } from '../../picker-service';
import { CIRCLE_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultMathCirclePicker implements IGraphicPicker {
  type: string = 'circle';
  numberType: number = CIRCLE_NUMBER_TYPE;

  constructor(@inject(CircleRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(circle: ICircle, point: IPoint, params?: IPickParams): boolean {
    if (!circle.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (circle.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const circleAttribute = graphicService.themeService.getCurrentTheme().circleAttribute;
    const circleAttribute = getTheme(circle).circle;
    let { x = circleAttribute.x, y = circleAttribute.y } = circle.attribute;

    pickContext.highPerformanceSave();
    if (!circle.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(circle.transMatrix, true);
    } else {
      const point = circle.getOffsetXY(circleAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      circle,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        circleAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
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
        circleAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = circleAttribute.lineWidth || themeAttribute.lineWidth;
        pickContext.lineWidth = lineWidth;
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();
    return picked;
  }
}
