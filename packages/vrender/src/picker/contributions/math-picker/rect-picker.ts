import { isArray, isNumber, IPoint, AABBBounds } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import { IGraphicAttribute, IContext2d, IMarkAttribute, IRect, IThemeAttribute } from '../../../interface';
import { IGraphicRender, RectRender } from '../../../render';
import { IGraphicPicker, IPickParams } from '../../picker-service';
import { RECT_NUMBER_TYPE } from '../../../graphic/constants';

const _bounds = new AABBBounds();

@injectable()
export class DefaultMathRectPicker implements IGraphicPicker {
  type: string = 'rect';
  numberType: number = RECT_NUMBER_TYPE;

  constructor(@inject(RectRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(rect: IRect, point: IPoint, params?: IPickParams): boolean {
    if (!rect.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (rect.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const { rectAttribute } = graphicService.themeService.getCurrentTheme();
    const rectAttribute = getTheme(rect).rect;
    const { cornerRadius = rectAttribute.cornerRadius } = rect.attribute;
    let { x = rectAttribute.x, y = rectAttribute.y } = rect.attribute;

    pickContext.highPerformanceSave();
    let onlyTranslate = true;
    if (!rect.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      onlyTranslate = false;
      pickContext.transformFromMatrix(rect.transMatrix, true);
    } else {
      const point = rect.getOffsetXY(rectAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    let picked = true;
    // 处理圆角情况，无圆角直接使用bounds判断结果
    if (
      !onlyTranslate ||
      (isNumber(cornerRadius, true) && cornerRadius !== 0) ||
      (isArray(cornerRadius) && (<number[]>cornerRadius).some(num => num !== 0))
    ) {
      // 详细形状判断
      picked = false;
      this.canvasRenderer.drawShape(
        rect,
        pickContext,
        x,
        y,
        {} as any,
        null,
        (
          context: IContext2d,
          rectAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
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
          rectAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
          themeAttribute: IThemeAttribute
        ) => {
          // 选中后面就不需要再走逻辑了
          if (picked) {
            return true;
          }
          const lineWidth = rectAttribute.lineWidth || themeAttribute.lineWidth;
          pickContext.lineWidth = lineWidth;
          picked = context.isPointInStroke(point.x, point.y);
          return picked;
        }
      );
    } else if (picked) {
      // 如果只有描边那需要测试描边
      const {
        fill = rectAttribute.fill,
        stroke = rectAttribute.stroke,
        lineWidth = rectAttribute.lineWidth
      } = rect.attribute;
      if (fill) {
        picked = true;
      } else if (stroke) {
        const bounds = rect.AABBBounds;
        _bounds.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
        _bounds.expand(-lineWidth / 2);
        picked = !_bounds.containsPoint(point);
      }
    }

    pickContext.highPerformanceRestore();
    return picked; // 无圆角形状判断通过
  }
}
