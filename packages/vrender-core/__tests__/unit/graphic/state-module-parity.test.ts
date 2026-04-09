import { createRect } from '../../../src/graphic/rect';
import { StateModel } from '../../../src/graphic/state/state-model';
import { StateStyleResolver } from '../../../src/graphic/state/state-style-resolver';
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

  test('StateModel should stay aligned with graphic currentStates transitions', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { lineWidth: 3 },
      selected: { stroke: 'orange' }
    } as any;
    graphic.stateSort = (a: string, b: string) => a.localeCompare(b);

    const model = new StateModel<any>({
      stateSort: graphic.stateSort as any
    });

    model.addState('hover', false);
    graphic.addState('hover', false, false);
    expect(model.getCurrentStates()).toEqual(graphic.currentStates);

    model.addState('active', true);
    graphic.addState('active', true, false);
    expect(model.getCurrentStates()).toEqual(graphic.currentStates);

    model.toggleState('selected');
    graphic.toggleState('selected', false);
    expect(model.getCurrentStates()).toEqual(graphic.currentStates);

    model.removeState('active');
    graphic.removeState('active', false);
    expect(model.getCurrentStates()).toEqual(graphic.currentStates);

    model.useStates([]);
    graphic.useStates([], false);
    expect(model.getCurrentStates()).toEqual(graphic.currentStates);
  });

  test('StateStyleResolver should match compiled shallow state resolution order for nested attrs', () => {
    const graphic = createGraphic();
    (graphic as any).attribute.shadowBlur = { value: 1, color: 'black' };
    graphic.states = {
      hover: { fill: 'red', shadowBlur: { value: 2 } },
      active: { opacity: 0.4, shadowBlur: { color: 'green' } }
    } as any;

    const resolver = new StateStyleResolver<any>();
    const resolvedAttrs = resolver.resolve({}, graphic.states as any, undefined, ['active', 'hover']);

    graphic.useStates(['hover', 'active'], false);

    expect(resolvedAttrs).toEqual({
      fill: 'red',
      opacity: 0.4,
      shadowBlur: { value: 2 }
    });
    expect((graphic.attribute as any).fill).toBe((resolvedAttrs as any).fill);
    expect((graphic.attribute as any).opacity).toBe((resolvedAttrs as any).opacity);
    expect((graphic.attribute as any).shadowBlur).toEqual((resolvedAttrs as any).shadowBlur);
  });

  test('StateStyleResolver should match legacy stateProxy precedence and nullish skips', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: { fill: 'red' },
      active: { fill: 'green' }
    } as any;
    graphic.stateProxy = jest.fn((stateName: string) => {
      if (stateName === 'hover') {
        return undefined;
      }
      return {
        fill: 'proxy-fill',
        stroke: 'orange'
      };
    }) as any;

    const resolver = new StateStyleResolver<any>();
    const resolvedAttrs = resolver.resolve({}, graphic.states as any, graphic.stateProxy as any, ['hover', 'active']);

    graphic.useStates(['hover', 'active'], false);

    expect(resolvedAttrs).toEqual({
      fill: 'proxy-fill',
      stroke: 'orange'
    });
    expect(graphic.attribute.fill).toBe((resolvedAttrs as any).fill);
    expect(graphic.attribute.stroke).toBe((resolvedAttrs as any).stroke);
  });

  test('StateStyleResolver backup should stay a legacy helper while graphic normalAttrs now reflects base truth', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red',
        lineWidth: 3
      },
      active: {
        opacity: 0.4
      }
    } as any;
    const resolver = new StateStyleResolver<any>();

    graphic.useStates(['hover'], false);

    const targetAttrs = {
      opacity: 0.4
    };
    const legacyTargetAttrs = { ...targetAttrs };
    const backup = resolver.computeNormalAttrsBackup(
      graphic.normalAttrs as any,
      targetAttrs,
      ((graphic as any).finalAttribute ?? graphic.attribute) as any
    );

    (graphic as any).updateNormalAttrs(legacyTargetAttrs);

    expect(backup.normalAttrs).toEqual({
      opacity: 1
    });
    expect(graphic.normalAttrs).toEqual((graphic as any).baseAttributes);
    expect(backup.attrs).toEqual({
      ...legacyTargetAttrs,
      fill: 'blue',
      lineWidth: 1,
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      stroke: 'black',
      visible: true,
      zIndex: 1
    });
  });

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

    const plan = orchestrator.analyzeTransition({}, attrs, ['hover'], true, {
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
