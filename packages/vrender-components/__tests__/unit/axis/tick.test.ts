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
