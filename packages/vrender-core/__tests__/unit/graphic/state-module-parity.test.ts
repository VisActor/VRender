import { createRect } from '../../../src/graphic/rect';
import { StateTransitionOrchestrator } from '../../../src/graphic/state/state-transition-orchestrator';

describe('Graphic state extracted modules parity', () => {
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
      visible: true,
      zIndex: 1
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    return graphic;
  };

  test('StateTransitionOrchestrator should match legacy animated state application', () => {
    const legacyGraphic = createGraphic();
    const newGraphic = createGraphic();
    const orchestrator = new StateTransitionOrchestrator<any>();
    const attrs = {
      fill: 'red',
      visible: false,
      zIndex: 9
    };

    legacyGraphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    (legacyGraphic as any).context = {
      stateAnimateConfig: {
        duration: 600,
        easing: 'quadIn'
      }
    };
    (legacyGraphic as any).finalAttribute = {
      fill: 'blue'
    };
    (legacyGraphic as any).applyAnimationState = jest.fn();
    const legacyJumpSpy = jest.spyOn(legacyGraphic as any, 'setAttributesAndPreventAnimate');
    const legacyEmitSpy = jest.spyOn(legacyGraphic as any, '_emitCustomEvent');

    newGraphic.stateAnimateConfig = {
      duration: 450,
      easing: 'linear'
    } as any;
    (newGraphic as any).context = {
      stateAnimateConfig: {
        duration: 600,
        easing: 'quadIn'
      }
    };
    (newGraphic as any).finalAttribute = {
      fill: 'blue'
    };
    (newGraphic as any).applyAnimationState = jest.fn();
    const newJumpSpy = jest.spyOn(newGraphic as any, 'setAttributesAndPreventAnimate');
    const newEmitSpy = jest.spyOn(newGraphic as any, '_emitCustomEvent');

    legacyGraphic.applyStateAttrs(attrs, ['hover'], true, false);

    const plan = orchestrator.analyzeTransition(attrs, true, {
      noWorkAnimateAttr: newGraphic.getNoWorkAnimateAttr()
    });
    orchestrator.applyTransition(newGraphic as any, plan, true, {
      animateConfig: newGraphic.stateAnimateConfig
    });

    expect((newGraphic as any).applyAnimationState.mock.calls).toEqual(
      (legacyGraphic as any).applyAnimationState.mock.calls
    );
    expect(newJumpSpy.mock.calls).toEqual(legacyJumpSpy.mock.calls);
    expect(newEmitSpy.mock.calls).toEqual(legacyEmitSpy.mock.calls);
    expect((newGraphic as any).finalAttribute).toEqual((legacyGraphic as any).finalAttribute);
  });

  test('StateTransitionOrchestrator should match legacy clear-state fallback behavior', () => {
    const legacyGraphic = createGraphic();
    const newGraphic = createGraphic();
    const orchestrator = new StateTransitionOrchestrator<any>();
    const attrs: any = {
      fill: undefined,
      visible: true
    };

    (legacyGraphic as any).finalAttribute = {
      fill: 'red',
      visible: false
    };
    (legacyGraphic as any).applyAnimationState = jest.fn();
    const legacyJumpSpy = jest.spyOn(legacyGraphic as any, 'setAttributesAndPreventAnimate');

    (newGraphic as any).finalAttribute = {
      fill: 'red',
      visible: false
    };
    (newGraphic as any).applyAnimationState = jest.fn();
    const newJumpSpy = jest.spyOn(newGraphic as any, 'setAttributesAndPreventAnimate');

    legacyGraphic.applyStateAttrs(attrs, [], true, true);
    const plan = orchestrator.applyClearTransition(newGraphic as any, attrs, true);

    expect(plan.animateAttrs).toEqual({ fill: newGraphic.getDefaultAttribute('fill') });
    expect((newGraphic as any).applyAnimationState.mock.calls).toEqual(
      (legacyGraphic as any).applyAnimationState.mock.calls
    );
    expect(newJumpSpy.mock.calls).toEqual(legacyJumpSpy.mock.calls);
    expect((newGraphic as any).finalAttribute).toEqual((legacyGraphic as any).finalAttribute);
  });
});
