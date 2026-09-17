import { createGlyph } from '../../../src/graphic/glyph';
import { createRect } from '../../../src/graphic/rect';
import { UpdateTag } from '../../../src/common/enums';
import { application } from '../../../src/application';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { createPath } from '../../../src/graphic/path';
import { createCircle } from '../../../src/graphic/circle';

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

describe('Glyph cached geometry', () => {
  let previousService: typeof application.graphicService;

  beforeEach(() => {
    previousService = application.graphicService;
    application.graphicService = new DefaultGraphicService();
  });

  afterEach(() => {
    application.graphicService = previousService;
  });

  describe.each(['attributes', 'derived', 'host'])('%s offset updates', writer => {
    test.each(['dx', 'dy'])('refreshes cached matrices and bounds for %s', key => {
      const glyph = createGlyph({});
      const child = createRect({ width: 10, height: 10 });
      glyph.setSubGraphic([child]);
      const readPosition = () => ({
        matrix: key === 'dx' ? child.transMatrix.e : child.transMatrix.f,
        child: key === 'dx' ? child.AABBBounds.x1 : child.AABBBounds.y1,
        glyph: key === 'dx' ? glyph.AABBBounds.x1 : glyph.AABBBounds.y1
      });
      expect(readPosition()).toEqual({ matrix: 0, child: 0, glyph: 0 });

      if (writer === 'derived') {
        glyph.commitSubGraphicAttributes(child, { [key]: 20 });
      } else if (writer === 'host') {
        glyph.setAttributes({ [key]: 20 });
      } else {
        child.setAttributes({ [key]: 20 });
      }

      expect(child.attribute[key]).toBe(20);
      expect(readPosition()).toEqual({ matrix: 20, child: 20, glyph: 20 });
    });
  });

  describe.each(['single', 'batch', 'state'])('%s inherited geometry updates', writer => {
    [
      {
        key: 'path',
        initial: 'M0 0H10V10H0Z',
        next: 'M0 0H30V10H0Z',
        initialWidth: 10,
        nextWidth: 30,
        createChild: () => createPath({})
      },
      {
        key: 'radius',
        initial: 10,
        next: 30,
        initialWidth: 20,
        nextWidth: 60,
        createChild: () => createCircle({})
      }
    ].forEach(({ key, initial, next, initialWidth, nextWidth, createChild }) => {
      test(`refreshes child and host geometry for ${key}`, () => {
        const glyph = createGlyph({ [key]: initial });
        const child = createChild();
        glyph.setSubGraphic([child]);
        // Revalidate after inheritance is bound, including Path's required path attribute.
        child.setAttribute('fill', 'red');
        const expectWidths = (width: number) => {
          expect(child.AABBBounds.width()).toBe(width);
          expect(glyph.AABBBounds.width()).toBe(width);
          if ('getParsedPathShape' in child) {
            expect(child.getParsedPathShape().getBounds().width()).toBe(width);
          }
        };
        expectWidths(initialWidth);

        if (writer === 'single') {
          glyph.setAttribute(key, next);
        } else if (writer === 'batch') {
          glyph.setAttributes({ [key]: next });
        } else {
          glyph.states = { expanded: { [key]: next } };
          glyph.setStates(['expanded'], false);
        }

        expect(child.attribute[key]).toBe(next);
        expectWidths(nextWidth);
        if (writer === 'state') {
          expect(glyph.baseAttributes[key]).toBe(initial);
          glyph.clearStates(false);
          expect(child.attribute[key]).toBe(initial);
          expectWidths(initialWidth);
        }
      });
    });
  });

  test.each(['host', 'derived', 'state'])('%s paint updates preserve warmed geometry caches', writer => {
    const glyph = createGlyph({ fill: 'red', fillOpacity: 1 });
    const child = createRect({ width: 10, height: 10 });
    glyph.setSubGraphic([child]);
    const graphics = [glyph, child];
    const readGeometry = () =>
      graphics.map(graphic => ({
        width: graphic.AABBBounds.width(),
        x: graphic.transMatrix.e,
        y: graphic.transMatrix.f,
        boundsUpdates: (graphic as any).updateAABBBoundsStamp
      }));
    const initialGeometry = readGeometry();
    graphics.forEach(graphic => ((graphic as any)._updateTag = UpdateTag.NONE));
    const paint = { fill: 'blue', fillOpacity: 0.5 };

    if (writer === 'host') {
      glyph.setAttributes(paint);
    } else if (writer === 'derived') {
      glyph.commitSubGraphicAttributes(child, paint);
    } else {
      glyph.states = { hover: paint };
      glyph.setStates(['hover'], false);
    }

    expect(child.attribute.fill).toBe('blue');
    expect(child.attribute.fillOpacity).toBe(0.5);
    expect((child as any)._updateTag & UpdateTag.UPDATE_PAINT).not.toBe(0);
    graphics.forEach(graphic => {
      expect(
        (graphic as any)._updateTag & (UpdateTag.UPDATE_SHAPE_AND_BOUNDS | UpdateTag.UPDATE_GLOBAL_LOCAL_MATRIX)
      ).toBe(0);
    });
    expect(readGeometry()).toEqual(initialGeometry);
  });
});
