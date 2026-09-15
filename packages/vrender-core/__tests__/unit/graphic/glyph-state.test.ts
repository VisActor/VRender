import { createGlyph } from '../../../src/graphic/glyph';
import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';

describe('Glyph state', () => {
  const createTestGlyph = () => {
    const glyph = createGlyph({
      x: 0,
      y: 0,
      stroke: 'black',
      lineWidth: 1,
      scaleX: 1,
      scaleY: 1
    });

    jest.spyOn(glyph as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    const subGraphic = [
      createRect({
        width: 10,
        height: 10,
        fill: 'pink'
      }),
      createRect({
        width: 6,
        height: 6,
        fill: 'green'
      })
    ];

    subGraphic.forEach(graphic => {
      jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
        onAttributeUpdate: jest.fn(),
        onSetStage: jest.fn()
      });
    });

    glyph.setSubGraphic(subGraphic);

    return { glyph, subGraphic };
  };

  test('should apply glyphStates attributes to the glyph itself', () => {
    const { glyph } = createTestGlyph();
    glyph.glyphStates = {
      hover: {
        attributes: {
          stroke: 'red',
          scaleX: 2
        },
        subAttributes: [{ fill: 'orange' }, { fill: 'blue' }]
      }
    } as any;

    glyph.useStates(['hover'], false);

    expect(glyph.attribute.stroke).toBe('red');
    expect(glyph.attribute.scaleX).toBe(2);
    expect(glyph.currentStates).toEqual(['hover']);
  });

  test('should call glyphStateProxy with the requested state names', () => {
    const { glyph } = createTestGlyph();
    const glyphStateProxy = jest.fn((stateName: string, targetStates?: string[]) => ({
      attributes: {
        stroke: `${stateName}-${targetStates?.join('+')}`
      },
      subAttributes: []
    }));
    glyph.glyphStateProxy = glyphStateProxy as any;

    glyph.useStates(['hover'], false);

    expect(glyphStateProxy).toHaveBeenCalledWith('hover', ['hover']);
    expect(glyph.attribute.stroke).toBe('hover-hover');
  });

  test('should not directly apply glyph state subAttributes to subGraphics in the current implementation', () => {
    const { glyph, subGraphic } = createTestGlyph();
    glyph.glyphStates = {
      hover: {
        attributes: {
          stroke: 'red'
        },
        subAttributes: [{ fill: 'orange' }, { fill: 'blue' }]
      }
    } as any;

    glyph.useStates(['hover'], false);

    expect(subGraphic[0].attribute.fill).toBe('pink');
    expect(subGraphic[1].attribute.fill).toBe('green');
  });

  test('should clear glyph states and restore attrs from base truth', () => {
    const { glyph } = createTestGlyph();
    glyph.glyphStates = {
      hover: {
        attributes: {
          stroke: 'red',
          scaleY: 3
        },
        subAttributes: []
      }
    } as any;

    glyph.useStates(['hover'], false);
    glyph.clearStates(false);

    expect(glyph.currentStates).toEqual([]);
    expect(glyph.attribute.stroke).toBe('black');
    expect(glyph.attribute.scaleY).toBe(1);
    expect(glyph.normalAttrs).toEqual((glyph as any).baseAttributes);
  });

  test('explicit glyphStates take precedence over standard local definitions', () => {
    const { glyph } = createTestGlyph();
    (glyph as any).states = {
      hover: {
        stroke: 'normal-state'
      }
    };
    glyph.glyphStates = {
      hover: {
        attributes: {
          stroke: 'glyph-state'
        },
        subAttributes: []
      }
    } as any;

    glyph.useStates(['hover'], false);

    expect(glyph.attribute.stroke).toBe('glyph-state');
  });

  test('removes state-only keys and restores the latest base attributes', () => {
    const { glyph } = createTestGlyph();
    glyph.glyphStates = {
      selected: { attributes: { fillOpacity: 0.25, stroke: 'red' }, subAttributes: [] }
    };
    glyph.setStates(['selected'], false);
    expect(glyph.attribute.fillOpacity).toBe(0.25);
    expect(glyph.baseAttributes.fillOpacity).toBeUndefined();
    glyph.setAttribute('stroke', 'orange');
    expect(glyph.attribute.stroke).toBe('red');
    glyph.setStates([], false);
    expect(glyph.attribute.stroke).toBe('orange');
    expect(glyph.attribute.fillOpacity).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(glyph.attribute, 'fillOpacity')).toBe(false);
  });

  test('refreshes a proxy-only state without clearing it first', () => {
    const { glyph } = createTestGlyph();
    let opacity = 0.2;
    glyph.glyphStateProxy = () => ({ attributes: { fillOpacity: opacity }, subAttributes: [] });
    glyph.setStates(['selected'], { animate: false });
    opacity = 0.8;
    glyph.setStates(['selected'], { animate: false });
    expect(glyph.currentStates).toEqual(['selected']);
    expect(glyph.effectiveStates).toEqual(['selected']);
    expect(glyph.resolvedStatePatch.fillOpacity).toBe(0.8);
    expect(glyph.attribute.fillOpacity).toBe(0.8);
    expect(glyph.baseAttributes.fillOpacity).toBeUndefined();
  });

  test('preserves legacy input order and stateSort without mutating the input', () => {
    const { glyph } = createTestGlyph();
    glyph.glyphStates = {
      a: { attributes: { stroke: 'red' }, subAttributes: [] },
      z: { attributes: { stroke: 'blue' }, subAttributes: [] }
    };
    glyph.useStates(['z', 'a'], false);
    expect(glyph.attribute.stroke).toBe('red');
    glyph.useStates(['a', 'z'], false);
    expect(glyph.attribute.stroke).toBe('blue');
    (glyph as any).stateSort = (a: string, b: string) => b.localeCompare(a);
    const states = ['a', 'z'];
    const proxy = jest.fn((name: string) => glyph.glyphStates[name]);
    glyph.glyphStateProxy = proxy;
    glyph.setStates(states, { animate: false });
    expect(glyph.attribute.stroke).toBe('red');
    expect(proxy).toHaveBeenCalledWith('a', ['z', 'a']);
    expect(states).toEqual(['a', 'z']);
  });

  test('uses Group definitions unless explicit legacy inputs own the glyph', () => {
    const { glyph } = createTestGlyph();
    const group = createGroup({});
    group.sharedStateDefinitions = {
      hover: { stroke: 'shared' },
      selected: { fillOpacity: 0.4 }
    };
    group.add(glyph);
    glyph.states = { hover: { stroke: 'local' } };
    glyph.setStates(['hover'], false);
    expect(glyph.attribute.stroke).toBe('shared');
    glyph.glyphStates = { hover: { attributes: { stroke: 'legacy' }, subAttributes: [] } };
    glyph.setStates(['hover', 'selected'], { animate: false });
    expect(glyph.attribute.stroke).toBe('legacy');
    expect(glyph.attribute.fillOpacity).toBeUndefined();
    glyph.glyphStateProxy = () => undefined;
    glyph.setStates(['hover'], { animate: false });
    expect(glyph.attribute.stroke).toBe('black');
    glyph.glyphStateProxy = undefined;
    glyph.glyphStates = undefined;
    glyph.setStates(['hover', 'selected'], { animate: false });
    expect(glyph.attribute.stroke).toBe('shared');
    expect(glyph.attribute.fillOpacity).toBe(0.4);
    glyph.clearStates(false);
    expect(glyph.registeredActiveScopes).toBeUndefined();
  });
});
