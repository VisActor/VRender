import type { IAABBBounds } from '@visactor/vutils';
import { boundStroke } from '../tools';
import type { IGraphic, ISymbolBoundsContribution, ISymbolGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

// export const SymbolBoundsContribution = Symbol.for('SymbolBoundsContribution');

// @injectable()
export class DefaultSymbolOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements ISymbolBoundsContribution
{
  updateBounds(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const {
      outerBorder,
      shadowBlur = symbolTheme.shadowBlur,
      strokeBoundsBuffer = symbolTheme.strokeBoundsBuffer
    } = attribute;

    if (outerBorder) {
      const defaultOuterBorder = symbolTheme.outerBorder;
      const { distance = defaultOuterBorder.distance, lineWidth = defaultOuterBorder.lineWidth } = outerBorder;

      // Symbol的distance一定是number
      boundStroke(aabbBounds, (distance as number) + (shadowBlur + lineWidth) / 2, true, strokeBoundsBuffer);
    }
    return aabbBounds;
  }
}
