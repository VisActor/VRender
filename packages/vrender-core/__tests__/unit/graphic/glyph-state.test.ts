import { createGlyph } from '../../../src/graphic/glyph';
import { createRect } from '../../../src/graphic/rect';

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

  test('should differ from normal graphic states by reading glyphStates instead of states', () => {
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
});
