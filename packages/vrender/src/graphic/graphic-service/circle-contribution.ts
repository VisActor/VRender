import { injectable } from 'inversify';
import type { ICircleBoundsContribution } from '../../interface';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';

export const CircleBoundsContribution = Symbol.for('CircleBoundsContribution');

@injectable()
export class DefaultCircleOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements ICircleBoundsContribution {}
