import { interpolateColor } from '../../src/index';

it('interpolateColor', () => {
  expect(interpolateColor(`rgb(100, 0, 0)`, `rgb(0, 100, 0)`, 0.5, false)).toEqual(`rgb(50,50,0)`);
  expect(
    interpolateColor(
      [`rgb(100, 0, 0)`, false, false, false] as any,
      [`rgb(0, 100, 0)`, false, false, false] as any,
      0.5,
      false
    )
  ).toEqual([`rgb(50,50,0)`, false, false, false]);
  expect(interpolateColor([`rgb(100, 0, 0)`, false, false, false] as any, 'rgb(0, 100, 0)', 0.5, false)).toEqual([
    `rgb(50,50,0)`,
    'rgb(0, 100, 0)',
    'rgb(0, 100, 0)',
    'rgb(0, 100, 0)'
  ]);
  expect(interpolateColor('rgb(100, 0, 0)', [`rgb(0, 100, 0)`, false, false, false] as any, 0.5, false)).toEqual([
    `rgb(50,50,0)`,
    'rgb(100, 0, 0)',
    'rgb(100, 0, 0)',
    'rgb(100, 0, 0)'
  ]);
});
