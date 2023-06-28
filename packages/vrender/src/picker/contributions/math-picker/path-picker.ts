import { inject, injectable } from 'inversify';
import type { IPoint } from '@visactor/vutils';
import { getTheme } from '../../../graphic/theme';
import type {
  IContext2d,
  IPath,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IGraphicPicker,
  IGraphicRender,
  IPickParams
} from '../../../interface';
import { PathRender } from '../../../render';
import { PATH_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultMathPathPicker implements IGraphicPicker {
  type: string = 'path';
  numberType: number = PATH_NUMBER_TYPE;

  constructor(@inject(PathRender) public readonly canvasRenderer: IGraphicRender) {}

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
    let { x = pathAttribute.x, y = pathAttribute.y } = path.attribute;

    pickContext.highPerformanceSave();
    if (!path.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(path.transMatrix, true);
    } else {
      const point = path.getOffsetXY(pathAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

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
        picked = context.isPointInPath(point.x, point.y);
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
        pickContext.lineWidth = lineWidth;
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();

    return picked;
  }
}
