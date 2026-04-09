import { createRect } from '../../../src/graphic/rect';
import { AttributeUpdateType } from '../../../src/common/enums';

describe('Graphic useStates', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1,
      visible: true
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    return graphic;
  };

  test('should apply a single state and update currentStates', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.5
      }
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.opacity).toBe(0.5);
    expect(graphic.attribute.stroke).toBe('black');
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.normalAttrs).toMatchObject({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1
    });
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should merge multiple states using compiled priority and rank order', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.4
      },
      active: {
        fill: 'green',
        lineWidth: 4
      }
    } as any;

    graphic.useStates(['hover', 'active'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.opacity).toBe(0.4);
    expect(graphic.attribute.lineWidth).toBe(4);
    expect(graphic.currentStates).toEqual(['active', 'hover']);
    expect(graphic.normalAttrs).toMatchObject({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      opacity: 1,
      lineWidth: 1
    });
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should use stateProxy instead of static states for dynamic attrs', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    const stateProxy = jest.fn((stateName: string, targetStates?: string[]) => ({
      fill: `${stateName}-${targetStates?.join('+')}`,
      stroke: 'orange'
    }));
    graphic.stateProxy = stateProxy as any;

    graphic.useStates(['hover'], false);

    expect(stateProxy).toHaveBeenCalledWith('hover', ['hover']);
    expect(graphic.attribute.fill).toBe('hover-hover');
    expect(graphic.attribute.stroke).toBe('orange');
  });

  test('should call applyAnimationState when hasAnimation is true', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.25
      }
    } as any;

    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState).toHaveBeenCalledTimes(1);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.currentStates).toEqual(['hover']);
  });

  test('should apply attrs directly and stop state animates when hasAnimation is false', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    const stopStateAnimates = jest.spyOn(graphic as any, 'stopStateAnimates');
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], false);

    expect(stopStateAnimates).toHaveBeenCalledTimes(1);
    expect(applyAnimationState).not.toHaveBeenCalled();
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should clear current states and restore attrs from static truth when useStates receives an empty array', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        lineWidth: 3
      }
    } as any;

    graphic.useStates(['hover'], false);
    graphic.useStates([], false);

    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
    expect(graphic.currentStates).toEqual([]);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should skip recomputing identical states in the same order', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    const restoreFromStaticTruth = jest.spyOn(graphic as any, '_restoreAttributeFromStaticTruth');

    graphic.useStates(['hover'], false);
    graphic.useStates(['hover'], false);

    expect(restoreFromStaticTruth).toHaveBeenCalledTimes(1);
    expect(graphic.currentStates).toEqual(['hover']);
  });

  test('should emit beforeStateUpdate with previous and next state info', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const eventOrder: string[] = [];
    const beforeListener = jest.fn((event: any) => {
      eventOrder.push('before');
    });
    const afterListener = jest.fn(() => {
      eventOrder.push('after');
    });
    graphic.addEventListener('beforeStateUpdate', beforeListener as any);
    graphic.addEventListener('afterStateUpdate', afterListener as any);

    graphic.useStates(['hover'], false);

    expect(beforeListener).toHaveBeenCalledTimes(1);
    expect(beforeListener.mock.calls[0][0].detail).toMatchObject({
      prevStates: [],
      nextStates: ['hover'],
      hasAnimation: false,
      isClear: false,
      type: AttributeUpdateType.STATE,
      attrs: {
        fill: 'red'
      }
    });
    expect(afterListener).toHaveBeenCalledTimes(1);
    expect(eventOrder).toEqual(['before', 'after']);
  });

  test('should allow beforeStateUpdate to prevent state application', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const afterListener = jest.fn();
    graphic.addEventListener('beforeStateUpdate', ((event: any) => {
      event.preventDefault();
    }) as any);
    graphic.addEventListener('afterStateUpdate', afterListener as any);

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.currentStates).toBeUndefined();
    expect(afterListener).not.toHaveBeenCalled();
  });

  test('should support mixed state definitions and expose effectiveStates/resolvedStatePatch', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      },
      selected: {
        name: 'selected',
        priority: 10,
        patch: {
          stroke: 'orange'
        },
        suppress: ['hover']
      }
    } as any;

    graphic.useStates(['hover', 'selected'], false);

    expect(graphic.currentStates).toEqual(['hover', 'selected']);
    expect(graphic.effectiveStates).toEqual(['selected']);
    expect(graphic.resolvedStatePatch).toEqual({
      stroke: 'orange'
    });
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.stroke).toBe('orange');
  });

  test('should invalidate resolver cache and reapply current state patch', () => {
    const graphic = createGraphic();
    const resolver = jest.fn().mockReturnValueOnce({ fill: 'red' }).mockReturnValueOnce({ fill: 'green' });
    graphic.states = {
      hover: {
        name: 'hover',
        resolver,
        declaredAffectedKeys: ['fill']
      }
    } as any;

    graphic.useStates(['hover'], false);
    graphic.invalidateResolver();

    expect(resolver).toHaveBeenCalledTimes(2);
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.effectiveStates).toEqual(['hover']);
    expect(graphic.resolvedStatePatch).toEqual({
      fill: 'green'
    });
    expect(graphic.attribute.fill).toBe('green');
  });
});

describe('Graphic addState/removeState/toggleState', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1,
      visible: true
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    graphic.states = {
      hover: {
        fill: 'red'
      },
      active: {
        lineWidth: 3
      },
      selected: {
        stroke: 'orange'
      }
    } as any;

    return graphic;
  };

  test('should add a single state', () => {
    const graphic = createGraphic();

    graphic.addState('hover', false, false);

    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should call useStates when addState recalculates state attrs', () => {
    const graphic = createGraphic();
    const useStates = jest.spyOn(graphic, 'useStates');

    graphic.addState('hover', false, false);

    expect(useStates).toHaveBeenCalledWith(['hover'], false);
  });

  test('should remove an existing state and restore attrs', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover'], false);

    graphic.removeState('hover', false);

    expect(graphic.currentStates).toEqual([]);
    expect(graphic.attribute.fill).toBe('blue');
  });

  test('should ignore removal of a non-existent state', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover'], false);
    const useStates = jest.spyOn(graphic, 'useStates');

    graphic.removeState('active', false);

    expect(useStates).not.toHaveBeenCalled();
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should add multiple states continuously when keepCurrentStates is true', () => {
    const graphic = createGraphic();

    graphic.addState('hover', false, false);
    graphic.addState('active', true, false);
    graphic.addState('selected', true, false);

    expect(graphic.currentStates).toEqual(['active', 'hover', 'selected']);
    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.attribute.lineWidth).toBe(3);
    expect(graphic.attribute.stroke).toBe('orange');
  });

  test('should remove multiple states continuously with array input', () => {
    const graphic = createGraphic();
    graphic.useStates(['hover', 'active', 'selected'], false);

    graphic.removeState(['hover', 'active'], false);

    expect(graphic.currentStates).toEqual(['selected']);
    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
    expect(graphic.attribute.stroke).toBe('orange');
  });

  test('should toggle state on and off', () => {
    const graphic = createGraphic();

    graphic.toggleState('hover', false);
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.attribute.fill).toBe('red');

    graphic.toggleState('hover', false);
    expect(graphic.currentStates).toEqual([]);
    expect(graphic.attribute.fill).toBe('blue');
  });
});

describe('Graphic clearStates', () => {
  const createGraphic = () => {
    const onAttributeUpdate = jest.fn();
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1,
      visible: true
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate,
      onSetStage: jest.fn()
    });

    graphic.states = {
      hover: {
        fill: 'red',
        lineWidth: 3
      }
    } as any;

    return { graphic, onAttributeUpdate };
  };

  test('should clear all current states', () => {
    const { graphic } = createGraphic();
    graphic.useStates(['hover'], false);

    graphic.clearStates(false);

    expect(graphic.currentStates).toEqual([]);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should restore attrs from base truth when states are cleared', () => {
    const { graphic } = createGraphic();
    graphic.useStates(['hover'], false);

    graphic.clearStates(false);

    expect(graphic.attribute.fill).toBe('blue');
    expect(graphic.attribute.lineWidth).toBe(1);
  });

  test('should trigger attribute update when clearing states without animation', () => {
    const { graphic, onAttributeUpdate } = createGraphic();
    graphic.useStates(['hover'], false);
    onAttributeUpdate.mockClear();

    graphic.clearStates(false);

    expect(onAttributeUpdate).toHaveBeenCalledTimes(1);
  });

  test('should call applyAnimationState when clearing states with animation', () => {
    const { graphic } = createGraphic();
    graphic.useStates(['hover'], false);
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.clearStates(true);

    expect(applyAnimationState).toHaveBeenCalledTimes(1);
    expect(graphic.currentStates).toEqual([]);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });

  test('should stop state animates and restore attrs directly when clearing without animation', () => {
    const { graphic } = createGraphic();
    graphic.useStates(['hover'], false);
    const stopStateAnimates = jest.spyOn(graphic as any, 'stopStateAnimates');

    graphic.clearStates(false);

    expect(stopStateAnimates).toHaveBeenCalledTimes(1);
    expect(graphic.attribute.fill).toBe('blue');
  });

  test('should not throw when clearing empty states repeatedly', () => {
    const { graphic } = createGraphic();

    expect(() => {
      graphic.clearStates(false);
      graphic.clearStates(false);
    }).not.toThrow();

    expect(graphic.currentStates).toEqual([]);
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
  });
});
