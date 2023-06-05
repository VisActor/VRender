import { IAABBBounds } from '@visactor/vutils';
import { IGraphic, IAreaGraphicAttribute } from '../../interface';

export const AreaBoundsContribution = Symbol.for('AreaBoundsContribution');

export interface IAreaBoundsContribution {
  updateBounds: (
    attribute: IAreaGraphicAttribute,
    arcTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

// @injectable()
// export class DefaultArcOuterBorderBoundsContribution
//   extends DefaultOuterBorderBoundsContribution
//   implements IArcBoundsContribution {}
