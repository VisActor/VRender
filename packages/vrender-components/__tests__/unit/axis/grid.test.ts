import { IGraphic, Stage, Path, IPath } from '@visactor/vrender';
import { polarToCartesian } from '@visactor/vutils';
import { Grid } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { Point } from '../../../src/core/type';

function getCirclePoints(center: Point, count: number, radius: number) {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI * 2) / count;
    points.push(polarToCartesian(center, radius, angle));
  }
  return points;
}

describe('Grid', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });
  it('Line Grid', () => {
    const gridItems = [
      {
        points: [
          { x: 20, y: 20 },
          { x: 200, y: 20 }
        ]
      },
      {
        points: [
          { x: 20, y: 60 },
          { x: 200, y: 60 }
        ]
      },
      {
        points: [
          { x: 20, y: 100 },
          { x: 200, y: 100 }
        ]
      },
      {
        points: [
          { x: 20, y: 140 },
          { x: 200, y: 140 }
        ]
      }
    ];
    const grid = new Grid({
      type: 'line',
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: 'red'
      }
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(4);
    expect((grid.getChildren()[2] as IPath).attribute.path).toBe('M20,100L200,100');
  });

  it('Line Grid with alternateColor', () => {
    const count = 10;
    const center = { x: 50, y: 350 };
    const gridItems: any = [];
    for (let index = 0; index < count; index++) {
      gridItems.push({
        points: [center, polarToCartesian(center, 50, Math.PI * -0.5 + index * ((Math.PI * 2) / count))]
      });
    }

    const grid = new Grid({
      type: 'line',
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: '#000',
        lineDash: [2, 4]
      },
      alternateColor: 'pink'
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(19);
    expect((grid.getChildren()[14] as Path).attribute.fill).toBe('pink');
    expect((grid.getChildren()[14] as Path).attribute.path).toBe(
      'M50,350L79.38926261462366,390.45084971874735L50,400L50,350Z'
    );
  });

  it('Line Grid with alternateColor and `smoothLink` is true', () => {
    const count = 10;
    const center = { x: 50, y: 550 };
    const gridItems: any = [];
    for (let index = 0; index < count; index++) {
      gridItems.push({
        points: [center, polarToCartesian(center, 50, Math.PI * -0.5 + index * ((Math.PI * 2) / count))]
      });
    }

    const grid = new Grid({
      type: 'line',
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: '#000',
        lineDash: [2, 4]
      },
      alternateColor: 'pink',
      smoothLink: true,
      center
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(19);
    expect((grid.getChildren()[14] as Path).attribute.fill).toBe('pink');
    expect((grid.getChildren()[14] as Path).attribute.path).toBe(
      'M50,550L79.38926261462366,590.4508497187473A50,50,0,0,1,50,600L50,600L50,600L50,550A0,0,0,0,0,50,550Z'
    );
  });

  it('Circle Grid', () => {
    const center = { x: 300, y: 300 };
    const gridItems = [
      {
        points: getCirclePoints(center, 5, 20)
      },
      {
        points: getCirclePoints(center, 5, 50)
      },
      {
        points: getCirclePoints(center, 5, 80)
      },
      {
        points: getCirclePoints(center, 5, 110)
      }
    ];
    const grid = new Grid({
      type: 'circle',
      center,
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: 'blue',
        lineDash: [2, 4]
      },
      closed: true
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(4);
    // @ts-ignore
    expect(grid.getChildren()[2].attribute.path).toBe('M300,220A80,80,0,0,1,300,380A80,80,0,0,1,300,220Z');
  });

  it('Circle Grid with alternateColor', () => {
    const center = { x: 300, y: 300 };
    const gridItems = [
      {
        points: getCirclePoints(center, 5, 20)
      },
      {
        points: getCirclePoints(center, 5, 50)
      },
      {
        points: getCirclePoints(center, 5, 80)
      },
      {
        points: getCirclePoints(center, 5, 110)
      }
    ];
    const grid = new Grid({
      type: 'circle',
      center,
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: 'blue',
        lineDash: [2, 4]
      },
      closed: true,
      alternateColor: ['red', 'yellow', 'blue']
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(7);
    expect((grid.getChildren()[2] as Path).attribute.path).toBe('M300,220A80,80,0,0,1,300,380A80,80,0,0,1,300,220Z');
    expect((grid.getChildren()[4] as Path).attribute.fill).toBe('red');
    expect((grid.getChildren()[5] as Path).attribute.fill).toBe('yellow');
    expect((grid.getChildren()[6] as Path).attribute.fill).toBe('blue');
  });

  it('Polygon Grid', () => {
    const center = { x: 450, y: 450 };
    const gridItems = [
      {
        points: getCirclePoints(center, 6, 20)
      },
      {
        points: getCirclePoints(center, 6, 50)
      },
      {
        points: getCirclePoints(center, 6, 80)
      },
      {
        points: getCirclePoints(center, 6, 110)
      },
      {
        points: getCirclePoints(center, 6, 140)
      }
    ];
    const grid = new Grid({
      type: 'polygon',
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: 'green'
      },
      closed: false
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(5);
    // @ts-ignore
    expect(grid.getChildren()[2].attribute.path).toBe(
      'M530,450L490,519.282032302755L410,519.282032302755L370,450L409.99999999999994,380.71796769724494L490,380.71796769724494'
    );
  });

  it('Polygon Grid with alternateColor', () => {
    const center = { x: 450, y: 450 };
    const gridItems = [
      {
        points: getCirclePoints(center, 6, 20)
      },
      {
        points: getCirclePoints(center, 6, 50)
      },
      {
        points: getCirclePoints(center, 6, 80)
      },
      {
        points: getCirclePoints(center, 6, 110)
      },
      {
        points: getCirclePoints(center, 6, 140)
      }
    ];
    const grid = new Grid({
      type: 'polygon',
      items: gridItems,
      style: {
        lineWidth: 2,
        stroke: 'green'
      },
      closed: false,
      alternateColor: ['#ff7893', '#ffffff']
    });

    stage.defaultLayer.add(grid as unknown as IGraphic);
    stage.render();
    expect(grid.getChildren()).toHaveLength(9);
    expect((grid.getChildren()[5] as Path).attribute.fill).toBe('#ff7893');
    expect((grid.getChildren()[6] as Path).attribute.fill).toBe('#ffffff');
  });
});
