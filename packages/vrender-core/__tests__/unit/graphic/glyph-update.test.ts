import { createGlyph } from '../../../src/graphic/glyph';
import { createRect } from '../../../src/graphic/rect';
import { UpdateTag } from '../../../src/common/enums';

const createFixture = () => {
  const glyph = createGlyph({ fill: 'red', width: 20 });
  const child = createRect({ height: 10 });
  const service = { onAttributeUpdate: jest.fn(), onSetStage: jest.fn() };
  [glyph, child].forEach(g => jest.spyOn(g as any, 'getGraphicService').mockReturnValue(service));
  glyph.setSubGraphic([child]);
  return { glyph, child, service };
};

describe('Glyph derived attributes', () => {
  test('encodes the initial, state, base update and restored values before observers', () => {
    const { glyph, child } = createFixture();
    const encoder = jest.fn(g => child.setAttribute('width', g.attribute.width));
    glyph.setSubGraphicEncoder(encoder);
    expect(child.attribute.width).toBe(20);
    const seen: number[] = [];
    glyph.onUpdate(() => seen.push(child.attribute.width));
    glyph.states = { selected: { width: 40 } };
    glyph.setStates(['selected'], false);
    glyph.setAttribute('width', 30);
    glyph.clearStates(false);
    expect(seen).toEqual([40, 40, 30]);
    expect(glyph.baseAttributes.width).toBe(30);
  });

  test('silent writes still encode but do not notify observers or services', () => {
    const { glyph, child, service } = createFixture();
    glyph.setSubGraphicEncoder((g, context) => {
      g.commitSubGraphicAttributes(child, { width: g.attribute.width }, undefined, context);
    });
    service.onAttributeUpdate.mockClear();
    const observer = jest.fn();
    glyph.onUpdate(observer);
    glyph.addEventListener('afterAttributeUpdate', observer);
    child.addEventListener('afterAttributeUpdate', observer);
    glyph.setAttributes({ width: 50 }, false, { skipUpdateCallback: true });
    expect(child.attribute.width).toBe(50);
    expect(observer).not.toHaveBeenCalled();
    expect(service.onAttributeUpdate).not.toHaveBeenCalled();
  });

  test('keeps inheritance through host and child state surfaces and detach', () => {
    const { glyph, child } = createFixture();
    glyph.states = { hover: { fill: 'blue' } };
    glyph.useStates(['hover'], false);
    expect(child.attribute.fill).toBe('blue');
    child.states = { selected: { lineWidth: 4 } };
    child.useStates(['selected'], false);
    expect(child.attribute.fill).toBe('blue');
    child.setAttribute('height', 15);
    expect(child.attribute.fill).toBe('blue');
    glyph.clearStates(false);
    expect(child.attribute.fill).toBe('red');
    child.clearStates(false);
    expect(child.attribute.fill).toBe('red');
    glyph.setSubGraphic([]);
    expect(child.glyphHost).toBeNull();
    expect(child.attribute.fill).toBeUndefined();
    expect(child.baseAttributes.fill).toBeUndefined();
  });

  test('removes only owned keys atomically and keeps child state and base truth', () => {
    const { glyph, child, service } = createFixture();
    child.setAttributes({ fill: 'orange', lineWidth: 2 });
    child.states = { selected: { fill: 'green' } };
    child.setStates(['selected'], false);
    glyph.setAttribute('fill', 'blue');
    service.onAttributeUpdate.mockClear();
    glyph.commitSubGraphicAttributes(child, { width: 9 }, ['fill']);
    expect(child.attribute.fill).toBe('green');
    expect(child.attribute.width).toBe(9);
    expect(child.attribute.lineWidth).toBe(2);
    expect(service.onAttributeUpdate).toHaveBeenCalledTimes(1);
    child.clearStates(false);
    expect(child.attribute.fill).toBe('blue');
    expect(Object.prototype.hasOwnProperty.call(child.baseAttributes, 'fill')).toBe(false);
  });

  test('inherited paint state changes do not invalidate child geometry', () => {
    const { glyph, child } = createFixture();
    glyph.states = { hover: { fill: 'blue', fillOpacity: 0.5 } };
    (glyph as any)._updateTag = 0;
    (child as any)._updateTag = 0;
    glyph.setStates(['hover'], false);
    expect(child.attribute.fill).toBe('blue');
    expect((child as any)._updateTag & UpdateTag.UPDATE_PAINT).not.toBe(0);
    expect((child as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).toBe(0);
    expect((glyph as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).toBe(0);
    glyph.clearStates(false);
    (glyph as any)._updateTag = 0;
    (child as any)._updateTag = 0;
    glyph.setAttribute('fill', 'purple');
    expect(child.attribute.fill).toBe('purple');
    expect((child as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).toBe(0);
    expect((glyph as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).toBe(0);
  });

  test('derived paint patches do not invalidate child geometry', () => {
    const { glyph, child } = createFixture();
    (child as any)._updateTag = 0;
    glyph.commitSubGraphicAttributes(child, { fill: 'gray', fillOpacity: 0.5 });
    expect(child.attribute.fill).toBe('gray');
    expect((child as any)._updateTag & UpdateTag.UPDATE_PAINT).not.toBe(0);
    expect((child as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).toBe(0);
    glyph.commitSubGraphicAttributes(child, { width: 30 });
    expect((child as any)._updateTag & UpdateTag.UPDATE_SHAPE_AND_BOUNDS).not.toBe(0);
  });

  test('clone callbacks are independent and initAttributes resynchronizes children', () => {
    const { glyph, child, service } = createFixture();
    const encode = jest.fn((g, context) => {
      g.commitSubGraphicAttributes(g.getSubGraphic()[0], { width: g.attribute.width }, undefined, context);
    });
    glyph.setSubGraphicEncoder(encode);
    const clone = glyph.clone() as typeof glyph;
    [clone, ...clone.getSubGraphic()].forEach(g => jest.spyOn(g as any, 'getGraphicService').mockReturnValue(service));
    clone.setAttributes({ x: 10 }, false, { skipUpdateCallback: true });
    expect(encode).toHaveBeenCalledTimes(1);
    clone.setSubGraphicEncoder(encode);
    clone.initAttributes({ width: 60 });
    expect(clone.getSubGraphic()[0].attribute).toMatchObject({ width: 60 });
    expect(child.attribute.width).toBe(20);
  });

  test('release clears encoder references and detaches children', () => {
    const { glyph, child } = createFixture();
    glyph.setSubGraphicEncoder(jest.fn());
    glyph.release();
    expect(glyph.getSubGraphic()).toEqual([]);
    expect(child.glyphHost).toBeNull();
    expect(child.releaseStatus).toBe('released');
    expect((glyph as any).subGraphicEncoder).toBeUndefined();
  });
});
