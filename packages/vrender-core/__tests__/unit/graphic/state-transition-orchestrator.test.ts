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

  test('should not globally treat geometry names as optional aliases', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const plan = orchestrator.analyzeTransition(
      {},
      {
        height: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => (key === 'height' ? 0 : undefined)
      }
    );

    expect(plan.animateAttrs).toEqual({
      height: 0
    });
  });

  test('should not materialize undefined rect geometry aliases to theme defaults during clear transitions', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const verticalPlan = orchestrator.analyzeTransition(
      {},
      {
        lineWidth: 0,
        fillOpacity: undefined,
        x: 150,
        y: 0,
        y1: 320,
        width: 140,
        x1: undefined,
        height: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => {
          if (key === 'lineWidth' || key === 'height' || key === 'x1') {
            return 0;
          }
          if (key === 'fillOpacity') {
            return 1;
          }
          return undefined;
        }
      }
    );

    expect(verticalPlan.animateAttrs).toHaveProperty('height', 0);
    expect(verticalPlan.animateAttrs).toHaveProperty('x1', 0);

    const verticalRectPlan = orchestrator.analyzeTransition(
      {},
      {
        lineWidth: 0,
        fillOpacity: undefined,
        x: 150,
        y: 0,
        y1: 320,
        width: 140,
        x1: undefined,
        height: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => {
          if (key === 'lineWidth' || key === 'height' || key === 'x1') {
            return 0;
          }
          if (key === 'fillOpacity') {
            return 1;
          }
          return undefined;
        },
        shouldSkipDefaultAttribute: (key: string) => key === 'height' || key === 'x1'
      }
    );

    expect(verticalRectPlan.animateAttrs).toEqual({
      lineWidth: 0,
      fillOpacity: 1,
      x: 150,
      y: 0,
      y1: 320,
      width: 140
    });
    expect(verticalRectPlan.animateAttrs).not.toHaveProperty('height');
    expect(verticalRectPlan.animateAttrs).not.toHaveProperty('x1');

    expect(verticalPlan.animateAttrs).toEqual({
      lineWidth: 0,
      fillOpacity: 1,
      x: 150,
      y: 0,
      y1: 320,
      width: 140,
      x1: 0,
      height: 0
    });

    const horizontalPlan = orchestrator.analyzeTransition(
      {},
      {
        lineWidth: 0,
        fillOpacity: undefined,
        x: 10,
        x1: 210,
        y: 5,
        height: 40,
        width: undefined,
        y1: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => {
          if (key === 'lineWidth' || key === 'width' || key === 'y1') {
            return 0;
          }
          if (key === 'fillOpacity') {
            return 1;
          }
          return undefined;
        }
      }
    );

    expect(horizontalPlan.animateAttrs).toHaveProperty('width', 0);
    expect(horizontalPlan.animateAttrs).toHaveProperty('y1', 0);

    const horizontalRectPlan = orchestrator.analyzeTransition(
      {},
      {
        lineWidth: 0,
        fillOpacity: undefined,
        x: 10,
        x1: 210,
        y: 5,
        height: 40,
        width: undefined,
        y1: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => {
          if (key === 'lineWidth' || key === 'width' || key === 'y1') {
            return 0;
          }
          if (key === 'fillOpacity') {
            return 1;
          }
          return undefined;
        },
        shouldSkipDefaultAttribute: (key: string) => key === 'width' || key === 'y1'
      }
    );

    expect(horizontalRectPlan.animateAttrs).toEqual({
      lineWidth: 0,
      fillOpacity: 1,
      x: 10,
      x1: 210,
      y: 5,
      height: 40
    });
    expect(horizontalRectPlan.animateAttrs).not.toHaveProperty('width');
    expect(horizontalRectPlan.animateAttrs).not.toHaveProperty('y1');

    expect(horizontalPlan.animateAttrs).toEqual({
      lineWidth: 0,
      fillOpacity: 1,
      x: 10,
      x1: 210,
      y: 5,
      height: 40,
      width: 0,
      y1: 0
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

  test('should keep extra animation attrs out of the static final target', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const plan = orchestrator.analyzeTransition(
      {},
      {
        lineWidth: 0
      },
      [],
      true,
      {
        isClear: true,
        extraAnimateAttrs: {
          fillOpacity: 1
        }
      }
    );

    expect(plan.targetAttrs).toEqual({
      lineWidth: 0
    });
    expect(plan.animateAttrs).toEqual({
      lineWidth: 0,
      fillOpacity: 1
    });
    expect(plan.targetAttrs).not.toHaveProperty('fillOpacity');
  });

  test('should allow extra animation attrs to replace an undefined clear target transiently', () => {
    const orchestrator = new StateTransitionOrchestrator<any>();

    const plan = orchestrator.analyzeTransition(
      {},
      {
        height: undefined
      },
      [],
      true,
      {
        isClear: true,
        getDefaultAttribute: (key: string) => (key === 'height' ? 0 : undefined),
        shouldSkipDefaultAttribute: (key: string) => key === 'height',
        extraAnimateAttrs: {
          height: 100
        }
      }
    );

    expect(plan.targetAttrs).toEqual({
      height: undefined
    });
    expect(plan.animateAttrs).toEqual({
      height: 100
    });
  });
});
