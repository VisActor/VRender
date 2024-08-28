import type { LinearScale, ContinuousScale } from '@visactor/vscale';
// eslint-disable-next-line no-duplicate-imports
import { isContinuous } from '@visactor/vscale';
import { isFunction, isValid, last } from '@visactor/vutils';
import type { ICartesianTickDataOpt, ILabelItem, ITickData, ITickDataOpt } from '../type';
// eslint-disable-next-line no-duplicate-imports
import { convertDomainToTickData, getCartesianLabelBounds, hasOverlap, intersect } from './util';

function getScaleTicks(
  op: ITickDataOpt,
  scale: ContinuousScale,
  count: number,
  getTicks: (count: number, range?: [number, number]) => number[]
) {
  let scaleTicks: number[];
  const { breakData } = op;

  if (breakData) {
    const { range: breakRanges } = breakData();
    const domain = scale.domain();
    scaleTicks = [];
    for (let i = 0; i < domain.length; i++) {
      if (i < domain.length - 1) {
        const range: [number, number] = [domain[i], domain[i + 1]];
        const ticks = getTicks(count, range);
        ticks.forEach(tick => {
          if (!breakRanges.some((breakRange: [number, number]) => tick >= breakRange[0] && tick <= breakRange[1])) {
            scaleTicks.push(tick);
          }
        });
      }
    }
    // reset
    (scale as LinearScale).domain(domain);
  } else {
    scaleTicks = getTicks(count);
  }

  return scaleTicks;
}

/** 连续轴默认 tick 数量 */
export const DEFAULT_CONTINUOUS_TICK_COUNT = 5;
/**
 * 对于连续轴：
 * - 如果spec配了tickCount、forceTickCount、tickStep，则直接输出LinearScale的ticks()、forceTicks()、stepTicks()结果；
 * - 默认输出tickCount为10的ticks()结果。
 *
 * @param scale
 * @param op
 * @returns
 */
export const continuousTicks = (scale: ContinuousScale, op: ITickDataOpt): ITickData[] => {
  if (!isContinuous(scale.type)) {
    return convertDomainToTickData(scale.domain());
  }
  // if range is so small
  const range = scale.range();
  const rangeSize = Math.abs(range[range.length - 1] - range[0]);
  if (rangeSize < 2) {
    return convertDomainToTickData([scale.domain()[0]]);
  }

  const { tickCount, forceTickCount, tickStep, noDecimals = false, labelStyle, breakData } = op;

  let scaleTicks: number[];
  if (isValid(tickStep)) {
    scaleTicks = (scale as LinearScale).stepTicks(tickStep);
  } else if (isValid(forceTickCount)) {
    scaleTicks = getScaleTicks(op, scale, forceTickCount, (count: number, range?: [number, number]) => {
      if (range && range.length) {
        return (scale as LinearScale).domain(range).forceTicks(count);
      }
      return (scale as LinearScale).forceTicks(count);
    });
  } else if (op.tickMode === 'd3') {
    const count =
      (isFunction(tickCount) ? tickCount({ axisLength: rangeSize, labelStyle }) : tickCount) ??
      DEFAULT_CONTINUOUS_TICK_COUNT;

    scaleTicks = getScaleTicks(op, scale, count, (count: number, range?: [number, number]) => {
      if (range && range.length) {
        return (scale as LinearScale).domain(range).d3Ticks(count, { noDecimals });
      }
      return (scale as LinearScale).d3Ticks(count, { noDecimals });
    });
  } else {
    const count =
      (isFunction(tickCount) ? tickCount({ axisLength: rangeSize, labelStyle }) : tickCount) ??
      DEFAULT_CONTINUOUS_TICK_COUNT;
    const customTicks = isFunction(op.tickMode) ? op.tickMode : undefined;

    scaleTicks = getScaleTicks(op, scale, count, (count: number, range?: [number, number]) => {
      if (range && range.length) {
        return (scale as LinearScale).domain(range).ticks(count, { noDecimals, customTicks });
      }
      return (scale as LinearScale).ticks(count, { noDecimals, customTicks });
    });
  }

  if (op.sampling) {
    // 判断重叠
    if (op.coordinateType === 'cartesian' || (op.coordinateType === 'polar' && op.axisOrientType === 'radius')) {
      const { labelGap = 4, labelFlush } = op as ICartesianTickDataOpt;
      let items = getCartesianLabelBounds(scale, scaleTicks, op as ICartesianTickDataOpt).map(
        (bounds, i) =>
          ({
            AABBBounds: bounds,
            value: scaleTicks[i]
          } as ILabelItem<number>)
      );
      const samplingMethod = breakData ? methods.greedy : methods.parity; // 由于轴截断后刻度会存在不均匀的情况，所以不能使用 parity 算法
      while (items.length >= 3 && hasOverlap(items, labelGap)) {
        items = samplingMethod(items, labelGap);
      }
      const ticks = items.map(item => item.value);

      if (ticks.length < 3 && labelFlush) {
        if (ticks.length > 1) {
          ticks.pop();
        }
        if (last(ticks) !== last(scaleTicks)) {
          ticks.push(last(scaleTicks));
        }
      }

      scaleTicks = ticks;
    }
  }

  return convertDomainToTickData(scaleTicks);
};

const methods = {
  parity: function <T>(items: ILabelItem<T>[]) {
    return items.filter((item, i) => i % 2 === 0);
  },
  greedy: function <T>(items: ILabelItem<T>[], sep: number) {
    let a: ILabelItem<T>;
    return items.filter((b, i) => {
      if (!i || !intersect(a.AABBBounds, b.AABBBounds, sep)) {
        a = b;
        return true;
      }
      return false;
    });
  }
};
