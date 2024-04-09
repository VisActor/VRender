import { degreeToRadian } from '@visactor/vutils';
import type { Group, IGraphic, Stage } from '@visactor/vrender-core';
import type { Tag, Segment } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { CartesianMarkLine } from '../../../src/marker/cartesian/line';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Marker', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  // afterAll(() => {
  //   stage.release();
  // });

  it('MarkLine', () => {
    const markLine = new CartesianMarkLine({
      points: [
        {
          x: 100,
          y: 50
        },
        {
          x: 400,
          y: 50
        }
      ],
      label: {
        text: 'markLine-label',
        refX: 10
      },
      endSymbol: {
        visible: true,
        refAngle: degreeToRadian(90)
      }
    });
    stage.defaultLayer.add(markLine as unknown as IGraphic);
    stage.render();
    const markLineContainer = markLine.children[0] as unknown as Group;
    expect(markLineContainer.childrenCount).toBe(2);

    // segement构造的line
    expect((markLineContainer.children[0] as unknown as Segment).attribute.points).toEqual([
      {
        x: 100,
        y: 50
      },
      {
        x: 400,
        y: 50
      }
    ]);
    expect((markLineContainer.children[0] as unknown as Segment).endSymbol?.attribute.x).toBe(400);
    expect((markLineContainer.children[0] as unknown as Segment).endSymbol?.attribute.y).toBe(50);
    expect((markLineContainer.children[0] as unknown as Segment).endSymbol?.attribute.angle).toBe(3.141592653589793);

    // tag构造的label
    expect((markLineContainer.children[1] as unknown as Tag).attribute.x).toBe(410);
    expect((markLineContainer.children[1] as unknown as Tag).attribute.y).toBe(50);
    expect(
      ((markLineContainer.children[1] as unknown as Tag).getChildByName('tag-content') as any).children[0].attribute
        .text
    ).toBe('markLine-label');
  });

  it('MarkLine with invalid type', () => {
    const markLine = new CartesianMarkLine({
      points: [
        {
          x: 100,
          y: 50
        }
      ],
      label: {
        text: 'markLine-label',
        refX: 10
      },
      endSymbol: {
        visible: true,
        refAngle: degreeToRadian(90)
      }
    });
    stage.defaultLayer.add(markLine as unknown as IGraphic);
    stage.render();
    expect(markLine.childrenCount).toBe(0);
  });

  it('MarkArea with update invalid points', () => {
    const markLine = new CartesianMarkLine({
      points: [
        {
          x: 100,
          y: 50
        },
        {
          x: 400,
          y: 50
        }
      ],
      label: {
        text: 'markLine-label',
        refX: 10
      },
      endSymbol: {
        visible: true,
        refAngle: degreeToRadian(90)
      }
    });
    stage.defaultLayer.add(markLine as unknown as IGraphic);
    stage.render();
    markLine.setAttributes({
      points: []
    });
    expect(markLine.childrenCount).toBe(0);
  });

  it('MarkLine with update valid points', () => {
    const markLine = new CartesianMarkLine({
      points: [],
      label: {
        text: 'markLine-label',
        refX: 10
      },
      endSymbol: {
        visible: true,
        refAngle: degreeToRadian(90)
      }
    });
    stage.defaultLayer.add(markLine as unknown as IGraphic);
    stage.render();
    markLine.setAttributes({
      points: [
        {
          x: 100,
          y: 50
        },
        {
          x: 400,
          y: 50
        }
      ]
    });
    const markAreaContainer = markLine.children[0] as unknown as Group;
    expect(markAreaContainer.childrenCount).toBe(2);
  });
});
