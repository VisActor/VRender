import { createRect } from '../../../src/graphic/rect';

describe('Graphic state performance', () => {
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

  test('should keep the deprecated normalAttrs alias aligned with base truth after frequent state switching', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { lineWidth: 3 },
      selected: { opacity: 0.5 }
    } as any;

    for (let i = 0; i < 200; i++) {
      graphic.useStates(['hover'], false);
      graphic.useStates(['active'], false);
      graphic.useStates(['selected'], false);
      graphic.clearStates(false);
    }

    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(graphic.currentStates).toEqual([]);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
    expect(graphic.attribute.opacity).toBe(1);
  });

  test('should keep normalAttrs keys bounded while reusing the same state keys', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red', lineWidth: 3 }
    } as any;

    graphic.useStates(['hover'], false);
    const firstKeys = Object.keys(graphic.normalAttrs ?? {});

    for (let i = 0; i < 100; i++) {
      graphic.useStates([], false);
      graphic.useStates(['hover'], false);
    }

    expect(Object.keys(graphic.normalAttrs ?? {})).toEqual(firstKeys);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should switch states 1000 times within a reasonable threshold', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { fill: 'green' }
    } as any;

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      graphic.useStates(i % 2 === 0 ? ['hover'] : ['active'], false);
    }
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  test('should merge ten states within a reasonable threshold', () => {
    const graphic = createGraphic();
    const states: Record<string, any> = {};
    const stateNames: string[] = [];

    for (let i = 0; i < 10; i++) {
      const name = `state-${i}`;
      stateNames.push(name);
      states[name] = { [`key${i}`]: i };
    }
    graphic.states = states as any;

    const start = Date.now();
    graphic.useStates(stateNames, false);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(10);
    expect(graphic.currentStates).toEqual(stateNames);
  });

  test('should call stateProxy for each resolution because no cache exists', () => {
    const graphic = createGraphic();
    const stateProxy = jest.fn((stateName: string) => ({ fill: stateName }));
    graphic.stateProxy = stateProxy as any;

    graphic.useStates(['hover'], false);
    graphic.useStates([], false);
    graphic.useStates(['hover'], false);

    expect(stateProxy).toHaveBeenCalledTimes(2);
  });
});
