import type { IGraphic, IGroup, Stage } from '@visactor/vrender-core';
import { Title } from '../../src';
import { createCanvas } from '../util/dom';
import { createTestStage } from '../util/vrender';

describe('Title', () => {
  let stage: Stage;

  beforeAll(() => {
    createCanvas(document.body, 'title-main');
    stage = createTestStage('title-main');
  });

  afterAll(() => {
    stage.release();
  });

  it('should keep container layout size in static attrs after later updates', () => {
    const title = new Title({
      x: 20,
      y: 30,
      width: 180,
      padding: [4, 8, 6, 10],
      text: 'Main title',
      subtext: 'Subtitle',
      textStyle: {
        fontSize: 18,
        fill: '#333'
      },
      subtextStyle: {
        fontSize: 12,
        fill: '#666'
      }
    });

    stage.defaultLayer.add(title as unknown as IGraphic);
    stage.render();

    const container = title.find(node => node.name === 'title-container') as IGroup;
    expect(container).toBeTruthy();

    const width = container.attribute.width as number;
    const height = container.attribute.height as number;
    const boundsPadding = container.attribute.boundsPadding as number[];

    expect(Number.isFinite(width)).toBe(true);
    expect(Number.isFinite(height)).toBe(true);
    expect((container as any).baseAttributes.width).toBe(width);
    expect((container as any).baseAttributes.height).toBe(height);
    expect((container as any).baseAttributes.boundsPadding).toEqual(boundsPadding);

    container.setAttributes({ x: 12 });

    expect(container.attribute.width).toBe(width);
    expect(container.attribute.height).toBe(height);
    expect(container.attribute.boundsPadding).toEqual(boundsPadding);
    expect((container as any).baseAttributes.width).toBe(width);
    expect((container as any).baseAttributes.height).toBe(height);
    expect((container as any).baseAttributes.boundsPadding).toEqual(boundsPadding);
  });
});
