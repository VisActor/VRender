import { injectable } from 'inversify';
import type { IRectBoundsContribution } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const RectBoundsContribution = Symbol.for('RectBoundsContribution');

@injectable()
export class DefaultRectOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IRectBoundsContribution {}
