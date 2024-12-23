import type { LinearScale, ContinuousScale } from '@visactor/vscale';
// eslint-disable-next-line no-duplicate-imports
import { isContinuous } from '@visactor/vscale';
import { isFunction, isValid, last } from '@visactor/vutils';
import type { ICartesianTickDataOpt, ILabelItem, ITickData, ITickDataOpt } from '../type';
// eslint-disable-next-line no-duplicate-imports
import { convertDomainToTickData, getCartesianLabelBounds } from './util';
import { textIntersect as intersect, hasOverlap } from '../util';

const filterTicksByBreak = (ticks: number[], breakDomains: [number, number][]) => {
  return breakDomains && breakDomains.length
    ? ticks.filter(tick => {
        return breakDomains.every(breakDomain => {
          return tick < breakDomain[0] || tick > breakDomain[1];
        });
      })
    : ticks;
};
function getScaleTicks(
  op: ITickDataOpt,
  scale: ContinuousScale,
  count: number,
  getTicks: (count: number, domain?: [number, number]) => number[]
) {
  let scaleTicks: number[];
  const { breakData } = op;

  // Todo: @zwx 将截断的逻辑挪到 scale 中
  if (breakData && breakData()) {
    const { breakDomains } = breakData();
    const domain = scale.domain();
    scaleTicks = [];
    for (let i = 0; i < domain.length - 1; i++) {
      const subDomain: [number, number] = [domain[i], domain[i + 1]];
      const ticks = getTicks(count, subDomain); // 暂时不对个数进行分段
      ticks.forEach(tick => {
        if (!breakDomains.some(breakDomain => tick >= breakDomain[0] && tick <= breakDomain[1])) {
          scaleTicks.push(tick);
        }
      });
    }
    // reset
    (scale as LinearScale).domain(domain);
  } else {
    scaleTicks = getTicks(count);
  }

  return scaleTicks;
}

function forceItemVisible(
  sourceItem: ILabelItem<number>,
  items: ILabelItem<number>[],
  check: boolean,
  comparator: any,
  inverse = false
) {
  if (check && !items.includes(sourceItem)) {
    let remainLength = items.length;
    if (remainLength > 1) {
      if (inverse) {
        items.push(sourceItem);
      } else {
        items.unshift(sourceItem);
      }
      for (let i = 0; i < remainLength; i++) {
        const index = inverse ? remainLength - 1 - i : i;
        if (comparator(items[index])) {
          items.splice(index, 1);
          i--;
          remainLength--;
        } else {
          break;
        }
      }
    }
  }
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
    scaleTicks = filterTicksByBreak(
      (scale as LinearScale).stepTicks(tickStep),
      breakData && breakData() ? breakData().breakDomains : null
    );
  } else if (isValid(forceTickCount)) {
    scaleTicks = getScaleTicks(op, scale, forceTickCount, (count: number, subDomain?: [number, number]) => {
      if (subDomain && subDomain.length) {
        return (scale as LinearScale).domain(subDomain, true).forceTicks(count);
      }
      return (scale as LinearScale).forceTicks(count);
    });
  } else if (op.tickMode === 'd3') {
    const count =
      (isFunction(tickCount) ? tickCount({ axisLength: rangeSize, labelStyle }) : tickCount) ??
      DEFAULT_CONTINUOUS_TICK_COUNT;

    scaleTicks = getScaleTicks(op, scale, count, (count: number, subDomain?: [number, number]) => {
      if (subDomain && subDomain.length) {
        return (scale as LinearScale).domain(subDomain, true).d3Ticks(count, { noDecimals });
      }
      return (scale as LinearScale).d3Ticks(count, { noDecimals });
    });
  } else {
    const count =
      (isFunction(tickCount) ? tickCount({ axisLength: rangeSize, labelStyle }) : tickCount) ??
      DEFAULT_CONTINUOUS_TICK_COUNT;
    const customTicks = isFunction(op.tickMode) ? op.tickMode : undefined;

    scaleTicks = getScaleTicks(op, scale, count, (count: number, subDomain?: [number, number]) => {
      if (subDomain && subDomain.length) {
        return (scale as LinearScale).domain(subDomain, true).ticks(count, { noDecimals, customTicks });
      }
      return (scale as LinearScale).ticks(count, { noDecimals, customTicks });
    });
  }

  const domain = scale.domain();

  if (op.labelFirstVisible && domain[0] !== scaleTicks[0] && !scaleTicks.includes(domain[0])) {
    scaleTicks.unshift(domain[0]);
  }

  if (
    op.labelLastVisible &&
    domain[domain.length - 1] !== scaleTicks[scaleTicks.length - 1] &&
    !scaleTicks.includes(domain[domain.length - 1])
  ) {
    scaleTicks.push(domain[domain.length - 1]);
  }
  if (op.sampling && scaleTicks.length > 1) {
    // 判断重叠
    if (op.coordinateType === 'cartesian' || (op.coordinateType === 'polar' && op.axisOrientType === 'radius')) {
      const { labelGap = 4, labelFlush } = op as ICartesianTickDataOpt;
      const MIN_FONT_SIZE = 6;
      let items: ILabelItem<number>[];
      // 刻度个数 > 像素个数的情况，先做一层预估，减少计算，避免卡死的情况
      if (scaleTicks.length * MIN_FONT_SIZE > rangeSize) {
        const samplingScaleTicks: number[] = [];
        const step = Math.floor((scaleTicks.length * MIN_FONT_SIZE) / rangeSize);
        scaleTicks.forEach((tick, index) => {
          if (index % step === 0 || index === scaleTicks.length - 1) {
            samplingScaleTicks.push(tick);
          }
        });
        items = getCartesianLabelBounds(scale, samplingScaleTicks, op as ICartesianTickDataOpt).map(
          (bounds, i) =>
            ({
              AABBBounds: bounds,
              value: samplingScaleTicks[i]
            } as ILabelItem<number>)
        );
      } else {
        items = getCartesianLabelBounds(scale, scaleTicks, op as ICartesianTickDataOpt).map(
          (bounds, i) =>
            ({
              AABBBounds: bounds,
              value: scaleTicks[i]
            } as ILabelItem<number>)
        );
      }
      const firstSourceItem = items[0];
      const lastSourceItem = last(items);

      const samplingMethod = breakData && breakData() ? methods.greedy : methods.parity; // 由于轴截断后刻度会存在不均匀的情况，所以不能使用 parity 算法
      while (items.length >= 3 && hasOverlap(items as any, labelGap)) {
        items = samplingMethod(items, labelGap);
      }

      const checkFirst = op.labelFirstVisible;
      let checkLast = op.labelLastVisible; // 这里和 auto-hide 里的逻辑有差异，不根据 length 自动强制显示最后一个（会引起 vtable 较多 badcase）。

      if (intersect(firstSourceItem as any, lastSourceItem as any, labelGap)) {
        if (items.includes(lastSourceItem) && items.length > 1 && checkFirst && checkLast) {
          items.splice(items.indexOf(lastSourceItem), 1);
          checkLast = false;
        }
      }

      forceItemVisible(firstSourceItem, items, checkFirst, (item: ILabelItem<number>) =>
        intersect(item as any, firstSourceItem as any, labelGap)
      );
      forceItemVisible(
        lastSourceItem,
        items,
        checkLast,
        (item: ILabelItem<number>) =>
          intersect(item as any, lastSourceItem as any, labelGap) ||
          (checkFirst && item !== firstSourceItem ? intersect(item as any, firstSourceItem as any, labelGap) : false),
        true
      );

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
      if (!i || !intersect(a as any, b as any, sep)) {
        a = b;
        return true;
      }
      return false;
    });
  }
};
