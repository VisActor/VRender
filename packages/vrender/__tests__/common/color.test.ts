import { GradientParser } from '../../src/index';

it('gradient-color', () => {
  expect(GradientParser.processColorStops([{ value: 'rgb(100, 0, 0)' }, { value: 'rgb(0, 100, 0)' }])).toEqual([
    { color: 'rgb(100, 0, 0)', offset: 0 },
    { color: 'rgb(0, 100, 0)', offset: 1 }
  ]);
  expect(
    GradientParser.processColorStops([
      { value: 'rgb(100, 0, 0)', length: { value: '0' } },
      { value: 'rgb(0, 100, 0)', length: { value: '100' } }
    ])
  ).toEqual([
    { color: 'rgb(100, 0, 0)', offset: 0 },
    { color: 'rgb(0, 100, 0)', offset: 1 }
  ]);
  expect(
    GradientParser.processColorStops([
      { value: 'rgb(100, 0, 0)', length: { value: '0' } },
      { value: 'rgb(0, 0, 100)', length: { value: '30' } },
      { value: 'rgb(0, 100, 0)', length: { value: '100' } }
    ])
  ).toEqual([
    { color: 'rgb(100, 0, 0)', offset: 0 },
    { color: 'rgb(0, 0, 100)', offset: 0.3 },
    { color: 'rgb(0, 100, 0)', offset: 1 }
  ]);
});
