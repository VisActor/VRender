import { createRect } from '../../../src/graphic/rect';

describe('Graphic state edge cases', () => {
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

  test('should ignore non-existent states without throwing', () => {
    const graphic = createGraphic();

    expect(() => graphic.useStates(['nonexistent'], false)).not.toThrow();
    expect(graphic.currentStates).toEqual(['nonexistent']);
    expect(graphic.attribute.fill).toBe('blue');
  });

  test('should ignore null and undefined results from stateProxy', () => {
    const graphic = createGraphic();
    graphic.stateProxy = jest
      .fn()
      .mockImplementationOnce(() => null)
      .mockImplementationOnce(() => undefined) as any;

    graphic.useStates(['hover', 'active'], false);

    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.currentStates).toEqual(['hover', 'active']);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should handle empty state attrs objects', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {}
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should use stateProxy when static states and stateProxy share the same state name', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' }
    } as any;
    graphic.stateProxy = jest.fn(() => ({ fill: 'proxy' })) as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('proxy');
  });

  test('should support very long state names', () => {
    const graphic = createGraphic();
    const longStateName = 's'.repeat(512);
    graphic.states = {
      [longStateName]: { fill: 'red' }
    } as any;

    graphic.useStates([longStateName], false);

    expect(graphic.currentStates).toEqual([longStateName]);
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should support special character state names', () => {
    const graphic = createGraphic();
    const specialState = 'hover:focus/选中@1';
    graphic.states = {
      [specialState]: { fill: 'red' }
    } as any;

    graphic.useStates([specialState], false);

    expect(graphic.currentStates).toEqual([specialState]);
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should keep the last state when useStates is called rapidly in sequence', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { fill: 'green' },
      selected: { fill: 'orange' }
    } as any;

    graphic.useStates(['hover'], false);
    graphic.useStates(['active'], false);
    graphic.useStates(['selected'], false);

    expect(graphic.currentStates).toEqual(['selected']);
    expect(graphic.attribute.fill).toBe('orange');
  });
});
