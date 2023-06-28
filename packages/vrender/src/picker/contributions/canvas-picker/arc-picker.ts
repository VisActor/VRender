import { inject, injectable } from 'inversify';
import type { IPoint } from '@visactor/vutils';
import { getTheme } from '../../../graphic/theme';
import type {
  IArc,
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicPicker,
  IGraphicRender,
  IPickParams
} from '../../../interface';

import { ArcRender } from '../../../render';
import { getScaledStroke } from '../../../common/canvas-utils';
import { ARC_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultCanvasArcPicker implements IGraphicPicker {
  type: string = 'arc';
  numberType: number = ARC_NUMBER_TYPE;

  constructor(@inject(ArcRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(arc: IArc, point: IPoint, params?: IPickParams): boolean {
    if (!arc.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (arc.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const arcAttribute = getTheme(arc).arc;

    // const arcAttribute = graphicService.themeService.getCurrentTheme().arcAttribute;

    pickContext.highPerformanceSave();
    let { x = arcAttribute.x, y = arcAttribute.y } = arc.attribute;
    if (!arc.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(arc.transMatrix, true);
    } else {
      const point = arc.getOffsetXY(arcAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      arc,
      pickContext,
      x,
      y,
      {} as any,
      null,
      (
        context: IContext2d,
        arcAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
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
        arcAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = arcAttribute.lineWidth || themeAttribute.lineWidth;
        pickContext.lineWidth = getScaledStroke(pickContext, lineWidth, pickContext.dpr);
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();
    return picked;
  }
}
