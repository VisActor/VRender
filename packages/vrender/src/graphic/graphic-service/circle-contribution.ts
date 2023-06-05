import { IAABBBounds } from '@visactor/vutils';
import { injectable } from 'inversify';
import { IGraphic, ICircleGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const CircleBoundsContribution = Symbol.for('CircleBoundsContribution');

export interface ICircleBoundsContribution {
  updateBounds: (
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

@injectable()
export class DefaultCircleOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements ICircleBoundsContribution {}
