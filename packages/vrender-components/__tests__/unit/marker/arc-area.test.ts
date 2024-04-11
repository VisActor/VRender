import type { IGraphic, Stage, Polygon, Group, Arc } from '@visactor/vrender-core';
import type { Tag } from '../../../src';
import { MarkArcArea } from '../../../src';
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

  it('MarkArcArea', () => {
    const markArea = new MarkArcArea({
      center: {
        x: 100,
        y: 100
      },
      innerRadius: 50,
      outerRadius: 70,
      startAngle: 0,
      endAngle: Math.PI / 2,
      label: {
        text: 'markArcArea-label',
        dx: 10
      }
    });
    stage.defaultLayer.add(markArea as unknown as IGraphic);
    stage.render();

    const markAreaContainer = markArea.children[0] as unknown as Group;
    expect(markAreaContainer.childrenCount).toBe(2);
    // ploygon图元构造的area
    expect((markAreaContainer.children[0] as Arc).attribute.x).toEqual(100);
    expect((markAreaContainer.children[0] as Arc).attribute.y).toEqual(100);
    expect((markAreaContainer.children[0] as Arc).attribute.innerRadius).toEqual(50);
    expect((markAreaContainer.children[0] as Arc).attribute.outerRadius).toEqual(70);
    expect((markAreaContainer.children[0] as Arc).attribute.startAngle).toEqual(0);
    expect((markAreaContainer.children[0] as Arc).attribute.endAngle).toBeCloseTo(Math.PI / 2);
    expect((markAreaContainer.children[0] as Arc).attribute.fill).toBeTruthy();
    expect((markAreaContainer.children[0] as Arc).attribute.fill).toBe('#b2bacf');
    // tag构造的label
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.x).toBeCloseTo(155.1543289325507);
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.y).toBe(155.1543289325507);
    expect((markAreaContainer.children[1] as unknown as Tag).attribute.dx).toBe(10);
    expect(
      (markAreaContainer.children[1] as unknown as any).getChildByName('tag-content').children[0].attribute.text
    ).toBe('markArcArea-label');
  });
});
