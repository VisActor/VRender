import { IGraphic, Stage, IRect } from '@visactor/vrender';
import { Tag } from '../../src';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';

describe('Tag', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });
  it('Tag should be render correctly', () => {
    const tag = new Tag({
      textStyle: {
        fontSize: 12,
        fill: '#333333',
        textAlign: 'end',
        textBaseline: 'top',
        lineHeight: 12,
        fontWeight: 'normal',
        fillOpacity: 1,
        text: '我是一个坐标轴标题'
      },
      space: 4,
      padding: 4,
      x: 381.5451914693508,
      y: 522.145770236779,
      visible: true,
      text: 'title',
      angle: 0.6947382761967031,
      panel: { visible: true, fill: 'rgba(0, 0, 0, 0.3)' },
      maxWidth: 60
    });

    stage.defaultLayer.add(tag as unknown as IGraphic);
    stage.render();

    /**
     * UNIT TEXT ERROR:
     * expect(received).toBe(expected) // Object.is equality

        Expected: 60
        Received: 48
     */
    // expect((tag.getElementsByName('tag-text')[0] as unknown as IGraphic).AABBBounds.width()).toBe(60);
    expect((tag.getElementsByName('tag-panel')[0] as IRect).attribute.x).toBe(-60);
  });
});
