import { createRect } from '../../../src/graphic/rect';

describe('Graphic state resolution', () => {
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

  test('should apply a single state attribute', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' }
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.stroke).toBe('black');
  });

  test('should merge multiple states by assigning attrs in order', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { stroke: 'orange', lineWidth: 3 }
    } as any;

    graphic.useStates(['hover', 'active'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.stroke).toBe('orange');
    expect(graphic.attribute.lineWidth).toBe(3);
  });

  test('should let the higher ranked compiled state override earlier attributes with the same name', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red', opacity: 0.4 },
      active: { fill: 'green' }
    } as any;

    graphic.useStates(['hover', 'active'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.opacity).toBe(0.4);
  });

  test('should prefer stateProxy over static states when both exist', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red', stroke: 'purple' }
    } as any;
    graphic.stateProxy = jest.fn(() => ({ fill: 'proxy', stroke: 'orange' })) as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('proxy');
    expect(graphic.attribute.stroke).toBe('orange');
  });

  test('should keep untouched attributes when only part of the attrs are overridden', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' }
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.stroke).toBe('black');
    expect(graphic.attribute.lineWidth).toBe(1);
  });

  test('should replace nested object attrs following compiled state order instead of deep merging them', () => {
    const graphic = createGraphic();
    (graphic as any).attribute.shadowBlur = { value: 1, color: 'black' };
    graphic.states = {
      hover: { shadowBlur: { value: 2 } },
      active: { shadowBlur: { color: 'red' } }
    } as any;

    graphic.useStates(['hover', 'active'], false);

    expect((graphic.attribute as any).shadowBlur).toEqual({ value: 2 });
  });

  test('should deep merge nested object attrs when stateMergeMode is deep and preserve compiled order', () => {
    const graphic = createGraphic();
    (graphic as any).stateMergeMode = 'deep';
    (graphic as any).attribute.shadowBlur = { value: 1, color: 'black', offset: { x: 0, y: 0 } };
    graphic.states = {
      hover: { shadowBlur: { value: 2, offset: { x: 5 } } },
      active: { shadowBlur: { color: 'red' } }
    } as any;

    graphic.useStates(['hover', 'active'], false);

    expect((graphic.attribute as any).shadowBlur).toEqual({
      value: 2,
      color: 'red',
      offset: { x: 5 }
    });
  });

  test('should apply undefined and null attrs as-is', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: undefined, stroke: null }
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBeUndefined();
    expect(graphic.attribute.stroke).toBeNull();
    expect(graphic.normalAttrs).toMatchObject({
      fill: 'blue',
      stroke: 'black'
    });
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });
});
