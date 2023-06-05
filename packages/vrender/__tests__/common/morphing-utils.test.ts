import { alignSubpath, CustomPath2D, pathToBezierCurves } from '../../src/index';

it('pathToBezierCurves', () => {
  const path = new CustomPath2D();

  path.fromString('M100,100L200,200');
  expect(pathToBezierCurves(path)).toEqual([[100, 100, 100, 100, 200, 200, 200, 200]]);

  path.fromString('L200,200C50,50,150,150,300,300');
  expect(pathToBezierCurves(path)).toEqual([[200, 200, 50, 50, 150, 150, 300, 300]]);
});

it('alignSubpath empty paths', () => {
  const [path1, path2] = alignSubpath([], []);

  expect(path1).toEqual([]);
  expect(path2).toEqual([]);
});

it('alignSubpath paths', () => {
  const originPath1 = [0, 100, 20, 50, 80, 150, 100, 100];
  const originPath2 = [0, 100, 20, 50, 80, 150, 100, 100, 120, 50, 180, 150, 200, 100, 220, 50, 280, 150, 300, 100];
  const [path1, path2] = alignSubpath(originPath1, originPath2);

  expect(path1.length).toEqual(path2.length);
  expect(path1[0]).toBeCloseTo(originPath1[0]);
  expect(path1[1]).toBeCloseTo(originPath1[1]);

  expect(path1[path1.length - 1]).toBeCloseTo(originPath1[originPath1.length - 1]);
  expect(path1[path1.length - 2]).toBeCloseTo(originPath1[originPath1.length - 2]);
});
