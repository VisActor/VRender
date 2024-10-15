import { LinearScale, wilkinsonExtended } from '@visactor/vscale';
import { ticks } from '../../../src';

test('Custom Line Ticks', () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(
    ticks(s, {
      coordinateType: 'cartesian',
      axisOrientType: 'bottom',
      labelStyle: {},
      tickCount: 5,
      tickMode: (scale, count) => {
        const d = scale.calculateVisibleDomain(scale.get('_range'));
        return wilkinsonExtended(d[0], d[1], count);
      }
    }).map(tick => tick.value)
  ).toStrictEqual([0, 25, 50, 75, 100]);
});

test('Normal Line Ticks', () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(
    ticks(s, {
      coordinateType: 'cartesian',
      axisOrientType: 'bottom',
      labelStyle: {},
      tickCount: 5
    }).map(tick => tick.value)
  ).toStrictEqual([0, 20, 40, 60, 80, 100]);
});

test('Line Ticks has breakData config', () => {
  const scale = new LinearScale().domain([0, 2000, 10000, 25000]).range([292, 23, 23, 0]).nice();
  // TODO：分段的  scale  默认不对 count 进行处理，即每一个子段都使用 count
  expect(
    ticks(scale, {
      coordinateType: 'cartesian',
      axisOrientType: 'left',
      labelStyle: {},
      tickCount: 5,
      breakData: () => {
        return {
          breakDomains: [[2000, 10000]]
        };
      }
    }).map(tick => tick.value)
  ).toStrictEqual([0, 500, 1000, 1500, 15000, 20000, 25000]);
});
