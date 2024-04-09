import type { IGraphic, Stage, Polygon, Group } from '@visactor/vrender-core';
import type { Tag } from '../../../src';
import { CartesianMarkArea } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Marker', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('MarkArea', () => {
    const markArea = new CartesianMarkArea({
      points: [
        {
          x: 100,
          y: 250
        },
        {
          x: 200,
          y: 250
        },
        {
          x: 200,
          y: 450
        },
        {
          x: 100,
          y: 450
        }
      ],
      label: {
        text: 'markArea-label',
        dx: 10
      }
    });
    stage.defaultLayer.add(markArea as unknown as IGraphic);
    stage.render();

    const markAreaContainer = markArea.children[0] as unknown as Group;
    expect(markAreaContainer.childrenCount).toBe(2);
    // ploygon图元构造的area
    expect((markAreaContainer.children[0] as Polygon).attribute.points).toEqual([
      {
        x: 100,
        y: 250
      },
      {
        x: 200,
        y: 250
      },
      {
        x: 200,
        y: 450
      },
      {
        x: 100,
        y: 450
      }
    ]);
    expect((markAreaContainer.children[0] as Polygon).attribute.fill).toBeTruthy();
    expect((markAreaContainer.children[0] as Polygon).attribute.fill).toBe('#b2bacf');
    // tag构造的label
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.x).toBe(200);
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.y).toBe(350);
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.dx).toBe(10);
    expect(
      (markAreaContainer.children[1] as unknown as any).getChildByName('tag-content').children[0].attribute.text
    ).toBe('markArea-label');
  });

  it('MarkArea with invalid points', () => {
    const markArea = new CartesianMarkArea({
      points: [
        {
          x: 100,
          y: 250
        },
        {
          x: 200,
          y: 250
        }
      ],
      label: {
        text: 'markArea-label',
        dx: 10
      }
    });
    stage.defaultLayer.add(markArea as unknown as IGraphic);
    stage.render();
    expect(markArea.childrenCount).toBe(0);
  });

  it('MarkArea with update invalid points', () => {
    const markArea = new CartesianMarkArea({
      points: [
        {
          x: 100,
          y: 250
        },
        {
          x: 200,
          y: 250
        },
        {
          x: 200,
          y: 450
        },
        {
          x: 100,
          y: 450
        }
      ],
      label: {
        text: 'markArea-label',
        dx: 10
      }
    });
    stage.defaultLayer.add(markArea as unknown as IGraphic);
    stage.render();
    markArea.setAttributes({
      points: []
    });
    expect(markArea.childrenCount).toBe(0);
  });

  it('MarkArea with update valid points', () => {
    const markArea = new CartesianMarkArea({
      points: [],
      label: {
        text: 'markArea-label',
        dx: 10
      }
    });
    stage.defaultLayer.add(markArea as unknown as IGraphic);
    stage.render();
    markArea.setAttributes({
      points: [
        {
          x: 100,
          y: 250
        },
        {
          x: 200,
          y: 250
        },
        {
          x: 200,
          y: 450
        },
        {
          x: 100,
          y: 450
        }
      ]
    });
    const markAreaContainer = markArea.children[0] as unknown as Group;
    expect(markAreaContainer.childrenCount).toBe(2);
  });
});
