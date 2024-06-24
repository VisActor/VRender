import type { BandScale, ContinuousScale, IBaseScale } from '@visactor/vscale';
// eslint-disable-next-line no-duplicate-imports
import { isContinuous, isDiscrete } from '@visactor/vscale';
import { continuousTicks } from './continuous';
import type { IPolarTickDataOpt, ITickData, ITickDataOpt } from '../type';
import { convertDomainToTickData } from './util';
import { polarAngleAxisDiscreteTicks } from './discrete/polar-angle';

// 总入口
// 总入口
export const polarTicks = (scale: IBaseScale, op: ITickDataOpt): ITickData[] => {
  if (isContinuous(scale.type)) {
    return continuousTicks(scale as ContinuousScale, op);
  } else if (isDiscrete(scale.type)) {
    if (op.coordinateType === 'polar') {
      if (op.axisOrientType === 'angle') {
        return polarAngleAxisDiscreteTicks(scale as BandScale, op as IPolarTickDataOpt);
      }
    }
  }
  return convertDomainToTickData(scale.domain());
};
