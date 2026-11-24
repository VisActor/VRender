import type { IGraphic, IText, Stage } from '@visactor/vrender-core';
import { SLIDER_ELEMENT_NAME, Slider } from '../../src';
import { createCanvas, removeDom } from '../util/dom';
import { createTestStage } from '../util/vrender';

describe('Slider handler text', () => {
  let stage: Stage;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createCanvas(document.body, 'slider-handler-text');
    stage = createTestStage(canvas.id);
  });

  afterEach(() => {
    stage.release();
    removeDom(canvas);
  });

  it('updates the style from the current range and clears styles omitted by the callback', () => {
    const style = jest.fn((value: string | number) => {
      if (Number(value) === 30) {
        return undefined;
      }
      return Number(value) > 50 ? { fill: '#0055cc', dx: 6 } : { fill: '#b32329' };
    });
    const slider = new Slider({
      min: 0,
      max: 100,
      value: [20, 80],
      range: true,
      railWidth: 200,
      railHeight: 8,
      handlerText: { style }
    });
    stage.defaultLayer.add(slider as unknown as IGraphic);
    const end = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;
    expect(end.attribute.dx).toBe(6);

    style.mockClear();
    slider.setValue([20, 40]);
    expect(style.mock.calls).toEqual([
      [20, 'start', expect.objectContaining({ layout: 'horizontal', railWidth: 200, railHeight: 8 })],
      [40, 'end', expect.objectContaining({ layout: 'horizontal', railWidth: 200, railHeight: 8 })]
    ]);
    expect(end.attribute.text).toBe('40');
    expect(end.attribute.fill).toBe('#b32329');
    expect(end.attribute.dx).toBeUndefined();
    expect(end.attribute.x).toBe(slider.endHandler.attribute.x);

    slider.setValue([20, 30]);
    expect(end.attribute.text).toBe('30');
    expect(end.attribute.fill).toBeUndefined();
  });

  it('keeps single-handler callback position and formatting consistent', () => {
    const style = jest.fn(() => ({ fill: '#0055cc' }));
    const slider = new Slider({
      min: 0,
      max: 100,
      value: 20,
      railWidth: 200,
      railHeight: 8,
      handlerText: { style, formatter: value => `${value}%` }
    });
    stage.defaultLayer.add(slider as unknown as IGraphic);
    const label = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
    expect(style).toHaveBeenLastCalledWith(20, 'end', expect.anything());
    expect(label.attribute.text).toBe('20%');

    slider.setValue(55);
    expect(style).toHaveBeenLastCalledWith(55, 'end', expect.anything());
    expect(label.attribute.text).toBe('55%');
  });
});
