import { inject, injectable } from '../../../common/inversify-lite';
import type { IPoint } from '@visactor/vutils';
import { getTheme } from '../../../graphic/theme';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  IThemeAttribute,
  IGraphicPicker,
  IGraphicRender,
  IPickParams
} from '../../../interface';
import { SymbolRender } from '../../../render';
import { SYMBOL_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultMathSymbolPicker implements IGraphicPicker {
  type: string = 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;

  constructor(@inject(SymbolRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(symbol: ISymbol, point: IPoint, params?: IPickParams): boolean {
    if (!symbol.AABBBounds.containsPoint(point)) {
      return false;
    }
    if (symbol.attribute.pickMode === 'imprecise') {
      return true;
    }

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    // const symbolAttribute = graphicService.themeService.getCurrentTheme().symbolAttribute;
    const symbolAttribute = getTheme(symbol).symbol;
    let { x = symbolAttribute.x, y = symbolAttribute.y } = symbol.attribute;

    pickContext.highPerformanceSave();
    if (!symbol.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      pickContext.transformFromMatrix(symbol.transMatrix, true);
    } else {
      const point = symbol.getOffsetXY(symbolAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      pickContext.setTransformForCurrent();
    }

    // 详细形状判断
    let picked = false;
    this.canvasRenderer.drawShape(
      symbol,
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
        picked = context.isPointInPath(point.x, point.y);
        return picked;
      },
      (
        context: IContext2d,
        symbolAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
        themeAttribute: IThemeAttribute
      ) => {
        // 选中后面就不需要再走逻辑了
        if (picked) {
          return true;
        }
        const lineWidth = symbolAttribute.lineWidth || themeAttribute.lineWidth;
        pickContext.lineWidth = lineWidth;
        picked = context.isPointInStroke(point.x, point.y);
        return picked;
      }
    );

    pickContext.highPerformanceRestore();
    return picked;
  }
}
