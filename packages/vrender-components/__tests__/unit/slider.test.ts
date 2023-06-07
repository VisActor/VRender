/**
 * TODO:
 * 1. 事件测试
 * 2. setValue 测试
 */
import { IGraphic, Stage, ISymbol, IGroup, IRect, IText } from '@visactor/vrender';
import { Slider, SLIDER_ELEMENT_NAME } from '../../src';
import { createCanvas } from '../util/dom';
import { createStage } from '../util/vrender';

describe('Slider', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  describe('Slider with single handler', () => {
    it('Horizontal slider.', () => {
      const slider = new Slider({
        x: 100,
        y: 100,
        layout: 'horizontal',
        railWidth: 200,
        railHeight: 10,
        min: 0,
        max: 100,
        value: 34,
        railStyle: {
          borderRadius: 5
        },
        startText: {
          visible: true,
          text: 'Low',
          space: 8
        },
        endText: {
          visible: true,
          text: 'High',
          space: 8
        },
        handlerStyle: {
          fillColor: 'transparent'
        }
      });

      stage.defaultLayer.add(slider as unknown as IGraphic);
      stage.render();

      const railContainer = slider.getElementsByName(SLIDER_ELEMENT_NAME.railContainer)[0] as IGroup;
      // expect(railContainer.getChildren()).toHaveLength(3);

      const rail = slider.getElementsByName(SLIDER_ELEMENT_NAME.rail)[0] as IRect;
      expect(rail.AABBBounds.width()).toBe(200);
      expect(rail.AABBBounds.height()).toBe(10);

      const startText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startText)[0] as IText;
      expect(startText.attribute.y).toBe(5);
      expect(startText.attribute.textAlign).toBe('start');
      expect(startText.attribute.textBaseline).toBe('middle');

      const endText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endText)[0] as IText;
      expect(endText.attribute.y).toBe(5);
      expect(endText.attribute.x).toBeCloseTo(239.1479949951172);
      expect(endText.attribute.textAlign).toBe('start');
      expect(endText.attribute.textBaseline).toBe('middle');

      const startHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandler)[0] as ISymbol;
      expect(startHandler.attribute.x).toBe(68);

      let startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(68);
      expect(startHandlerText.attribute.y).toBe(16);

      const track = slider.getElementsByName(SLIDER_ELEMENT_NAME.track)[0] as IRect;
      expect(track.attribute.width).toBe(68);
      expect(track.attribute.height).toBe(10);

      // change align
      slider.setAttribute('align', 'top');
      startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.y).toBe(-6);
    });

    it('Vertical slider.', () => {
      const slider = new Slider({
        x: 100,
        y: 120,
        layout: 'vertical',
        railWidth: 10,
        railHeight: 200,
        min: 0,
        max: 100,
        value: 34,
        railStyle: {
          borderRadius: 5
        },
        startText: {
          visible: true,
          text: 'Low',
          space: 8
        },
        endText: {
          visible: true,
          text: 'High',
          space: 8
        },
        handlerStyle: {
          fillColor: 'transparent'
        }
      });

      stage.defaultLayer.add(slider as unknown as IGraphic);
      stage.render();

      // const railContainer = slider.getElementsByName(SLIDER_ELEMENT_NAME.railContainer)[0] as IGroup;
      // // expect(railContainer.getChildren()).toHaveLength(3);

      const rail = slider.getElementsByName(SLIDER_ELEMENT_NAME.rail)[0] as IRect;
      expect(rail.AABBBounds.width()).toBe(10);
      expect(rail.AABBBounds.height()).toBe(200);

      const startText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startText)[0] as IText;
      expect(startText.attribute.y).toBe(0);
      expect(startText.attribute.textAlign).toBe('center');
      expect(startText.attribute.textBaseline).toBe('top');

      const endText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endText)[0] as IText;
      expect(endText.attribute.y).toBe(228);
      expect(endText.attribute.x).toBeCloseTo(5);
      expect(endText.attribute.textAlign).toBe('center');
      expect(endText.attribute.textBaseline).toBe('top');

      const startHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandler)[0] as ISymbol;
      expect(startHandler.attribute.y).toBe(68);
      expect(startHandler.attribute.x).toBe(5);

      let startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(16);
      expect(startHandlerText.attribute.y).toBe(68);

      const track = slider.getElementsByName(SLIDER_ELEMENT_NAME.track)[0] as IRect;
      expect(track.attribute.width).toBe(10);
      expect(track.attribute.height).toBe(68);

      // change align
      slider.setAttribute('align', 'right');
      startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(16);
    });
  });

  describe('Slider with two handlers', () => {
    it('Horizontal slider.', () => {
      const slider = new Slider({
        x: 100,
        y: 200,
        layout: 'horizontal',
        railWidth: 200,
        railHeight: 10,
        range: true,
        min: 0,
        max: 100,
        value: [10, 78],
        railStyle: {
          borderRadius: 5,
          fillColor: 'yellow'
        },
        startText: {
          visible: true,
          text: 'Low',
          space: 8
        },
        endText: {
          visible: true,
          text: 'High',
          space: 8
        },
        handlerStyle: {
          fillColor: 'transparent'
        }
      });

      stage.defaultLayer.add(slider as unknown as IGraphic);
      stage.render();

      const startHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandler)[0] as ISymbol;
      expect(startHandler.attribute.x).toBe(20);

      let startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(20);
      expect(startHandlerText.attribute.y).toBe(16);

      const endHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandler)[0] as ISymbol;
      expect(endHandler.attribute.x).toBe(156);

      let endHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;
      expect(endHandlerText.attribute.x).toBe(156);
      expect(endHandlerText.attribute.y).toBe(16);

      const track = slider.getElementsByName(SLIDER_ELEMENT_NAME.track)[0] as IRect;
      expect(track.attribute.width).toBe(136);
      expect(track.attribute.height).toBe(10);

      // change align
      slider.setAttribute('align', 'top');
      startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.y).toBe(-6);
      endHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;
      expect(endHandlerText.attribute.y).toBe(-6);
    });

    it('Vertical slider.', () => {
      const slider = new Slider({
        x: 100,
        y: 220,
        layout: 'vertical',
        railWidth: 10,
        railHeight: 200,
        range: true,
        min: 0,
        max: 100,
        value: [10, 78],
        railStyle: {
          borderRadius: 5,
          fillColor: 'yellow'
        },
        startText: {
          visible: true,
          text: 'Low',
          space: 8
        },
        endText: {
          visible: true,
          text: 'High',
          space: 8
        },
        handlerStyle: {
          fillColor: 'transparent'
        }
      });

      stage.defaultLayer.add(slider as unknown as IGraphic);
      stage.render();

      const startHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandler)[0] as ISymbol;
      expect(startHandler.attribute.x).toBe(5);
      expect(startHandler.attribute.y).toBe(20);

      let startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(16);
      expect(startHandlerText.attribute.y).toBe(20);

      const endHandler = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandler)[0] as ISymbol;
      expect(endHandler.attribute.x).toBe(5);
      expect(endHandler.attribute.y).toBe(156);

      let endHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;
      expect(endHandlerText.attribute.x).toBe(16);
      expect(endHandlerText.attribute.y).toBe(156);

      const track = slider.getElementsByName(SLIDER_ELEMENT_NAME.track)[0] as IRect;
      expect(track.attribute.width).toBe(10);
      expect(track.attribute.height).toBe(136);

      // change align
      slider.setAttribute('align', 'left');
      startHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.startHandlerText)[0] as IText;
      expect(startHandlerText.attribute.x).toBe(-6);
      endHandlerText = slider.getElementsByName(SLIDER_ELEMENT_NAME.endHandlerText)[0] as IText;
      expect(endHandlerText.attribute.x).toBe(-6);
    });
  });
});
