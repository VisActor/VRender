import { AttributeUpdateType } from '../../../src/common/enums';
import { StateTransitionOrchestrator } from '../../../src/graphic/state/state-transition-orchestrator';

describe('StateTransitionOrchestrator', () => {
  test('should split animate and non-animate attrs when animation is enabled', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const plan = orchestrator.analyzeTransition(
      {},
      {
        fill: 'red',
        opacity: 0.4,
        visible: false,
        zIndex: 9
      },
      undefined,
      true,
      {
        noWorkAnimateAttr: {
          visible: 1,
          zIndex: 1
        }
      }
    );

    expect(plan.targetAttrs).toEqual({
      fill: 'red',
      opacity: 0.4,
      visible: false,
      zIndex: 9
    });
    expect(plan.animateAttrs).toEqual({
      fill: 'red',
      opacity: 0.4
    });
    expect(plan.jumpAttrs).toEqual({
      visible: false,
      zIndex: 9
    });
    expect(plan.noAnimateAttrs).toEqual({
      visible: false,
      zIndex: 9
    });
  });

  test('should apply animated transitions with explicit animateConfig priority and finalAttribute sync', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();
    const applyAnimationState = jest.fn();
    const setAttributesAndPreventAnimate = jest.fn();
    const emitCustomEvent = jest.fn();
    const graphic = {
      finalAttribute: {
        fill: 'blue'
      },
      applyAnimationState,
      setAttributesAndPreventAnimate,
      stopStateAnimates: jest.fn(),
      _emitCustomEvent: emitCustomEvent
    };

    orchestrator.applyTransition(
      graphic as any,
      {
        targetAttrs: {
          fill: 'red',
          visible: false
        },
        animateAttrs: {
          fill: 'red'
        },
        jumpAttrs: {
          visible: false
        },
        noAnimateAttrs: {
          visible: false
        }
      },
      true,
      {
        animateConfig: {
          duration: 600,
          easing: 'quadIn'
        }
      }
    );

    expect(applyAnimationState).toHaveBeenCalledWith(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: { fill: 'red' },
            duration: 600,
            easing: 'quadIn'
          }
        }
      ]
    );
    expect(setAttributesAndPreventAnimate).toHaveBeenCalledWith({ visible: false }, false, {
      type: AttributeUpdateType.STATE
    });
    expect(graphic.finalAttribute).toEqual({
      fill: 'red',
      visible: false
    });
    expect(emitCustomEvent).toHaveBeenCalledWith('afterStateUpdate', { type: AttributeUpdateType.STATE });
  });

  test('should apply non-animated transitions directly and stop state animates', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();
    const setAttributesAndPreventAnimate = jest.fn();
    const stopStateAnimates = jest.fn();
    const graphic = {
      finalAttribute: {
        fill: 'blue'
      },
      setAttributesAndPreventAnimate,
      stopStateAnimates,
      _emitCustomEvent: jest.fn()
    };

    orchestrator.applyTransition(
      graphic as any,
      {
        targetAttrs: {
          fill: 'red',
          opacity: 0.4
        },
        animateAttrs: {},
        jumpAttrs: {},
        noAnimateAttrs: {}
      },
      false
    );

    expect(stopStateAnimates).toHaveBeenCalledTimes(1);
    expect(setAttributesAndPreventAnimate).toHaveBeenCalledWith({ fill: 'red', opacity: 0.4 }, false, {
      type: AttributeUpdateType.STATE
    });
    expect(graphic.finalAttribute).toEqual({
      fill: 'red',
      opacity: 0.4
    });
  });

  test('should apply clear transitions with default attribute fallback for animated undefined attrs', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();
    const applyAnimationState = jest.fn();
    const setAttributesAndPreventAnimate = jest.fn();
    const graphic: any = {
      finalAttribute: {
        fill: 'red',
        visible: true
      },
      context: undefined,
      stateAnimateConfig: undefined,
      applyAnimationState,
      setAttributesAndPreventAnimate,
      stopStateAnimates: jest.fn(),
      getNoWorkAnimateAttr: () => ({
        visible: 1
      }),
      getDefaultAttribute: (key: string) => (key === 'fill' ? 'blue' : undefined),
      _emitCustomEvent: jest.fn()
    };

    const plan = orchestrator.applyClearTransition(
      graphic as any,
      {
        fill: undefined,
        visible: true
      },
      true
    );

    expect(plan.animateAttrs).toEqual({
      fill: 'blue'
    });
    expect(plan.jumpAttrs).toEqual({
      visible: true
    });
    expect(applyAnimationState).toHaveBeenCalledWith(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: { fill: 'blue' },
            duration: 200,
            easing: 'cubicOut'
          }
        }
      ]
    );
    expect(setAttributesAndPreventAnimate).toHaveBeenCalledWith({ visible: true }, false, {
      type: AttributeUpdateType.STATE
    });
    expect(graphic.finalAttribute).toEqual({
      fill: undefined,
      visible: true
    });
  });

  test('should allow animateConfig to append additional no-animate attrs', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const plan = orchestrator.analyzeTransition(
      {},
      {
        fill: 'red',
        opacity: 0.4,
        visible: false
      },
      undefined,
      true,
      {
        noWorkAnimateAttr: {
          visible: 1
        },
        animateConfig: {
          noAnimateAttrs: ['fill']
        }
      }
    );

    expect(plan.animateAttrs).toEqual({
      opacity: 0.4
    });
    expect(plan.jumpAttrs).toEqual({
      fill: 'red',
      visible: false
    });
    expect(plan.noAnimateAttrs).toEqual({
      fill: 'red',
      visible: false
    });
  });
});
