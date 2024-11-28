import type { ContinuousPlayerAttributes } from './continuous-player';
import type { DiscretePlayerAttributes } from './discrete-player';

export * from './base';
export * from './direction';
export * from './discrete-player';
export * from './continuous-player';
export * from './event';
export * from './layout';

export type PlayerAttributes = ContinuousPlayerAttributes | DiscretePlayerAttributes;
