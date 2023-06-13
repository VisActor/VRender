/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Rect } from '../../src/index';
import { crateDemoGlyph } from '../glyph';

describe('Graphic-state', () => {
  it('hasState', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink' },
      hover: { fillOpacity: 0.5 }
    };

    expect(rect.hasState()).toBeFalsy();
    rect.useStates(['hover']);
    expect(rect.hasState()).toBeTruthy();
    expect(rect.attribute.fill).toEqual('red');
    expect(rect.attribute.fillOpacity).toEqual(rect.states.hover.fillOpacity);
    expect(rect.normalAttrs?.fillOpacity).toBeUndefined();
    expect(rect.currentStates).toEqual(['hover']);
  });

  it('toggleState', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink' },
      hover: { fillOpacity: 0.5 }
    };

    expect(rect.hasState('hover')).toBeFalsy();
    rect.toggleState('hover');
    expect(rect.hasState('hover')).toBeTruthy();
    expect(rect.attribute.fill).toEqual('red');
    expect(rect.attribute.fillOpacity).toEqual(rect.states.hover.fillOpacity);
    expect(rect.normalAttrs?.fillOpacity).toBeUndefined();
    expect(rect.currentStates).toEqual(['hover']);
    rect.toggleState('hover');
    expect(rect.hasState('hover')).toBeFalsy();
    expect(rect.attribute.fillOpacity).toBeUndefined();
    expect(rect.currentStates).toEqual([]);
    expect(rect.normalAttrs).toBeNull();
  });

  it('clearStates', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink', stroke: 'black' },
      hover: { fillOpacity: 0.5, fill: 'yellow' }
    };

    rect.useStates(['selected', 'hover']);

    expect(rect.hasState()).toBeTruthy();
    expect(rect.attribute.fill).toEqual(rect.states.hover.fill);
    expect(rect.attribute.stroke).toEqual(rect.states.selected.stroke);
    expect(rect.normalAttrs?.fill).toEqual('red');
    expect(rect.normalAttrs?.stroke).toBeUndefined();
    expect(rect.normalAttrs?.fillOpacity).toBeUndefined();

    rect.clearStates();

    expect(rect.hasState()).toBeFalsy();
    expect(rect.attribute.fill).toEqual('red');
    expect(rect.attribute.stroke).toBeUndefined();
    expect(rect.attribute.fillOpacity).toBeUndefined();
    expect(rect.normalAttrs).toBeNull();
  });

  it('useStates', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink', stroke: 'black' },
      hover: { fillOpacity: 0.5, fill: 'yellow' }
    };

    rect.useStates(['selected']);
    expect(rect.hasState()).toBeTruthy();
    expect(rect.attribute.fill).toEqual(rect.states.selected.fill);
    expect(rect.attribute.stroke).toEqual(rect.states.selected.stroke);
    expect(rect.normalAttrs?.fill).toEqual('red');
    expect(rect.normalAttrs?.stroke).toBeUndefined();
  });

  it('addState() and keepCurrentStates = true', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink', stroke: 'black' },
      hover: { fillOpacity: 0.5, fill: 'yellow' }
    };

    rect.addState('selected', true);
    expect(rect.hasState()).toBeTruthy();
    expect(rect.attribute).toMatchObject(rect.states.selected);
    expect(rect.normalAttrs).toMatchObject({ fill: 'red', stroke: undefined });

    rect.addState('hover', true);
    expect(rect.attribute).toMatchObject({ ...rect.states.selected, ...rect.states.hover });
  });

  it('addState() and keepCurrentStates = false', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {
      selected: { fill: 'pink', stroke: 'black' },
      hover: { fillOpacity: 0.5, fill: 'yellow' }
    };

    rect.addState('selected', false);
    expect(rect.hasState()).toBeTruthy();
    expect(rect.attribute).toMatchObject(rect.states.selected);
    expect(rect.normalAttrs).toMatchObject({ fill: 'red', stroke: undefined });

    rect.addState('hover', false);
    expect(rect.attribute).toMatchObject(rect.states.hover);
    expect(rect.normalAttrs).toMatchObject({ fill: 'red', fillOpacity: undefined });
  });

  it('removeState', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    rect.states = {};

    rect.useStates(['selected']);

    expect(rect.hasState('selected')).toBeTruthy();
    expect(rect.currentStates).toEqual(['selected']);
    expect(rect.attribute.fill).toEqual('red');
    expect(rect.normalAttrs?.fill).toBeUndefined();
    expect(rect.normalAttrs?.stroke).toBeUndefined();
    expect(rect.normalAttrs?.fillOpacity).toBeUndefined();

    rect.removeState('selected');

    expect(rect.currentStates).toEqual([]);
    expect(rect.hasState('selected')).toBeFalsy();
    expect(rect.attribute.fill).toEqual('red');
    expect(rect.attribute.stroke).toBeUndefined();
    expect(rect.attribute.fillOpacity).toBeUndefined();
    expect(rect.normalAttrs).toBeNull();
  });
});

describe('glyph-state', () => {
  it('hasState', () => {
    const glyph = crateDemoGlyph();
    glyph.glyphStates = {
      selected: { attributes: { stroke: 'red' } },
      hover: { attributes: { fillOpacity: 0.5 } }
    };

    expect(glyph.hasState()).toBeFalsy();
    glyph.addState('hover');
    expect(glyph.hasState()).toBeTruthy();
    expect(glyph.attribute).toMatchObject(glyph.glyphStates.hover.attributes);
    expect(glyph.normalAttrs).toMatchObject({ fillOpacity: undefined });
    expect(glyph.currentStates).toEqual(['hover']);
  });

  it('hasState', () => {
    const glyph = crateDemoGlyph();
    glyph.glyphStates = {
      selected: { attributes: { stroke: 'red' }, subAttributes: [{ lineWidth: 2 }] },
      hover: { attributes: { fillOpacity: 0.5 }, subAttributes: [{ fill: 'yellow' }, { fill: 'grey' }] }
    };

    expect(glyph.hasState()).toBeFalsy();
    glyph.addState('hover');
    expect(glyph.hasState()).toBeTruthy();
    expect(glyph.attribute).toMatchObject(glyph.glyphStates.hover.attributes);
    expect(glyph.normalAttrs).toMatchObject({ fillOpacity: undefined });
    expect(glyph.currentStates).toEqual(['hover']);
    expect(glyph.subGraphic[0].attribute).toMatchObject(glyph.glyphStates.hover.subAttributes[0]);
    expect(glyph.subGraphic[1].attribute).toMatchObject(glyph.glyphStates.hover.subAttributes[1]);

    glyph.addState('selected', true);
    expect(glyph.attribute).toMatchObject({
      ...glyph.glyphStates.hover.attributes,
      ...glyph.glyphStates.selected.attributes
    });
    expect(glyph.subGraphic[0].attribute).toMatchObject({
      ...glyph.glyphStates.hover.subAttributes[0],
      ...glyph.glyphStates.selected.subAttributes[0]
    });
    expect(glyph.subGraphic[1].attribute).toMatchObject(glyph.glyphStates.hover.subAttributes[1]);
  });
});
