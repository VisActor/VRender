import type { IGraphic, IText, Stage } from '@visactor/vrender-core';
import { ColorContinuousLegend, SizeContinuousLegend, SLIDER_ELEMENT_NAME } from '../../../src';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';

initBrowserEnv();

describe('ContinuousLegend handlerText style callback', () => {
  let stage: Stage;

  beforeAll(() => {
    createCanvas(document.body, 'continuous-legend');
    stage = createStage('continuous-legend');
  });

  afterAll(() => {
    stage.release();
  });

  it('ColorContinuousLegend should evaluate handlerText style callback on render and update', () => {
    const style = jest.fn((value: number, position: 'start' | 'end') => ({
      fill: value >= 50 ? 'red' : 'blue',
      dx: position === 'start' ? -6 : 6
    }));
    const legend = new ColorContinuousLegend({
      layout: 'horizontal',
      align: 'bottom',
      min: 0,
      max: 100,
      value: [20, 80],
      colors: ['#1664FF', '#B2CFFF', '#FEE3A2', '#FF8A00'],
      railWidth: 200,
      railHeight: 8,
      handlerText: {
        visible: true,
        style
      }
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    let startHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
    let endHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;

    expect(style).toHaveBeenCalledWith(
      20,
      'start',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 200,
        railHeight: 8
      })
    );
    expect(style).toHaveBeenCalledWith(
      80,
      'end',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 200,
        railHeight: 8
      })
    );
    expect(startHandlerText.attribute.fill).toBe('blue');
    expect(startHandlerText.attribute.dx).toBe(-6);
    expect(endHandlerText.attribute.fill).toBe('red');
    expect(endHandlerText.attribute.dx).toBe(6);

    legend.setSelected([55, 90]);

    startHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
    endHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;

    expect(style).toHaveBeenCalledWith(
      55,
      'start',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 200,
        railHeight: 8
      })
    );
    expect(style).toHaveBeenCalledWith(
      90,
      'end',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 200,
        railHeight: 8
      })
    );
    expect(startHandlerText.attribute.fill).toBe('red');
    expect(startHandlerText.attribute.dx).toBe(-6);
    expect(endHandlerText.attribute.fill).toBe('red');
    expect(endHandlerText.attribute.dx).toBe(6);
  });

  it('SizeContinuousLegend should evaluate handlerText style callback on render and update', () => {
    const style = jest.fn((value: number, position: 'start' | 'end') => ({
      fill: value >= 40 ? 'green' : 'gray',
      dy: position === 'start' ? -4 : 4
    }));
    const legend = new SizeContinuousLegend({
      layout: 'horizontal',
      align: 'bottom',
      min: 0,
      max: 100,
      value: [10, 70],
      railWidth: 180,
      railHeight: 8,
      handlerText: {
        visible: true,
        style
      }
    });

    stage.defaultLayer.add(legend as unknown as IGraphic);
    stage.render();

    let startHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
    let endHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;

    expect(style).toHaveBeenCalledWith(
      10,
      'start',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 180,
        railHeight: 8
      })
    );
    expect(style).toHaveBeenCalledWith(
      70,
      'end',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 180,
        railHeight: 8
      })
    );
    expect(startHandlerText.attribute.fill).toBe('gray');
    expect(startHandlerText.attribute.dy).toBe(-4);
    expect(endHandlerText.attribute.fill).toBe('green');
    expect(endHandlerText.attribute.dy).toBe(4);

    legend.setSelected([45, 90]);

    startHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
    endHandlerText = legend.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;

    expect(style).toHaveBeenCalledWith(
      45,
      'start',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 180,
        railHeight: 8
      })
    );
    expect(style).toHaveBeenCalledWith(
      90,
      'end',
      expect.objectContaining({
        layout: 'horizontal',
        align: 'bottom',
        railWidth: 180,
        railHeight: 8
      })
    );
    expect(startHandlerText.attribute.fill).toBe('green');
    expect(startHandlerText.attribute.dy).toBe(-4);
    expect(endHandlerText.attribute.fill).toBe('green');
    expect(endHandlerText.attribute.dy).toBe(4);
  });
});
