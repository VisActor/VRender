import { injectable } from 'inversify';
import { DefaultOuterBorderBoundsContribution } from './common-contribution';
import type { IPathBoundsContribution } from '../../interface/graphic-service';

export const PathBoundsContribution = Symbol.for('PathBoundsContribution');

@injectable()
export class DefaultPathOuterBorderBoundsContribution
  extends DefaultOuterBorderBoundsContribution
  implements IPathBoundsContribution {}
