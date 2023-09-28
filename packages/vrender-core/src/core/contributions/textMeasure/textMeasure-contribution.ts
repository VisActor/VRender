import { injectable } from '../../../common/inversify-lite';
import { ATextMeasure } from './AtextMeasure';

export const TextMeasureContribution = Symbol.for('TextMeasureContribution');

@injectable()
export class DefaultTextMeasureContribution extends ATextMeasure {}
