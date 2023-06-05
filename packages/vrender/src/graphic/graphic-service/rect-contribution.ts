import { IAABBBounds } from '@visactor/vutils';
import { injectable } from 'inversify';
import { IGraphic, IRectGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const RectBoundsContribution = Symbol.for('RectBoundsContribution');

export interface IRectBoundsContribution {
  updateBounds: (
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

@injectable()
export class DefaultRectOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IRectBoundsContribution {}
