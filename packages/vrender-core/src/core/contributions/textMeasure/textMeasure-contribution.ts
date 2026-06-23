import { ATextMeasure } from './AtextMeasure';

export const TextMeasureContribution = Symbol.for('TextMeasureContribution');

export class DefaultTextMeasureContribution extends ATextMeasure {
  id: string = 'DefaultTextMeasureContribution';
}
