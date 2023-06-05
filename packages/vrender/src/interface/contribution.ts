import { Releaseable } from './common';

export interface IContribution<T> extends Releaseable {
  configure: (service: T, ...data: any) => void;
}
