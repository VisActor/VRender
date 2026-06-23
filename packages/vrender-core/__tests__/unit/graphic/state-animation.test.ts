import { createRect } from '../../../src/graphic/rect';
import { DefaultStateAnimateConfig } from '../../../src/animate/config';
import { AttributeUpdateType } from '../../../src/common/enums';
import { AnimationStateManager } from '../../../../vrender-animate/src/state/animation-state';
import { AnimateExecutor } from '../../../../vrender-animate/src/executor/animate-executor';

describe('Graphic state animation integration', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      opacity: 1,
      visible: true,
      zIndex: 1
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    return graphic;
  };

  test('should trigger applyAnimationState when useStates enables animation', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState).toHaveBeenCalledTimes(1);
    expect(applyAnimationState).toHaveBeenCalledWith(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: { fill: 'red' },
            duration: DefaultStateAnimateConfig.duration,
            easing: DefaultStateAnimateConfig.easing
          }
        }
      ]
    );
  });

  test('should not trigger applyAnimationState when useStates disables animation', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], false);

    expect(applyAnimationState).not.toHaveBeenCalled();
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should pass custom stateAnimateConfig into the animation payload', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation).toMatchObject({
      duration: 450,
      easing: 'linear',
      to: { fill: 'red' }
    });
  });

  test('should split animateAttrs and noAnimateAttrs when applying animated state', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        visible: false,
        zIndex: 9
      }
    } as any;
    const applyAnimationState = jest.fn();
    const setAttributesAndPreventAnimate = jest.spyOn(graphic as any, 'setAttributesAndPreventAnimate');
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation.to).toEqual({ fill: 'red' });
    expect(setAttributesAndPreventAnimate).toHaveBeenCalledWith({ visible: false, zIndex: 9 }, false, {
      type: AttributeUpdateType.STATE
    });
    expect(graphic.attribute.visible).toBe(false);
    expect(graphic.attribute.zIndex).toBe(9);
  });

  test('should use the default state animation config when no override is provided', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation).toMatchObject({
      duration: 200,
      easing: 'cubicOut'
    });
  });

  test('should prefer graphic stateAnimateConfig before context fallback', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    (graphic as any).context = {
      stateAnimateConfig: {
        duration: 600,
        easing: 'quadIn'
      }
    };
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation).toMatchObject({
      duration: 450,
      easing: 'linear'
    });
  });

  test('should use context stateAnimateConfig as fallback when graphic config is absent', () => {
    const graphic = createGraphic();
    (graphic as any).context = {
      stateAnimateConfig: {
        duration: 600,
        easing: 'quadIn'
      }
    };
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation).toMatchObject({
      duration: 600,
      easing: 'quadIn'
    });
  });

  test('should disable animation when hasAnimation is false even if stateAnimateConfig exists', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], false);

    expect(applyAnimationState).not.toHaveBeenCalled();
    expect(graphic.attribute.fill).toBe('red');
  });

  test('should delegate state animation stop to animation state manager when available', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    (graphic as any).stopAnimationState = jest.fn();

    graphic.useStates(['hover'], false);

    expect((graphic as any).stopAnimationState).toHaveBeenCalledWith('state', 'end');
  });

  test('should allow partial animation config overrides', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 350
    } as any;
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation).toEqual({
      type: 'state',
      to: { fill: 'red' },
      duration: 350,
      easing: undefined
    });
  });

  test('should animate removed clear-state style keys back to defaults when base lacks the key', () => {
    const graphic = createGraphic();
    delete (graphic as any).baseAttributes.fillOpacity;
    delete (graphic.attribute as any).fillOpacity;
    graphic.setFinalAttributes?.({ ...(graphic.attribute as any) });
    graphic.states = {
      hover: {
        lineWidth: 4,
        fillOpacity: 0.6
      }
    } as any;
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);
    graphic.clearStates(true);

    expect(applyAnimationState).toHaveBeenLastCalledWith(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: expect.objectContaining({
              lineWidth: 1,
              fillOpacity: graphic.getDefaultAttribute('fillOpacity')
            }),
            duration: DefaultStateAnimateConfig.duration,
            easing: DefaultStateAnimateConfig.easing
          }
        }
      ]
    );
  });

  test('should allow explicit animateConfig to override graphic and context defaults in applyStateAttrs', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    (graphic as any).context = {
      stateAnimateConfig: {
        duration: 600,
        easing: 'quadIn'
      }
    };
    const applyAnimationState = jest.fn();
    (graphic as any).applyAnimationState = applyAnimationState;

    (graphic as any).applyStateAttrs(
      {
        fill: 'red'
      },
      ['hover'],
      true,
      false,
      {
        duration: 700,
        easing: 'bounceOut'
      }
    );

    expect(applyAnimationState.mock.calls[0][1][0].animation).toMatchObject({
      duration: 700,
      easing: 'bounceOut',
      to: { fill: 'red' }
    });
  });

  test('should allow animateConfig to append extra no-animate attrs during state application', () => {
    const graphic = createGraphic();
    graphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear',
      noAnimateAttrs: ['fill']
    } as any;
    graphic.states = {
      hover: {
        fill: 'red',
        opacity: 0.25,
        visible: false
      }
    } as any;
    const applyAnimationState = jest.fn();
    const setAttributesAndPreventAnimate = jest.spyOn(graphic as any, 'setAttributesAndPreventAnimate');
    (graphic as any).applyAnimationState = applyAnimationState;

    graphic.useStates(['hover'], true);

    expect(applyAnimationState.mock.calls[0][1][0].animation.to).toEqual({ opacity: 0.25 });
    expect(setAttributesAndPreventAnimate).toHaveBeenCalledWith({ fill: 'red', visible: false }, false, {
      type: AttributeUpdateType.STATE
    });
  });
});

describe('AnimationStateManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should trigger the completion callback after the state animation ends', () => {
    const endCallbacks: Array<() => void> = [];
    jest.spyOn(AnimateExecutor.prototype, 'execute').mockImplementation(() => undefined);
    jest
      .spyOn(AnimateExecutor.prototype, 'onEnd')
      .mockImplementation(function (this: AnimateExecutor, cb?: () => void) {
        if (cb) {
          endCallbacks.push(cb);
        }
      });

    const manager = new AnimationStateManager({} as any);
    const callback = jest.fn();

    manager.applyState(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: { fill: 'red' },
            duration: 200,
            easing: 'cubicOut'
          }
        }
      ],
      callback
    );

    endCallbacks.forEach(cb => cb());

    expect(callback).toHaveBeenCalledWith(false);
  });

  test('should stop the previous animation when a new transition requires interruption', () => {
    jest.spyOn(AnimateExecutor.prototype, 'execute').mockImplementation(() => undefined);
    jest.spyOn(AnimateExecutor.prototype, 'onEnd').mockImplementation(() => undefined);

    const manager = new AnimationStateManager({} as any);
    const previousExecutor = {
      stop: jest.fn()
    };

    manager.stateList = [
      {
        state: 'state',
        animationConfig: {
          type: 'state',
          to: { fill: 'red' },
          duration: 200,
          easing: 'cubicOut'
        },
        executor: previousExecutor
      }
    ] as any;

    manager.applyState(
      ['disappear'],
      [
        {
          name: 'disappear',
          animation: {
            type: 'state',
            to: { opacity: 0 },
            duration: 200,
            easing: 'cubicOut'
          }
        }
      ]
    );

    expect(previousExecutor.stop).toHaveBeenCalledWith(null, false);
  });
});
