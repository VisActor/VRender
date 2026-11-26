import type { IGraphic, IText, Stage } from '@visactor/vrender-core';
import { ColorContinuousLegend, SizeContinuousLegend, SLIDER_ELEMENT_NAME } from '../../src';
import type { SizeLegendAttributes } from '../../src/legend/size/type';
import { createCanvas, removeDom } from '../util/dom';
import { createTestStage } from '../util/vrender';

const legendAttributes = {
  min: 199579,
  max: 1318683096,
  railWidth: 200,
  railHeight: 8
};

function getHandlerTexts(legend: SizeContinuousLegend | ColorContinuousLegend) {
  return [
    legend.find(node => node.name === SLIDER_ELEMENT_NAME.startHandlerText, true) as IText,
    legend.find(node => node.name === SLIDER_ELEMENT_NAME.endHandlerText, true) as IText
  ] as const;
}

describe('SizeContinuousLegend handler text', () => {
  let stage: Stage;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createCanvas(document.body, 'size-legend-handler-text');
    stage = createTestStage(canvas.id);
  });

  afterEach(() => {
    stage.release();
    removeDom(canvas);
  });

  function mountLegend(attributes: Partial<SizeLegendAttributes> = {}) {
    const legend = new SizeContinuousLegend({ ...legendAttributes, ...attributes });
    stage.defaultLayer.add(legend as unknown as IGraphic);
    return legend;
  }

  it('separates horizontally aligned labels and flips alignment when the handles cross', () => {
    const legend = mountLegend();
    const [start, end] = getHandlerTexts(legend);
    expect(start.attribute.textAlign).toBe('right');
    expect(end.attribute.textAlign).toBe('left');

    legend.setSelected([300000000, 300000000]);
    expect(start.globalAABBBounds.x2).toBeLessThan(end.globalAABBBounds.x1);
    expect(start.attribute.text).toBe('300000000');
    expect(end.attribute.text).toBe('300000000');

    legend.setSelected([500000000, 300000000]);
    expect(end.globalAABBBounds.x2).toBeLessThan(start.globalAABBBounds.x1);
    expect(start.attribute.textAlign).toBe('left');
    expect(end.attribute.textAlign).toBe('right');
  });

  it.each([
    ['right', false, 'start'],
    ['left', true, 'end']
  ] as const)('keeps %s vertical labels centered on their handles', (align, inverse, textAlign) => {
    const legend = mountLegend({
      inverse,
      layout: 'vertical',
      align,
      railWidth: 8,
      railHeight: 200,
      handlerText: { style: value => ({ fill: Number(value) > 400e6 ? '#0055cc' : '#b32329' }) }
    });
    const [start, end] = getHandlerTexts(legend);
    const startHandle = legend.find(node => node.name === SLIDER_ELEMENT_NAME.startHandler, true) as IGraphic;
    const endHandle = legend.find(node => node.name === SLIDER_ELEMENT_NAME.endHandler, true) as IGraphic;
    const expectCenteredLabels = () => {
      for (const [label, handle] of [
        [start, startHandle],
        [end, endHandle]
      ] as const) {
        expect(label.attribute.textBaseline).toBe('middle');
        expect(label.attribute.textAlign).toBe(textAlign);
        const labelBounds = label.globalAABBBounds;
        const handleBounds = handle.globalAABBBounds;
        expect((labelBounds.y1 + labelBounds.y2) / 2).toBeCloseTo((handleBounds.y1 + handleBounds.y2) / 2);
      }
    };
    expectCenteredLabels();

    legend.setSelected([300000000, 300000000]);
    expectCenteredLabels();
    expect(end.attribute.text).toBe('300000000');
    expect(end.attribute.fill).toBe('#b32329');
  });

  it('keeps custom horizontal label placement', () => {
    const custom = mountLegend({ handlerText: { style: { textAlign: 'center', dx: 10 } } });
    const [customStart, customEnd] = getHandlerTexts(custom);
    for (const label of [customStart, customEnd]) {
      expect(label.attribute.textAlign).toBe('center');
      expect(label.attribute.dx).toBe(10);
    }
  });

  it.each([
    ['static style', { fill: '#0055cc' }],
    ['value-dependent color', (value: string | number) => ({ fill: Number(value) > 300e6 ? '#0055cc' : '#b32329' })]
  ] as const)('reserves space for endpoint labels with %s when the initial selection is narrow', (_name, style) => {
    const legend = mountLegend({
      value: [400000000, 500000000],
      title: { visible: true, text: 'Population' },
      handlerText: { style }
    });
    const { x1, x2 } = legend.globalAABBBounds;
    const [start, end] = getHandlerTexts(legend);

    legend.setSelected([legendAttributes.min, legendAttributes.max]);
    expect(start.globalAABBBounds.x1).toBeGreaterThanOrEqual(x1);
    expect(end.globalAABBBounds.x2).toBeLessThanOrEqual(x2);
    expect(start.globalAABBBounds.x1).toBeGreaterThanOrEqual(0);
  });

  it('keeps the color legend default layout', () => {
    const legend = new ColorContinuousLegend({ ...legendAttributes, colors: ['#fff', '#000'] });
    stage.defaultLayer.add(legend as unknown as IGraphic);
    for (const label of getHandlerTexts(legend)) {
      expect(label.attribute.textAlign).toBe('center');
    }
  });
});
