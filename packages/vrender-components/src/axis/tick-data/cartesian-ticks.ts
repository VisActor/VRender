import type { BandScale, ContinuousScale, IBaseScale } from '@visactor/vscale';
// eslint-disable-next-line no-duplicate-imports
import { isContinuous, isDiscrete } from '@visactor/vscale';
import { continuousTicks } from './continuous';
import { linearDiscreteTicks } from './discrete/linear';
import type { ICartesianTickDataOpt, ITickData, ITickDataOpt } from '../type';
import { convertDomainToTickData } from './util';

// 总入口
export const cartesianTicks = (scale: IBaseScale, op: ITickDataOpt): ITickData[] => {
  if (isContinuous(scale.type)) {
    return continuousTicks(scale as ContinuousScale, op);
  } else if (isDiscrete(scale.type)) {
    if (op.coordinateType === 'cartesian') {
      return linearDiscreteTicks(scale as BandScale, op as ICartesianTickDataOpt);
    }
  }
  return convertDomainToTickData(scale.domain());
};
