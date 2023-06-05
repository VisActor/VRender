import { IAABBBounds } from '@visactor/vutils';
import { injectable } from 'inversify';
import { IGraphic, IArcGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const ArcBoundsContribution = Symbol.for('ArcBoundsContribution');

export interface IArcBoundsContribution {
  updateBounds: (
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

@injectable()
export class DefaultArcOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IArcBoundsContribution {}
