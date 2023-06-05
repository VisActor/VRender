import {
  splitToGrids,
  splitLine,
  createLine,
  createPolygon,
  splitPolygon,
  splitArc,
  splitCircle,
  splitRect,
  splitArea,
  createRect,
  createArc,
  createCircle,
  createArea
} from '../../src/index';

it('splitToGrids() when width === height', () => {
  expect(splitToGrids(100, 100, 1)).toEqual([1]);
  expect(splitToGrids(100, 100, 9)).toEqual([3, 3, 3]);
  expect(splitToGrids(100, 100, 11)).toEqual([4, 4, 3]);
  expect(splitToGrids(100, 100, 20)).toEqual([5, 5, 5, 5]);
});

it('splitToGrids() when width > height', () => {
  expect(splitToGrids(300, 100, 1)).toEqual([1]);
  expect(splitToGrids(300, 100, 9)).toEqual([6, 3]);
  expect(splitToGrids(300, 100, 11)).toEqual([6, 5]);
  expect(splitToGrids(300, 100, 20)).toEqual([8, 8, 4]);
});

it('splitToGrids() when width < height', () => {
  expect(splitToGrids(100, 200, 1)).toEqual([1]);
  expect(splitToGrids(100, 200, 4)).toEqual([1, 1, 1, 1]);
  expect(splitToGrids(100, 200, 11)).toEqual([2, 2, 2, 2, 2, 1]);
  expect(splitToGrids(100, 200, 20)).toEqual([2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
});

it('splitLine() when points.length < count', () => {
  const line = createLine({
    points: new Array(1000).fill(0).map((entry, index) => ({ y: index * 20, x: 10 * index }))
  });

  expect(splitLine(line, 2)).toEqual([
    { x: 0, y: 0 },
    { x: 5000, y: 10000 }
  ]);
  expect(splitLine(line, 10)).toEqual([
    { x: 0, y: 0 },
    { x: 1000, y: 2000 },
    { x: 2000, y: 4000 },
    { x: 3000, y: 6000 },
    { x: 4000, y: 8000 },
    { x: 5000, y: 10000 },
    { x: 6000, y: 12000 },
    { x: 7000, y: 14000 },
    { x: 8000, y: 16000 },
    { x: 9000, y: 18000 }
  ]);
});

it('splitLine() when points.length > count', () => {
  const line = createLine({
    points: new Array(5).fill(0).map((entry, index) => ({ y: index * 20, x: 10 * index }))
  });

  expect(splitLine(line, 11)).toEqual([
    { x: 0, y: 0 },
    { x: 4, y: 8 },
    { x: 8, y: 16 },
    { x: 10, y: 20 },
    { x: 14, y: 28 },
    { x: 18, y: 36 },
    { x: 20, y: 40 },
    { x: 24, y: 48 },
    { x: 28, y: 56 },
    { x: 30, y: 60 },
    { x: 40, y: 80 }
  ]);
});

it('splitPolygon()', () => {
  const polygon = createPolygon({
    x: 100,
    y: 100,
    points: [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 200 },
      { x: 0, y: 200 }
    ]
  });

  expect(splitPolygon(polygon, 4)).toEqual([
    {
      points: [
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
        { x: 100, y: 100 }
      ]
    },
    {
      points: [
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 }
      ]
    },
    {
      points: [
        { x: 0, y: 100 },
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ]
    },
    {
      points: [
        { x: 100, y: 100 },
        { x: 100, y: 200 },
        { x: 0, y: 200 },
        { x: 0, y: 100 }
      ]
    }
  ]);
});

it('splitRect()', () => {
  const rect = createRect({
    x: 100,
    y: 100,
    width: 200,
    height: 100
  });

  expect(splitRect(rect, 5)).toEqual([
    {
      x: 0,
      y: 0,
      width: 50,
      height: 50
    },
    {
      x: 50,
      y: 0,
      width: 50,
      height: 50
    },
    {
      x: 100,
      y: 0,
      width: 50,
      height: 50
    },
    {
      x: 150,
      y: 0,
      width: 50,
      height: 50
    },
    {
      x: 0,
      y: 50,
      width: 200,
      height: 50
    }
  ]);
});

it('splitArc()', () => {
  const arc = createArc({
    x: 100,
    y: 100,
    startAngle: 0,
    endAngle: Math.PI,
    innerRadius: 10,
    outerRadius: 80
  });
  const res = splitArc(arc, 5);

  expect(res.length).toBe(5);
  expect((res[0] as any).endAngle).toBeCloseTo(Math.PI / 4);
  expect((res[1] as any).endAngle).toBeCloseTo((2 * Math.PI) / 4);
  expect((res[2] as any).endAngle).toBeCloseTo((3 * Math.PI) / 4);
  expect((res[3] as any).endAngle).toBeCloseTo((4 * Math.PI) / 4);
  expect((res[4] as any).endAngle).toBeCloseTo(Math.PI);

  expect((res[0] as any).startAngle).toBeCloseTo(0);
  expect((res[1] as any).startAngle).toBeCloseTo(Math.PI / 4);
  expect((res[2] as any).startAngle).toBeCloseTo((2 * Math.PI) / 4);
  expect((res[3] as any).startAngle).toBeCloseTo((3 * Math.PI) / 4);
  expect((res[4] as any).startAngle).toBeCloseTo(0);
});

it('splitCircle()', () => {
  const circle = createCircle({
    x: 100,
    y: 100,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    radius: 50
  });
  const res = splitCircle(circle, 6);

  expect(res.length).toBe(6);
  expect((res[0] as any).endAngle).toBeCloseTo(Math.PI / 3);
  expect((res[1] as any).endAngle).toBeCloseTo((2 * Math.PI) / 3);
  expect((res[2] as any).endAngle).toBeCloseTo(Math.PI);
  expect((res[3] as any).endAngle).toBeCloseTo((4 * Math.PI) / 3);
  expect((res[4] as any).endAngle).toBeCloseTo((5 * Math.PI) / 3);
  expect((res[5] as any).endAngle).toBeCloseTo(2 * Math.PI);

  expect((res[0] as any).startAngle).toBeCloseTo(0);
  expect((res[1] as any).startAngle).toBeCloseTo(Math.PI / 3);
  expect((res[2] as any).startAngle).toBeCloseTo((2 * Math.PI) / 3);
  expect((res[3] as any).startAngle).toBeCloseTo((3 * Math.PI) / 3);
  expect((res[4] as any).startAngle).toBeCloseTo((4 * Math.PI) / 3);
  expect((res[5] as any).startAngle).toBeCloseTo((5 * Math.PI) / 3);
});

it('splitCircle()', () => {
  const area = createArea({
    x: 100,
    y: 100,
    curveType: 'basis',
    points: [
      {
        x: 10,
        y: 100,
        y1: 20
      },
      {
        x: 40,
        y: 200,
        y1: 40
      },
      {
        x: 70,
        y: 100,
        y1: 20
      },
      {
        x: 100,
        y: 100,
        y1: 20
      }
    ]
  });
  const res = splitArea(area, 6);

  expect(res.length).toBe(6);
});
