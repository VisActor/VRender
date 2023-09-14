import { inject, injectable } from '../../../common/inversify-lite';
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
} from '../../../interface';
import { LineRender } from '../../../render';
import { getTheme } from '../../../graphic/theme';
import { LINE_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultMathLinePicker implements IGraphicPicker {
  type: string = 'line';
  numberType: number = LINE_NUMBER_TYPE;

  constructor(@inject(LineRender) public readonly canvasRenderer: IGraphicRender) {}
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
    const lineAttribute = getTheme(line).line;
    let { x = lineAttribute.x, y = lineAttribute.y } = line.attribute;

    pickContext.highPerformanceSave();
    if (!line.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(line.transMatrix, true);
    } else {
      const point = line.getOffsetXY(lineAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

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
