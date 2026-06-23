import { createRect } from '../../../src/graphic/rect';

describe('Graphic normalAttrs', () => {
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

    graphic.states = {
      hover: {
        fill: 'red',
        lineWidth: 3
      },
      active: {
        opacity: 0.4
      }
    } as any;

    return graphic;
  };

  test('should expose baseAttributes as a readable deprecated alias before any state is applied', () => {
    const graphic = createGraphic();

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1
    });
  });

  test('should keep normalAttrs aligned with base truth after applying a state', () => {
    const graphic = createGraphic();

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.lineWidth).toBe(3);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      lineWidth: 1
    });
  });

  test('should keep normalAttrs unchanged when switching states', () => {
    const graphic = createGraphic();

    graphic.useStates(['hover'], false);
    graphic.useStates(['active'], false);

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      lineWidth: 1,
      opacity: 1
    });
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
    expect(graphic.attribute.opacity).toBe(0.4);
  });

  test('should keep normalAttrs readable after clearing states', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover'], false);

    graphic.clearStates(false);

    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should keep the deprecated alias stable while reusing the same state keys', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover'], false);
    const firstKeys = Object.keys(graphic.normalAttrs ?? {});

    graphic.useStates(['hover', 'active'], false);

    expect(Object.keys(graphic.normalAttrs ?? {})).toEqual(firstKeys);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should no longer derive normalAttrs from finalAttribute when active animates exist', () => {
    const graphic = createGraphic();
    (graphic as any).finalAttribute = {
      fill: 'final-fill',
      lineWidth: 9
    };
    graphic.animates = new Map([
      [
        'a',
        {
          preventAttr: jest.fn()
        } as any
      ]
    ]);

    graphic.useStates(['hover'], false);

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      lineWidth: 1
    });
  });

  test('should no longer derive normalAttrs from tracked animates when animates map is absent', () => {
    const graphic = createGraphic();
    (graphic as any).finalAttribute = {
      fill: 'tracked-final-fill',
      lineWidth: 11
    };
    (graphic as any).getTrackedAnimates = () =>
      new Map([
        [
          'a',
          {
            preventAttr: jest.fn()
          } as any
        ]
      ]);

    graphic.useStates(['hover'], false);

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      lineWidth: 1
    });
  });

  test('should preserve base truth while unrelated state attrs change', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover'], false);

    graphic.useStates(['active'], false);

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.normalAttrs).toMatchObject({
      opacity: 1
    });
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
  });
});
