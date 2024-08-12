import { LinearScale, wilkinsonExtended } from '@visactor/vscale';

test('Custom Line Ticks', () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(
    s.ticks(5, {
      customTicks: (scale, count) => {
        const d = scale.calculateVisibleDomain(scale.get('_range'));
        return wilkinsonExtended(d[0], d[1], count);
      }
    })
  ).toStrictEqual([0, 25, 50, 75, 100]);
});

test('Normal Line Ticks', () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(s.ticks(5)).toStrictEqual([0, 20, 40, 60, 80, 100]);
});
