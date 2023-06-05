import { IAABBBounds } from '@visactor/vutils';
import { injectable } from 'inversify';
import { IGraphic, IPathGraphicAttribute } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const PathBoundsContribution = Symbol.for('PathBoundsContribution');

export interface IPathBoundsContribution {
  updateBounds: (
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) => IAABBBounds;
}

@injectable()
export class DefaultPathOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IPathBoundsContribution {}
