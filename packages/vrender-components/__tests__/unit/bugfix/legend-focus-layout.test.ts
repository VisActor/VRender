import type { IGraphic, Stage } from '@visactor/vrender-core';
import { DiscreteLegend } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();

describe('Legend focus layout', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 100,
      fill: 'rgba(33, 100, 60, .2)',
      item: {
        maxWidth: 100,
        value: {
          style: {
            fill: '#000'
          }
        }
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          value: 100,
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', value: 100, shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(370.05995178222656);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item without value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 200,
      fill: 'rgba(33, 100, 60, .2)',
      item: {
        maxWidth: 100
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(310);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with focus', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 250,
      fill: 'rgba(33, 100, 60, .2)',
      layout: 'vertical',
      item: {
        maxWidth: 100,
        focus: true
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(108.71428571428572);
  });

  it('should not exceed the maximum width of the item, and the basic length exceeds, legend item with focus and value', () => {
    const legend = new DiscreteLegend({
      x: 100,
      y: 400,
      fill: 'rgba(33, 100, 60, .2)',
      layout: 'vertical',
      item: {
        maxWidth: 100,
        focus: true,
        value: {
          style: {
            fill: '#000'
          }
        }
      },
      items: [
        {
          label: '苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果苹果',
          value: 100,
          shape: { fill: 'red', symbolType: 'circle' }
        },
        { label: '香蕉', value: 100, shape: { fill: 'yellow', symbolType: 'square' } },
        { label: '橘子', value: 100, shape: { fill: 'orange', symbolType: 'triangle' } },
        { label: '葡萄', value: 100, shape: { fill: 'purple', symbolType: 'diamond' } },
        { label: '梨', value: 100, shape: { fill: 'star' } }
      ]
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    expect(legend.AABBBounds.width()).toBe(87.92627607073103);
  });
});
