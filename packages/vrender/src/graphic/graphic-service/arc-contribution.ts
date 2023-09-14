import { injectable } from '../../common/inversify-lite';
import type { IArcBoundsContribution } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const ArcBoundsContribution = Symbol.for('ArcBoundsContribution');

@injectable()
export class DefaultArcOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IArcBoundsContribution {}
