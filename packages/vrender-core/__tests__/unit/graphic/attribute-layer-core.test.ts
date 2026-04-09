import { createRect } from '../../../src/graphic/rect';

describe('Graphic attribute layering', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    return graphic;
  };

  test('should keep baseAttributes as static truth while normalAttrs stays a readable deprecated alias', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.4
      }
    } as any;

    graphic.useStates(['hover'], false);

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue',
        opacity: 1
      })
    );
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.resolvedStatePatch).toEqual({
      fill: 'red',
      opacity: 0.4
    });
    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.opacity).toBe(0.4);

    graphic.clearStates(false);

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue',
        opacity: 1
      })
    );
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.opacity).toBe(1);
    expect(graphic.resolvedStatePatch).toBeUndefined();
  });

  test('should restore attribute from current static truth on animation stop instead of committing props to base', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    graphic.useStates(['hover'], false);

    (graphic.attribute as any).fill = 'animated-green';
    (graphic as any).finalAttribute = {
      fill: 'animated-green'
    };

    (graphic as any).onStop({
      fill: 'animated-green'
    });

    expect((graphic as any).baseAttributes).toEqual(
      expect.objectContaining({
        fill: 'blue'
      })
    );
    expect(graphic.resolvedStatePatch).toEqual({
      fill: 'red'
    });
    expect(graphic.attribute.fill).toBe('red');
  });
});
