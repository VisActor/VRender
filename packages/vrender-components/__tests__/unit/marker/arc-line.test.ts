import { degreeToRadian } from '@visactor/vutils';
import type { Group, IGraphic, Stage } from '@visactor/vrender-core';
import type { ArcSegment, Tag } from '../../../src';
// eslint-disable-next-line no-duplicate-imports
import { MarkArcLine } from '../../../src';
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

  // afterAll(() => {
  //   stage.release();
  // });

  it('MarkArcLine', () => {
    const markLine = new MarkArcLine({
      radius: 100,
      startAngle: 0,
      endAngle: Math.PI / 2,
      center: {
        x: 150,
        y: 150
      },
      label: {
        text: 'markArcLine-label',
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

    expect((markLineContainer.children[0] as unknown as ArcSegment).endSymbol?.attribute.x).toBe(150);
    expect((markLineContainer.children[0] as unknown as ArcSegment).endSymbol?.attribute.y).toBe(250);
    expect((markLineContainer.children[0] as unknown as ArcSegment).endSymbol?.attribute.angle).toBe(6.283185307179586);

    // tag构造的label
    expect((markLineContainer.children[1] as unknown as Tag).attribute.x).toBeCloseTo(233.4386001800126);
    expect((markLineContainer.children[1] as unknown as Tag).attribute.y).toBe(219.29646455628165);
    expect(
      ((markLineContainer.children[1] as unknown as Tag).getChildByName('tag-content') as any).children[0].attribute
        .text
    ).toBe('markArcLine-label');
  });
});
