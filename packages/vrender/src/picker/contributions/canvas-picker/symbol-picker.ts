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
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { getScaledStroke } from '../../../common/canvas-utils';
import { BasePicker } from './base-picker';
import { SYMBOL_NUMBER_TYPE } from '../../../graphic/constants';
import { createRect } from '../../../graphic';

const rect = createRect({});

@injectable()
export class DefaultCanvasSymbolPicker extends BasePicker<ISymbol> implements IGraphicPicker {
  type: string = 'symbol';
  numberType: number = SYMBOL_NUMBER_TYPE;

  constructor(@inject(SymbolRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }

  contains(symbol: ISymbol, point: IPoint, params?: IPickParams): boolean {
    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    const parsedPath = symbol.getParsedPath();
    if (!pickContext.camera) {
      if (!symbol.AABBBounds.containsPoint(point)) {
        return false;
      }
      if (parsedPath.isSvg || symbol.attribute.pickMode === 'imprecise') {
        return true;
      }
    }

    pickContext.highPerformanceSave();
    // const symbolAttribute = graphicService.themeService.getCurrentTheme().symbolAttribute;
    const symbolAttribute = getTheme(symbol).symbol;

    const data = this.transform(symbol, symbolAttribute, pickContext);
    const { x, y, z, lastModelMatrix } = data;
    // let { x = symbolAttribute.x, y = symbolAttribute.y } = symbol.attribute;

    // pickContext.highPerformanceSave();
    // if (!symbol.transMatrix.onlyTranslate()) {
    //   // 性能较差
    //   x = 0;
    //   y = 0;
    //   pickContext.transformFromMatrix(symbol.transMatrix, true);
    // } else {
    //   const point = symbol.getOffsetXY(symbolAttribute);
    //   x += point.x;
    //   y += point.y;
    //   // 当前context有rotate/scale，重置matrix
    //   pickContext.setTransformForCurrent();
    // }

    let pickPoint = point;
    if (pickContext.camera) {
      pickPoint = point.clone();
      const globalMatrix = symbol.parent.globalTransMatrix;
      pickPoint.x = globalMatrix.a * point.x + globalMatrix.c * point.y + globalMatrix.e;
      pickPoint.y = globalMatrix.b * point.x + globalMatrix.d * point.y + globalMatrix.f;
    }

    this.canvasRenderer.z = z;
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
        picked = context.isPointInPath(pickPoint.x, pickPoint.y);
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
        pickContext.lineWidth = getScaledStroke(pickContext, lineWidth, pickContext.dpr);
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
