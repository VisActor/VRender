import { degreeToRadian } from '@visactor/vutils';
import { IGraphic, Stage, Arc, Path, Rect } from '@visactor/vrender';
import { LineCrosshair, CircleCrosshair, PolygonCrosshair, RectCrosshair, SectorCrosshair, Tag } from '../../src';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';

describe('Crosshair', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    // stage.release();
  });

  it('Line crosshair with limitBounds', () => {
    const lineCrosshair = new LineCrosshair({
      start: { x: 100, y: 200 },
      end: { x: 300, y: 200 },
      lineStyle: {
        strokeColor: '#000'
      }
    });
    stage.defaultLayer.add(lineCrosshair as unknown as IGraphic);
    stage.render();

    expect(lineCrosshair.childrenCount).toBe(1);
  });

  it('Circle crosshair', () => {
    const crosshair = new CircleCrosshair({
      center: {
        x: 250,
        y: 250
      },
      radius: 100,
      startAngle: Math.PI * -0.5,
      endAngle: Math.PI * 0.5
    });
    stage.defaultLayer.add(crosshair as unknown as IGraphic);
    stage.render();

    expect(crosshair.childrenCount).toBe(1);
    expect((crosshair.children[0] as Arc).attribute.startAngle).toBe(Math.PI * -0.5);
    expect((crosshair.children[0] as Arc).attribute.endAngle).toBe(Math.PI * 0.5);
  });

  it('Polygon crosshair', () => {
    const crosshair = new PolygonCrosshair({
      center: {
        x: 250,
        y: 250
      },
      radius: 100,
      startAngle: 0,
      endAngle: Math.PI * 2,
      sides: 10,
      lineStyle: {
        strokeColor: 'red',
        lineDash: [0]
      }
    });
    stage.defaultLayer.add(crosshair as unknown as IGraphic);
    stage.render();

    expect(crosshair.childrenCount).toBe(1);

    expect((crosshair.children[0] as Path).attribute.path).toBe(
      'M350,250L330.90169943749476,308.7785252292473L280.90169943749476,345.10565162951536L219.09830056250527,345.10565162951536L169.09830056250527,308.7785252292473L150,250L169.09830056250524,191.2214747707527L219.09830056250524,154.89434837048464L280.9016994374947,154.89434837048464L330.9016994374947,191.22147477075265L350,249.99999999999997Z'
    );
  });

  it('Rect crosshair with limitBounds', () => {
    const crosshair = new RectCrosshair({
      start: {
        x: 30,
        y: 30
      },
      end: {
        x: 330,
        y: 130
      }
    });
    stage.defaultLayer.add(crosshair as unknown as IGraphic);
    stage.render();

    expect(crosshair.childrenCount).toBe(1);

    expect((crosshair.children[0] as Rect).attribute.width).toBe(300);
    expect((crosshair.children[0] as Rect).attribute.height).toBe(100);
  });

  it('Sector Crosshair', () => {
    const startAngle = 1.3 * Math.PI;
    const endAngle = 1.7 * Math.PI;
    const crosshair = new SectorCrosshair({
      center: {
        x: 250,
        y: 250
      },
      radius: 100,
      innerRadius: 30,
      startAngle,
      endAngle
    });

    stage.defaultLayer.add(crosshair as unknown as IGraphic);
    stage.render();
    expect(crosshair.childrenCount).toBe(1);
    expect((crosshair.children[0] as Arc).attribute.startAngle).toBe(startAngle);
    expect((crosshair.children[0] as Arc).attribute.endAngle).toBe(endAngle);
  });
});
