import { parseSvgPath } from '../../../src/common/path-svg';

describe('common/path-svg', () => {
  test('returns empty for empty/invalid input', () => {
    expect(parseSvgPath('')).toEqual([]);
    expect(parseSvgPath('   ')).toEqual([]);
  });

  test('parses a simple command', () => {
    expect(parseSvgPath('M0 0')).toEqual([['M', 0, 0]]);
  });

  test('splits merged M commands into M then L', () => {
    expect(parseSvgPath('M0 0 10 10 20 20')).toEqual([
      ['M', 0, 0],
      ['L', 10, 10],
      ['L', 20, 20]
    ]);
  });

  test('splits merged m commands into m then l', () => {
    expect(parseSvgPath('m0 0 10 10')).toEqual([
      ['m', 0, 0],
      ['l', 10, 10]
    ]);
  });

  test('handles command without coords', () => {
    expect(parseSvgPath('M')).toEqual([['M']]);
  });

  test('parses scientific notation numbers', () => {
    expect(parseSvgPath('M1e2 3E-1')).toEqual([['M', 100, 0.3]]);
  });
});
