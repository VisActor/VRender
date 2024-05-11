import type { Group, IGraphic, Stage } from '@visactor/vrender-core';
import type { Tag, Segment } from '../../../src';
import { MarkPoint } from '../../../src';
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

  it('MarkPoint Text', () => {
    const markPoint = new MarkPoint({
      position: {
        x: 100,
        y: 250
      },
      itemContent: {
        type: 'text',
        offsetX: 100,
        offsetY: 30,
        refX: 10,
        refY: 0,
        refAngle: 0,
        textStyle: {
          text: 'mark point label text',
          panel: {
            visible: true
          }
        }
      }
    });
    stage.defaultLayer.add(markPoint as unknown as IGraphic);
    stage.render();

    const markPointContainer = markPoint.children[0] as unknown as Group;
    expect(markPointContainer.children[0].childrenCount).toBe(2);
    // segement构造的line
    expect((markPointContainer.children[0] as unknown as Segment).attribute.points).toEqual([
      {
        x: 100,
        y: 250
      },
      {
        x: 200,
        y: 280
      }
    ]);

    expect((markPointContainer.children[0] as unknown as Segment).endSymbol).toBeUndefined();
    expect((markPointContainer.children[0] as unknown as Segment).startSymbol?.attribute.x).toBe(100);
    expect((markPointContainer.children[0] as unknown as Segment).startSymbol?.attribute.y).toBe(250);

    // tag构造的label
    expect((markPointContainer.children[3] as unknown as Tag).attribute.x).toBeCloseTo(209.5782628522115);
    expect((markPointContainer.children[3] as unknown as Tag).attribute.y).toBeCloseTo(282.87347885566345);
    expect(
      ((markPointContainer.children[3] as unknown as Tag).getChildByName('tag-content') as any).children[0].attribute
        .text
    ).toBe('mark point label text');
  });
});
