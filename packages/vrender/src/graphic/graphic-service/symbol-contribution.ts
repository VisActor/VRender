import { IAABBBounds } from '@visactor/vutils';
import { injectable } from 'inversify';
import { boundStroke } from '../tools';
import { IGraphic, ISymbolGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const SymbolBoundsContribution = Symbol.for('SymbolBoundsContribution');

export interface ISymbolBoundsContribution {
  updateBounds: (
    attribute: ISymbolGraphicAttribute,
    SymbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

@injectable()
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
      boundStroke(aabbBounds, (distance as number) + shadowBlur + lineWidth / 2, true, strokeBoundsBuffer);
    }
    return aabbBounds;
  }
}
