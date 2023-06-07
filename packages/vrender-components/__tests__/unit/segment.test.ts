import { IGraphic, Stage } from '@visactor/vrender';
import { Segment } from '../../src';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';

describe('Segment', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });
  it('Segment with startSymbol and endSymbol without Clip', () => {
    const segment = new Segment({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 330 }
      ],
      lineStyle: {
        strokeColor: 'red',
        lineWidth: 2,
        lineDash: [2, 4]
      },
      startSymbol: {
        visible: true,
        symbolType: 'square',
        style: {
          fillOpacity: 0.4
        }
      },
      endSymbol: {
        visible: true,
        style: {
          fillOpacity: 0.4
        }
      }
    });

    stage.defaultLayer.add(segment as unknown as IGraphic);
    stage.render();

    expect(segment.name).toBe('segment');
    expect(segment.childrenCount).toBe(3);
    expect(segment.line.attribute.points).toEqual([
      { x: 100, y: 100 },
      { x: 200, y: 330 }
    ]);
    expect(segment.line.attribute.strokeColor).toBe('red');
    expect(segment.line.attribute.lineWidth).toBe(2);
    expect(segment.line.attribute.lineDash).toEqual([2, 4]);
    expect(segment.startSymbol?.attribute.symbolType).toBe('square');
    expect(segment.endSymbol?.attribute.symbolType).toBe('triangle');
    expect(segment.AABBBounds.x1).toBeCloseTo(92.10522299399389);
    expect(segment.AABBBounds.x2).toBeCloseTo(207.8947770060061);
  });

  it('Segment with startSymbol with Clip', () => {
    const segment = new Segment({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 330 }
      ],
      startSymbol: {
        visible: true,
        clip: true,
        symbolType: 'square',
        style: {
          fillOpacity: 0.4
        }
      }
    });

    stage.defaultLayer.add(segment as unknown as IGraphic);
    stage.render();

    expect(segment.childrenCount).toBe(2);
    expect(segment.line.attribute.points[0].x).toBeCloseTo(102.3923566684867);
    expect(segment.line.attribute.points[0].y).toBeCloseTo(105.50242033751941);
    expect(segment.line.attribute.points[1].x).toBeCloseTo(200);
    expect(segment.line.attribute.points[1].y).toBeCloseTo(330);
    expect(segment.AABBBounds.x1).toBeCloseTo(92.10522299399389);
    expect(segment.AABBBounds.x2).toBeCloseTo(201);
  });

  it('Segment with endSymbol with Clip', () => {
    const segment = new Segment({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 330 }
      ],
      endSymbol: {
        visible: true,
        clip: true,
        symbolType: 'square',
        style: {
          fillOpacity: 0.4
        }
      }
    });

    stage.defaultLayer.add(segment as unknown as IGraphic);
    stage.render();

    expect(segment.childrenCount).toBe(2);
    expect(segment.line.attribute.points[0]).toEqual({
      x: 100,
      y: 100
    });
    expect(segment.line.attribute.points[1].x).toBeCloseTo(197.6076433315133);
    expect(segment.line.attribute.points[1].y).toBeCloseTo(324.4975796624806);
    expect(segment.AABBBounds.x1).toBeCloseTo(99);
    expect(segment.AABBBounds.x2).toBeCloseTo(207.8947770060061);
  });

  it('Segment with startSymbol and endSymbol with Clip', () => {
    const segment = new Segment({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 330 }
      ],
      startSymbol: {
        visible: true,
        clip: true,
        symbolType: 'square',
        style: {
          fillOpacity: 0.4
        }
      },
      endSymbol: {
        visible: true,
        clip: true,
        symbolType: 'square',
        style: {
          fillOpacity: 0.4
        }
      }
    });

    stage.defaultLayer.add(segment as unknown as IGraphic);
    stage.render();

    expect(segment.childrenCount).toBe(3);
    expect(segment.line.attribute.points[0].x).toBeCloseTo(102.3923566684867);
    expect(segment.line.attribute.points[0].y).toBeCloseTo(105.50242033751941);
    expect(segment.line.attribute.points[1].x).toBeCloseTo(197.6076433315133);
    expect(segment.line.attribute.points[1].y).toBeCloseTo(324.4975796624806);
    expect(segment.AABBBounds.x1).toBeCloseTo(92.10522299399389);
    expect(segment.AABBBounds.x2).toBeCloseTo(207.8947770060061);
  });

  it('Segment without startSymbol and endSymbol without clip', () => {
    const segment = new Segment({
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 330 }
      ]
    });

    stage.defaultLayer.add(segment as unknown as IGraphic);
    stage.render();

    expect(segment.childrenCount).toBe(1);
    expect(segment.line.attribute.points).toEqual([
      { x: 100, y: 100 },
      { x: 200, y: 330 }
    ]);
    expect(segment.AABBBounds.x1).toBeCloseTo(99);
    expect(segment.AABBBounds.x2).toBeCloseTo(201);
  });
});
